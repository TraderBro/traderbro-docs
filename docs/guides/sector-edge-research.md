---
sidebar_position: 2
title: Sector Edge Research
---

# Sector Edge Research

An analyst who is great overall may be mediocre in specific sectors. Sector edge tells you exactly where their expertise is concentrated.

---

## Why sector edge matters

Two analysts may both have 65% accuracy lifetime. But one might be 80% accurate in Technology and 45% in Energy, while the other is consistently 65% across all sectors. Before acting on a tech call, you want to know which category each analyst falls into.

---

## Getting sector edge for a single analyst

```bash
traderbro analyst sector-edge noLimitGains --period 3m
```

Output:

```
Sector          Calls   Accuracy %   Return % (3M)
──────────────────────────────────────────────────
Technology      14      78.6%        +24.3%
Financials      8       62.5%        +9.1%
Energy          3       —            —
```

`—` appears when there are fewer calls than `--min-calls` (default 3) or return windows haven't matured.

## Switch to industry-level breakdown

```bash
traderbro analyst sector-edge noLimitGains --group-by industry --period 3m
```

```
Industry            Calls   Accuracy %   Return % (3M)
──────────────────────────────────────────────────────
Semiconductors      9       88.9%        +31.2%
Software            5       60.0%        +14.1%
Banks               4       75.0%        +7.3%
```

---

## Using sector edge for stock selection

**Workflow:** Before acting on an analyst's call on a tech stock, check their Technology sector edge first.

```bash
# Step 1: Get the analyst's tech sector edge (6-month window)
traderbro analyst sector-edge aleabitoreddit --sector Technology --period 6m --json

# Step 2: If strong edge confirmed, get their recent NVDA predictions
traderbro analyst predictions aleabitoreddit --symbol NVDA --json
```

---

## Cross-analyst sector map

To see which sectors analysts are best at *in aggregate*:

```bash
traderbro analyst sector-map --period 3m
```

```
Sector          Calls   Analysts   Accuracy %   Return % (3M)
───────────────────────────────────────────────────────────────
Technology      248     18         66.9%        +15.2%
Financials      134     12         61.2%        +8.7%
Energy          87      9          58.6%        +4.1%
```

This tells you which sectors the TraderBro analyst pool has the most reliable signal in overall — useful for knowing which types of calls to trust most.

## Date-scoped sector map

```bash
# How did analysts perform in Q1 2025?
traderbro analyst sector-map \
  --date-from 2025-01-01 --date-to 2025-03-31 \
  --period 3m --json \
  | jq '.rows | sort_by(-.avg_return) | .[0:5]'
```

---

## Discover available sectors

```bash
traderbro sectors list
traderbro sectors industries Technology
```

Use the exact strings returned here as values for `--sector` and `--industry` flags.
