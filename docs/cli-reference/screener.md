---
sidebar_position: 7
title: screener
---

# screener

Commands for screening stocks using the live DataMatrix snapshot — a Redis-cached set of fundamentals, valuations, price levels, and performance metrics updated throughout the trading day.

---

## traderbro screener schema

Discover filterable fields via a **retrieval funnel** — the screener exposes 300+
fields, so `schema` never dumps the full catalog by default. Instead it gives you a
small group index, lets you search by concept, and returns full detail only for the
keys you ask about.

No authentication required — use this to discover filter keys before running a screen.

**Recommended workflow:**
1. `screener schema` → see the field groups + a curated core set.
2. Have an intent ("oversold cheap tech")? → `screener schema --search "oversold cheap"`.
3. Browse a domain? → `screener schema --group valuation`.
4. Before writing filters → `screener schema --fields rsi,pe_ratio` for exact operators / timeframes / values.
5. Build: `screener run --filter "<key>:<op>:<value>"` (add `@<tf>` for a non-default timeframe).

### Usage

```bash
traderbro screener schema [flags]
```

### Flags

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--search` | `-s` | string | — | Concept/synonym search → ranked matching fields |
| `--group` | `-g` | string | — | All fields in one category (e.g. `technical`, `valuation`, `ownership`) |
| `--fields` | `-f` | csv | — | Full detail for specific keys: `rsi,in_index,revenue` |
| `--all` | | bool | false | Dump every field, paginated (discouraged for agents — large) |
| `--flat` | | bool | false | Legacy flat array with live stats (backward compat) |
| `--source` | | string | `all` | Filter by source: `stockanalysis` \| `tradingview` \| `all` |
| `--limit` | `-n` | int | 20 | Cap results (search / group / dump) |
| `--category` | | string | — | *(legacy)* Filter the flat array by category |
| `--json` | | bool | false | Output as JSON (full mode-aware envelope) |
| `--jq` | | string | — | Apply jq expression to JSON output |

With no mode flag, `schema` returns the **group index** plus a curated `core` set.

### Modifiers (`@`)

Some fields are one logical concept across many timeframes/periods (`type` carries a
`modifier`). Apply a modifier in `screener run` with an `@` suffix; omit it for the default.

| Axis | Applies to | Values | Default | Example |
|---|---|---|---|---|
| `timeframe` | technicals (`rsi`, `ma50`, `atr`, `relative_volume`) | `1D 1W 1M` (+ intraday `60 240` live via TradingView) | `1D` | `rsi@1W:lt:30` |
| `window` | returns | `1w 1m 3m 6m ytd 1y 3y 5y 10y 20y` | `1y` | `price_change@3m:gt:20` |
| `period` | fundamentals (`revenue`, `net_income`) | `ttm fy fq` | `ttm` | `revenue@fq:gt:250M` |

### Examples

```bash
# Group index + core fields
traderbro screener schema

# Search by concept (synonyms work: oversold→rsi, cheap→pe_ratio, squeeze→short_float)
traderbro screener schema --search "oversold cheap large cap"
traderbro screener schema --search "short squeeze"
traderbro screener schema --search "index membership s&p 500"

# Browse one domain
traderbro screener schema --group technical

# Exact syntax for the keys you'll filter on
traderbro screener schema --fields rsi,in_index,revenue --json

