---
title: brochart
sidebar_label: brochart
---

# traderbro brochart

Control the **traderbro.ai-hosted** TradingView charting library from the CLI via a local
WebSocket bridge. This is the proprietary-data chart — it carries TraderBro's custom overlays
(analyst marks, calculated events, predictions) that cannot be loaded into tradingview.com.

:::tip Which chart command?
Use **`brochart`** for proprietary overlays on the traderbro.ai chart. For high-fidelity
price/volume from the official tradingview.com chart — deeper intraday, extended hours, long
history, and bulk pattern scanning — use [`tvsandbox`](./tvsandbox.md).
:::

## Prerequisites

1. Start the bridge server: `traderbro brochart serve`
2. Open your TraderBro chart page in a browser — the bridge connects automatically

## Commands

### serve

Start the WebSocket bridge server.

```bash
traderbro brochart serve
traderbro brochart serve --port 7892   # custom port (default 7891)
```

Keep this running in a dedicated terminal while using other `tv` commands.

---

### state

Print the current chart state (symbol, resolution, studies, shapes).

```bash
traderbro brochart state
traderbro brochart state --json
traderbro brochart state --full --json   # includes complete layout blob
```

---

### symbol

Switch the active chart to a different symbol.

```bash
traderbro brochart symbol NASDAQ:AAPL
traderbro brochart symbol NASDAQ:NVDA 1D   # also set resolution
traderbro brochart symbol NASDAQ:MSFT 1W
```

---

### screenshot

Capture the active chart as a PNG.

```bash
traderbro brochart close                              # dismiss panels first
traderbro brochart screenshot -o /tmp/chart.png
traderbro brochart screenshot                         # prints base64 to stdout
```

Always run `brochart close` before `brochart screenshot` to get a clean image.

---

### bars

Fetch OHLCV bar data with authoritative UDF timestamps.

```bash
traderbro brochart bars                    # last 90 bars (default)
traderbro brochart bars --last 300
traderbro brochart bars --last 90 --json
```

Use `brochart bars` before any `brochart draw` command to get exact timestamps. Computed timestamps
(e.g. from `date`) can be off by one bar around weekends and DST transitions.

Returns OHLC + volume per bar. JSON shape:

```json
{
  "symbol": "NASDAQ:AAPL",
  "resolution": "D",
  "count": 3,
  "bars": [
    { "date": "2026-05-12", "ts": 1778544000, "o": 291.98, "h": 294.9, "l": 290.23, "c": 294.27, "v": 56201555 }
  ]
}
```

---

### draw

Draw shapes and annotations on the chart.

```bash
# Horizontal level
traderbro brochart draw hline 150
traderbro brochart draw hline 150 --color '#ff9800' --style 1
traderbro brochart draw hline 200 --label "Key Support"

# Trend line (get timestamps from brochart bars first)
traderbro brochart draw line 2026-04-07 165 2026-05-09 212
traderbro brochart draw line 2026-04-07 165 2026-05-09 212 --color '#ef5350' --width 2
traderbro brochart draw line 2026-04-07 165 2026-05-09 212 --label "Uptrend"

# Arrow marker
traderbro brochart draw arrow up 2026-04-07 160
traderbro brochart draw arrow down 2026-11-10 219

# Text label
traderbro brochart draw text 2026-04-27 221 "Bull Flag"

# Rectangle
traderbro brochart draw rect 2026-04-24 218 2026-05-09 197 --color '#26a69a' --transparency 85
traderbro brochart draw rect 2026-04-24 218 2026-05-09 197 --label "Bull Flag"

# Position tools
traderbro brochart draw long 2026-05-01 198 2026-08-01 235 --stop 180
traderbro brochart draw short 2026-05-01 198 2026-08-01 165 --stop 215

# Manage shapes
traderbro brochart draw list --json
traderbro brochart draw clear
```

**Colour convention:**

| Role | Hex |
|---|---|
| Bullish (support, long) | `#26a69a` |
| Bearish (resistance, short) | `#ef5350` |
| Neutral (necklines, levels) | `#ff9800` |
| Momentum / oscillator | `#9c27b0` |
| Moving averages | `#2196f3` |

---

### study

Manage indicators on the chart.

```bash
traderbro brochart study list
traderbro brochart study list --json
traderbro brochart study add "Relative Strength Index"
traderbro brochart study add "Bollinger Bands"
traderbro brochart study add Volume --force        # add a duplicate explicitly
traderbro brochart study remove <id>
traderbro brochart study clear
```

Use the **full display name** (e.g. `"Relative Strength Index"`, not `RSI`).
By default `brochart study add` short-circuits with a "study already on chart" note
if a study with the same name is already present; pass `--force` to add a
duplicate (e.g. two Moving Averages with different periods).

#### study values

