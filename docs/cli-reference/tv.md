---
title: tv
sidebar_label: tv
---

# traderbro tv

Control a TradingView chart from the CLI via a local WebSocket bridge.

## Prerequisites

1. Start the bridge server: `traderbro tv serve`
2. Open your TraderBro chart page in a browser — the bridge connects automatically

## Commands

### serve

Start the WebSocket bridge server.

```bash
traderbro tv serve
traderbro tv serve --port 7892   # custom port (default 7891)
```

Keep this running in a dedicated terminal while using other `tv` commands.

---

### state

Print the current chart state (symbol, resolution, studies, shapes).

```bash
traderbro tv state
traderbro tv state --json
traderbro tv state --full --json   # includes complete layout blob
```

---

### symbol

Switch the active chart to a different symbol.

```bash
traderbro tv symbol NASDAQ:AAPL
traderbro tv symbol NASDAQ:NVDA 1D   # also set resolution
traderbro tv symbol NASDAQ:MSFT 1W
```

---

### screenshot

Capture the active chart as a PNG.

```bash
traderbro tv close                              # dismiss panels first
traderbro tv screenshot -o /tmp/chart.png
traderbro tv screenshot                         # prints base64 to stdout
```

Always run `tv close` before `tv screenshot` to get a clean image.

---

### bars

Fetch OHLCV bar data with authoritative UDF timestamps.

```bash
traderbro tv bars                    # last 90 bars (default)
traderbro tv bars --last 300
traderbro tv bars --last 90 --json
```

Use `tv bars` before any `tv draw` command to get exact timestamps. Computed timestamps
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
traderbro tv draw hline 150
traderbro tv draw hline 150 --color '#ff9800' --style 1
traderbro tv draw hline 200 --label "Key Support"

# Trend line (get timestamps from tv bars first)
traderbro tv draw line 2026-04-07 165 2026-05-09 212
traderbro tv draw line 2026-04-07 165 2026-05-09 212 --color '#ef5350' --width 2
traderbro tv draw line 2026-04-07 165 2026-05-09 212 --label "Uptrend"

# Arrow marker
traderbro tv draw arrow up 2026-04-07 160
traderbro tv draw arrow down 2026-11-10 219

# Text label
traderbro tv draw text 2026-04-27 221 "Bull Flag"

# Rectangle
traderbro tv draw rect 2026-04-24 218 2026-05-09 197 --color '#26a69a' --transparency 85
traderbro tv draw rect 2026-04-24 218 2026-05-09 197 --label "Bull Flag"

# Position tools
traderbro tv draw long 2026-05-01 198 2026-08-01 235 --stop 180
traderbro tv draw short 2026-05-01 198 2026-08-01 165 --stop 215

# Manage shapes
traderbro tv draw list --json
traderbro tv draw clear
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
traderbro tv study list
traderbro tv study list --json
traderbro tv study add "Relative Strength Index"
traderbro tv study add "Bollinger Bands"
traderbro tv study add Volume --force        # add a duplicate explicitly
traderbro tv study remove <id>
traderbro tv study clear
```

Use the **full display name** (e.g. `"Relative Strength Index"`, not `RSI`).
By default `tv study add` short-circuits with a "study already on chart" note
if a study with the same name is already present; pass `--force` to add a
duplicate (e.g. two Moving Averages with different periods).

#### study values

Pull a time-aligned matrix of bars + every active study's computed output.
This is the primary tool for numeric questions — "what's the current RSI?",
"find the bar where MACD crossed signal", "is there an RSI divergence in
the last 30 bars?" — anything that needs exact values rather than a visual.

```bash
traderbro tv study values                    # last 60 bars, all studies on chart
traderbro tv study values --last 30 --json
traderbro tv study values --ids wPbb6S,yteGJ4 --last 10
traderbro tv study values --include-volume --last 60 --json
traderbro tv study values --json --jq '.bars[-1].studies'
```

**Flags:**

| Flag | Default | Notes |
|---|---|---|
| `--last N` | `60` | Tail-slice to the most recent N bars. `0` returns all loaded bars. |
| `--ids <id1,id2>` | (all) | Comma-separated study IDs from `tv study list`. |
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
traderbro tv study values --last 1 --json \
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
traderbro tv save
traderbro tv save "NVDA Failed H&S — May 2026"
traderbro tv saved
traderbro tv saved --json
```

