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

```bash
traderbro calculated-events list --symbol NASDAQ:AAPL
traderbro calculated-events list --symbol NASDAQ:AAPL --type golden_cross
traderbro calculated-events list --symbol NASDAQ:AAPL --category oscillator --direction bullish
traderbro calculated-events list --symbol NASDAQ:AAPL --within-days 90 --limit 20
traderbro calculated-events list --symbol NASDAQ:AAPL --from 2025-01-01 --to 2025-06-01
```

**Flags**

| Flag | Description | Default |
|---|---|---|
| `--symbol` | Symbol in `EXCHANGE:TICKER` format (required) | — |
| `--type` | Comma-separated event types to filter | all types |
| `--category` | Filter by event category | all categories |
| `--direction` | `bullish` or `bearish` | all |
| `--within-days` | Only events in the last N days | — |
| `--from` | Start date `YYYY-MM-DD` | — |
| `--to` | End date `YYYY-MM-DD` | — |
| `--resolution` | `daily` (weekly/intraday coming soon — see plan 128) | `daily` |
| `--limit` | Max events returned (max 500) | 50 |
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
| `--limit` | Max results (max 500) | 100 |
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
