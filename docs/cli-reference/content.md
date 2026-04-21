---
sidebar_position: 5
title: content
---

# content

Commands for querying monitored analyst content — tweets, YouTube videos, Substack articles, and transcripts.

---

## traderbro content list

List monitored content items with filtering options.

### Usage

```bash
traderbro content list [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--analyst` | string | — | Filter by analyst slug |
| `--source` | string | — | Filter by source: `twitter`, `youtube`, `substack` |
| `--type` | string | — | Filter by content type: `tweet`, `video`, `article`, `transcript` |
| `--relevant` | bool | false | Only content classified as market-relevant |
| `--securities` | bool | false | Only content that mentions securities |
| `--since` | string | — | Content published on or after (YYYY-MM-DD) |

### Examples

```bash
# Recent Twitter content from a specific analyst
traderbro content list --analyst noLimitGains --source twitter --limit 10 --json

# Market-relevant content mentioning securities since Jan 2025
traderbro content list --relevant --securities --since 2025-01-01 --json

# All YouTube videos
traderbro content list --source youtube --type video --json
```

### Output (JSON mode)

```json
{
  "count": 150,
  "results": [
    {
      "id": 501,
      "content_type": "tweet",
      "analyst_slug": "noLimitGains",
      "title": "NVDA breaking out of consolidation...",
      "published_date": "2025-03-15"
    }
  ]
}
```

---

## traderbro content get

Get full content detail including symbol mentions.

### Usage

```bash
traderbro content get <id> [flags]
```

### Examples

```bash
traderbro content get 501
traderbro content get 501 --json
```

### Output (Table mode)

```
ID:        501
Title:     NVDA breaking out of consolidation...
URL:       https://twitter.com/...
Type:      tweet
Analyst:   noLimitGains
Published: 2025-03-15
```

### Output (JSON mode)

```json
{
  "id": 501,
  "title": "NVDA breaking out of consolidation...",
  "url": "https://twitter.com/...",
  "content_type": "tweet",
  "analyst_slug": "noLimitGains",
  "published_date": "2025-03-15"
}
```

---

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `2` | Authentication failure |
| `3` | Content not found |
| `4` | Validation error |
| `5` | Network error |
