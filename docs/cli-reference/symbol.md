---
sidebar_position: 4
title: symbol
---

# symbol

Commands for searching and querying symbols tracked by TraderBro.

---

## traderbro symbol list

List tracked symbols with prediction and mention counts.

### Usage

```bash
traderbro symbol list [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--type` | string | — | Filter by type: `stock`, `etf`, `crypto` |
| `--country` | string | — | Filter by country code (e.g. `US`, `BD`) |
| `--sector` | string | — | Filter by sector |
| `--search` | string | — | Search by name or ticker |
| `--has-predictions` | bool | false | Only symbols with analyst predictions |

### Examples

```bash
# All symbols with predictions
traderbro symbol list --has-predictions --json

# US stocks only
traderbro symbol list --type stock --country US --json

# Technology sector symbols
traderbro symbol list --sector Technology --json
```

### Output (JSON mode)

```json
{
  "count": 312,
  "results": [
    {
      "id": 42,
      "symbol": "NVDA",
      "name": "NVIDIA Corporation",
      "symbol_type": "stock",
      "country": "US",
      "predictions_count": 18,
      "mentions_count": 47
    }
  ]
}
```

---

## traderbro symbol search

Search symbols by name or ticker.

### Usage

```bash
traderbro symbol search <query> [flags]
```

### Examples

```bash
traderbro symbol search "Tesla" --json
traderbro symbol search NVDA --json
```

### Output (JSON mode)

```json
{
  "count": 2,
  "results": [
    {
      "id": 7,
      "symbol": "TSLA",
      "name": "Tesla, Inc.",
      "symbol_type": "stock",
      "country": "US"
    }
  ]
}
```

---

## traderbro symbol mentions

List content mentions for a symbol (from tweets, videos, articles).

### Usage

```bash
traderbro symbol mentions <id> [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--type` | string | — | Filter by mention type |

### Examples

```bash
traderbro symbol mentions 42 --json
traderbro symbol mentions 42 --type prediction --json
```

### Output (JSON mode)

```json
{
  "results": [
    {
      "id": 201,
      "mention_type": "prediction",
      "direction": "bullish",
      "confidence_score": 85,
      "key_quote": "NVDA is a must-hold..."
    }
  ]
}
```

---

## traderbro symbol predictions

List analyst predictions for a symbol.

### Usage

```bash
traderbro symbol predictions <id> [flags]
```

### Examples

```bash
traderbro symbol predictions 42 --json
```

### Output (JSON mode)

```json
{
  "results": [
    {
      "id": 101,
      "analyst_name": "No Limit Gains",
      "direction": "bullish",
      "stated_price_target": "650",
      "confidence_score": 85,
      "published_at": "2025-03-15T10:00:00Z"
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
| `3` | Symbol not found |
| `4` | Validation error |
| `5` | Network error |
