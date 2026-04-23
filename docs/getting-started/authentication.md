---
sidebar_position: 2
title: Authentication
---

# Authentication

TraderBro uses API keys to authenticate all requests.

## Step 1 — Generate an API key

1. Log in at [traderbro.ai](https://traderbro.ai)
2. Go to **Settings → API Keys**
3. Click **Generate New Key**
4. Copy the key — it starts with `tb_sk_`

## Step 2 — Configure the CLI

Run the interactive setup:

```bash
traderbro configure --server https://api.traderbro.ai --key tb_sk_YOUR_KEY_HERE
```

This saves your credentials to `~/.traderbro/config.yaml`.

## Step 3 — Verify

```bash
traderbro whoami
```

You should see your account details:

```
Email:    you@example.com
Plan:     Pro
```

---

## Environment variables

For CI pipelines, scripts, and AI agents, use environment variables instead of the config file:

```bash
export TRADERBRO_SERVER="https://api.traderbro.ai"
export TRADERBRO_API_KEY="tb_sk_..."
```

Environment variables take precedence over the config file.

## Per-command key override

You can override credentials for a single command using global flags:

```bash
traderbro analyst list --server https://api.traderbro.ai --key tb_sk_... --json
```

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `exit code 2` | Authentication failure | Check your API key is valid and not expired |
| `loading config: ...` | Config file missing | Run `traderbro configure` |
| Connection refused | Wrong server URL | Confirm `--server` points to `https://api.traderbro.ai` |

Next: [First Command](/getting-started/first-command)
