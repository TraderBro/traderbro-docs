---
sidebar_position: 1
title: Overview
---

# CLI Reference Overview

Every TraderBro command follows the same structure:

```
traderbro <command-group> <subcommand> [arguments] [flags]
```

## Command groups

| Group | Description |
|---|---|
| [`analyst`](/cli-reference/analyst) | List analysts, get profiles, view predictions, sector edge, sector map |
| [`prediction`](/cli-reference/prediction) | List and get individual analyst predictions |
| [`symbol`](/cli-reference/symbol) | Search symbols, list mentions and predictions per symbol |
| [`content`](/cli-reference/content) | Query monitored tweets, videos, and articles |
| [`research`](/cli-reference/research) | Published research articles |
| `sectors` | List available sectors and industries |
| `configure` | Save server URL and API key to config file |
| `whoami` | Verify authentication and show account info |
| `describe` | Output a machine-readable schema of all commands |

---

## Global flags

These flags apply to every command.

| Flag | Type | Default | Description |
|---|---|---|---|
| `--json` | bool | false | Output as JSON |
| `--plain` | bool | false | Tab-delimited output (no colors, no borders) |
| `--jq <expr>` | string | — | Apply jq expression to JSON output (implies `--json`) |
| `--limit <n>` | int | 25 | Items per page (max 100) |
| `--page <n>` | int | 1 | Page number |
| `--no-color` | bool | false | Disable colored output |
| `--no-input` | bool | false | Disable interactive prompts |
| `-q, --quiet` | bool | false | Suppress non-essential stderr |
| `-v, --verbose` | bool | false | Show debug info on stderr |
| `--server <url>` | string | from config | Override server URL |
| `--key <key>` | string | from config | Override API key |

---

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `2` | Authentication failure |
| `3` | Not found |
| `4` | Validation error (bad flag value) |
| `5` | Network error |

---

## Output modes

**Table mode** (default): human-readable bordered table with color.

**JSON mode** (`--json`): full API response as formatted JSON. Always use this for scripts and AI agents.

**Plain mode** (`--plain`): tab-delimited, no colors or borders. Use for shell pipelines where JSON is too heavy.

**jq mode** (`--jq '<expr>'`): applies a jq expression to the JSON output inline. Implies `--json`.

```bash
# Get just the slugs of the top 10 analysts
traderbro analyst list --limit 10 --jq '.results[].slug'
```
