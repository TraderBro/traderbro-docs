---
sidebar_position: 3
title: prediction
---

# prediction

Commands for querying analyst predictions across all tracked symbols.

---

## traderbro prediction list

List analyst predictions with filtering and sorting options.

### Usage

```bash
traderbro prediction list [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--symbol` | string | — | Filter by ticker (e.g. `AAPL`, `TSLA`) |
| `--analyst` | string | — | Filter by analyst slug |
| `--direction` | string | — | Filter by direction: `bullish`, `bearish`, `neutral` |
| `--since` | string | — | Predictions published on or after (YYYY-MM-DD) |
| `--until` | string | — | Predictions published on or before (YYYY-MM-DD) |
| `--correct` | string | — | Filter by correctness: `true` or `false` |
| `--sort` | string | `date` | Sort by: `date`, `return`, `confidence` |

### Examples

```bash
# All NVDA predictions
traderbro prediction list --symbol NVDA --json

# Bullish calls since January 2025
traderbro prediction list --direction bullish --since 2025-01-01 --json

# Predictions by a specific analyst on TSLA
traderbro prediction list --analyst noLimitGains --symbol TSLA --json

# Incorrect predictions sorted by worst return
traderbro prediction list --correct false --sort return --json

# Daily watchlist script
for symbol in NVDA AMD MSFT; do
  traderbro prediction list --symbol $symbol \
    --since $(date -v-1d +%Y-%m-%d) --json
done
```

### Output (Table mode)

```
ID    Analyst          Symbol   Direction   Return %   Correct   Published
──────────────────────────────────────────────────────────────────────────
101   No Limit Gains   NVDA     bullish     +22.4%     ✓         2025-03-15
102   Alea Bitor       TSLA     bearish     +8.1%      ✓         2025-03-10
103   Crux Capital     AAPL     bullish     -3.2%      ✗         2025-03-05
```

`—` in the Correct column means the prediction window has not matured yet.

### Output (JSON mode)

```json
{
  "count": 234,
  "next": "https://api.traderbro.ai/...",
  "results": [
    {
      "id": 101,
      "analyst_name": "No Limit Gains",
      "analyst_slug": "noLimitGains",
      "symbol_ticker": "NVDA",
      "direction": "bullish",
      "confidence_score": 85,
      "current_return_pct": 22.4,
      "is_directionally_correct": true,
      "published_at": "2025-03-15T10:00:00Z"
    }
  ]
}
```

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
