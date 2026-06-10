---
sidebar_position: 8
title: insight
---

# insight

One unified surface over every analyst **mention** of a symbol — predictions, forward-looking
catalysts, and evidence/commentary — each carrying a **sentiment** and **insight tags**. This is
the command for answering "what are analysts *saying* about $X?" (as opposed to `analyst predictions` /
`symbol predictions`, which are the curated, return-tracked directional calls only).

It replaces the old `symbol mentions` and `analyst commentary` commands, which only exposed a subset
of mention types and no sentiment/tags.

---

## traderbro insight

List `ContentSymbolMention` rows filtered by any combination of symbol, analyst, mention type,
insight tag, sentiment, direction, and date.

### Usage

```bash
traderbro insight [flags]
```

### Flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--symbol` | string (repeatable) | — | Bare ticker (any exchange) or `EXCHANGE:TICKER` (exact). Repeatable or comma-joined. Max 25. Also reads a piped symbol list on stdin. |
| `--analyst` | string (repeatable) | — | Analyst slug. Repeatable or comma-joined. Max 25. |
| `--type` | string (repeatable) | — | Mention type. Repeatable or comma-joined. |
| `--tag` | string (repeatable) | — | Insight tag. Repeatable or comma-joined. **OR** by default. Max 10. |
| `--all-tags` | bool | false | Require **ALL** `--tag` values (AND) instead of any (OR). |
| `--sentiment` | string (repeatable) | — | `positive`, `negative`, `mixed`, `neutral`. |
| `--direction` | string (repeatable) | — | `bullish`, `bearish`, `neutral` (set on predictions). |
| `--since` | string | — | Published on/after `YYYY-MM-DD`. |
| `--until` | string | — | Published on/before `YYYY-MM-DD`. |
| `--describe` | bool | false | Print the valid type/tag/sentiment values and limits, then exit. |
| `--json` / `--plain` / `--jq` | | | Output mode (global). |
| `--limit` / `--page` | int | 25 / 1 | Pagination. `--limit` max 100. |

### Combining filters & limits (the contract)

- **Different filters AND together.** `insight --symbol NASDAQ:NVDA --type evidence_insight --sentiment negative`
  = NVDA **and** evidence_insight **and** negative.
- **Repeated values of the same filter OR together.** `--symbol NVDA --symbol AMD` = NVDA **or** AMD.
  Same for `--type`, `--sentiment`, `--direction`, and (by default) `--tag`.
- **`--tag` is OR by default; `--all-tags` makes it AND.** `--tag earnings_result --tag fundamental_metric`
  → mentions with *either* tag; add `--all-tags` → mentions carrying *both*.

| Limit | Value |
|---|---|
| symbols per request | 25 |
| analysts per request | 25 |
| tags per request | 10 |
| page size (`--limit`) | default 25, max 100 |
| ordering | most recent first (`published_at` desc, nulls last) — fixed |

Unknown `--type` / `--tag` / `--sentiment` / `--direction` values return an error that lists the
valid set, so you can self-correct.

### Discoverable values

Run `traderbro insight --describe` (or `traderbro describe`) for the live, authoritative lists.

- **Mention types:** `prediction`, `conditional_prediction`, `catalyst_insight`, `evidence_insight`,
  `commentary` *(legacy)*, `risk_mention` *(legacy)*, `neutral` *(legacy)*.
- **Sentiments:** `positive`, `negative`, `mixed`, `neutral`.
- **Insight tags (26):** `analyst_rating`, `chart_observation`, `clinical_data`, `comparative_analysis`,
  `company_positioning`, `corporate_action`, `credit_taking`, `earnings_result`, `expert_interview`,
  `fundamental_metric`, `insider_activity`, `institutional_flow`, `macro_event`, `market_reaction`,
  `news_relay`, `options_flow`, `options_oi_update`, `performance_ranking`, `performance_update`,
  `price_milestone`, `sector_ecosystem`, `sector_momentum`, `short_mechanics`, `strategic_relationship`,
  `supply_chain_allocation`, `valuation_argument`.

### Examples

```bash
# What is the market saying about NVDA — most recent first
traderbro insight --symbol NASDAQ:NVDA

# Negative earnings chatter on NVDA
traderbro insight --symbol NVDA --tag earnings_result --sentiment negative --json

# What an analyst talks about beyond their directional calls
traderbro insight --analyst ray-wang --type evidence_insight,catalyst_insight

# Multiple symbols at once (OR)
traderbro insight --symbol NVDA --symbol AMD --type catalyst_insight

# Tags: ANY vs ALL
traderbro insight --symbol NVDA --tag earnings_result,fundamental_metric              # either
traderbro insight --symbol NVDA --tag earnings_result,fundamental_metric --all-tags   # both

# Symbol + analyst compose (AND)
traderbro insight --symbol NVDA --analyst flow-god

# Pipe a screen into insight (catalysts across a filtered universe)
traderbro screener run --market US --symbols-only | traderbro insight --type catalyst_insight

# Aggregate with jq — sentiment mix and top tags for a symbol
traderbro insight --symbol NVDA --limit 100 --json --jq '[.results[].sentiment] | group_by(.) | map({(.[0]): length}) | add'
traderbro insight --symbol NVDA --limit 100 --json --jq '[.results[].tags[]] | group_by(.) | map({tag: .[0], n: length}) | sort_by(-.n)'

# Discover the vocabulary
traderbro insight --describe
```

### Output (table)

```
Symbol       Analyst         Type              Sentiment  Tags                       Quote                                Published
NASDAQ:NVDA  flow-god        evidence_insight  positive   ["options_flow"]           $NVDA - $4.9M Put seller (bullish)   2026-05-29
NASDAQ:NVDA  trade-whisperer conditional_pred… positive   ["sector_ecosystem",…]     If $NVDA wins, $TSM wins             2026-05-28
```

### Output (JSON)

```json
{
  "count": 10193,
  "page": 1,
  "page_size": 25,
  "total_pages": 408,
  "results": [
    {
      "id": 1234567,
      "symbol": "NASDAQ:NVDA",
      "ticker": "NVDA",
      "symbol_name": "NVIDIA Corp.",
      "analyst_slug": "flow-god",
      "mention_type": "evidence_insight",
      "sentiment": "positive",
      "tags": ["options_flow"],
      "direction": null,
      "confidence_score": null,
      "price_target": null,
      "timeframe": "",
      "key_quote": "$NVDA - $4.9M Put seller (bullish)",
      "content_title": null,
      "content_url": "https://x.com/.../status/...",
      "published_at": "2026-05-29T16:09:15Z",
      "created_at": "2026-05-29T17:02:11Z"
    }
  ]
}
```

> **Note:** `sentiment` may be `null` and `tags` may be `[]` on older mentions that have not yet been
> re-classified by the v3 pipeline. A `null` sentiment means *unclassified*, **not** neutral. Counts
> climb over time as re-classification completes.

### Empty results & errors

- An empty result set returns `count: 0` with an empty `results` array (exit 0) — not an error.
- An unknown tag/type/sentiment returns a `400` whose body lists the valid values.
- If you pipe a symbol list on stdin but it is empty (e.g. the upstream screen matched nothing),
  `insight` errors rather than silently listing every mention.

---

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success (including empty result sets) |
| 1 | Error (bad filter value, network/auth failure, empty piped stdin) |
