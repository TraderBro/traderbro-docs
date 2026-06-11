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

Pick one transport:

- **Interactive (WS bridge)** — drives the chart tab a human has open:
  1. Start the bridge server: `traderbro brochart serve`
  2. Open your TraderBro chart page in a browser — the bridge connects automatically
- **Headless (CDP)** — no human tab; the CLI owns a background Chrome (sandbox/agent use):
  `traderbro brochart launch --via cdp --headless` (see [launch](#launch)). Every command
  then works with the global `--via cdp` flag.

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
traderbro brochart --via cdp screenshot -o /tmp/chart.png   # headless: watermark-free
```

Always run `brochart close` before `brochart screenshot` to get a clean image.

Over the headless/CDP transport (`--via cdp` / `--headless`) **with a file destination
(`-o`)**, the chart pane is captured natively (CDP `Page.captureScreenshot`, clipped to
the widget container `.TVChartContainer`) — **watermark-free** (no logged-in-account
stamp). The WS bridge transport and base64-to-stdout output use TradingView's
`takeClientScreenshot`.

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

### analysts / patterns / tab — sidebar control (plan 181)

Read and set the chart sidebar's data tabs — which **analysts** and calculated-event
**patterns** overlay the chart — and switch the active tab. These drive the SAME
sidebar handlers a person clicks, so the CLI sees/sets exactly what the UI does.
(Analysts/patterns are the self-hosted chart's proprietary overlays — `tvsandbox`,
which only sees tradingview.com, cannot render them.)

```bash
# Analysts — slugs come from `analysts list`; selection overlays their calls as marks
traderbro brochart analysts list                       # available + selected for the current symbol
traderbro brochart analysts select the-analyst         # REPLACE selection (default)
traderbro brochart analysts select acme --add          # append
traderbro brochart analysts select acme --remove       # drop one
traderbro brochart analysts select --clear             # remove all
traderbro brochart analysts select a b --direction bullish   # filter marks bullish|bearish|all

# Patterns — types come from `patterns list`; selection overlays event markers
traderbro brochart patterns list
traderbro brochart patterns select golden_cross death_cross   # REPLACE
traderbro brochart patterns select bull_flag --add --horizon 6m
traderbro brochart patterns select --clear

# Tab — switch the active sidebar panel (opens it if collapsed)
traderbro brochart tab analysts            # symbols|analysts|patterns|copilot|hermes
```

Notes:
- The available **analysts**/**patterns** list populates once the tab has fetched for the
  current symbol — run `tab analysts` / `tab patterns` (or the `list`) after switching
  symbols, and in headless allow ~5s before re-listing.
- **JSON shape:** both `analysts list --json` and `patterns list --json` carry the
  catalogue under **`available`** (+ `selected`, `direction`). `patterns list` also
  includes `availableTypes` (alias of `available`), `aggregates` (per-type counts), and
  `horizon`. `analysts list` rows are `{slug, name, followers}` — there is no quality field;
  rank with `traderbro analyst list --sort return` to pick *which* analysts to overlay.
- `brochart state --json` includes a `sidebar` block (active tab + analyst/pattern
  selection) for one-shot reads.
- Modes: bare slugs/types **replace** the selection; `--add` / `--remove` / `--clear`
  adjust it. Selection changes refresh the chart overlays immediately.

---

### launch

Launch (or reuse) an app-owned Chrome pointed at the self-hosted brochart chart and drive
it over the DevTools Protocol — the **headless counterpart to the WS bridge**, for
sandboxes/agents with no human browser tab. Authenticates by injecting a session JWT into
`localStorage.token`; it does **not** use the bridge.

```bash
# Remote / sandbox (headless) — JWT from the environment (broker-injected)
TRADERBRO_USER_JWT=<jwt> traderbro brochart launch --via cdp --headless

# Local dev (foreground), explicit JWT + local chart URL (use your vite port, e.g. 3000/3002)
traderbro brochart launch --via cdp --jwt <jwt> --cdp-url http://localhost:3000/chart

# Then every command works over the same Chrome with --via cdp
# (in local dev, repeat the SAME --cdp-url on each; in prod the default is correct):
traderbro brochart --via cdp symbol NASDAQ:NVDA 1D
traderbro brochart --via cdp analysts list --json
traderbro brochart --via cdp analysts select alea --add
traderbro brochart --via cdp close
traderbro brochart --via cdp screenshot -o ~/shared/nvda.png   # watermark-free
```

Notes:
- Uses CDP port **9334** by default (coexists with `tvsandbox`'s 9333) and its own Chrome
  profile (`~/.traderbro/brochart-profile`), so both can run side-by-side in one sandbox.
- **Auth:** `--jwt` defaults to `$TRADERBRO_USER_JWT`. A missing/invalid JWT makes the SPA
  bounce to `/login` and `launch` fails loudly — fix the env var or `--jwt`, don't retry blind.
- **Local dev — pass the same `--cdp-url` to EVERY `--via cdp` command**, not only `launch`.
  The CLI locates the chart tab by that URL's host; if a follow-up command omits it, it
  defaults to the production host and attaches to the wrong/missing tab. In production the
  default URL is correct, so no `--cdp-url` is needed.
- `serve`, `charts`, and `health` are **WS-bridge only** — they do not operate over
  `--via cdp`. On a headless chart, confirm readiness from `launch`'s `ready` line and
  `state --json` instead.
- In headless, the Analysts/Patterns React panel fetch is slower (>5s): run `analysts list`
  / `patterns list` **before** `select` so the overlay datafeed is primed.
- `screenshot -o` over `--via cdp` is clipped to the chart pane — it shows the price chart
  **with overlay marks** (analyst calls, pattern markers), not the sidebar panel UI.

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
| `--via` | `bridge` | Transport: `bridge` (WS server) or `cdp` (drive a launched Chrome over DevTools) |
| `--headless` | false | Launch the brochart Chrome headless (remote/no-display servers) |
| `--jwt` | `$TRADERBRO_USER_JWT` | Session JWT injected into `localStorage.token` for `--via cdp` auth |
| `--cdp-port` | `9334` | CDP debug port for the brochart Chrome (`--via cdp`) |
| `--cdp-url` | production | Chart URL for `--via cdp` (e.g. `http://localhost:3000/chart` for local dev — use your vite port; pass the SAME value to every `--via cdp` command) |
| `--profile` | `~/.traderbro/brochart-profile` | Chrome profile dir for `--via cdp` |
| `--tab` | — | Address a specific CDP tab by target id (`--via cdp`) |
