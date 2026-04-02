# VULK MCP Server

Build full-stack web applications from any AI coding tool using [VULK](https://vulk.dev).

This MCP server lets AI assistants (Claude, Cursor, Windsurf, VS Code Copilot) create, edit, deploy, and manage VULK projects programmatically.

## Quick Start

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "vulk": {
      "command": "npx",
      "args": ["-y", "@vulk/mcp-server"],
      "env": {
        "VULK_API_KEY": "vk_sk_your_api_key_here"
      }
    }
  }
}
```

### Cursor

Add to Cursor settings (Settings > MCP Servers):

```json
{
  "vulk": {
    "command": "npx",
    "args": ["-y", "@vulk/mcp-server"],
    "env": {
      "VULK_API_KEY": "vk_sk_your_api_key_here"
    }
  }
}
```

### VS Code (GitHub Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "vulk": {
      "command": "npx",
      "args": ["-y", "@vulk/mcp-server"],
      "env": {
        "VULK_API_KEY": "vk_sk_your_api_key_here"
      }
    }
  }
}
```

### Windsurf

Add to Windsurf MCP settings:

```json
{
  "vulk": {
    "command": "npx",
    "args": ["-y", "@vulk/mcp-server"],
    "env": {
      "VULK_API_KEY": "vk_sk_your_api_key_here"
    }
  }
}
```

## Get Your API Key

1. Go to [vulk.dev/settings/api-keys](https://vulk.dev/settings/api-keys)
2. Click "Create API Key"
3. Copy the key (starts with `vk_sk_`)

## Tools

| Tool | Description |
|------|-------------|
| `generate` | Create a new web app from a text prompt |
| `edit` | Modify an existing project with instructions |
| `list` | List your projects with pagination |
| `get` | Get project details, status, and URLs |
| `files` | Download project source files |
| `deploy` | Deploy a project to production |
| `models` | List available AI models |
| `usage` | Check your API usage stats |

### Example: Generate an app

> "Use VULK to build a modern task management app with drag-and-drop, dark mode, and team collaboration"

### Example: List projects

> "Show me my VULK projects"

### Example: Get project files

> "Get the source code of my VULK project abc123"

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VULK_API_KEY` | Yes | Your VULK API key (`vk_sk_...`) |
| `VULK_API_BASE` | No | API base URL (default: `https://vulk.dev`) |

## What is VULK?

[VULK](https://vulk.dev) is an AI-powered application builder that generates production-ready web applications from text descriptions. It supports:

- **16+ AI models** (Claude, GPT-4o, Gemini, DeepSeek, and more)
- **Full-stack generation** (React frontend + API backend + database)
- **One-click deployment** to Cloudflare Pages
- **Real-time preview** with hot reload
- **8 languages** (EN, PT, FR, DE, ES, IT, JA, HI)

### Pricing

| Plan | Price | Credits/month |
|------|-------|---------------|
| Free | $0 | 3 generations |
| Builder | $19/mo | 100 generations |
| Pro | $49/mo | 300 generations |
| Team | $99/mo | 1000 generations |
| Business | $249/mo | Unlimited |

## Development

```bash
# Clone
git clone https://github.com/devjoaocastro/vulk-mcp-server.git
cd vulk-mcp-server

# Install
npm install

# Build
npm run build

# Run locally
VULK_API_KEY=vk_sk_... node dist/index.js
```

## License

MIT
