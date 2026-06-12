# calculated-events

Query the persisted history of technical events detected on a symbol's price history.

Events are computed from stored OHLCV data by a suite of detectors (45+ types) and written to the database. They cover candlestick patterns, chart patterns, market structure, oscillators, volume anomalies, levels, and statistical extremes.

---

## Commands

| Command | Description |
|---|---|
| `calculated-events types` | List all available event types |
| `calculated-events list` | List events for a single symbol |
| `calculated-events scan` | Multi-symbol event search |
| `calculated-events refresh` | Recompute events for a symbol on demand |
| `calculated-events patterns` | Per-event-type historical forward returns for a symbol |

---

## `calculated-events types`

List all registered event types grouped by category.

```bash
traderbro calculated-events types
traderbro calculated-events types --category candlestick
traderbro calculated-events types --json
```

**Flags**

| Flag | Description | Default |
|---|---|---|
| `--category` | Filter by category name | all categories |
| `--json` | Output as JSON | false |

**Categories**

| Category | Description |
|---|---|
| `candlestick` | 61 TA-Lib candlestick patterns (CDLHAMMER, CDLENGULFING, etc.) |
| `chart_pattern` | Head & Shoulders, flags, pennants, double top/bottom |
| `trend_ma` | MA crossovers, price-MA crossings, MA bounces |
| `oscillator` | RSI, MACD, Stochastic threshold and crossover events |
| `market_structure` | BOS (Break of Structure), CHoCH (Change of Character), DC zigzag |
| `boundary` | Bollinger Bands, gaps, S/R level breaks |
| `volume` | Volume spikes and buying/selling climax |
| `levels` | Pivot points, periodic high/low breaks, Fibonacci retracements |
| `statistical` | ATR extension, standard deviation breaches |

**Example output**

```json
{
  "types": [
    { "event_type": "golden_cross",  "event_category": "trend_ma",    "default_params": {"fast": 50, "slow": 200} },
    { "event_type": "rsi_oversold",  "event_category": "oscillator",  "default_params": {"period": 14, "level": 30} },
    { "event_type": "BOS_Up",        "event_category": "market_structure", "default_params": {} }
  ],
  "count": 72
}
```

---

## `calculated-events list`

List events for a single symbol, most recent first.

The symbol may be passed positionally OR via `--symbol` (equivalent — see
[filtering conventions](filtering-conventions.md)).

```bash
traderbro calculated-events list NASDAQ:AAPL
traderbro calculated-events list --symbol NASDAQ:AAPL --type golden_cross
traderbro calculated-events list --symbol NASDAQ:AAPL --category oscillator --direction bullish
traderbro calculated-events list --symbol NASDAQ:AAPL --within-days 90 --limit 20
traderbro calculated-events list NASDAQ:AAPL --since 2025-01-01 --until 2025-06-01
```

**Flags**

| Flag | Description | Default |
|---|---|---|
| `--symbol` | Symbol `EXCHANGE:TICKER` (or pass it positionally) | — |
| `--type` | Comma-separated event types to filter | all types |
| `--category` | Filter by event category | all categories |
| `--direction` | `bullish` or `bearish` | all |
| `--within-days` | Only events in the last N days | — |
| `--since` | Start date `YYYY-MM-DD` (alias `--from`) | — |
| `--until` | End date `YYYY-MM-DD` (alias `--to`) | — |
| `--resolution` | `daily` (weekly/intraday coming soon — see plan 128) | `daily` |
| `--limit` | Max events returned (max 500). Returns a bounded page by default; `has_more=true` + a stderr note signal when more match — pass a higher `--limit` for the full set. | 25 |
| `--cluster-within-days` | Collapse consecutive same-type events within N days into a single cluster row (0 = off) | 0 |
| `--json` | Output as JSON | false |

**Example output (table)**

```
NASDAQ:AAPL  ·  Calculated Events  ·  daily
──────────────────────────────────────────────────────────────────
DATE         EVENT                   CATEGORY          DIR
2026-05-08   CDLSHOOTINGSTAR         candlestick       ↓ bear
2026-05-04   bull_flag               chart_pattern     ↑ bull
2026-04-27   BOS_Up                  market_structure  ↑ bull
2026-04-02   rsi_oversold            oscillator        ↑ bull
2026-03-30   CDLMORNINGSTAR          candlestick       ↑ bull
──────────────────────────────────────────────────────────────────
5 events
```

---

## `calculated-events scan`

Search events across multiple symbols. Accepts symbol lists from screener output or an explicit list.

