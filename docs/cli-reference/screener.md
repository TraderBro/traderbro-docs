---
sidebar_position: 7
title: screener
---

# screener

Commands for screening stocks using the live DataMatrix snapshot — a Redis-cached set of fundamentals, valuations, price levels, and performance metrics updated throughout the trading day.

---

## traderbro screener schema

List all filterable fields with their types, categories, and descriptions.

No authentication required — use this to discover available filter keys before running a screen.

### Usage

```bash
traderbro screener schema [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--category` | string | — | Narrow to one category: `valuation`, `growth`, `performance`, `price`, `profitability`, `financials`, `balance_sheet`, `dividends`, `risk`, `price_levels`, `metadata` |
| `--json` | bool | false | Output as JSON |
| `--plain` | bool | false | Tab-delimited output |
| `--jq` | string | — | Apply jq expression to JSON output |

### Examples

```bash
# All fields (table)
traderbro screener schema

# Only valuation fields
traderbro screener schema --category valuation

# Growth fields as JSON — pipe to jq for just the keys
traderbro screener schema --category growth --json | jq '[.fields[].key]'
```

### Output (Table mode)

```
Key                  Type         Category     Label
────────────────────────────────────────────────────────────────
market_cap           numeric      valuation    Market Cap
pe_ratio             numeric      valuation    P/E Ratio
revenue_growth       numeric      growth       Revenue Growth %
ch1y                 numeric      performance  1-Year Change %
sector               categorical  metadata     Sector
```

### Output (JSON mode)

```json
{
  "fields": [
    {
      "key": "market_cap",
      "label": "Market Cap",
      "description": "Total market capitalisation (USD)",
      "type": "numeric",
      "category": "valuation"
    }
  ]
}
```

### Field types

| Type | Operators available |
|---|---|
| `numeric` | `gt`, `lt`, `gte`, `lte`, `between` |
| `categorical` | `eq`, `neq`, `in` |
| `date` | `gt`, `lt`, `gte`, `lte` |

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
