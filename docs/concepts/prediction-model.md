---
sidebar_position: 3
title: Prediction Model
---

# Prediction Model

How TraderBro identifies, classifies, and tracks analyst predictions.

---

## What is a prediction?

A prediction is a **directional call on a specific symbol at a specific point in time**, extracted from an analyst's content (tweet, video, article, or transcript).

Each prediction has:
- A **symbol** (e.g. `NVDA`)
- A **direction**: `bullish`, `bearish`, or `neutral`
- A **published date** — when the analyst made the call
- An optional **price target** if stated
- A **confidence score** (0–100) derived from the language used
- An **author reasoning** excerpt

---

## Extraction pipeline

Content passes through a two-stage LLM pipeline:

1. **Triage** — determines whether the content contains a genuine directional prediction. Content that is purely commentary, reposting news, or "credit-taking" (claiming a prior call after the fact) is excluded.

2. **Extraction** — identifies the symbol, direction, price target, confidence, and reasoning from the content.

---

## Credit-taking detection

A common issue in social media analysis is analysts posting "I called this!" after a stock has already moved. TraderBro's triage stage is trained to detect and exclude these retroactive claims. Only forward-looking predictions count.

---

## Prediction series

When an analyst makes repeated calls on the same symbol, these are grouped into a series:

- `is_series_first: true` — the first call in a run; return credit starts here
- `is_series_last: true` — the most recent call in an active series

An analyst who posts "still bullish on NVDA" five times over three months gets credit for one prediction series, not five separate predictions. This prevents artificially inflating prediction count by reaffirming existing positions.

---

## Null fields

Some fields may be null for valid reasons:

| Field | Null means |
|---|---|
| `stated_price_target` | No specific target mentioned in the content |
| `is_directionally_correct` | Return window has not matured yet |
| `avg_return_3m` | Insufficient matured windows to calculate |
| `accuracy_rate` | Fewer than 10 matured predictions |
