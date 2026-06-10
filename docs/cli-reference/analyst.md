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
| `--sort` | string | `return` | Sort by: `return`, `predictions`, `name` |
| `--period` | string | — | Return period for sort/display: `7d`, `1m`, `3m`, `6m`, `1y` |
| `--exchange` | string | — | Filter by exchange analysts cover (e.g. `NASDAQ`, `NYSE`) |
| `--asset-class` | string | — | Filter by asset class (e.g. `Equities`, `Crypto`) |
| `--active` | bool | `true` | Only active analysts |
| `--min-predictions` | int | `0` | Minimum prediction count |
| `--min-return` | float | — | Minimum lifetime return % (e.g. `5` = 5%) |
| `--sector` | string | — | Filter to analysts with calls in this sector (e.g. `Technology`) |
| `--industry` | string | — | Filter to analysts with calls in this industry (e.g. `Semiconductors`) |

### Examples

```bash
# Top 10 analysts by return
traderbro analyst list --sort return --limit 10

# Best 3-month return, NASDAQ analysts, minimum 15 predictions
traderbro analyst list --period 3m --sort return --exchange NASDAQ --min-predictions 15

# Analysts covering Technology sector with 5+ predictions, JSON output
traderbro analyst list --sector Technology --min-predictions 5 --json

# Analysts with positive returns and a meaningful track record
traderbro analyst list --min-return 0.01 --min-predictions 15 --json
```

### Output (Table mode)

```
Slug              Name            Predictions   Return %
──────────────────────────────────────────────────────────
noLimitGains      No Limit Gains  42            +18.4%
aleabitoreddit    Alea Bitor      31            +14.1%
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
  "results": [...],
  "list_limit": 100,
  "list_limit_tier": "anonymous",
  "list_limit_reached": true
}
```

When `list_limit_reached` is `true`, the result set has been capped by your plan. The CLI prints a warning to stderr:

```
  ⚠ Showing first 100 results (guest limit). Log in or upgrade at https://traderbro.ai/#pricing
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
  "predictions_count": 42,
  "overall_return_pct": 18.4,
  "is_active": true,
  "bio": "..."
}
```

---

> `analyst predictions` was replaced by the unified [`prediction`](/cli-reference/prediction) command: `traderbro prediction --analyst <slug>` (adds return/period/sector/open filters).

## traderbro analyst sector-edge

Show an analyst's return breakdown by sector or industry.

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
Sector          Calls   Return % (3M)
─────────────────────────────────────────
Technology      14      +24.3%
Financials      8       +9.1%
Energy          3       —
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
      "avg_return": 24.3
    }
  ]
}
```

---

## traderbro analyst sector-map

Show aggregate return across **all analysts** by sector or industry.

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
Sector          Calls   Analysts   Return % (Max)
──────────────────────────────────────────────────
Technology      248     18         +15.2%
Financials      134     12         +8.7%
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
      "avg_return": 15.2
    }
  ]
}
```

---

> The old `analyst commentary` command was replaced by the unified [`insight`](/cli-reference/insight) command. Use `traderbro insight --analyst <slug>` (optionally `--type evidence_insight,catalyst_insight,commentary`).

---

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `2` | Authentication failure |
| `3` | Analyst not found |
| `4` | Validation error (invalid flag value) |
| `5` | Network error |
