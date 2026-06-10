---
sidebar_position: 4
title: symbol
---

# symbol

Commands for searching and querying symbols tracked by TraderBro.

---

> `symbol predictions` was replaced by the unified [`prediction`](/cli-reference/prediction) command: `traderbro prediction --symbol EXCHANGE:TICKER`.

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
| `--tz` | string | — | Render timestamps in this IANA zone (default: each symbol's exchange / market time) |

`--sort skew` ranks by `bull_bear_ratio`; `--sort change` ranks by `pct_change_vs_prior_window` (prediction volume vs the immediately-prior equal-length window — momentum). Both require a bounded `--since`. Each result includes `bull_bear_ratio` and `pct_change_vs_prior_window`. `latest_prediction_at` is ISO 8601 in **market time = the symbol's exchange timezone** (US → `-04:00/-05:00`, DSE → `+06:00`, Tadawul → `+03:00`); pass `--tz America/New_York` (or any IANA zone) to force one zone for the whole response. In `--summary` mode timestamps use `--tz` or UTC (aggregates span many exchanges).

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
