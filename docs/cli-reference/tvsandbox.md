---
title: tvsandbox
sidebar_label: tvsandbox
---

# traderbro tvsandbox

Drive the **official `tradingview.com/chart`** from the CLI over the Chrome DevTools Protocol,
using a dedicated, app-owned Chrome instance on the consumer's local machine (never your daily
browser). The CLI launches and reuses that Chrome; you sign in once and the session persists.

This is the high-fidelity price/volume path: deeper intraday resolutions, longer history, more
realtime data, **extended-hours** bars, and the throughput to loop thousands of symbols for
visual review.

:::tip Which chart command?
Use **`tvsandbox`** for raw market-data fidelity and bulk scanning from tradingview.com. For
TraderBro's proprietary overlays (analyst marks, calculated events, predictions) on the
traderbro.ai-hosted chart, use [`brochart`](./brochart.md).
:::

## How it works

- A dedicated Chrome is launched on its own debug port (**default 9333**, deliberately *not*
  9222) with a persistent profile at `~/.traderbro/chrome-profile`, bound to `127.0.0.1` only.
- Login is detected from TradingView's own `window.user` (a real numeric user id), not the
  `sessionid` cookie. Sign in once with `tvsandbox login`; every later run reuses the session.
- Data commands (`bars`, `snap`, `screenshot`, `metrics`, `sweep`, and `draw --symbol`) require
  a signed-in session — guests cannot load arbitrary per-symbol data. `screen` is the exception:
  it calls TradingView's public scanner API directly over HTTP, with no browser and no login.
- **No pattern detector.** tvsandbox does not detect chart patterns — the agent judges
  bull/bear/continuation from the bars + screenshot, and server-side detection lives in
  [`calculated-events`](./calculated-events.md). tvsandbox *draws* any native shape you anchor.
- **One shared Chrome — run commands sequentially**, never concurrently.

## Prerequisites

```bash
traderbro tvsandbox login     # opens the dedicated Chrome; sign into TradingView once
traderbro tvsandbox whoami    # confirm: "signed in as <user>"
```

## Global flags

| Flag | Default | Description |
|---|---|---|
| `--cdp-port` | `9333` | CDP debug port for the dedicated Chrome |
| `--profile` | `~/.traderbro/chrome-profile` | Chrome profile directory |
| `--json` | `false` | Output as JSON |

## Commands

### login

Launch/reuse the dedicated Chrome and wait while you sign into TradingView in that window. The
login is stored in the persistent profile, so you only do this once.

```bash
traderbro tvsandbox login
```

---

### whoami

Report whether the dedicated Chrome holds a logged-in TradingView session.

```bash
traderbro tvsandbox whoami --json
# { "loggedIn": true, "username": "...", "port": 9333 }
```

---

### eval

Run JavaScript against the chart page. The root object is `window.TradingViewApi`
(its `activeChart()` is the chart). Promises are awaited.

```bash
traderbro tvsandbox eval "window.TradingViewApi.activeChart().symbol()"
traderbro tvsandbox eval "window.TradingViewApi.activeChart().resolution()"
```

---

### bars

Load a symbol on the chart and return its raw OHLCV bars.

```bash
traderbro tvsandbox bars NVDA --res 1D --json
```

| Flag | Default | Description |
|---|---|---|
| `--res` | `1D` | Chart resolution (e.g. `5`, `60`, `1D`, `1W`, `1M`) |

Output (JSON): `{ "symbol", "res", "count", "bars": [{ "Time", "Open", "High", "Low", "Close", "Vol" }, …] }`.
`Time` is unix seconds (UTC).

---

### snap

Load a symbol, frame the last N candles so the data is visible, and capture a clean PNG.

```bash
traderbro tvsandbox snap TSLA --bars 250 --out /tmp/tsla.png
```

| Flag | Default | Description |
|---|---|---|
| `--res` | `1D` | Chart resolution |
| `--bars` | `250` | Number of candles to frame into view |
| `--margin` | `6` | Right-edge padding in bars |
| `--out` | `snap.png` | Output image path |
| `--full` | `false` | Full viewport instead of chart-only |

---

### frame

Frame the current chart to show the last N candles (default 250).

```bash
traderbro tvsandbox frame 300
```

---

### clear

Remove drawings this CLI made via `tvsandbox draw` (leaves your own drawings untouched).

```bash
traderbro tvsandbox clear
```

---

### screenshot

Capture the current chart to a PNG.

```bash
traderbro tvsandbox screenshot /tmp/chart.png
traderbro tvsandbox screenshot /tmp/chart.png --full
```

---

### screen

Screen the US market via TradingView's public scanner API — **no browser, no login**.

