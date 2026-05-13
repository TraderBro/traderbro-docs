# prices

Pull daily OHLCV bars from the price store for a single symbol over a date range. Replaces the `manage.py shell` bypass that forward-return / drawdown / base-rate analyses used to need.

---

## Usage

```bash
traderbro prices <EXCHANGE:SYMBOL> [date-range] [--json | --csv | --plain]
```

The date range is set one of three ways (mutually exclusive):

- `--from YYYY-MM-DD [--to YYYY-MM-DD]` — explicit range (default `--to` is today)
- `--within-days N` — last N calendar days
- `--last N` — last N trading bars (server pulls a slightly wider range, CLI slices to N)

Server cap: 5000 bars per request. When hit, the response includes `truncated: true` and `next_from: YYYY-MM-DD` so callers can paginate by re-calling with `--from <next_from>` until `truncated: false`.

---

## Flags

| Flag | Description | Default |
|---|---|---|
| `--from` | Start date `YYYY-MM-DD` | 1y ago |
| `--to` | End date `YYYY-MM-DD` | today |
| `--within-days` | Last N calendar days (mutually exclusive with `--from/--to` and `--last`) | — |
| `--last` | Last N trading bars (mutually exclusive with the above) | — |
| `--resolution` | `daily` (weekly/intraday coming soon — see plan 128) | `daily` |
| `--csv` | Emit CSV to stdout (header + rows) | false |
| `--no-header` | CSV mode only — omit the header row (useful for chaining `>> all.csv`) | false |
| `--json` | Output as JSON envelope `{symbol, resolution, count, truncated, [next_from], bars}` | false |

---

## Examples

```bash
# Last 30 trading days as JSON
traderbro prices NASDAQ:AAPL --last 30 --json

# Last quarter, table view
traderbro prices NASDAQ:NVDA --within-days 90

# 5-year CSV export for spreadsheet analysis
traderbro prices NASDAQ:AAPL --from 2021-01-01 --csv > aapl_5y.csv

# Chain multiple years into a single CSV (skip header on appends)
for year in 2020 2021 2022 2023 2024 2025; do
  traderbro prices NASDAQ:AAPL --from "${year}-01-01" --to "${year}-12-31" --csv --no-header
done > aapl_all.csv

# Self-describing pagination for ranges that exceed 5000 bars
traderbro prices NASDAQ:AAPL --from 2005-01-01 --json
# → truncated: true, next_from: "2024-11-13"
traderbro prices NASDAQ:AAPL --from 2024-11-13 --json
```

---

## Output (JSON mode)

```json
{
  "symbol": "NASDAQ:AAPL",
  "resolution": "daily",
  "count": 250,
  "truncated": false,
  "bars": [
    {
      "date": "2025-05-13",
      "open": 195.32,
      "high": 196.10,
      "low": 193.50,
      "close": 195.85,
      "adjusted_close": 193.45,
      "volume": 45123000
    }
  ]
}
```

When `truncated: true` is returned, `next_from` carries the date to resume with on the next call:

```json
{ "count": 5000, "truncated": true, "next_from": "2024-11-13", "bars": [...] }
```

The CLI also prints a stderr warning when truncation happens, so agents on `--json` mode aren't silently capped.

---

## Output (CSV mode)

```
date,open,high,low,close,adjusted_close,volume
2025-05-13,195.32,196.10,193.50,195.85,193.45,45123000
...
```

Volume is emitted as an integer (no scientific notation). Use `--no-header` when concatenating ranges into a single file.

---

## Exit codes

| Code | Reason |
|---|---|
| 0 | Success |
| 1 | Generic error (bad flags, mutually-exclusive range flags conflict) |
| 3 | Symbol not found (response includes `did_you_mean`) |
| 4 | Bad request (e.g. `--resolution weekly`, `--within-days 0`) |
