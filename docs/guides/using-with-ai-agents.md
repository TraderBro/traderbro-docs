---
sidebar_position: 5
title: Using with AI Agents
---

# Using with AI Agents

The TraderBro CLI is designed to be driven by AI assistants. Every command supports `--json` for machine-readable output. The flag tables and JSON schemas in this documentation are structured so AI models can parse them reliably.

---

## Setup for Claude Code

Install the `SKILL.md` into your Claude Code session to give Claude full knowledge of every command:

```bash
# In your project, point Claude Code to the SKILL.md from the CLI repo
# Or set TRADERBRO_API_KEY in your environment and run:
traderbro whoami --json
```

Once Claude Code knows the CLI is available, you can ask it directly:

> "Use the traderbro CLI to find the top 5 analysts by 3-month return with at least 20 predictions, then get their sector edge in Technology."

Claude will chain these commands automatically:

```bash
traderbro analyst list --period 3m --sort return --min-predictions 20 --limit 5 --json
traderbro analyst sector-edge <slug> --sector Technology --period 3m --json
```

---

## Copy-pasteable prompts

These prompts work with Claude, GPT-4, and similar AI assistants that have CLI access.

**Find top analysts:**
> "Run `traderbro analyst list --sort return --min-predictions 20 --limit 10 --json` and tell me which analysts have the best overall return."

**Sector-specific research:**
> "Find analysts with strong Technology sector edge using `traderbro analyst sector-edge <slug> --period 3m --group-by industry --json`. Check the top 3 analysts by return."

**Symbol sentiment check:**
> "Get all NVDA predictions from the last 7 days using `traderbro prediction list --symbol NVDA --since <date> --json` and summarise the bull/bear sentiment."

**Period comparison:**
> "Compare the top 10 analysts by 1-month return vs 3-month return. Use `traderbro analyst list --period 1m --sort return --limit 10 --json` and `traderbro analyst list --period 3m --sort return --limit 10 --json`."

---

## Always use `--json` with AI agents

Table output is for human reading. JSON gives the AI the full data structure it needs to reason over results:

```bash
# Bad for agents — truncated table, no numeric precision
traderbro analyst list --limit 10

# Good for agents — full structured data
traderbro analyst list --limit 10 --json
```

---

## Pagination in agentic loops

For large result sets, use `--limit` and `--page` to paginate:

```bash
traderbro prediction list --symbol NVDA --json --limit 50 --page 1
traderbro prediction list --symbol NVDA --json --limit 50 --page 2
```

The JSON response includes `count` and `next` fields. Ask the AI to stop paginating when `next` is null.

---

## Machine-readable schema

To give an AI a complete map of all commands and flags without reading the docs:

```bash
traderbro describe --json
```

This outputs a JSON schema of every command, subcommand, flag, type, and default value. AI agents can fetch this once and use it to construct valid commands autonomously. The schema also includes a `skills_discovery` section pointing to the skills commands.

---

## Liquidity gate — always filter the universe before scanning

The calculated-events store covers every active US symbol, including illiquid nano-caps and penny stocks. The same detectors that flag a `golden_cross` on Apple will also flag one on a $0.10 ticker that ran 20× on a single news event. Mathematically the cross is real; economically the signal is noise.

**Always upstream-filter with the screener** before piping into `calculated-events scan`. The standard liquidity gate for tradeable mega-cap signals:

```bash
traderbro screener run \
    --filter "exchange:eq:NASDAQ" \
    --filter "market_cap:gt:5B" \
    --filter "dollar_volume:gt:200M" \
    --symbols-only \
  | traderbro calculated-events scan --type bull_flag --within-days 7
```

Tighter gate (most liquid only): `market_cap:gt:50B` + `dollar_volume:gt:500M`.
Looser gate (include mid-caps): `market_cap:gt:2B` + `dollar_volume:gt:50M`.

Calling `scan` without an upstream symbol filter scans the entire universe — penny stocks included. This is rarely what an agent wants. If you genuinely want the full universe (e.g. computing aggregate counts for a market-internals dashboard), be explicit about it in your reasoning.

---

## Pattern effectiveness — "does this pattern work on this symbol?"