---

### range / zoom / timeframe

Control the visible date range and zoom level.

```bash
# Exact date range
traderbro tv range 2024-01-01
traderbro tv range 2024-01-01 2025-01-01

# Zoom
traderbro tv zoom in
traderbro tv zoom out
traderbro tv zoom reset
traderbro tv zoom 12

# Preset timeframes
traderbro tv timeframe 6M
traderbro tv timeframe 1Y 1D   # also set resolution
```

---

### search

Search for symbols via the UDF datafeed.

```bash
traderbro tv search TSLA
traderbro tv search Apple
traderbro tv search nvidia --exchange NASDAQ
traderbro tv search oil --type etf --json
```

---

### close

Close open panels and popups before a screenshot.

```bash
traderbro tv close
```

---

### charts / use

List connected browser tabs and switch between them.

```bash
traderbro tv charts
traderbro tv charts --json
traderbro tv use <id-prefix>
```

---

### eval

Escape hatch for TradingView API calls not yet in a named command.

```bash
traderbro tv eval "tvWidget.activeChart().symbol()"
```

If you use `eval` for the same operation more than once, that pattern belongs in
`chart-bridge.js` as a named case. Use `tradingview-cli` for API discovery.

---

## Standard Annotation Workflow

```bash
# 1. Set chart
traderbro tv symbol NASDAQ:NVDA 1D

# 2. Set visible range
traderbro tv range 2025-01-01

# 3. See what's on the chart
traderbro tv close
traderbro tv screenshot -o /tmp/before.png

# 4. Get authoritative timestamps for drawing
traderbro tv bars --last 90 --json

# 5. Annotate
traderbro tv draw hline 850
traderbro tv draw arrow up 2025-03-15 780

# 6. Verify
traderbro tv close
traderbro tv screenshot -o /tmp/annotated.png

# 7. Save
traderbro tv save "NVDA support levels"
```

## Numeric Pattern-Detection Workflow

For questions that need **exact indicator values** (not visual reading):

```bash
# 1. Set chart and studies you want to measure
traderbro tv symbol NASDAQ:AAPL
traderbro tv study add "Relative Strength Index"
traderbro tv study add "Bollinger Bands"

# 2. Pull bars + study values time-aligned (one call)
traderbro tv study values --last 30 --include-volume --json > /tmp/data.json

# 3. Run your numeric query against the time series with jq
jq '
  .bars
  | map({date, close, rsi: (.studies | to_entries[] | select(.key|startswith("Relative")) | .value.Plot)})
  | (max_by(.close)) as $pHi
  | (max_by(.rsi // -1)) as $rHi
  | "price-peak: \($pHi.date) close=\($pHi.close) rsi=\($pHi.rsi)\nrsi-peak:   \($rHi.date) rsi=\($rHi.rsi)\nbearish-div: \($pHi.date > $rHi.date)"
' /tmp/data.json

# 4. Annotate the bars you found, then screenshot
traderbro tv draw arrow down 2026-05-12 294.27
traderbro tv screenshot -o /tmp/annotated.png
```

Use this workflow for RSI divergence, MACD crossover detection, Bollinger
squeeze identification, volume confirmation, and multi-indicator
confluence. See the `tv-quant` skill (`traderbro skills read tv-quant`)
for five worked patterns with verified output.

## Flags

| Flag | Default | Description |
|---|---|---|
| `--port` | `7891` | Bridge server port |
| `--json` | false | Output as JSON |
| `--no-color` | false | Disable colored output |
