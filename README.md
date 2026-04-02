<p align="center">
  <img src="https://vulk.dev/images/vulk-icon.svg" alt="VULK" width="60" height="60" />
</p>

<h1 align="center">VULK MCP Server</h1>

<p align="center">
  <strong>Build full-stack web applications from any AI assistant.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@vulk/mcp-server"><img src="https://img.shields.io/npm/v/@vulk/mcp-server?color=0D9373" alt="npm" /></a>
  <a href="https://vulk.dev"><img src="https://img.shields.io/badge/vulk.dev-live-0D9373" alt="VULK" /></a>
  <a href="https://github.com/devjoaocastro/vulk-mcp-server/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
</p>

<p align="center">
  Give Claude, Cursor, Windsurf, or VS Code Copilot the ability to generate, edit, and deploy production-ready web applications — powered by <a href="https://vulk.dev">VULK</a>.
</p>

---

## What This Does

[![SafeSkill 97/100](https://img.shields.io/badge/SafeSkill-97%2F100_Verified%20Safe-brightgreen)](https://safeskill.dev/scan/devjoaocastro-vulk-mcp-server)

This MCP server connects AI coding assistants to VULK's app builder. When you say _"build me a project management dashboard"_, it doesn't just return a template — it triggers VULK's full AI generation pipeline:

- **16 AI models** (Claude, GPT-4o, Gemini, DeepSeek, and more)
- **Real-time generation** with file streaming
- **Full-stack output** (React + Tailwind + routing + API + database schemas)
- **Live preview** at `webapp.vulk.dev`
- **One-command deploy** to Cloudflare Pages

## Quick Setup

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "vulk": {
      "command": "npx",
      "args": ["-y", "@vulk/mcp-server"],
      "env": {
        "VULK_API_KEY": "vk_sk_your_key_here"
      }
    }
  }
}
```

### Cursor

Settings → MCP Servers → Add:

```json
{
  "vulk": {
    "command": "npx",
    "args": ["-y", "@vulk/mcp-server"],
    "env": {
      "VULK_API_KEY": "vk_sk_your_key_here"
    }
  }
}
```

### VS Code (GitHub Copilot)

Create `.vscode/mcp.json`:

```json
{
  "servers": {
    "vulk": {
      "command": "npx",
      "args": ["-y", "@vulk/mcp-server"],
      "env": {
        "VULK_API_KEY": "vk_sk_your_key_here"
      }
    }
  }
}
```

### Windsurf

Add to MCP settings:

```json
{
  "vulk": {
    "command": "npx",
    "args": ["-y", "@vulk/mcp-server"],
    "env": {
      "VULK_API_KEY": "vk_sk_your_key_here"
    }
  }
}
```

## Get Your API Key

1. Go to [vulk.dev/settings/api-keys](https://vulk.dev/settings/api-keys)
2. Click **Create API Key**
3. Copy the key (starts with `vk_sk_`)

Free accounts get 3 generations/month. [Upgrade](https://vulk.dev/pricing) for more.

## Tools

### `generate` — Build a new app

> "Build a modern SaaS dashboard with user auth, analytics charts, team management, and dark mode"

Creates a project, triggers AI generation, and returns all generated files with preview URL. Generation runs through VULK's full pipeline — intent analysis, code generation, auto-fixing, and browser verification.

### `edit` — Modify an existing project

> "Add a settings page with tabs for Profile, Billing, and Notifications"

Sends your instruction to VULK's AI with full context of the existing project files. The AI decides which files to create or modify.

### `list` — See your projects

Returns all your VULK projects with IDs, prompts, dates, and deployment URLs.

### `get` — Project details

Get status, metadata, and URLs for a specific project.

### `files` — Read source code

Download every file from a project — paths, content, language detection.

### `deploy` — Ship to production

Deploy to Cloudflare Pages and get a live production URL. Requires an active subscription.

### `models` — Available AI models

See which AI models are available on your plan and their capabilities.

### `usage` — Check your limits

View API request counts, credits remaining, and rate limit status.

### `subscribe` — Upgrade your plan

Get a link to upgrade. Plans from $19/mo (100 generations) to $249/mo (unlimited).

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VULK_API_KEY` | Yes | — | Your VULK API key (`vk_sk_...`) |
| `VULK_API_BASE` | No | `https://vulk.dev` | API base URL |

## How It Works

```
You → "Build me a task manager"
       ↓
MCP Server → POST /api/v1/projects (create record)
       ↓
MCP Server → POST /api/agent/stream (trigger AI generation)
       ↓
VULK Agent → Intent analysis → Code generation → Auto-fix → Verify
       ↓
MCP Server ← SSE stream (file_start, file_delta, file_complete events)
       ↓
You ← { files: [...], previewUrl, editorUrl }
```

The generation pipeline includes:
- **Intent analysis** — understands what kind of app you want
- **ReAct loop** — AI plans and generates files iteratively
- **Auto-fixer** — deterministic fixes for common issues
- **Browser verification** — renders the app and fixes errors
- **Quality scoring** — ensures the output meets standards

## Pricing

| Plan | Price | Credits/month | Models | Best For |
|------|-------|---------------|--------|----------|
| Free | $0 | 3 generations | Basic | Trying it out |
| Builder | $19.99/mo | 1,000 | Basic (Haiku, Flash, Mini) | Getting started |
| Pro | $39.99/mo | 2,500 | All 16+ models | Power users |
| Team | $79.99/mo | 5,000 | All models + collaboration | Small teams |
| Max | $199/mo | 10,000 | All + white-label + BYOM | Agencies |
| Business | $299/mo | 20,000 | Everything + SSO + SLA | Organizations |

Credits are token-based — simple apps use ~100 credits, complex ones ~500+. [Full pricing details](https://vulk.dev/pricing).

## Development

```bash
git clone https://github.com/devjoaocastro/vulk-mcp-server.git
cd vulk-mcp-server
npm install
npm run build
VULK_API_KEY=vk_sk_... node dist/index.js
```

## Links

- [VULK](https://vulk.dev) — AI app builder
- [API Keys](https://vulk.dev/settings/api-keys) — Get your key
- [Pricing](https://vulk.dev/pricing) — Plans and pricing
- [Documentation](https://support.vulk.dev) — Full docs
- [Status](https://vulk.dev/api/health) — API health

## License

MIT