```bash
# Explicit symbol list
traderbro calculated-events scan --symbols NASDAQ:AAPL,NASDAQ:NVDA --type golden_cross

# Pipe from screener
traderbro screener run --filter "sector:eq:Technology" --symbols-only \
  | traderbro calculated-events scan --type BOS_Up --within-days 30

# Group by symbol to find which symbols had events
traderbro calculated-events scan --type rsi_oversold --within-days 7 --group-by symbol

# Symbols-only output for further piping
traderbro calculated-events scan --type golden_cross --within-days 30 --symbols-only
```

**Flags**

| Flag | Description | Default |
|---|---|---|
| `--symbols` | Comma-separated `EXCHANGE:TICKER` list | all symbols |
| `--symbols-file` | JSON file `{"symbols": [...]}` from `screener run --json` | — |
| `--type` | Comma-separated event types | all types |
| `--category` | Filter by category | all |
| `--direction` | `bullish` or `bearish` | all |
| `--within-days` | Events in last N days | — |
| `--from` | Start date | — |
| `--to` | End date | — |
| `--market` | Filter by market/country (e.g. `US`, `BD`) | all |
| `--group-by` | `symbol` — count events per symbol | none |
| `--sort-by` | `occurred_at` or `symbol` | `occurred_at` |
| `--sort-order` | `asc` or `desc` | `desc` |
| `--symbols-only` | Output symbol list only (for piping) | false |
| `--limit` | Max results (max 500). Bounded page by default; `has_more=true` + stderr note when more match — raise `--limit` for more. | 25 |
| `--cluster-within-days` | Collapse consecutive same-type events within N days into a single cluster row (0 = off) | 0 |
| `--json` | Output as JSON | false |

**Pipeline pattern**

```bash
# Find tech stocks with recent golden cross, then check their calculated events
traderbro screener run \
  --filter "sector:eq:Technology" \
  --filter "market_cap:gt:1000000000" \
  --symbols-only \
  | traderbro calculated-events scan \
      --type golden_cross \
      --within-days 30 \
      --symbols-only \
  | traderbro calculated-events scan \
      --type rsi_oversold \
      --within-days 90
```

**Example output (group-by symbol)**

```json
{
  "count": 3,
  "results": [
    { "symbol": "NASDAQ:NVDA", "event_count": 12 },
    { "symbol": "NASDAQ:AAPL", "event_count": 7 },
    { "symbol": "NYSE:TSLA",   "event_count": 3 }
  ]
}
```

---

## `calculated-events refresh`

Recompute all events for a symbol synchronously using stored price data. Upserts results into the database. Use this to get fresh events for a symbol before running a query.

```bash
traderbro calculated-events refresh NASDAQ:NVDA
traderbro calculated-events refresh NASDAQ:NVDA --detectors golden_cross,rsi_oversold
```

**Flags**

| Flag | Description | Default |
|---|---|---|
| `--detectors` | Comma-separated detector keys to run | all detectors |

**Example output**

```
NASDAQ:NVDA  →  1598 events upserted  (45 detectors)
```

With `--json`:

```json
{
  "symbol": "NASDAQ:NVDA",
  "total_events_upserted": 1598,
  "detectors_run": 45,
  "results": {
    "golden_cross":      { "events_detected": 3 },
    "rsi_oversold":      { "events_detected": 18 },
    "candle_patterns":   { "events_detected": 477 }
  }
}
```

---

## `calculated-events patterns`

Show per-event-type historical forward-return effectiveness for a single symbol.

For every event type that has fired on the symbol, returns the count, last occurrence, direction, and the average forward return at 7 horizons (1D/3D/7D/1M/3M/6M/1Y) plus sample sizes.

**Bearish returns are sign-flipped server-side** — so for both directions, a higher positive number means "the pattern played out as expected." Neutral event types (`bb_squeeze`, `volume_spike`) return `returns: null` by design.

Use this command (not `list` or `scan`) for questions like:
- "Does pattern X actually work on this symbol?"
- "Which patterns have the best historical track record on AAPL?"
- "What high-accuracy setups just triggered on NVDA?"

```bash
traderbro calculated-events patterns NASDAQ:AAPL
traderbro calculated-events patterns NASDAQ:NVDA --hot-only --horizon 1m
traderbro calculated-events patterns NASDAQ:TSLA --event-type bull_flag --json
traderbro calculated-events patterns NASDAQ:META --direction bullish --sort-by avg_return --asc
```

**Flags**

