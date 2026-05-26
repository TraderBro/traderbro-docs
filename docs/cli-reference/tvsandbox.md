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
pattern detection.

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
- Data commands (`bars`, `detect`, `show`, `snap`, `metrics`, `funnel`) require a signed-in
  session — guests cannot load arbitrary per-symbol data. `screen` is the exception: it calls
  TradingView's public scanner API directly over HTTP, with no browser and no login.

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

Output (JSON): `{ "symbol", "res", "count", "bars": [[t,o,h,l,c,v], …] }`.

---

### detect

Load a symbol and run the head-and-shoulders detector on its bars.

```bash
traderbro tvsandbox detect NVDA --bear --res 1D
traderbro tvsandbox detect NVDA --bull
```

| Flag | Default | Description |
|---|---|---|
| `--bear` | (default) | Bearish H&S top |
| `--bull` | | Bullish inverse-H&S bottom |
| `--res` | `1D` | Chart resolution |

---

### show

Detect and **draw** the H&S pattern on the chart, optionally saving a screenshot.

```bash
traderbro tvsandbox show NVDA --bull --screenshot /tmp/inv_hs.png
```

| Flag | Default | Description |
|---|---|---|
| `--bull` / `--bear` | `--bear` | Pattern direction |
| `--res` | `1D` | Chart resolution |
| `--screenshot` | | Save an image of the drawn chart to this path |
| `--full` | `false` | Capture the full browser viewport instead of chart-only |

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

Remove shapes this CLI drew (leaves your own drawings untouched).

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
| `--bear` | (default) | Genuine-uptrend names rolling over (H&S-top candidates) |
| `--bull` | | Downtrend names turning up (inverse-H&S-bottom candidates) |
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

### funnel

Full pipeline: stage 1 screens the US market over HTTP (no chart); stage 2 loads each candidate
on the dedicated Chrome and confirms the H&S with the Go detector. Optionally writes a Markdown
report.

```bash
traderbro tvsandbox funnel --bear                  # H&S tops, daily
traderbro tvsandbox funnel --bull --res 1W         # inverse-H&S bottoms, weekly
traderbro tvsandbox funnel --bear --res 1D,1W,1M   # multi-timeframe (confirm each TF)
traderbro tvsandbox funnel --bull --max 0 --report bull.md   # full universe → report
```

| Flag | Default | Description |
|---|---|---|
| `--bull` / `--bear` | `--bear` | Pattern direction |
| `--res` | `1D` | Resolution; accepts a comma list (e.g. `1D,1W,1M`) |
| `--max` | `40` | Max candidates to confirm (0 = all) |
| `--universe` | | Scan a named index instead of the perf prefilter |
| `--report` | | Write a Markdown report of the hits to this path |

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| non-zero | Error — e.g. not signed in (run `tvsandbox login`), Chrome unavailable, or symbol load failed |