Pull a time-aligned matrix of bars + every active study's computed output.
This is the primary tool for numeric questions — "what's the current RSI?",
"find the bar where MACD crossed signal", "is there an RSI divergence in
the last 30 bars?" — anything that needs exact values rather than a visual.

```bash
traderbro brochart study values                    # last 60 bars, all studies on chart
traderbro brochart study values --last 30 --json
traderbro brochart study values --ids wPbb6S,yteGJ4 --last 10
traderbro brochart study values --include-volume --last 60 --json
traderbro brochart study values --json --jq '.bars[-1].studies'
```

**Flags:**

| Flag | Default | Notes |
|---|---|---|
| `--last N` | `60` | Tail-slice to the most recent N bars. `0` returns all loaded bars. |
| `--ids <id1,id2>` | (all) | Comma-separated study IDs from `brochart study list`. |
| `--include-volume` | off | Add the Volume study just for this call, then remove it. Convenience for "I want volume aligned without setup boilerplate." |
| `--json` | off | Machine-readable output. |

**Output shape (JSON):**

```json
{
  "count": 60,
  "bars": [
    {
      "date": "2026-05-12",
      "ts":   1778506200,
      "open": 291.98, "high": 294.9, "low": 290.23, "close": 294.27,
      "volume": 56201555,
      "studies": {
        "Bollinger Bands (20, 2, 0, SMA)": { "Median": 264.29, "Upper": 291.16, "Lower": 237.43 },
        "Relative Strength Index (14)":    { "Plot":   67.58 }
      }
    }
  ],
  "schema": [ /* original exportData schema, kept for power users */ ]
}
```

The `studies` map uses the **full configured name** (with parameters) as
the key, so the JSON is self-describing. To extract values robustly in
`jq`, use `startswith` or `test`:

```bash
traderbro brochart study values --last 1 --json \
  | jq '.bars[-1].studies | to_entries[] | select(.key|startswith("Bollinger")) | .value'
```

**Source:** values come from `widget.activeChart().exportData()` — the same
series the chart itself paints, no second round-trip to the UDF API. The
CLI waits for each study's `onDataLoaded` event before exporting, so a
freshly-added study returns populated values on the first call.

**Errors:** passing `--ids <unknown>` exits non-zero with
`study ID(s) not on chart: …` rather than silently dropping the unknown ID.

---

### save / saved

Save the current chart layout and list saved layouts.

```bash
traderbro brochart save
traderbro brochart save "NVDA Failed H&S — May 2026"
traderbro brochart saved
traderbro brochart saved --json
```

---

### range / zoom / timeframe

Control the visible date range and zoom level.

```bash
# Exact date range
traderbro brochart range 2024-01-01
traderbro brochart range 2024-01-01 2025-01-01

# Zoom
traderbro brochart zoom in
traderbro brochart zoom out
traderbro brochart zoom reset
traderbro brochart zoom 12

# Preset timeframes
traderbro brochart timeframe 6M
traderbro brochart timeframe 1Y 1D   # also set resolution
```

---

### search

Search for symbols via the UDF datafeed.

```bash
traderbro brochart search TSLA
traderbro brochart search Apple
traderbro brochart search nvidia --exchange NASDAQ
traderbro brochart search oil --type etf --json
```

---

### close

Close open panels and popups before a screenshot.

```bash
traderbro brochart close
```

---

### charts / use

List connected browser tabs and switch between them.

```bash
traderbro brochart charts
traderbro brochart charts --json
traderbro brochart use <id-prefix>
```

---

### health

Read-only diagnostic of the chart pipeline. Use at run start, between every K
symbols in long loops, and after any error.

```bash
traderbro brochart health
traderbro brochart health --json
traderbro brochart health --quick                # skip slow udf_auth check
traderbro brochart health --mem-threshold 400    # fail if heap > 400 MB
```

Runs five checks: `bridge_reachable`, `chart_connected`, `widget_ready`,
`udf_auth`, `memory_ok`. Exits 0 if all pass, non-zero otherwise. Composes
with shell `||`:

```bash
traderbro brochart health || traderbro brochart refresh
```

Output (JSON):

```json
{
  "ok": true,
  "checks": [
    {"name": "bridge_reachable", "ok": true},
    {"name": "chart_connected",  "ok": true, "tab_id": "35088f7f-...", "symbol": "NASDAQ:AAPL"},
    {"name": "widget_ready",     "ok": true, "symbol": "NASDAQ:AAPL"},
    {"name": "udf_auth",         "ok": true, "latency_ms": 27},
    {"name": "memory_ok",        "ok": true, "heap_mb": 56, "threshold_mb": 1500}
  ]
}
```

The `udf_auth` check classifies HTTP 401 as auth failure; non-401 errors
(like "no bar data for foreign symbol") pass auth but include a hint in the
error field.

---

### refresh

