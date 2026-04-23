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

## Direct download

Pre-built binaries for all platforms are available on the [GitHub releases page](https://github.com/TraderBro/traderbro-cli-binary/releases).

```bash
# macOS — Apple Silicon (arm64)
curl -fsSL https://github.com/TraderBro/traderbro-cli-binary/releases/download/latest/traderbro_darwin_arm64.tar.gz | tar -xz && sudo mv traderbro /usr/local/bin/

# macOS — Intel (amd64)
curl -fsSL https://github.com/TraderBro/traderbro-cli-binary/releases/download/latest/traderbro_darwin_amd64.tar.gz | tar -xz && sudo mv traderbro /usr/local/bin/

# Linux — x86_64 (amd64)
curl -fsSL https://github.com/TraderBro/traderbro-cli-binary/releases/download/latest/traderbro_linux_amd64.tar.gz | tar -xz && sudo mv traderbro /usr/local/bin/

# Linux — ARM64
curl -fsSL https://github.com/TraderBro/traderbro-cli-binary/releases/download/latest/traderbro_linux_arm64.tar.gz | tar -xz && sudo mv traderbro /usr/local/bin/
```

For Windows, download [traderbro_windows_amd64.zip](https://github.com/TraderBro/traderbro-cli-binary/releases/download/latest/traderbro_windows_amd64.zip), extract, and add `traderbro.exe` to your `PATH`.

## Verify installation

```bash
traderbro --version
```

Next: [Authentication](/getting-started/authentication)