| Flag | Description | Default |
|---|---|---|
| `--horizon` | Which `avg_return_<h>` to display + drive recency. One of `1d, 3d, 7d, 1m, 3m, 6m, 1y` | `3m` |
| `--event-type` | Filter to one or more event types (comma-separated) | — |
| `--direction` | `bullish` / `bearish` / `neutral` | — |
| `--hot-only` | Only rows whose avg return beats their direction baseline AND occurred recently AND n ≥ 3 | off |
| `--top` | Limit to top N rows after sorting (0 = no limit) | `0` |
| `--sort-by` | Sort column: `avg_return`, `count`, `last_occurred_at`, `sample_size` | `avg_return` |
| `--asc` | Ascending sort (default descending — most positive return first) | off |
| `--min-samples` | Drop rows whose sample size at the selected horizon is below this | `1` |
| `--within-days` | Override `--hot-only` recency window (default `max(horizon_days, 30)`) | — |
| `--verbose` | Show per-direction baseline used by `--hot-only` | off |
| `--resolution` | Price resolution: `daily` (only option today) | `daily` |

**Output (table mode)**

```
EVENT TYPE              DIR  COUNT  LAST      AVG 3M   n    HOT
─────────────────────────────────────────────────────────────────
golden_cross            ↑     16   11mo ago  +9.1%   16
bull_flag               ↑    206   23d ago   +7.9%  204    ★
double_bottom           ↑     55   8mo ago   +6.2%   55
head_and_shoulders      ↓     36   2mo ago  +10.5%   35    ★
bear_flag               ↓    168   1mo ago   +5.9%  168    ★
…
```

`★ HOT` = above-direction-average return at the selected horizon + occurred within `max(horizon_days, 30)` days + sample size ≥ 3.

**Output (JSON mode)**

```json
{
  "symbol": "NASDAQ:AAPL",
  "resolution": "daily",
  "selected_horizon": "3m",
  "count": 47,
  "hot_only": false,
  "recency_days": 90,
  "event_types": [
    {
      "event_type": "golden_cross",
      "event_category": "trend_ma",
      "direction": "bullish",
      "count": 16,
      "last_occurred_at": "2025-06-14",
      "hot": false,
      "returns": {
        "avg_return_1d": -0.54, "sample_size_1d": 16,
        "avg_return_3d":  0.31, "sample_size_3d": 16,
        "avg_return_7d":  1.56, "sample_size_7d": 16,
        "avg_return_1m":  2.38, "sample_size_1m": 16,
        "avg_return_3m":  9.09, "sample_size_3m": 16,
        "avg_return_6m": 26.67, "sample_size_6m": 16,
        "avg_return_1y": 30.45, "sample_size_1y": 15
      }
    }
  ]
}
```

**Notes**

- The full-history aggregate comes from a single `GROUP BY` over the `CalculatedEventReturn` table — sub-millisecond even for 30k+ events on a single symbol.
- Always quote `sample_size` when citing an average. A `+85% avg_return_1y` on `n=1` is a single sample, not a track record. The `--hot-only` filter enforces `n ≥ 3` by definition.
- The "hot" predicate is computed client-side from the response — agents can reproduce it from the JSON without recalling the rule.

---

## Event data fields

Every event record contains:

| Field | Type | Description |
|---|---|---|
| `event_type` | string | Specific event identifier (e.g. `golden_cross`, `BOS_Up`) |
| `event_category` | string | Broad category (e.g. `trend_ma`, `market_structure`) |
| `direction` | string\|null | `bullish`, `bearish`, or null |
| `occurred_at` | date | Bar date when the event fired |
| `data` | object | Signal-specific payload (varies by detector) |

The `data` field contains detector-specific values:

```json
// golden_cross
{ "fast": 50, "slow": 200, "fast_ma": 182.45, "slow_ma": 175.22 }

// BOS_Up
{ "close": 130.6, "level": 126.64, "atr": 4.07 }

// bull_flag
{
  "pole_height": 36.98,
  "target_price": 161.69,
  "stop_price": 120.21,
  "pattern_bars": 35,
  "keypoints": {
    "pole_base":     { "date": "2025-12-17", "price": 88.58 },
    "pole_tip":      { "date": "2026-01-28", "price": 125.56 },
    "flag_low":      { "date": "2026-02-05", "price": 120.21 },
    "confirmation":  { "date": "2026-02-06", "price": 124.71 }
  }
}
```

---

## Notes

- Events are precomputed and stored — `list` and `scan` are instant queries against the database.
- Run `refresh` before querying a symbol that was recently added or hasn't been processed yet.
- The `backfill_calculated_events` Celery task processes all active symbols nightly.
- Fib retracement and pivot point events fire frequently on daily data (rolling window recalculates each bar) — use `--within-days` to focus on recent signals.
- Market structure events (`BOS_Up`, `CHoCH_Up`, etc.) and chart patterns (`bull_flag`, `head_and_shoulders`) are the highest-signal events — they fire infrequently and align with visually significant price structure.