`calculated-events scan` answers *"which symbols just fired pattern X?"* but says nothing about whether the pattern *works* on those symbols. For that:

```bash
traderbro calculated-events patterns EXCHANGE:SYMBOL [flags]
```

Returns one row per event type with: full-history count, last occurrence, direction, and the **average forward return at 7 horizons** (1D/3D/7D/1M/3M/6M/1Y) plus sample sizes. Bearish returns are sign-flipped server-side — for both directions, a higher positive number means "the pattern played out as expected."

Common agent uses:

```bash
# Does Bull Flag work on TSLA?
traderbro calculated-events patterns NASDAQ:TSLA --event-type bull_flag --json

# Top 10 best-performing patterns on AAPL at 3M horizon
traderbro calculated-events patterns NASDAQ:AAPL --top 10 --json

# Currently-relevant high-accuracy setups (above-direction-avg + recent + n>=3)
traderbro calculated-events patterns NASDAQ:NVDA --hot-only --horizon 1m --json

# Bullish-tagged patterns that actually drop the stock (contrarian setups)
traderbro calculated-events patterns NASDAQ:META --direction bullish --sort-by avg_return --asc --top 5
```

**Always quote `sample_size` when citing an average.** An `n=1` "+85% avg" is honest but not statistically meaningful. The `--hot-only` filter enforces `n ≥ 3` by definition; for other queries, surface `n` in your response.

Neutral event types (`bb_squeeze`, `volume_spike`) return `returns: null` — no forward-return data by design. Don't quote returns for them.

See the `pattern-effectiveness` skill (`traderbro skills show pattern-effectiveness`) for full workflow guidance, including the sign convention with a worked example.

---

## Workflow skills

Skills are step-by-step workflows embedded in the binary that tell an AI agent how to chain CLI commands for common tasks. They are the right tool when a user asks an open-ended question like "what stocks should I buy?" rather than requesting a specific command.

### List available skills

```bash
traderbro skills list --json
```

Returns a list of skills with `name`, `description`, `trigger_keywords`, and `required_tools`. The AI should check this whenever the user's request matches a common workflow.

Example output:

```json
{
  "count": 1,
  "skills": [
    {
      "name": "analyst-top-picks",
      "description": "Finds stocks to buy based on the latest recommendations from the best-performing analysts on TraderBro",
      "trigger_keywords": ["what should i buy", "best analyst picks", "top analyst recommendations"],
      "required_tools": ["analyst list", "analyst predictions <slug>"]
    }
  ]
}
```

### Read a skill's full instructions

```bash
traderbro skills show analyst-top-picks
```

Prints the complete markdown workflow including step-by-step commands, scoring logic, and output format. The AI should read and follow the skill instructions exactly.

### Available skills

| Name | Description | Trigger keywords |
|---|---|---|
| `analyst-top-picks` | Finds stocks to buy from the best-performing analysts | "what should I buy", "best analyst picks", "top recommendations" |
| `tvsandbox-setup` | **Read first** for the official tradingview.com chart: login gate, port 9333, single-Chrome rule | "tvsandbox", "set up tradingview", "intraday data", "extended hours" |
| `tvsandbox-reading` | Read/judge one symbol from official data (bars + screenshot); no detector — agent decides | "read the chart", "is this bullish", "what pattern" |
| `tvsandbox-scanning` | Bulk scan: `screen` → `metrics` → `sweep` across many symbols | "scan the market", "go through each chart", "find candidates" |
| `tvsandbox-drawing` | Annotate with any of ~90 native TradingView objects via `tvsandbox draw` | "draw a fib", "mark support", "annotate the chart" |

## Chart access — which command

TraderBro reaches charts three ways; route by what you need:

- **`tvsandbox`** — the official `tradingview.com/chart` over CDP. High-fidelity price/volume
  (intraday, extended-hours, long history), bulk scanning, and native drawing. Start with
  `traderbro skills show tvsandbox-setup`.
- **`brochart`** — the traderbro.ai-hosted chart, carrying TraderBro's **proprietary overlays**
  (analyst marks, calculated events, predictions).
- **`calculated-events`** — server-side **pattern detection**. There is no geometry detector in
  the CLI; on tvsandbox the agent judges bull/bear/continuation from the bars + screenshot.
