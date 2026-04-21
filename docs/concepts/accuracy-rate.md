---
sidebar_position: 2
title: Accuracy Rate
---

# Accuracy Rate

`accuracy_rate` measures the percentage of an analyst's predictions that were directionally correct.

---

## Definition

A prediction is directionally correct if the price moved in the direction of the call by the end of the measurement window:

- **Bullish call** → stock price is higher than at time of call → ✓ correct
- **Bearish call** → stock price is lower than at time of call → ✓ correct

The measurement window is 3 months by default.

---

## Minimum prediction threshold

Accuracy is only shown when an analyst has **10 or more matured predictions**. Below this threshold, `accuracy_rate` is null.

This prevents a single lucky call from showing a misleading 100% accuracy rate. An analyst with 3/3 correct is statistically indistinguishable from random; an analyst with 70/100 correct is not.

---

## What accuracy does not measure

- **Magnitude** — an analyst can be 80% accurate with tiny returns, or 55% accurate with large returns. Always look at `overall_return_pct` alongside accuracy.
- **Timing** — a bullish call is correct if the price is higher at window maturity, even if it dropped 20% before recovering.
- **Conviction size** — all predictions are weighted equally regardless of the analyst's stated confidence.

---

## Accuracy vs return — which matters more?

Neither alone is sufficient. The most useful signal is **high accuracy + high return**:

| Accuracy | Return | Interpretation |
|---|---|---|
| High | High | Strong analyst with good magnitude calls |
| High | Low | Correct direction but small moves |
| Low | High | High-risk, high-reward style; volatile |
| Low | Low | Poor signal overall |

Use `--min-accuracy` and `--min-return` together to find analysts in the top-left quadrant:

```bash
traderbro analyst list --min-accuracy 65 --min-return 10 --min-predictions 20 --json
```
