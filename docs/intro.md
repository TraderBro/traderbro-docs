---
slug: /
sidebar_position: 1
title: TraderBro CLI
---

# TraderBro CLI

Query analyst predictions, returns, sector analytics, and research — from your terminal.

```bash
traderbro analyst list --sort accuracy --limit 10 --json
traderbro analyst sector-edge noLimitGains --period 3m
traderbro prediction list --symbol NVDA --since 2025-01-01 --json
```

Designed for both humans and AI agents. Every command supports `--json` for machine-readable output and `--jq` for inline filtering.

---

## Quick navigation

| I want to… | Go to |
|---|---|
| Install the CLI | [Installation](/getting-started/installation) |
| Set up my API key | [Authentication](/getting-started/authentication) |
| Run my first command | [First Command](/getting-started/first-command) |
| See all analyst flags | [Analyst Reference](/cli-reference/analyst) |
| Find top analysts by 3-month return | [Finding Top Analysts](/guides/finding-top-analysts) |
| Understand how returns are calculated | [Return Calculation](/concepts/return-calculation) |
| Use TraderBro with Claude or GPT | [Using with AI Agents](/guides/using-with-ai-agents) |

---

## What you can do

- **Rank analysts** by accuracy, return, or prediction count across any time window (7d, 1m, 3m, 6m, 1y)
- **Drill into sector edge** — see which sectors an analyst consistently outperforms in
- **Browse predictions** — filter by symbol, direction, date range, and correctness
- **Monitor content** — query the tweets, videos, and articles that feed the prediction pipeline
- **Search symbols** — find any stock, ETF, or crypto tracked by TraderBro

---

## Installation

```bash
brew install traderbro/tap/traderbro
traderbro configure
traderbro whoami
```

See [Installation](/getting-started/installation) for all platforms and options.
