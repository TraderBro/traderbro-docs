---
sidebar_position: 3
title: First Command
---

# Your First Command

Once you've [authenticated](/getting-started/authentication), try these commands in order.

## See top analysts

```bash
traderbro analyst list --sort accuracy --limit 10
```

Output:

```
Slug              Name            Accuracy   Predictions   Return %
────────────────────────────────────────────────────────────────────
noLimitGains      No Limit Gains  71.2%      42            +18.4%
aleabitoreddit    Alea Bitor      68.5%      31            +14.1%
...
```

## Get a full analyst profile

```bash
traderbro analyst get noLimitGains
```

## See predictions for a stock

```bash
traderbro prediction list --symbol NVDA --limit 5
```

## Filter for bullish calls only

```bash
traderbro prediction list --symbol NVDA --direction bullish --json
```

---

## JSON output

Add `--json` to any command for machine-readable output — use this for scripts and AI agents:

```bash
traderbro analyst list --sort accuracy --limit 5 --json
```

```json
{
  "count": 47,
  "next": "https://traderbro.ai/...",
  "results": [
    {
      "slug": "noLimitGains",
      "name": "No Limit Gains",
      "accuracy_rate": 71.2,
      "predictions_count": 42,
      "overall_return_pct": 18.4
    }
  ]
}
```

## Inline filtering with `--jq`

```bash
# Just names and accuracy
traderbro analyst list --limit 10 --jq '.results[] | {slug, accuracy_rate}'
```

---

You're ready. Browse the [CLI Reference](/cli-reference/overview) for every command and flag, or jump to a [Guide](/guides/finding-top-analysts) for a task-based walkthrough.
