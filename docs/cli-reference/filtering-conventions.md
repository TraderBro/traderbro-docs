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