```bash
traderbro tvsandbox screen --bear --limit 50 --json
traderbro tvsandbox screen --bull --limit 30
```

| Flag | Default | Description |
|---|---|---|
| `--bear` | (default) | Genuine-uptrend names rolling over (topping candidates) |
| `--bull` | | Downtrend names turning up (bottoming candidates) |
| `--limit` | `300` | Max rows per stock/ETF query |

---

### metrics

Loop a symbol list on the dedicated Chrome, read each one's bars, and compute technical features
(RSI(14), EMA200 distance, ATR%, % from 52-week high, 20-bar position, volume ratio, 20/60-bar
returns) plus an upside composite score. Ranked output.

```bash
traderbro tvsandbox metrics NVDA,AAPL,MSFT --sort score
traderbro tvsandbox metrics --universe sp500 --sort rsi --top 20
cat syms.txt | traderbro tvsandbox metrics --symbols-file -
```

| Flag | Default | Description |
|---|---|---|
| `--res` | `1D` | Chart resolution |
| `--universe` | | Index universe (`sp500`, `nasdaq100`, `dow`) instead of an arg list |
| `--symbols-file` | | File of symbols (JSON array, `{symbols:[…]}`, or one per line; `-` = stdin) |
| `--sort` | `score` | Sort field: `score\|rsi\|distEma200\|fromHi\|r20\|r60\|pos20\|volR\|atrPct\|last` |
| `--top` | `0` | Show only the top N rows (0 = all) |

---

### sweep

Bulk-capture artifacts for many symbols so an agent can review them. For each symbol it loads
the chart, writes a framed screenshot (`<out-dir>/<TICKER>.png`) and its bars
(`<out-dir>/<TICKER>.json`), then an `<out-dir>/index.json`. This is the "go through each chart"
tool — it produces the artifacts; the **agent** reads the bars/images and decides
bull/bear/continuation (there is no detector).

```bash
traderbro tvsandbox sweep NVDA,AAPL,MSFT --out-dir /tmp/charts
traderbro tvsandbox sweep --universe sp500 --res 1D --out-dir /tmp/sp
traderbro tvsandbox screen --bull --limit 40 --json | jq -r '.[].sym' \
  | traderbro tvsandbox sweep --symbols-file - --out-dir /tmp/bull
```

| Flag | Default | Description |
|---|---|---|
| `--res` | `1D` | Chart resolution |
| `--universe` | | Index universe (`sp500`, `nasdaq100`, `dow`) instead of an arg list |
| `--symbols-file` | | File of symbols (JSON array, `{symbols:[…]}`, or one per line; `-` = stdin) |
| `--out-dir` | `tvsweep` | Directory for `<TICKER>.png` + `<TICKER>.json` + `index.json` |
| `--bars` | `250` | Candles to frame into each screenshot |
| `--no-bars` | `false` | Skip the per-symbol bars JSON (screenshots only) |

---

### draw

Render any of TradingView's ~90 native drawing objects on the chart — a thin passthrough to
`createMultipointShape`. You supply the shape name and anchor points; there is no auto-detection.

```bash
traderbro tvsandbox draw fib_retracement --points "2026-04-01:164.27,2026-05-15:236.54" --screenshot fib.png
traderbro tvsandbox draw anchored_vwap   --points 2026-04-07
traderbro tvsandbox draw head_and_shoulders --symbol WLK --points "t1:p1,...,t7:p7" --screenshot hs.png
```

Points are comma-separated `time:price`; `time` = `YYYY-MM-DD` or unix seconds; `price` may be
omitted for tools that ignore it (VWAP, volume profile). Each tool needs a specific number of
points — if wrong, TradingView's `Required N` error is surfaced. Available shapes include
`trend_line`, `rectangle`, `fib_retracement`(2), `fib_channel`(3), `anchored_vwap`(1),
`fixed_range_volume_profile`(2), `head_and_shoulders`(7), `triangle_pattern`/`abcd_pattern`(4),
`xabcd_pattern`(5), `elliott_impulse_wave`(6), `long_position`, `text`, and many more.

| Flag | Default | Description |
|---|---|---|
| `--points` | | Anchor points `"t1:p1,t2:p2,..."` (required) |
| `--symbol` | | Load this symbol first (else draw on the current chart) |
| `--res` | `1D` | Resolution when `--symbol` is given |
| `--color` | | Line/shape color (e.g. `#2962ff`) |
| `--width` | | Line width |
| `--screenshot` | | Capture a PNG after drawing |

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| non-zero | Error — e.g. not signed in (run `tvsandbox login`), Chrome unavailable, or symbol load failed |
