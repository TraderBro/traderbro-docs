---
sidebar_position: 2
title: analyst
---

# analyst

Commands for querying analyst profiles, predictions, and sector performance.

---

## traderbro analyst list

List all tracked analysts with performance metrics.

### Usage

```bash
traderbro analyst list [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--sort` | string | `accuracy` | Sort by: `accuracy`, `return`, `predictions`, `name` |
| `--period` | string | — | Return period for sort/display: `7d`, `1m`, `3m`, `6m`, `1y` |
| `--country` | string | — | Filter by focus country (e.g. `US`, `BD`) |
| `--asset-class` | string | — | Filter by asset class (e.g. `Equities`, `Crypto`) |
| `--active` | bool | `true` | Only active analysts |
| `--min-predictions` | int | `0` | Minimum prediction count |
| `--min-return` | float | — | Minimum lifetime return % (e.g. `5` = 5%) |
| `--min-accuracy` | float | `0` | Minimum accuracy % (e.g. `60` = 60%) |
| `--sector` | string | — | Filter to analysts with calls in this sector (e.g. `Technology`) |
| `--industry` | string | — | Filter to analysts with calls in this industry (e.g. `Semiconductors`) |

### Examples

```bash
# Top 10 analysts by accuracy
traderbro analyst list --sort accuracy --limit 10

# Best 3-month return, US analysts, minimum 15 predictions
traderbro analyst list --period 3m --sort return --country US --min-predictions 15

# Analysts covering Technology sector with 5+ predictions, JSON output
traderbro analyst list --sector Technology --min-predictions 5 --json

# Analysts with ≥60% accuracy and positive returns
traderbro analyst list --min-accuracy 60 --min-return 0.01 --json
```

### Output (Table mode)

```
Slug              Name            Accuracy   Predictions   Return %
────────────────────────────────────────────────────────────────────
noLimitGains      No Limit Gains  71.2%      42            +18.4%
aleabitoreddit    Alea Bitor      68.5%      31            +14.1%
```

When `--sector` or `--industry` is used, the table shows segment-specific columns:

```
Slug              Name            Calls in Segment   Return % (Segment)
────────────────────────────────────────────────────────────────────────
noLimitGains      No Limit Gains  12                 +22.1%
```

### Output (JSON mode)

```json
{
  "count": 47,
  "next": null,
  "results": [
    {
      "slug": "noLimitGains",
      "name": "No Limit Gains",
      "accuracy_rate": 71.2,
      "predictions_count": 42,
      "overall_return_pct": 18.4,
      "avg_return_7d": null,
      "avg_return_1m": 8.2,
      "avg_return_3m": 12.1,
      "avg_return_6m": 15.3,
      "avg_return_1y": null,
      "is_active": true
    }
  ]
}
```

---

## traderbro analyst get

Get full analyst profile.

### Usage

```bash
traderbro analyst get <slug> [flags]
```

### Examples

```bash
traderbro analyst get noLimitGains
traderbro analyst get aleabitoreddit --json
```

### Output (Table mode)

```
Slug:         noLimitGains
Name:         No Limit Gains
Accuracy:     71.2%
Predictions:  42
Return %:     18.4%
Active:       true
Bio:          ...
```

### Output (JSON mode)

```json
{
  "slug": "noLimitGains",
  "name": "No Limit Gains",
  "accuracy_rate": 71.2,
  "predictions_count": 42,
  "overall_return_pct": 18.4,
  "is_active": true,
  "bio": "..."
}
```

---

## traderbro analyst predictions

List predictions made by an analyst.

### Usage

```bash
traderbro analyst predictions <slug> [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--symbol` | string | — | Filter by ticker (e.g. `AAPL`) |
| `--direction` | string | — | Filter by direction: `bullish`, `bearish`, `neutral` |

### Examples

```bash
traderbro analyst predictions noLimitGains
traderbro analyst predictions aleabitoreddit --direction bullish --json
traderbro analyst predictions crux_capital_ --symbol TSLA --json
```

### Output (JSON mode)

```json
{
  "count": 42,
  "results": [
    {
      "id": 101,
      "symbol_ticker": "NVDA",
      "direction": "bullish",
      "confidence_score": 85,
      "published_at": "2025-03-15T10:00:00Z"
    }
  ]
}
```

---

## traderbro analyst sector-edge

Show an analyst's return and accuracy breakdown by sector or industry.

### Usage

```bash
traderbro analyst sector-edge <slug> [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--group-by` | string | `sector` | Group by: `sector` or `industry` |
| `--period` | string | `max` | Return period: `7d`, `1m`, `3m`, `6m`, `1y`, `max` |
| `--min-calls` | int | `3` | Only show segments with at least N calls |

### Examples

```bash
# Sector breakdown for 3-month returns
traderbro analyst sector-edge noLimitGains --period 3m

# Industry breakdown, minimum 5 calls per segment
traderbro analyst sector-edge aleabitoreddit --group-by industry --min-calls 5

# JSON for agent use
traderbro analyst sector-edge crux_capital_ --period 1m --json
```

### Output (Table mode)

```
Sector          Calls   Accuracy %   Return % (3M)
──────────────────────────────────────────────────
Technology      14      78.6%        +24.3%
Financials      8       62.5%        +9.1%
Energy          3       66.7%        —
```

`—` means fewer than `--min-calls` or the return window has not matured for enough calls yet.

### Output (JSON mode)

```json
{
  "period": "3m",
  "group_by": "sector",
  "rows": [
    {
      "label": "Technology",
      "calls": 14,
      "accuracy": 78.6,
      "avg_return": 24.3
    }
  ]
}
```

---

## traderbro analyst sector-map

Show aggregate return and accuracy across **all analysts** by sector or industry.

### Usage

```bash
traderbro analyst sector-map [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--level` | string | `sector` | Aggregation level: `sector` or `industry` |
| `--period` | string | `max` | Return period: `7d`, `1m`, `3m`, `6m`, `1y`, `max` |
| `--min-calls` | int | `3` | Only show segments with at least N total calls |
| `--date-from` | string | — | Filter predictions published on or after (YYYY-MM-DD) |
| `--date-to` | string | — | Filter predictions published on or before (YYYY-MM-DD) |

### Examples

```bash
# Overall sector map
traderbro analyst sector-map

# Industry level, 3-month returns
traderbro analyst sector-map --level industry --period 3m

# Q1 2025 only
traderbro analyst sector-map --date-from 2025-01-01 --date-to 2025-03-31

# Top 5 sectors by return last month, JSON
traderbro analyst sector-map --date-from 2025-03-01 --date-to 2025-03-31 --period 1m --json \
  | jq '.rows | sort_by(-.avg_return) | .[0:5]'
```

### Output (Table mode)

```
Sector          Calls   Analysts   Accuracy %   Return % (Max)
───────────────────────────────────────────────────────────────
Technology      248     18         66.9%        +15.2%
Financials      134     12         61.2%        +8.7%
```

### Output (JSON mode)

```json
{
  "level": "sector",
  "period": "max",
  "rows": [
    {
      "label": "Technology",
      "calls": 248,
      "analyst_count": 18,
      "accuracy": 66.9,
      "avg_return": 15.2
    }
  ]
}
```

---

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `2` | Authentication failure |
| `3` | Analyst not found |
| `4` | Validation error (invalid flag value) |
| `5` | Network error |
