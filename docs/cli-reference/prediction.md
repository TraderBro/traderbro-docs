---
sidebar_position: 3
title: prediction
---

# prediction

Commands for querying analyst predictions across all tracked symbols.

---

## traderbro prediction

The single surface over analyst predictions — filter by **analyst, symbol, date, sector/industry,
and return**. Bare `traderbro prediction` lists (same as `prediction list`). It replaces the old
`analyst predictions <slug>` and `symbol predictions <EX:TICKER>` commands.

### Usage

```bash
traderbro prediction [flags]
```

### Combining filters (the contract)

- **Different filters AND together**; **repeated/comma values of the same filter OR together.**
- `--symbol` takes a bare ticker (any exchange) or `EXCHANGE:TICKER` (exact). Max 25. A symbol
  list can be piped in (one per line) from `screener run --symbols-only`.
- **`--period` selects WHICH return** drives `--min-return` / `--max-return` / `--sort return`
  and the displayed return column: `current` (live, default) or the frozen window returns
  `7d|1m|3m|6m|1y`.
- **NULL window returns mean "not yet measurable"** (the window hasn't matured) — return
  filters and return sorts **exclude** such rows; they are never treated as 0.

### Flags

| Flag | Type | Description |
|---|---|---|
| `--analyst` | string (repeatable) | analyst slug; OR; max 25 |
| `--symbol` | string (repeatable) | bare ticker or `EXCHANGE:TICKER`; OR; max 25; stdin pipe |
| `--direction` | string (repeatable) | `bullish`, `bearish`, `neutral` |
| `--sector` / `--industry` | string (repeatable) | symbol sector / industry at prediction time |
| `--period` | string | `current` (default), `7d`, `1m`, `3m`, `6m`, `1y` |
| `--min-return` / `--max-return` | number | bounds on the `--period` return (NULLs excluded) |
| `--correct` | true/false | directional correctness |
| `--open` | true/false | `true` = call still running; `false` = closed by a reversal |
| `--series-first` | true/false | `true` = only the first call of a series (dedupe repeats) |
| `--has-target` | true/false | stated price target present |
| `--min-confidence` | number | 0–100 (NULL excluded) |
| `--since` / `--until` | YYYY-MM-DD | publish-date range |
| `--window` | string | relative: `4h`, `24h`, `3d`, `7d`, `30d` |
| `--sort` | string | `date` (default), `return` (uses `--period`), `confidence` |
| `--tz` | IANA zone | render `published_at` in this timezone |
| `--describe` | bool | print valid values + limits (live, from the server) |
| `--limit` / `--page`, `--json` / `--plain` / `--jq` | | global |

### Examples

```bash
# An analyst's bullish calls already up >10% one month out
traderbro prediction --analyst ray-wang --direction bullish --period 1m --min-return 10

# Across two symbols: last month's calls, best 3-month returns first
traderbro prediction --symbol NVDA,AMD --since 2026-05-10 --sort return --period 3m

# Open (not reversed) first-of-series tech calls with a stated target
traderbro prediction --sector Technology --open true --series-first true --has-target true

# Pipe a screen into prediction
traderbro screener run --filter "industry:eq:Semiconductors" --symbols-only \
  | traderbro prediction --period 1m --min-return 20

# Vocabulary
traderbro prediction --describe
```

### Output

Table columns: `ID, Analyst, Symbol, Direction, Return % (per --period), Correct, Sector,
Published`. JSON rows include all five window returns, `confidence_score`, `symbol_sector`,
`symbol_industry`, `is_series_first`, `closed_at`.

Unknown `--direction`/`--period` values return an error listing the valid set.

---

## traderbro prediction get

Get full detail for a single prediction.

### Usage

```bash
traderbro prediction get <id> [flags]
```

### Examples

```bash
traderbro prediction get 101
traderbro prediction get 101 --json
```

### Output (Table mode)

```
ID:            101
Analyst:       No Limit Gains
Symbol:        NVDA
Direction:     bullish
Price Target:  $650
Price at Call: $480
Current Price: $585
Return %:      +22.4%
Confidence:    85%
Source:        https://twitter.com/...
Published:     2025-03-15T10:00:00Z
Reasoning:     Strong AI demand, datacenter spending...
```

### Output (JSON mode)

```json
{
  "id": 101,
  "analyst_name": "No Limit Gains",
  "analyst_slug": "noLimitGains",
  "symbol_ticker": "NVDA",
  "direction": "bullish",
  "stated_price_target": "650",
  "price_at_prediction": 480.0,
  "current_price": 585.0,
  "current_return_pct": 22.4,
  "confidence_score": 85,
  "is_directionally_correct": true,
  "source_url": "https://twitter.com/...",
  "published_at": "2025-03-15T10:00:00Z",
  "author_reasoning": "Strong AI demand..."
}
```

---

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `2` | Authentication failure |
| `3` | Prediction not found |
| `4` | Validation error |
| `5` | Network error |
