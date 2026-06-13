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
- **Guest mode is the default and is fully supported.** Data commands (`bars`, `snap`,
  `screenshot`, `metrics`, `sweep`, `draw --symbol`) all run logged-OUT: a guest chart loads
  per-symbol bars, switches symbol/resolution, captures, and computes up to **2 indicators** — on a
  **delayed (BATS) feed**. Fine for daily/weekly TA; do not present an intraday guest print as a
  live quote. (`screen` needs no browser at all — it calls TradingView's public scanner API over
  HTTP.)
- **Indicator budget: 2 per chart** in guest mode (a TradingView guest limit; `Volume` is the free
  default overlay and doesn't count). Use `tvsandbox study add "<full name>"` / `study list` /
  `study remove <id>` / `study clear` — the command enforces the cap (refuses the 3rd), dedupes, and
  avoids the guest `createStudy` promise-hang you'd hit hand-writing `eval`. Set indicator
  parameters with **`--inputs`** (positional, comma-separated: `--inputs 200` for an EMA length,
  `--inputs 12,26,9` for MACD) — without it you get TradingView defaults (e.g. EMA length 9). The
  traderbro.ai `brochart` chart is separate and has no such cap.
- **Capture flag asymmetry:** `bars`/`snap`/`screenshot` save with `--out`; `draw` saves with
  `--screenshot`. They are not interchangeable.
- Logging in is **optional** (and currently unused in production — the TV session pool is
  mothballed, see `docs-devops/tvsandbox-session-pool-mothballed.md`). `tvsandbox login` /
  `auth export` still work for a signed-in machine; login is detected from TradingView's own
  `window.user`, not the `sessionid` cookie.
- **No pattern detector.** tvsandbox does not detect chart patterns — the agent judges
  bull/bear/continuation from the bars + screenshot, and server-side detection lives in
  [`calculated-events`](./calculated-events.md). tvsandbox *draws* any native shape you anchor.
- **One shared Chrome — run commands sequentially**, never concurrently.
- **Clean full-bleed chart by default:** on every chart connect the CLI enters TradingView's
  fullscreen mode (hides the header, the left drawing toolbar and the right watchlist panel)
  and installs a DOM observer that auto-removes TradingView's recurring blocking dialogs
  (the guest "Look first / Then leap" gateway and the "More indicators / free trial" upsell —
  both `data-dialog-name="gopro"`; the gateway variant has no close button, so it is removed
  at the DOM level). Captures and live viewing both get the bare chart.

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
| `--tab` | (empty) | Address a specific tab by its target id (from `tvsandbox open`) — for per-subagent/parallel use. Empty = the shared default tab. |
| `--max-tabs` | `2` | Cap on CLI-owned tabs `open` will create. Default matches the TradingView Basic connection limit (Premium = 50). Env: `TVSANDBOX_MAX_TABS` |
| `--json` | `false` | Output as JSON |

## Parallel tabs & the TradingView connection limit

Each agent or conversation thread can own its **own tab** so concurrent work doesn't
collide on one shared chart:

```bash
id=$(traderbro tvsandbox open)            # create a tab, print its target id
traderbro tvsandbox bars NVDA --tab "$id"
traderbro tvsandbox snap NVDA --tab "$id" --out nvda.png
traderbro tvsandbox close --tab "$id"     # close it when done
```

- **Within one tab:** strictly sequential (never two commands against the same tab at once).
- **Across tabs:** parallel is fine — but only up to the **TradingView plan's
  simultaneous-connection cap: Basic = 2, Premium = 50**. Each live data tab is one
  connection (the shared default tab counts too).
- Exceeding the cap makes TradingView close the connection (*"We've closed this
  connection"*) and data stops loading. **Recover:**

  ```bash
  traderbro tvsandbox close --all          # free connections (or --stale 10m)
  traderbro tvsandbox eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>/restore connection/i.test(x.textContent||''));if(b){b.click();return 'restored';}return 'no-modal';})()"
  traderbro tvsandbox bars NASDAQ:AAPL     # confirm data loads again
  ```

On Basic, run parallel subagents in **waves of ≤2** and close the shared/default tab
during parallel work.

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

### open

Create a new logged-in TradingView tab and print its target id (the ownership token
for `--tab`). Use one tab per agent/thread. Respects `--max-tabs`.

```bash
id=$(traderbro tvsandbox open)
traderbro tvsandbox open --json   # { "tab": "<id>", "port": 9333 }
```

---

### close

Close a tab opened by `open`, or reap leftovers.

```bash
traderbro tvsandbox close --tab <id>     # close your tab
traderbro tvsandbox close --all          # close all CLI-owned tabs
traderbro tvsandbox close --stale 10m    # reap CLI tabs older than 10m (crashed subagents)
```

---

### tabs

List open TradingView tabs, marking CLI-owned ones and their age.

```bash
traderbro tvsandbox tabs
traderbro tvsandbox tabs --json
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

### search

Resolve a ticker or company name to the symbols TradingView actually serves on the
guest feed, with their loadable exchange. Use it whenever you're unsure of the exact
symbol/exchange — the guest feed often uses a different exchange than a stock's real
primary listing (e.g. SPY loads as `AMEX:SPY`, **not** `NYSEARCA:SPY`). Don't guess;
search, then pass a `SYMBOL` from the list straight to `bars`/`snap`.

```bash
traderbro tvsandbox search SPY
# SYMBOL        EXCHANGE   TYPE   DESCRIPTION
# AMEX:SPY      NYSE Arca  fund   SPDR S&P 500 ETF TRUST
# ...
traderbro tvsandbox search "nvidia" --json
```

| Flag | Default | Description |
|---|---|---|
| `--limit` | `8` | Max results |

Output (JSON): `{ "query", "matches": [{ "symbol", "ticker", "exchange", "type", "description" }, …] }`.
`symbol` is the loadable form (prefix:ticker, or bare ticker).

---

### bars

Load a symbol on the chart and return its raw OHLCV bars.

```bash
traderbro tvsandbox bars NVDA --res 1D --json
traderbro tvsandbox bars NVDA --res 1W --out ~/work/nvda_1w.json   # write to file, print 1-line confirm
traderbro tvsandbox bars NVDA --res 1D,1W,1M --out ~/work/nvda.json # multi-timeframe → one file per res
```

| Flag | Default | Description |
|---|---|---|
| `--res` | `1D` | Chart resolution(s); accepts a **comma list** (e.g. `1D,1W,1M`) to fetch multiple timeframes in one call |
| `--out` | — | Write bars to this file (JSON, or CSV if `--csv`/`.csv`) and print a **compact confirmation** instead of dumping the payload. Multi-res writes one file per res (`name_<res>.ext`). Prefer this for analysis — fetch once, then read the file (don't re-download). |
| `--csv` | `false` | Emit/write bars as CSV (`date,time,open,high,low,close,volume`) for pandas |

Output (JSON): `{ "symbol", "res", "count", "bars": [{ "Time", "Open", "High", "Low", "Close", "Vol" }, …] }`
(or `{ "symbol", "resolutions": [...] }` for a multi-res stream). `Time` is unix seconds (UTC). With `--out`,
stdout is just a confirmation line per file.

If the symbol isn't served on the guest feed, `bars` fails fast (exit 1) with
`unresolved symbol … no data on the guest feed` **and lists candidate symbols** (from
`tvsandbox search`) — retry with one of those rather than guessing an exchange.

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
| `--full` | `false` | Capture the full browser viewport (incl. toolbars) instead of just the chart |

**Capture method & privacy:** `snap` captures the chart via a **CDP grab clipped to
the chart pane** — a clean chart with **no account-name watermark**. This matters for
a shared/pooled TradingView session (plan 153): TradingView's `takeClientScreenshot`
stamps "<username> created with TradingView.com …" onto every image, which would leak
the house account's name to end users. The CDP clip avoids that at the same
resolution, size, and speed (~2730px, ~330 KB, ~95 ms — on par with the native path).
`takeClientScreenshot` is retained only as a silent fallback if the chart pane can't
be located. The floating **Buy/Sell trade panel** is hidden for the shot (restored
right after) so it never clutters the figure. `--full` grabs the whole viewport
(incl. toolbars) for debugging.

**Auto-recovery:** if the chart switches to the symbol but its data feed never
delivers bars (a stale/dead Chrome data socket — the session is still signed in,
but the chart hangs on "loading"), `snap` (and `bars`) automatically restart the
dedicated Chrome **once** and retry. A fresh Chrome reloads the saved session and
the feed resumes — no action needed. An *unresolved/invalid symbol* fails fast
(no restart). This is most common on the first request after a long-idle Chrome.

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

Capture the current chart **as-is — this does NOT frame the view**. After `bars`/`metrics`
the on-screen chart is unframed (candles crammed into a sliver). For a clean, readable
figure use [`snap`](#snap) (loads + frames + captures); if you must use `screenshot`, run
`tvsandbox frame 250` immediately before it.

```bash
traderbro tvsandbox frame 250 && traderbro tvsandbox screenshot /tmp/chart.png
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
