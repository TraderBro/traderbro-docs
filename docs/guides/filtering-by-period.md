---
sidebar_position: 3
title: Filtering by Period
---

# Filtering by Period

The `--period` flag controls which return window is used for sorting and display. Choosing the right period depends on your trading style.

---

## Available periods

| Period | Value | Use for |
|---|---|---|
| 7 days | `7d` | Very short-term, momentum traders |
| 1 month | `1m` | Swing traders, short thesis |
| 3 months | `3m` | Medium-term, most general-purpose |
| 6 months | `6m` | Longer thesis, sector rotation |
| 1 year | `1y` | Long-term investors |
| Lifetime/max | *(omit flag)* | All-time performance |

---

## How period return is calculated

A prediction's period return is the direction-adjusted price change from the date of the call to the end of the window.

- A **bullish** call on a stock that rose 15% in 3 months = `+15%`
- A **bearish** call on a stock that fell 10% in 1 month = `+10%` (correct direction, positive return)
- A **bullish** call on a stock that fell 8% in 3 months = `-8%` (wrong direction)

See [Return Calculation](/concepts/return-calculation) for the full methodology.

---

## Why period return can be null

`avg_return_3m: null` means not enough of the analyst's predictions have had their 3-month window mature yet. A new analyst with 10 predictions all made 2 months ago will show null for `3m`, `6m`, and `1y` — but will show a value for `7d` and `1m`.

As windows mature, these fields populate automatically.

---

## Picking the right period for your strategy

**Day/momentum trading** — `7d` is barely useful here; the CLI is better suited for swing to medium-term.

**Swing trading** — `1m` tells you which analysts make calls that resolve profitably within a month. Good for identifying analysts who trade catalysts (earnings, product launches).

**General use** — `3m` is the most balanced. Long enough that most predictions have matured, short enough to reflect recent performance rather than years-old data.

**Sector rotation / macro** — `6m` or `1y`. Analysts with strong 6-month returns tend to identify structural trends early rather than just reacting to news.

---

## Examples

```bash
# Analysts best suited for 3-month swing trades
traderbro analyst list --period 3m --sort return --min-predictions 10

# Short-term momentum — 1-month return, US-only
traderbro analyst list --period 1m --sort return --country US

# Long-term — 1-year return, 20+ predictions
traderbro analyst list --period 1y --sort return --min-predictions 20
```