Reload the browser tab and wait for the chart to reconnect. Use to reclaim
memory or recover from stuck TV state (e.g. studies wedged after a
resolution change).

```bash
traderbro brochart refresh
traderbro brochart refresh --json
traderbro brochart refresh --verify-with-bars    # also confirm UDF auth post-reload
traderbro brochart refresh --timeout 30s         # extend reconnect ceiling
```

Cost: ~3-10s typical. Polls every 500 ms after a brief settle period for:
- Same tab UUID back in connected charts (sessionStorage persists).
- `tvWidget.activeChart()` non-null (widget fully bootstrapped).

**Does NOT fix:** expired localStorage tokens (page reloads with same
expired token), backend issues, permanently missing symbol data.

**Important:** after refresh, the chart restores whatever layout was last
saved via `brochart save` — *not necessarily an empty chart, and not necessarily
the symbol you were just analysing*. Always re-issue `brochart symbol X` after
a refresh.

---

### eval

Escape hatch for TradingView API calls not yet in a named command.

```bash
traderbro brochart eval "tvWidget.activeChart().symbol()"
```

If you use `eval` for the same operation more than once, that pattern belongs in
`chart-bridge.js` as a named case. Use `tradingview-cli` for API discovery.

---

## Standard Annotation Workflow

```bash
# 1. Set chart
traderbro brochart symbol NASDAQ:NVDA 1D

# 2. Set visible range
traderbro brochart range 2025-01-01

# 3. See what's on the chart
traderbro brochart close
traderbro brochart screenshot -o /tmp/before.png

# 4. Get authoritative timestamps for drawing
traderbro brochart bars --last 90 --json

# 5. Annotate
traderbro brochart draw hline 850
traderbro brochart draw arrow up 2025-03-15 780

# 6. Verify
traderbro brochart close
traderbro brochart screenshot -o /tmp/annotated.png

# 7. Save
traderbro brochart save "NVDA support levels"
```

## Numeric Pattern-Detection Workflow

For questions that need **exact indicator values** (not visual reading):

```bash
# 1. Set chart and studies you want to measure
traderbro brochart symbol NASDAQ:AAPL
traderbro brochart study add "Relative Strength Index"
traderbro brochart study add "Bollinger Bands"

# 2. Pull bars + study values time-aligned (one call)
traderbro brochart study values --last 30 --include-volume --json > /tmp/data.json

# 3. Run your numeric query against the time series with jq
jq '
  .bars
  | map({date, close, rsi: (.studies | to_entries[] | select(.key|startswith("Relative")) | .value.Plot)})
  | (max_by(.close)) as $pHi
  | (max_by(.rsi // -1)) as $rHi
  | "price-peak: \($pHi.date) close=\($pHi.close) rsi=\($pHi.rsi)\nrsi-peak:   \($rHi.date) rsi=\($rHi.rsi)\nbearish-div: \($pHi.date > $rHi.date)"
' /tmp/data.json

# 4. Annotate the bars you found, then screenshot
traderbro brochart draw arrow down 2026-05-12 294.27
traderbro brochart screenshot -o /tmp/annotated.png
```

Use this workflow for RSI divergence, MACD crossover detection, Bollinger
squeeze identification, volume confirmation, and multi-indicator
confluence. See the `tv-quant` skill (`traderbro skills read tv-quant`)
for five worked patterns with verified output.

## Long-Running Agent Loops

For runs over many symbols (>20) or long unattended sessions, gate the loop
with `brochart health` and recover with `brochart refresh`. The pattern:

```bash
# Pre-flight: health check, refresh if unhealthy, abort if still bad
traderbro brochart health || {
  traderbro brochart refresh
  traderbro brochart health || exit 1
}

# Set studies ONCE — they survive symbol switches and recompute automatically
traderbro brochart study add "Relative Strength Index"

count=0
for sym in $(cat symbols.txt); do
  count=$((count + 1))

  # Only if your loop draws shapes per symbol
  # traderbro brochart draw clear

  traderbro brochart symbol "$sym" || { echo "skip $sym"; continue; }
  result=$(traderbro brochart study values --last 60 --json --jq '.bars[-1]')
  echo "$sym: $result"

  # Defensive refresh every 50 symbols
  if (( count % 50 == 0 )); then
    traderbro brochart refresh
    traderbro brochart symbol "$sym"               # re-set; refresh restores saved layout
    traderbro brochart study add "Relative Strength Index"   # re-add if not in saved layout
  fi
done
```

See the `tv-long-running` skill (`traderbro skills read tv-long-running`)
for the full failure-mode → recovery decision table and memory budgeting
guidance.

## Flags

| Flag | Default | Description |
|---|---|---|
| `--port` | `7891` | Bridge server port |
| `--json` | false | Output as JSON |
| `--no-color` | false | Disable colored output |
