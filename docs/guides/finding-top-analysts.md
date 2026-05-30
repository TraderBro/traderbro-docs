---
sidebar_position: 1
title: Finding Top Analysts
---

# Finding Top Analysts

This guide walks through the most useful combinations of filters for discovering analysts worth following.

---

## Start with return

The default sort. Return is how TraderBro measures analyst quality — how much money an analyst's calls would have made:

```bash
traderbro analyst list --sort return --limit 20
```

Return alone is not enough — an analyst with 10 predictions is less meaningful than one with 100. Add a minimum prediction count so a couple of lucky calls don't top the list:

```bash
traderbro analyst list --sort return --min-predictions 20 --limit 20
```

---

## Use a time window

Return sorted over a specific period:

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
traderbro analyst list --country US --sort return --min-predictions 20

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
# US Technology analysts, 3-month return, ≥15 predictions
traderbro analyst list \
  --country US \
  --sector Technology \
  --period 3m \
  --sort return \
  --min-predictions 15 \
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
