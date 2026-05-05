---
sidebar_position: 5
title: Using with AI Agents
---

# Using with AI Agents

The TraderBro CLI is designed to be driven by AI assistants. Every command supports `--json` for machine-readable output. The flag tables and JSON schemas in this documentation are structured so AI models can parse them reliably.

---

## Setup for Claude Code

Install the `SKILL.md` into your Claude Code session to give Claude full knowledge of every command:

```bash
# In your project, point Claude Code to the SKILL.md from the CLI repo
# Or set TRADERBRO_API_KEY in your environment and run:
traderbro whoami --json
```

Once Claude Code knows the CLI is available, you can ask it directly:

> "Use the traderbro CLI to find the top 5 analysts by 3-month return with at least 20 predictions, then get their sector edge in Technology."

Claude will chain these commands automatically:

```bash
traderbro analyst list --period 3m --sort return --min-predictions 20 --limit 5 --json
traderbro analyst sector-edge <slug> --sector Technology --period 3m --json
```

---

## Copy-pasteable prompts

These prompts work with Claude, GPT-4, and similar AI assistants that have CLI access.

**Find top analysts:**
> "Run `traderbro analyst list --sort return --min-predictions 20 --limit 10 --json` and tell me which analysts have the best overall return."

**Sector-specific research:**
> "Find analysts with strong Technology sector edge using `traderbro analyst sector-edge <slug> --period 3m --group-by industry --json`. Check the top 3 analysts by return."

**Symbol sentiment check:**
> "Get all NVDA predictions from the last 7 days using `traderbro prediction list --symbol NVDA --since <date> --json` and summarise the bull/bear sentiment."

**Period comparison:**
> "Compare the top 10 analysts by 1-month return vs 3-month return. Use `traderbro analyst list --period 1m --sort return --limit 10 --json` and `traderbro analyst list --period 3m --sort return --limit 10 --json`."

---

## Always use `--json` with AI agents

Table output is for human reading. JSON gives the AI the full data structure it needs to reason over results:

```bash
# Bad for agents — truncated table, no numeric precision
traderbro analyst list --limit 10

# Good for agents — full structured data
traderbro analyst list --limit 10 --json
```

---

## Pagination in agentic loops

For large result sets, use `--limit` and `--page` to paginate:

```bash
traderbro prediction list --symbol NVDA --json --limit 50 --page 1
traderbro prediction list --symbol NVDA --json --limit 50 --page 2
```

The JSON response includes `count` and `next` fields. Ask the AI to stop paginating when `next` is null.

---

## Machine-readable schema

To give an AI a complete map of all commands and flags without reading the docs:

```bash
traderbro describe --json
```

This outputs a JSON schema of every command, subcommand, flag, type, and default value. AI agents can fetch this once and use it to construct valid commands autonomously. The schema also includes a `skills_discovery` section pointing to the skills commands.

---

## Workflow skills

Skills are step-by-step workflows embedded in the binary that tell an AI agent how to chain CLI commands for common tasks. They are the right tool when a user asks an open-ended question like "what stocks should I buy?" rather than requesting a specific command.

### List available skills

```bash
traderbro skills list --json
```

Returns a list of skills with `name`, `description`, `trigger_keywords`, and `required_tools`. The AI should check this whenever the user's request matches a common workflow.

Example output:

```json
{
  "count": 1,
  "skills": [
    {
      "name": "analyst-top-picks",
      "description": "Finds stocks to buy based on the latest recommendations from the best-performing analysts on TraderBro",
      "trigger_keywords": ["what should i buy", "best analyst picks", "top analyst recommendations"],
      "required_tools": ["analyst list", "analyst predictions <slug>"]
    }
  ]
}
```

### Read a skill's full instructions

```bash
traderbro skills show analyst-top-picks
```

Prints the complete markdown workflow including step-by-step commands, scoring logic, and output format. The AI should read and follow the skill instructions exactly.

### Available skills

| Name | Description | Trigger keywords |
|---|---|---|
| `analyst-top-picks` | Finds stocks to buy from the best-performing analysts | "what should I buy", "best analyst picks", "top recommendations" |
