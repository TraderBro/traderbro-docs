---
sidebar_position: 1
title: Return Calculation
---

# Return Calculation

Understanding how TraderBro calculates returns is important for interpreting analyst performance correctly.

---

## Direction-adjusted return

Raw price return is adjusted for the direction of the call so that a correct prediction always yields a positive number:

| Call direction | Price move | Adjusted return |
|---|---|---|
| Bullish | +15% | **+15%** ✓ |
| Bearish | -10% | **+10%** ✓ |
| Bullish | -8% | **-8%** ✗ |
| Bearish | +12% | **-12%** ✗ |

This means you can compare returns across bullish and bearish calls on a single scale. An analyst who consistently calls direction correctly will show positive returns regardless of whether the market was rising or falling.

---

## Time windows

Each prediction has return values calculated at fixed intervals after the prediction date:

| Field | Window |
|---|---|
| `avg_return_7d` | 7 days after prediction |
| `avg_return_1m` | 30 days after prediction |
| `avg_return_3m` | 90 days after prediction |
| `avg_return_6m` | 180 days after prediction |
| `avg_return_1y` | 365 days after prediction |
| `overall_return_pct` | Lifetime average across all matured windows |

### When windows are null

A return field is `null` when not enough of the analyst's predictions have reached that window yet. For example:
- An analyst who made all their predictions 2 months ago will show values for `7d` and `1m` but `null` for `3m`, `6m`, and `1y`
- `null` is not the same as 0 — it means the window hasn't matured, not that the return was zero

---

## First Call vs Follower Return

When an analyst makes repeated predictions on the same symbol (a "series"), TraderBro attributes return credit to the first call in the series:

- `is_series_first: true` — this is the anchoring prediction; return is calculated from this date
- Subsequent calls in the series update the thesis but the performance clock started at the first call

This prevents double-counting credit for an analyst who repeatedly reaffirms the same position.

---

## `overall_return_pct`

This is the mean direction-adjusted return across all predictions that have at least one matured window. It is not a time-weighted portfolio return — it treats each prediction equally.

An analyst with 30 predictions averaging +12% has made better directional calls on average than one with 30 predictions averaging +4%, regardless of the time period.

---

## Period return vs lifetime return

When you pass `--period 3m` to `analyst list`, the sort and display column switches from `overall_return_pct` to `avg_return_3m`. This shows you which analysts have been most profitable specifically within the 3-month window — useful for finding analysts whose calls resolve quickly rather than analysts who have been correct over many years.
