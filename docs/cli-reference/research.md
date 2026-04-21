---
sidebar_position: 6
title: research
---

# research

Commands for querying published research articles on TraderBro.

---

## traderbro research list

List published research articles.

### Usage

```bash
traderbro research list [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--category` | string | — | Filter by category: `stock`, `industry`, `macro`, `earnings`, `outlook` |
| `--country` | string | — | Filter by country code |
| `--language` | string | — | Filter by language: `en`, `bn`, `hi`, `ur` |
| `--featured` | bool | false | Only featured articles |

### Examples

```bash
# Stock research in English
traderbro research list --category stock --language en --json

# Featured articles
traderbro research list --featured --json

# US market research
traderbro research list --country us --json
```

### Output (JSON mode)

```json
{
  "count": 28,
  "results": [
    {
      "id": 10,
      "slug": "nvda-q1-outlook",
      "title": "NVDA Q1 2025 Outlook",
      "category": "stock",
      "author_display_name": "TraderBro Research",
      "published_at": "2025-03-01T09:00:00Z"
    }
  ]
}
```

---

## traderbro research get

Get a full research article including excerpt.

### Usage

```bash
traderbro research get <slug> [flags]
```

### Examples

```bash
traderbro research get nvda-q1-outlook
traderbro research get nvda-q1-outlook --json
```

### Output (Table mode)

```
ID:        10
Title:     NVDA Q1 2025 Outlook
Slug:      nvda-q1-outlook
Category:  stock
Author:    TraderBro Research
Published: 2025-03-01T09:00:00Z
Excerpt:   Demand from hyperscalers continues to...
```

### Output (JSON mode)

```json
{
  "id": 10,
  "slug": "nvda-q1-outlook",
  "title": "NVDA Q1 2025 Outlook",
  "category": "stock",
  "author_display_name": "TraderBro Research",
  "published_at": "2025-03-01T09:00:00Z",
  "excerpt": "Demand from hyperscalers continues to..."
}
```

---

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `2` | Authentication failure |
| `3` | Article not found |
| `4` | Validation error |
| `5` | Network error |
