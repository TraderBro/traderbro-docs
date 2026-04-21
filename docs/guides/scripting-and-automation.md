---
sidebar_position: 4
title: Scripting and Automation
---

# Scripting and Automation

The CLI is designed for shell scripting. Use `--json` for structured output and `--plain` for tab-delimited pipelines.

---

## Daily watchlist check

Check for new predictions on your symbols every morning:

```bash
#!/bin/bash
YESTERDAY=$(date -v-1d +%Y-%m-%d)   # macOS
# YESTERDAY=$(date -d "yesterday" +%Y-%m-%d)  # Linux

for symbol in NVDA AMD MSFT TSLA; do
  echo "=== $symbol ==="
  traderbro prediction list \
    --symbol $symbol \
    --since $YESTERDAY \
    --json \
    | jq '.results[] | {analyst: .analyst_name, direction, confidence: .confidence_score}'
done
```

---

## Find top analysts and get their sector edge

```bash
#!/bin/bash
# Get top 5 analysts by 3-month return, then get their Technology edge

traderbro analyst list \
  --period 3m --sort return --min-predictions 10 --limit 5 \
  --jq '.results[].slug' \
| while read slug; do
    echo "=== $slug ==="
    traderbro analyst sector-edge "$slug" \
      --period 3m --group-by industry --json \
      | jq '.rows[] | select(.label == "Semiconductors")'
  done
```

---

## Tab-delimited output with `--plain`

`--plain` outputs tab-separated values with no colors or table borders. Suitable for `awk`, `cut`, and CSV pipelines:

```bash
traderbro analyst list --plain | awk -F'\t' '{print $1, $3}'
```

---

## Inline filtering with `--jq`

`--jq` applies a jq expression directly — no need to pipe through `jq`:

```bash
# Just slugs
traderbro analyst list --jq '.results[].slug'

# Slugs and accuracy as CSV
traderbro analyst list --jq '.results[] | [.slug, .accuracy_rate] | @csv'

# Predictions for NVDA, bullish only, return > 10%
traderbro prediction list --symbol NVDA --direction bullish --json \
  | jq '.results[] | select(.current_return_pct > 10)'
```

---

## Cron job pattern

Run a nightly summary and save to a file:

```cron
0 6 * * * traderbro analyst list --period 3m --sort return --limit 20 --json \
  > /tmp/traderbro-morning-$(date +\%Y-\%m-\%d).json
```

---

## Using environment variables in scripts

No config file needed in CI or containerised environments:

```bash
export TRADERBRO_SERVER="https://api.traderbro.com"
export TRADERBRO_API_KEY="tb_sk_..."

traderbro analyst list --json
```

---

## Exit code checking

```bash
traderbro analyst get unknown-analyst
if [ $? -eq 3 ]; then
  echo "Analyst not found"
fi
```

| Exit code | Meaning |
|---|---|
| `0` | Success |
| `2` | Auth failure |
| `3` | Not found |
| `4` | Bad flag value |
| `5` | Network error |
