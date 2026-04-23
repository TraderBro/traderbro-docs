# CLAUDE.md — traderbro-docs

This file provides guidance to AI assistants (Claude, Roo Code) when working with the TraderBro documentation site.

## Environment & Setup

- **Node Version**: `v22.22.2` (located at `/opt/homebrew/opt/node@22/bin/node`)
- **Required Path**: Always prefix commands with `PATH="/opt/homebrew/opt/node@22/bin:$PATH"`
- **Docusaurus Version**: `3.10.0`

## Core Commands

```bash
# Build the site
PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run build

# Start local dev server (port 3000)
PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm start

# Serve local build
PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run serve

# Clean Docusaurus cache/build
PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run clear
```

## Known Issues & Critical Fixes

### Webpack ProgressPlugin Schema Validation Error
**Symptoms**: `npm run build` fails with `ValidationError: Invalid options object. Progress Plugin has been initialized using an options object that does not match the API schema`. It will complain about `must NOT have additional properties` like `reporters`, `reporter`, `name`, or `color`.

**Root Cause**: Webpack 5.106+ introduced stricter validation for `ProgressPlugin`. `webpackbar` versions (including 5.x and 6.x) pass deprecated/unknown properties that trigger this error in Docusaurus 3.x builds.

**Fix**: Ensure `package.json` has an `overrides` section that pins `webpack` to a version before the strict validation was enforced and pins `webpackbar` to a compatible version.
```json
  "overrides": {
    "webpackbar": "^5.0.2",
    "webpack": "5.105.0"
  }
```

## Build Artifacts

- **Output Directory**: `build/`
- **LLM Context File**: The `postbuild` script generates `build/llms-full.txt` which contains the concatenated content of all markdown files. This is useful for AI agents to ingest the entire documentation at once.

## Deployment

- Hosted on: GitHub Pages (`docs.traderbro.ai`)
- Trigger: Automatic via GitHub Actions on push to `main` branch.
