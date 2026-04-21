---
sidebar_position: 1
title: Finding Top Analysts
---

# Finding Top Analysts

This guide walks through the most useful combinations of filters for discovering analysts worth following.

---

## Start with accuracy

The default sort. Gets you analysts with the highest directional hit rate:

```bash
traderbro analyst list --sort accuracy --limit 20
```

Accuracy alone is not enough — an analyst with 10 predictions at 80% accuracy is less meaningful than one with 100 predictions at 70%.

Add a minimum prediction count:

```bash
traderbro analyst list --sort accuracy --min-predictions 20 --limit 20
```

---

## Sort by return instead

Accuracy measures whether calls are directionally correct. Return measures how much money those calls would have made:

```bash
traderbro analyst list --sort return --min-predictions 15 --limit 10
```

A high-return analyst who is only 55% accurate may still outperform a 75% accurate analyst with low-magnitude calls.

---

## Use a time window

Return and accuracy sorted over a specific period:

```bash
# Best analysts by 3-month return
traderbro analyst list --period 3m --sort return --min-predictions 10

# 1-month window — useful for swing traders
traderbro analyst list --period 1m --sort return --min-predictions 5
```

The `--period` flag changes which return column is used for both display and sorting. Without `--period`, lifetime return is used.

See [Filtering by Period](/guides/filtering-by-period) for a full explanation of what each window means.

---

## Filter by country

```bash
# US-focused analysts
traderbro analyst list --country US --sort accuracy --min-predictions 20

# Bangladesh market analysts
traderbro analyst list --country BD --sort return
```

---

## Filter by sector coverage

Find analysts who have made calls specifically in a sector:

```bash
traderbro analyst list --sector Technology --sort return --min-predictions 5 --json
traderbro analyst list --industry Semiconductors --min-predictions 3 --json
```

The return shown in sector/industry mode is the analyst's return within that segment, not their overall return.

---

## Combine filters

```bash
# US Technology analysts, 3-month return, ≥15 predictions, ≥60% accuracy
traderbro analyst list \
  --country US \
  --sector Technology \
  --period 3m \
  --sort return \
  --min-predictions 15 \
  --min-accuracy 60 \
  --json
```

---

## Pipe into sector-edge

Once you have a shortlist, drill into sector performance for each:

```bash
traderbro analyst list --period 3m --sort return --limit 5 --jq '.results[].slug' \
  | xargs -I{} traderbro analyst sector-edge {} --period 3m --json
```

See [Sector Edge Research](/guides/sector-edge-research) for more.
