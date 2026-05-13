# traderbro analyze

Generate a candlestick chart with indicator overlays, scan for candlestick patterns, detect structural chart patterns, and return a unified signals summary.

## Usage

```
traderbro analyze EXCHANGE:SYMBOL [flags]
```

## Description

`traderbro analyze` is the primary technical analysis command. It calls the TraderBro API to:

1. Render a candlestick chart PNG with the requested indicators
2. Scan the last N bars for TA-Lib candlestick patterns
3. Detect structural chart patterns (bull flags, head & shoulders, etc.)
4. Return a combined signals summary with a confluence score (0–10)

The chart PNG is saved locally. **The absolute file path is printed to stdout** — an AI agent can read the image with its Read/image tool at that path.

Human-readable summary (price, patterns, confluence) is printed to stderr.

## Flags

| Flag | Default | Description |
|---|---|---|
| `--period` | `6mo` | Chart lookback: `1mo`, `3mo`, `6mo`, `1y`, `2y` |
| `--interval` | `1d` | Bar interval: `1d`, `1wk` |
| `--indicators` | `sma_50,sma_200,rsi` | Comma-separated indicator keys |
| `--lookback` | `10` | Candle pattern scan window (bars) |
| `--no-candle-patterns` | off | Skip TA-Lib candlestick scan |
| `--no-chart-patterns` | off | Skip structural pattern detection (faster) |
| `--output-dir` | `~/.traderbro/charts` | Directory to save the PNG |
| `--json` | off | Print raw JSON to stdout (no PNG saved) |

### Available indicators

`sma_20`, `sma_50`, `sma_200`, `ema_20`, `ema_50`, `bbands`, `rsi`, `macd`

## Examples

```bash
# Quick analysis — defaults (6mo daily, SMA 50/200 + RSI)
traderbro analyze DSE:ACI

# 1-year chart with MACD
traderbro analyze NASDAQ:AAPL --period 1y --indicators sma_50,sma_200,rsi,macd

# Bollinger Bands instead of moving averages
traderbro analyze DSE:ACI --indicators bbands,rsi

# Skip structural pattern scan (faster response)
traderbro analyze DSE:ACI --no-chart-patterns

# Raw JSON — for piping or agent parsing
traderbro analyze DSE:ACI --json

# Save PNG to a custom directory
traderbro analyze DSE:ACI --output-dir /tmp/charts
```

## Output (default mode)

**stdout** — absolute path to the saved PNG (one line, no trailing whitespace):
```
/home/user/.traderbro/charts/ACI_DSE_1d_6mo_analyze_20260508-120000.png
```

**stderr** — human-readable summary:
```
ACI (DSE)  1d  6mo  |  Last: 49.50  +2.70%  |  126 bars
Candle patterns (last 10 bars): 2 total  2 bullish  (most recent: Engulfing Pattern, 1d ago)
Confluence: 7/10 — bullish
Chart saved: /home/user/.traderbro/charts/ACI_DSE_1d_6mo_analyze_20260508-120000.png
```

## Output (--json mode)

```json
{
  "symbol": "ACI",
  "exchange": "DSE",
  "chart": {
    "image_b64": "<base64-png>",
    "format": "png",
    "period": "6mo",
    "interval": "1d",
    "indicators": ["sma_50", "sma_200", "rsi"],
    "data_points": 126,
    "date_range": { "from": "2025-11-08", "to": "2026-05-08" }
  },
  "price_summary": {
    "latest_close": 49.5,
    "open": 48.2,
    "high": 50.1,
    "low": 47.8,
    "change_pct": 2.7
  },
  "candle_patterns": {
    "lookback": 10,
    "patterns_found": 2,
    "scan_range": { "from": "2026-04-28", "to": "2026-05-08" },
    "patterns": [
      {
        "pattern_id": "CDLENGULFING",
        "name": "Engulfing Pattern",
        "direction": "bullish",
        "signal": 100,
        "candles_span": 2,
        "date": "2026-05-07",
        "bars_ago": 1
      }
    ]
  },
  "chart_patterns": {
    "patterns_found": 0,
    "patterns": []
  },
  "signals": {
    "dominant_direction": "bullish",
    "candle_bias": "bullish",
    "structure_bias": "neutral",
    "confluence_score": 7,
    "summary": "2 bullish candle patterns in last 10 bars (Engulfing 1 bar ago, Hammer 3 bars ago)."
  },
  "generated_at": "2026-05-08T12:00:00Z"
}
```

### Key JSON fields

| Field | What it tells you |
|---|---|
| `candle_patterns[*].bars_ago` | 0 = today, 1 = yesterday. Patterns ≤ 2 bars ago are most actionable |
| `chart_patterns[*].status` | `"active"` = still in play; `"historical"` = already resolved |
| `chart_patterns[*].target_price` | Pattern's measured price target |
| `chart_patterns[*].stop_price` | Suggested invalidation level |
| `signals.confluence_score` | 0–10. ≥ 7 = high conviction. ≤ 3 = mixed or no signal |
| `signals.dominant_direction` | Overall bias: `"bullish"`, `"bearish"`, or `"neutral"` |
| `signals.summary` | Plain-English summary — read this first |

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | General error (invalid flags, etc.) |
| 2 | Auth failure — check your API key |
| 3 | Symbol not found or insufficient price history |
| 6 | Quota exceeded |

## See also

- [`traderbro patterns candles`](patterns.md) — candlestick scan only, no chart
- [`traderbro symbol search`](symbol.md) — find the right EXCHANGE:SYMBOL identifier
