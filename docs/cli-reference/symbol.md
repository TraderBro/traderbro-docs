---
sidebar_position: 4
title: symbol
---

# symbol

Commands for searching and querying symbols tracked by TraderBro.

---

## traderbro symbol search

Find the `EXCHANGE:SYMBOL` identifier for a company. Use the returned value with `symbol mentions` or `symbol predictions`.

### Usage

```bash
traderbro symbol search <query> [flags]
```

### Examples

```bash
# Search by company name
traderbro symbol search "Tesla" --json

# Search by ticker
traderbro symbol search AAPL --json
```

### Output (JSON mode)

```json
{
  "count": 1,
  "results": [
    {
      "symbol": "NASDAQ:TSLA",
      "name": "Tesla, Inc.",
      "exchange": "NASDAQ",
      "type": "stock",
      "country": "US"
    }
  ]
}
```

The `symbol` field is in `EXCHANGE:SYMBOL` format and is directly usable with `symbol mentions` and `symbol predictions`.

---

## traderbro symbol mentions

List content mentions for a symbol (from tweets, videos, articles).

### Usage

```bash
traderbro symbol mentions <EXCHANGE:SYMBOL> [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--type` | string | — | Filter by mention type: `commentary`, `prediction`, `risk_mention`, `conditional_prediction` |

### Examples

```bash
traderbro symbol mentions NASDAQ:TSLA --json
traderbro symbol mentions BINANCE:BTC --type commentary --json
traderbro symbol mentions NASDAQ:TSLA --type prediction --json

# Get all analysts who have commented on a symbol
traderbro symbol mentions NASDAQ:NVDA --json --jq '[.results[].analyst_slug] | unique'
```

### Output (JSON mode)

```json
{
  "count": 12,
  "page": 1,
  "page_size": 25,
  "total_pages": 1,
  "results": [
    {
      "id": 201,
      "symbol_ticker": "BTC",
      "analyst_slug": "apompliano",
      "mention_type": "commentary",
      "direction": null,
      "confidence_score": null,
      "key_quote": "bitcoin is hanging in there...",
      "content_url": "https://x.com/APompliano/status/...",
      "content_published": "2026-03-13T18:36:45Z"
    }
  ]
}
```

---

## traderbro symbol predictions

List analyst predictions for a symbol.

### Usage

```bash
traderbro symbol predictions <EXCHANGE:SYMBOL> [flags]
```

### Examples

```bash
traderbro symbol predictions NASDAQ:TSLA --json
traderbro symbol predictions NYSE:AAPL --json
traderbro symbol predictions DSE:ABBANK --json
```

### Output (JSON mode)

```json
{
  "count": 5,
  "page": 1,
  "page_size": 25,
  "total_pages": 1,
  "results": [
    {
      "id": 101,
      "analyst_slug": "askedgar",
      "analyst_name": "Ask Edgar",
      "direction": "bullish",
      "stated_price_target": "650",
      "confidence_score": 85,
      "published_at": "2026-03-15T10:00:00Z"
    }
  ]
}
```

---

## traderbro symbol trending

List symbols trending in analyst research coverage, ranked by analyst activity.

### Usage

```bash
traderbro symbol trending [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--since` | string | `all` | Time window: `4h`, `24h`, `1d`, `3d`, `7d`, `15d`, `30d`, `1m`, `3m`, `1y`, `all` |
| `--exchange` | string | — | Filter by exchange (e.g. `NASDAQ`, `NYSE`) |
| `--sector` | string | — | Filter by sector (e.g. `Technology`, `Healthcare`) |
| `--sort` | string | `analysts` | Sort order: `analysts`, `predictions`, `volume`, `bullish`, `bearish`, `skew`, `change` |
| `--min-predictions` | int | `0` | Drop symbols with fewer than N predictions in the window |
| `--summary` | bool | `false` | Window aggregates only (totals, ratio, unique symbols/analysts) — for live-tape posts |

`--sort skew` ranks by `bull_bear_ratio`; `--sort change` ranks by `pct_change_vs_prior_window` (prediction volume vs the immediately-prior equal-length window — momentum). Both require a bounded `--since`. Each result includes `bull_bear_ratio` and `pct_change_vs_prior_window`; `latest_prediction_at` is ISO 8601 in market time (ET).

### Examples

```bash
# Most-covered symbols in the last 4 hours (intraday)
traderbro symbol trending --since 4h

# Most-covered symbols in the last 24 hours
traderbro symbol trending --since 24h

# Most-covered symbols in the last 7 days
traderbro symbol trending --since 7d

# Most bullish NASDAQ stocks this month
traderbro symbol trending --since 1m --exchange NASDAQ --sort bullish

# Technology sector, all time, JSON
traderbro symbol trending --sector Technology --json

# What's SURGING in attention right now (momentum), min 3 prints
traderbro symbol trending --since 24h --sort change --min-predictions 3 --json

# Most one-sided (bull/bear skew) this week
traderbro symbol trending --since 7d --sort skew --json

# Aggregate tape summary for a live post (no per-symbol breakdown)
traderbro symbol trending --since 24h --summary --json

# Pipe to jq
traderbro symbol trending --since 7d --json | jq '.results[:5] | .[].ticker'
```

### Output (Table mode)

```
Ticker   Exchange   Analysts   Predictions   Bull   Bear   Latest
──────────────────────────────────────────────────────────────────
NVDA     NASDAQ     5          12            10     2      2026-04-20T10:00:00Z
AAPL     NASDAQ     4          9             8      1      2026-04-19T14:30:00Z
```

### Output (JSON mode)

```json
{
  "count": 48,
  "results": [...],
  "list_limit": 100,
  "list_limit_tier": "anonymous",
  "list_limit_reached": true
}
```

When `list_limit_reached` is `true`, results are capped by your plan. The CLI prints a warning to stderr:

```
  ⚠ Showing first 100 results (guest limit). Log in or upgrade at https://traderbro.ai/#pricing
```

---

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `2` | Authentication failure |
| `3` | Symbol not found |
| `4` | Validation error (e.g. missing exchange prefix) |
| `5` | Network error |
