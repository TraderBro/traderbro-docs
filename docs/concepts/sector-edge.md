---
sidebar_position: 4
title: Sector Edge
---

# Sector Edge

Sector edge is a per-analyst breakdown of accuracy and return by sector or industry, showing where an analyst's expertise is concentrated.

---

## How sectors are assigned

Each prediction inherits its sector and industry from the symbol at the time of ingestion. For example, NVDA is classified as Technology / Semiconductors. If a symbol's sector changes over time (rare), historical predictions retain the sector snapshot from when they were made.

Sector values come from the `sectors list` command:

```bash
traderbro sectors list
traderbro sectors industries Technology
```

Use these exact strings when filtering by `--sector` or `--industry`.

---

## Minimum call threshold

Segments with fewer than `--min-calls` (default: 3) calls are hidden. A single correct call in a sector is not enough to establish edge — it could be luck. Three or more calls provides a minimal signal.

Increase the threshold for more confidence:

```bash
traderbro analyst sector-edge noLimitGains --min-calls 5 --period 3m
```

---

## Interpreting the output

| Accuracy | Return | Interpretation |
|---|---|---|
| High | High | Genuine edge — analyst understands this sector deeply |
| High | Low | Correct direction but small moves; may be a conservative sector |
| Low | High | High-risk style in this sector; volatile outcomes |
| Low | Low | No edge here; avoid this analyst's calls in this sector |
| — | — | Fewer than min-calls, or windows not yet matured |

---

## Sector edge vs sector map

| Command | What it shows |
|---|---|
| `analyst sector-edge <slug>` | One analyst's breakdown across sectors |
| `analyst sector-map` | All analysts' aggregate performance per sector |

Use `sector-edge` to evaluate a specific analyst. Use `sector-map` to find which sectors the entire TraderBro analyst pool performs best in.

---

## Practical workflow

Before acting on a call from a new analyst:

```bash
# 1. Check their overall profile
traderbro analyst get the-analyst-slug --json

# 2. Check their sector edge in the relevant sector
traderbro analyst sector-edge the-analyst-slug --group-by industry --period 3m

# 3. If edge confirmed, see their recent calls on the symbol
traderbro analyst predictions the-analyst-slug --symbol NVDA --json
```
