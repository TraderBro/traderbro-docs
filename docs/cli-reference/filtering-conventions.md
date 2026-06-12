# Filtering conventions (one way to filter, everywhere)

The data commands share one filter vocabulary so your instinct transfers across them.
(Plan 184.) Legacy spellings still work as hidden aliases — nothing here breaks an old
invocation; these are just the canonical forms to reach for.

## Symbols — `--symbol` (repeatable) or positional

- Multi-symbol / scan commands take **`--symbol`** (repeatable, comma-separated, OR):
  `prediction`, `insight`, `calculated-events scan`.
  ```bash
  traderbro prediction --symbol NVDA --symbol AMD            # OR
  traderbro prediction --symbol NVDA,AMD                     # same
  echo "NASDAQ:NVDA" | traderbro calculated-events scan --symbol -   # stdin
  ```
- Single-symbol commands also accept the symbol **positionally** *and* via `--symbol`
  (use whichever — they're equivalent): `calculated-events list/refresh/patterns`,
  `prices`, `symbol share`.
  ```bash
  traderbro calculated-events list NASDAQ:AAPL
  traderbro calculated-events list --symbol NASDAQ:AAPL      # identical
  ```
- Symbols are `EXCHANGE:TICKER` or a bare ticker. Passing both a positional and
  `--symbol` to a single-symbol command is an error (pass it once).

## Dates — `--since` / `--until` (YYYY-MM-DD)

Absolute date range, everywhere: `prediction`, `insight`, `prices`,
`calculated-events list/scan`, `analyst sector-map`.
```bash
traderbro prediction --symbol NVDA --since 2025-01-01 --until 2025-06-30
traderbro calculated-events list NASDAQ:AAPL --since 2024-01-01
```
Aliases kept for back-compat: `--from`/`--to` (calculated-events, prices) and
`--date-from`/`--date-to` (analyst). Setting a canonical flag *and* its alias to
different values is an error.

## The one exception — `symbol trending --window`

`symbol trending` filters by a **relative window** (`4h`, `24h`, `7d`, `30d`, `all`),
not a date. Its canonical flag is **`--window`** (with `--since` kept as a hidden alias
for back-compat). Don't pass a `YYYY-MM-DD` date here.
```bash
traderbro symbol trending --window 7d
```

## OR vs AND

Repeating the **same** filter ORs its values; **different** filters AND together.
```bash
traderbro insight --symbol NVDA --symbol AMD --type evidence_insight
#            ^ NVDA OR AMD            AND  type = evidence_insight
```

## Not covered here

`screener run` uses a separate, schema-driven field-filter DSL
(`--filter "field:op:value"`, e.g. `--filter "country:eq:US"`) — it has **no `--market`
flag**; choose a market with a `country`/`exchange` filter. See the screener reference.

## Output formats: `--csv` for analysis

Every data command emits a table on a terminal and tab-delimited text when piped.
Add **`--json`** for the full envelope, or **`--csv`** for a header + one row per record
that loads directly into pandas / a spreadsheet:

```bash
traderbro screener run --filter "sector:eq:Technology" --csv > tech.csv
traderbro prediction --analyst aleabitoreddit --csv > preds.csv   # all return windows as columns
traderbro analyst list --sort return --period 3m --csv > leaderboard.csv
traderbro insight --symbol NASDAQ:NVDA --csv > sentiment.csv
traderbro calculated-events scan --symbols NVDA,AAPL,EWY --csv > events.csv
traderbro symbol trending --window 7d --csv
traderbro prices NASDAQ:AAPL --last 90 --csv > aapl.csv
```

Notes:
- **`--csv` works on every data command** (screener, prediction, analyst list, insight,
  calculated-events scan/list, symbol trending, prices). Single-item / action commands
  (`get`, `share`, `whoami`, schema/types) don't support it.
- **`--no-header`** omits the header row so you can append to one file:
  `traderbro prediction --analyst X --csv --no-header >> all.csv`.
- CSV goes to **stdout only**; warnings/notes go to stderr, so a redirect captures clean data.
- Numbers stay numeric (volume `1500000`, not `1.5e+06`); list fields like `tags` are joined
  with `;` to stay in one column; commas/quotes are RFC-4180 quoted.
- **CSV returns the same data subject to the same access limits as `--json`** — it is not a
  way around per-tier caps or required filters.
- `prediction --csv` / `analyst list --csv` emit **all** return horizons (7d…1y) as columns,
  not just the `--period`-selected one. `insight --csv` omits the free-text `key_quote`
  (use `--json` if you need it).
