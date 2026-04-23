# traderbro-docs

Documentation site for the [TraderBro CLI](https://docs.traderbro.ai) — a command-line tool for querying analyst predictions, return analytics, and sector research.

Live at: **[docs.traderbro.ai](https://docs.traderbro.ai)**

---

## Stack

- [Docusaurus 3](https://docusaurus.io) — static site framework
- [GitHub Pages](https://pages.github.com) — hosting (free, public repo)
- GitHub Actions — build and deploy on push to `main`

---

## Local development

```bash
npm install
npm start
```

Opens at `http://localhost:3000`.

## Build

```bash
npm run build
```

Output goes to `build/`. The `postbuild` script also generates `build/llms-full.txt` (concatenation of all doc pages for AI crawlers).

---

## Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`), which:

1. Builds the Docusaurus site
2. Generates `llms-full.txt`
3. Deploys to the `gh-pages` branch via `peaceiris/actions-gh-pages`

The custom domain `docs.traderbro.ai` is set via the `CNAME` field in the workflow.

---

## Content structure

```
docs/
├── intro.md                          ← Landing page (served at /)
├── getting-started/
│   ├── installation.md
│   ├── authentication.md
│   └── first-command.md
├── cli-reference/
│   ├── overview.md                   ← Global flags, exit codes, output modes
│   ├── analyst.md                    ← list, get, predictions, sector-edge, sector-map
│   ├── prediction.md
│   ├── symbol.md
│   ├── content.md
│   └── research.md
├── guides/
│   ├── finding-top-analysts.md
│   ├── sector-edge-research.md
│   ├── filtering-by-period.md
│   ├── scripting-and-automation.md
│   └── using-with-ai-agents.md
└── concepts/
    ├── return-calculation.md
    ├── accuracy-rate.md
    ├── prediction-model.md
    └── sector-edge.md
```

## AI discoverability

- `static/llms.txt` — AI crawler index (served at `/llms.txt`)
- `build/llms-full.txt` — full content dump generated at build time (served at `/llms-full.txt`)
- `static/robots.txt` — explicitly allows GPTBot, ClaudeBot, Google-Extended, PerplexityBot
