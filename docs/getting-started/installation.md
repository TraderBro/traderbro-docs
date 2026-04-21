---
sidebar_position: 1
title: Installation
---

# Installation

## macOS / Linux — Homebrew

```bash
brew install traderbro/tap/traderbro
```

Verify:

```bash
traderbro --version
```

## Linux — Shell script

```bash
curl -fsSL https://install.traderbro.com | sh
```

The script detects your architecture (amd64 / arm64) and installs the correct binary to `/usr/local/bin`.

## Windows — Scoop

```powershell
scoop bucket add traderbro https://github.com/traderbro/scoop-traderbro
scoop install traderbro
```

## Direct download

Pre-built binaries for all platforms are available on the [GitHub releases page](https://github.com/traderbro/traderbro-cli-binary/releases). Download the binary for your OS and architecture, make it executable, and move it to a directory on your `PATH`.

```bash
# Example for Linux amd64
chmod +x traderbro-linux-amd64
mv traderbro-linux-amd64 /usr/local/bin/traderbro
```

## Verify installation

```bash
traderbro --version
```

You should see output like:

```
traderbro version 1.0.0
```

Next: [Authentication](/getting-started/authentication)
