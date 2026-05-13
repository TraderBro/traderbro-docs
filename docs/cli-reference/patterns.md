# traderbro patterns

Pattern detection sub-commands.

## Sub-commands

| Sub-command | Description |
|---|---|
| [`patterns candles`](#candles) | Scan for TA-Lib candlestick patterns in recent bars |

---

## patterns candles

Scan the last N bars of a symbol's daily price history for candlestick patterns using TA-Lib.

### Usage

```
traderbro patterns candles EXCHANGE:SYMBOL [flags]
```

### Flags

| Flag | Default | Description |
|---|---|---|
| `--lookback` | `10` | Number of recent bars to scan |
| `--json` | off | Print raw JSON output |

### Examples

```bash
# Last 10 bars (default)
traderbro patterns candles DSE:ACI

# Extend the scan window to 20 bars
traderbro patterns candles NASDAQ:TSLA --lookback 20

# JSON for parsing or piping
traderbro patterns candles DSE:ACI --lookback 14 --json
```

### Output (default mode)

```
ACI (DSE) — Candlestick Patterns (last 10 bars)

  Pattern                    Direction  Date          Bars Ago  Signal
  ───────────────────────────────────────────────────────────────────
  Engulfing Pattern          bullish    2026-05-07    1         100
  Hammer                     bullish    2026-05-05    3         100

2 pattern(s) found.
```

### Output (--json mode)

```json
{
  "symbol": "ACI",
  "exchange": "DSE",
  "patterns_found": 2,
  "lookback": 10,
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
    },
    {
      "pattern_id": "CDLHAMMER",
      "name": "Hammer",
      "direction": "bullish",
      "signal": 100,
      "candles_span": 1,
      "date": "2026-05-05",
      "bars_ago": 3
    }
  ]
}
```

### Field reference

| Field | Description |
|---|---|
| `pattern_id` | TA-Lib function name (e.g. `CDLENGULFING`) |
| `name` | Human-readable pattern name |
| `direction` | `"bullish"` or `"bearish"` |
| `signal` | TA-Lib raw signal value: 100 (bullish), −100 (bearish), 200 (strong bullish), −200 (strong bearish) |
| `candles_span` | How many bars the pattern spans (e.g. 2 for Engulfing) |
| `date` | Date the pattern completed (YYYY-MM-DD) |
| `bars_ago` | 0 = today, 1 = yesterday. Patterns ≤ 2 bars ago carry the most weight |

### Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 2 | Auth failure |
| 3 | Symbol not found or insufficient price history (< 30 bars) |
| 6 | Quota exceeded |

## See also

- [`traderbro analyze`](analyze.md) — full analysis: chart + patterns + signals in one call
- [`traderbro symbol search`](symbol.md) — find the right EXCHANGE:SYMBOL identifier