# Only TradingView-sourced ETF fields
traderbro screener schema --source tradingview --group etf
```

Schema tables (search / detail / group) include a **Source** column: `snapshot`
(served locally from the matrix, fast) vs `live(TV)` (a TradingView passthrough field
fetched live via federation — see the Federation section). Each result's `source`
(`stockanalysis` | `tradingview`) is also in the JSON.

### Output (search, JSON)

```json
{
  "mode": "search",
  "query": "oversold cheap",
  "count": 4,
  "results": [
    { "key": "rsi", "type": "number", "operators": ["gt","lt","gte","lte","between"],
      "matched": ["oversold"], "score": 0.96,
      "modifier": {"axis":"timeframe","values":["1D","1W","1M"],"default":"1D"},
      "example": "rsi:lt:30" },
    { "key": "pe_ratio", "type": "number", "matched": ["cheap"], "score": 0.78,
      "example": "pe_ratio:lt:15" }
  ]
}
```

### Output (detail, JSON)

```json
{
  "mode": "detail",
  "fields": [
    { "key": "in_index", "label": "Index Membership", "category": "identifier",
      "type": "set", "operators": ["has","in"], "narrowing": true,
      "values": ["SP500","NDX","DJI","R2000"], "example": "in_index:has:SP500" }
  ],
  "unknown": []
}
```

Unknown keys in `--fields` are returned in `unknown` (with `did_you_mean`) rather than
erroring — partial input never hard-fails.

### Field types → operators

`type` is authoritative and derives the valid operators.

| Type | Operators | Notes |
|---|---|---|
| `number` / `price` / `currency` / `percent` | `gt lt gte lte between` | `currency` accepts `K/M/B/T` suffixes |
| `date` | `gt lt gte lte between` | `YYYY-MM-DD` |
| `categorical` | `eq neq in` | `sector`, `country`, `exchange` |
| `text` | `eq neq in match` | `name` (`match` = substring) |
| `set` | `has in` | array fields: `in_index` |
| `bool` | `eq` | `is_primary_listing`, `optionable` |

### Narrowing fields (lead with these)

Fields flagged `narrowing: true` (`in_index`, `exchange`, `country`, `sector`,
`industry`, `is_primary_listing`) are cheap and highly selective. Apply them **first** —
`in_index:has:SP500` cuts the universe to ~500 rows before numeric filters and before
piping into `calculated-events`, which pays a per-symbol cost.

---

## traderbro screener values

List every distinct non-null value present in the live DataMatrix for a given field. Use this before filtering on categorical fields so you know the exact strings the screener accepts.

No authentication required.

### Usage

```bash
traderbro screener values <field> [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--json` | bool | false | Output as JSON |
| `--plain` | bool | false | One value per line — clean for piping or scripting |
| `--jq` | string | — | Apply jq expression to JSON output |
| `-q, --quiet` | bool | false | Suppress stderr hint line |

### Examples

```bash
# What sectors exist in the matrix?
traderbro screener values sector

# All industries — pipe into grep
traderbro screener values industry --plain | grep -i software

# Valid exchange values as JSON
traderbro screener values exchange --json

# Countries, piped to count
traderbro screener values country --plain | wc -l

# Numeric field — returns min/max/avg instead
traderbro screener values pe_ratio
traderbro screener values ch1y
```

### Output (Table mode — categorical)

```
sector
──────────────────────
Communication Services
Consumer Discretionary
Consumer Staples
Energy
Financials
Healthcare
Industrials
Materials
Real Estate
Technology
Utilities

  11 unique values  ·  cache: warm  ·  use these exact strings in --filter sector:eq:<value>
```

### Output (Table mode — numeric field)

```
Field      Type     Count   Min       Max          Avg
──────────────────────────────────────────────────────
pe_ratio   numeric   3510   0.02   106675.72     131.15
```

### Output (JSON mode — categorical)

```json
{
  "field": "sector",
  "type": "categorical",
  "count": 11,
  "values": [
    "Communication Services",
    "Consumer Discretionary",
    ...
    "Technology",
    "Utilities"
  ],
  "cache_status": "warm"
}
```

### Output (JSON mode — numeric)

```json
{
  "field": "pe_ratio",
  "type": "numeric",
  "count": 3510,
  "min": 0.02,
  "max": 106675.72,
  "avg": 131.15,
  "cache_status": "warm"
}
```

### Why this matters

Categorical filter values must **exactly** match strings present in the DataMatrix. The screener does case-insensitive comparison, but the value must exist — `"tech"` and `"Information Technology"` return 0 results because the matrix uses `"Technology"`. Always call `screener values <field>` first when working with sector, industry, exchange, or country filters.

---

## traderbro screener run

Run a screen against the current DataMatrix snapshot. Filters are ANDed together.

Requires authentication.

### Usage

```bash
traderbro screener run [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--filter` | string | — | Filter expression: `key:op:value`. Repeatable. |
| `--sort` | string | `market_cap:desc` | Sort field and direction: `key:asc` or `key:desc` |
| `--limit` | int | `50` | Max results (server cap: 500) |
| `-c, --columns` | string | — | Comma-separated fields to return (e.g. `symbol,rsi,pe_ratio`). Omit → compact default set; `all` → every field. |
| `--symbols-only` | bool | false | Output symbol list only — clean for piping |
| `--json` | bool | false | Output as JSON |
| `--plain` | bool | false | Tab-delimited output |
| `--jq` | string | — | Apply jq expression to JSON output |
| `-q, --quiet` | bool | false | Suppress stderr stats line |

### Filter operators

| Operator | Meaning | Example |
|---|---|---|
| `gt` | greater than | `market_cap:gt:1B` |
| `lt` | less than | `pe_ratio:lt:20` |
| `gte` | greater than or equal | `pe_ratio:gte:15` |
| `lte` | less than or equal | `revenue_growth:lte:5` |
| `eq` | equals (case-insensitive) | `sector:eq:Technology` |
| `neq` | not equal | `sector:neq:Energy` |
| `between` | inclusive range | `pe_ratio:between:10,30` |
| `in` | in list | `sector:in:Technology,Healthcare` |
| `has` | set membership (array fields) | `in_index:has:SP500` |
| `match` | substring (text fields) | `name:match:capital` |

Operators are validated against the field's `type` (see `schema`). Using an
invalid operator returns `400` with the valid set — e.g. `sector:gt:5` →
`op 'gt' invalid for type 'categorical'`.

A non-default timeframe/period/window is applied with an `@` suffix on the key:
`rsi@1W:lt:30`, `revenue@fq:gt:250M`. Invalid modifiers return `400` with the
allowed values.

### Field-vs-field comparison (`@column`)

A filter value can reference **another column** instead of a constant — prefix it
with `@`. The comparison runs server-side over the **whole universe** (not just the
returned page), so `total` is the true count.

```bash
# uptrend regime: 50-day MA above the 200-day MA
traderbro screener run --filter "ma50:gt:@ma200" --columns symbol,ma50,ma200

# within 5% of the 52-week high (scale the RHS)
traderbro screener run --filter "close:gte:@high52*0.95"

# cheaper than its sector
traderbro screener run --filter "pe_ratio:lt:@sector_pe"

# bullish MACD (both operands are live TradingView fields)
traderbro screener run --filter "market_cap:gt:200B" --filter "MACD.macd:gt:@MACD.signal"
```

- **Operand grammar:** `@field`, `@field*k` / `@field/k` (scale), `@field+c` / `@field-c`
  (offset), combinable as `@field*k+c`. The field may itself carry a timeframe
  modifier (`@rsi@1W`).
- **Operators:** `gt`, `lt`, `gte`, `lte` only (float equality / ranges / text don't
  apply column-to-column). Other ops return `400`.
- **Both operands must be numeric**; an unknown or non-numeric RHS returns `400`
  (with `did_you_mean`).
- **AND-only / binary:** comparisons are ordinary `--filter` entries, ANDed with the
  rest. Each is binary — write `a < b < c` as two filters (`a:lt:@b` + `b:lt:@c`).
- **Federated operands:** if either operand is a live TradingView field, the
  comparison runs *after* probing TV and **cannot narrow the probe set** — pair it
  with a selective stored filter (`market_cap`, `sector`, `in_index`) or it returns
  `federation: needs_narrowing` (see Federation below).

### Response fields

Run responses include `total` (full match count before the `--limit` slice) and
`has_more` (whether more rows exist beyond what was returned), so an agent can size
the universe without paging. The `columns` field echoes the projection that was
applied (`null` when the full row was returned via `--columns all`).

#### Federation (live TradingView passthrough)

When a screen touches a **federated** field (live TradingView data, e.g. `aum`,
`expense_ratio`), the response also carries:

| Field | Meaning |
|---|---|
| `federation` | `live` (all probed symbols resolved) · `partial` (some symbols couldn't be mapped to TradingView) · `unresolved` (none could be mapped — live side empty) · `unavailable` (federation disabled) · `needs_narrowing` (stored filter not selective enough to probe) |
| `federation_unresolved` | `{count, reason, sample}` — symbols excluded from the live side because they have **no TradingView symbol mapping**. In table mode this prints to stderr as `live data unavailable for N symbol(s) (no TradingView mapping)`. |

`unresolved` symbols are **never** silently dropped or shown as a null value: a row
that matched the stored filters still appears (its federated column simply omitted),
and a federated *filter* never treats an unmapped symbol as "failed the filter" — it
is reported in `federation_unresolved` instead. Coverage is broad for US, Japan,
China, Korea, Hong Kong, Saudi, Canada, UK-primary and NSE-India; some markets
(e.g. BSE numeric scrips, LSE foreign secondaries) may be unresolved.

#### All TradingView fields are queryable

Every screenable TradingView field (~700) is a queryable federated field, referenced
by its **raw TV column name** (e.g. `return_on_equity_fq`, `price_earnings_ttm`,
`total_revenue_ttm`). Discover them with `screener schema --search "<concept>"` — TV
fields are tagged `source: tradingview` (vs `snapshot` for local matrix fields). A
field with `freshness: live` in the response was served live from TradingView. These
fetch live (so they need `SCREENER_FEDERATION_ENABLED`) and only for symbols that
crosswalk to TV's namespace (others appear in `federation_unresolved`).

```bash
screener schema --search "return on equity"          # find TV field names
screener run --filter "return_on_equity_fq:gt:20" \  # query bare, routes live
  --filter "market_cap:gt:1B" --columns symbol,return_on_equity_fq
```

### Selecting columns

The DataMatrix is ~300 fields wide. **Always name the columns you need** with
`--columns` — it makes responses faster, smaller, and focused on the question:

```bash
# return only the fields the question is about
traderbro screener run --filter "rsi:lt:30" --columns symbol,rsi,close_price,sector

# the full ~300-field row (rare — exports / inspection)
traderbro screener run --filter "market_cap:gt:50B" --columns all
```

If you omit `--columns`, the server projects to a **compact default set**
(`symbol, name, sector, close_price, market_cap, change, ch1y, pe_ratio, rsi,
dividend_yield, volume`). An unknown column returns `400` with `did_you_mean` —
discover keys with `screener schema --search <concept>`. In table/plain output
the displayed columns follow whatever you requested.

### Value suffixes

Numeric values accept magnitude suffixes (case-insensitive):

| Suffix | Multiplier | Example |
|---|---|---|
| `K` | ×1,000 | `volume:gt:500K` |
| `M` | ×1,000,000 | `market_cap:gt:500M` |
| `B` | ×1,000,000,000 | `market_cap:gt:1B` |
| `T` | ×1,000,000,000,000 | `market_cap:lt:2T` |

Null values are always excluded from numeric comparisons.

### Examples

```bash
# Technology stocks with market cap > $1B
traderbro screener run --filter "sector:eq:Technology" --filter "market_cap:gt:1B"

# P/E between 10 and 30, sorted by market cap ascending
traderbro screener run --filter "pe_ratio:between:10,30" --sort market_cap:asc --limit 20

# Stocks down >20% over 1 year but up >10% over 6 months (recovery candidates)
traderbro screener run \
  --filter "ch1y:lt:-20" \
  --filter "ch6m:gt:10" \
  --sort ch6m:desc \
  --limit 50

# Energy or Utilities sector stocks, JSON output
traderbro screener run --filter "sector:in:Energy,Utilities" --json

# Symbol-only output for piping (one EXCHANGE:TICKER per line)
traderbro screener run \
  --filter "sector:eq:Technology" \
  --filter "market_cap:gt:5B" \
  --symbols-only

# Discover the schema, then apply the right keys
traderbro screener schema --category performance
traderbro screener run --filter "ch1m:gt:20" --filter "ch3m:gt:0" --sort ch1m:desc
```

### Piping into calculated-events scan

`--symbols-only` produces one `EXCHANGE:TICKER` per line on stdout, designed to be piped:

```bash
# Find Technology mega-caps, then scan for hammer candlestick pattern
traderbro screener run \
  --filter "sector:eq:Technology" \
  --filter "market_cap:gt:10B" \
  --symbols-only \
  | traderbro calculated-events scan --type CDLHAMMER
```

### Output (Table mode)

```
Symbol        Name                       Mkt Cap    Close    Sector
────────────────────────────────────────────────────────────────────
NASDAQ:AAPL   Apple Inc                  3.00T      213.50   Technology
NASDAQ:MSFT   Microsoft Corporation      2.80T      425.80   Technology
NYSE:XOM      Exxon Mobil Corp           400.00B    118.20   Energy
```

Stderr (unless `--quiet`):

```
  3 results  ·  cache: warm  ·  use --symbols-only to pipe into calculated-events scan
```

### Output (JSON mode)

```json
{
  "count": 3,
  "cache_status": "warm",
  "results": [
    {
      "symbol": "NASDAQ:AAPL",
      "exchange": "NASDAQ",
      "name": "Apple Inc",
      "sector": "Technology",
      "market_cap": 3000000000000,
      "close_price": 213.50,
      "pe_ratio": 28.5,
      "ch1y": 12.3,
      "ch6m": 8.1
    }
  ]
}
```

### Output (symbols-only JSON mode)

```json
{
  "count": 3,
  "cache_status": "warm",
  "symbols": [
    "NASDAQ:AAPL",
    "NASDAQ:MSFT",
    "NYSE:XOM"
  ]
}
```

### Cache status

| Value | Meaning |
|---|---|
| `warm` | DataMatrix is populated — results are live |
| `cold` | Cache is empty (server just started or Redis flushed) — returns zero results |

When the cache is cold, `count` will be `0` and `results` will be `[]`. Retry in a few minutes while the background job repopulates.

---

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `2` | Authentication failure (screener run only) |
| `4` | Validation error (bad filter expression or unknown operator) |
| `5` | Network error |
