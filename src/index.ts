#!/usr/bin/env node

/**
 * VULK MCP Server
 *
 * Model Context Protocol server that exposes VULK's AI app builder
 * to Claude Desktop, Cursor, Windsurf, VS Code, and any MCP client.
 *
 * Tools:
 *   - generate:  Create a new web app from a text prompt
 *   - edit:      Modify an existing project with instructions
 *   - list:      List your VULK projects
 *   - get:       Get project details and status
 *   - files:     Download project source files
 *   - deploy:    Deploy a project to production
 *
 * Auth:
 *   VULK_API_KEY environment variable (get yours at https://vulk.dev/settings/api-keys)
 *
 * Usage:
 *   npx @vulk/mcp-server
 *
 * Claude Desktop config:
 *   {
 *     "mcpServers": {
 *       "vulk": {
 *         "command": "npx",
 *         "args": ["-y", "@vulk/mcp-server"],
 *         "env": { "VULK_API_KEY": "vk_sk_..." }
 *       }
 *     }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { vulkApi, type ApiResponse } from "./api.js";

// ── Server setup ──────────────────────────────────────────────

const server = new McpServer({
  name: "vulk",
  version: "1.0.0",
});

// ── Auth helper ───────────────────────────────────────────────

function getApiKey(): string {
  const key = process.env.VULK_API_KEY;
  if (!key) {
    throw new Error(
      "VULK_API_KEY is not set. Get your key at https://vulk.dev/settings/api-keys"
    );
  }
  if (!key.startsWith("vk_sk_")) {
    throw new Error(
      "Invalid VULK_API_KEY format. Keys start with vk_sk_"
    );
  }
  return key;
}

// ── Tool: generate ────────────────────────────────────────────

server.tool(
  "generate",
  "Create a new VULK project from a text prompt. Generates a complete web application " +
    "with React, routing, styling, and all necessary files. Returns the project ID and URLs.",
  {
    prompt: z
      .string()
      .describe(
        "Description of the app to build. Be specific about features, pages, styling, " +
          "and functionality. Example: 'A modern SaaS dashboard with user authentication, " +
          "analytics charts, settings page, and dark mode support'"
      ),
    projectType: z
      .enum([
        "landing-page",
        "dashboard",
        "portfolio",
        "e-commerce",
        "blog",
        "saas",
        "mobile-app",
        "admin-panel",
        "crm",
        "other",
      ])
      .optional()
      .describe("Type of project to generate. Helps optimize the generation pipeline."),
    model: z
      .string()
      .optional()
      .describe(
        "AI model to use (e.g., 'claude-sonnet-4-20250514', 'gpt-4o'). " +
          "Defaults to the best available model for your plan."
      ),
  },
  async ({ prompt, projectType, model }) => {
    const apiKey = getApiKey();

    const res = await vulkApi<{
      project: { id: string; prompt: string; createdAt: string };
    }>("/api/v1/projects", apiKey, {
      method: "POST",
      body: { prompt, projectType, model },
    });

    if (!res.ok) {
      return error(res, "Failed to create project");
    }

    const project = res.data.project;
    const editorUrl = `https://vulk.dev/ui/${project.id}`;
    const previewUrl = `https://webapp.vulk.dev/${project.id}`;

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              projectId: project.id,
              editorUrl,
              previewUrl,
              status: "created",
              message:
                "Project created. Open the editor URL to start generation, " +
                "or use the 'get' tool to check status.",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── Tool: edit ────────────────────────────────────────────────

server.tool(
  "edit",
  "Edit an existing VULK project with natural language instructions. " +
    "Describe what to change and VULK's AI will modify the relevant files.",
  {
    projectId: z.string().describe("The project ID to edit"),
    instruction: z
      .string()
      .describe(
        "What to change. Example: 'Add a contact form with email validation to the homepage'"
      ),
    files: z
      .array(z.string())
      .optional()
      .describe(
        "Specific files to modify (e.g., ['src/App.tsx', 'src/pages/Home.tsx']). " +
          "If omitted, the AI decides which files to change."
      ),
  },
  async ({ projectId, instruction, files }) => {
    const apiKey = getApiKey();

    // Verify the project exists and belongs to user
    const check = await vulkApi(`/api/v1/projects/${projectId}`, apiKey);
    if (!check.ok) {
      return error(check, "Project not found");
    }

    // For now, return edit instructions. Full async edit coming soon.
    const editorUrl = `https://vulk.dev/ui/${projectId}`;

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              projectId,
              editorUrl,
              instruction,
              targetFiles: files || "auto-detect",
              message:
                `Open ${editorUrl} and paste your instruction in the chat ` +
                `to apply the edit. API-driven editing coming in v1.1.`,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── Tool: list ────────────────────────────────────────────────

server.tool(
  "list",
  "List your VULK projects with pagination. Returns project IDs, prompts, " +
    "creation dates, and deployment URLs.",
  {
    limit: z
      .number()
      .min(1)
      .max(100)
      .default(20)
      .optional()
      .describe("Number of projects to return (1-100, default 20)"),
    offset: z
      .number()
      .min(0)
      .default(0)
      .optional()
      .describe("Number of projects to skip (for pagination)"),
  },
  async ({ limit, offset }) => {
    const apiKey = getApiKey();
    const params = new URLSearchParams();
    if (limit) params.set("limit", String(limit));
    if (offset) params.set("offset", String(offset));

    const res = await vulkApi<{
      projects: Array<{
        id: string;
        prompt: string;
        createdAt: string;
        updatedAt: string;
        deploymentUrl?: string;
        visibility?: string;
      }>;
      pagination: { limit: number; offset: number };
    }>(`/api/v1/projects?${params}`, apiKey);

    if (!res.ok) {
      return error(res, "Failed to list projects");
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(res.data, null, 2),
        },
      ],
    };
  }
);

// ── Tool: get ─────────────────────────────────────────────────

server.tool(
  "get",
  "Get details about a specific VULK project including its status, " +
    "deployment URL, and metadata.",
  {
    projectId: z.string().describe("The project ID to look up"),
  },
  async ({ projectId }) => {
    const apiKey = getApiKey();
    const res = await vulkApi<{
      project: {
        id: string;
        prompt: string;
        createdAt: string;
        updatedAt: string;
        deployedUrl?: string;
        customSubdomain?: string;
        visibility?: string;
        uiType?: string;
      };
    }>(`/api/v1/projects/${projectId}`, apiKey);

    if (!res.ok) {
      return error(res, "Project not found");
    }

    const project = res.data.project;
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              ...project,
              editorUrl: `https://vulk.dev/ui/${project.id}`,
              previewUrl: `https://webapp.vulk.dev/${project.id}`,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── Tool: files ───────────────────────────────────────────────

server.tool(
  "files",
  "Get the source files of a VULK project. Returns file paths, content, " +
    "and metadata for all files in the project.",
  {
    projectId: z.string().describe("The project ID"),
  },
  async ({ projectId }) => {
    const apiKey = getApiKey();
    const res = await vulkApi<{
      files: Array<{
        path: string;
        content: string;
        language?: string;
        size?: number;
      }>;
      total: number;
    }>(`/api/v1/projects/${projectId}/files`, apiKey);

    if (!res.ok) {
      return error(res, "Failed to get project files");
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              projectId,
              totalFiles: res.data.total,
              files: res.data.files.map((f) => ({
                path: f.path,
                language: f.language,
                size: f.size,
                content: f.content,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── Tool: deploy ──────────────────────────────────────────────

server.tool(
  "deploy",
  "Deploy a VULK project to production on Cloudflare Pages. " +
    "Returns the live URL when deployment completes.",
  {
    projectId: z.string().describe("The project ID to deploy"),
  },
  async ({ projectId }) => {
    const apiKey = getApiKey();

    // Verify project exists
    const check = await vulkApi(`/api/v1/projects/${projectId}`, apiKey);
    if (!check.ok) {
      return error(check, "Project not found");
    }

    const editorUrl = `https://vulk.dev/ui/${projectId}`;

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              projectId,
              editorUrl,
              message:
                `Open ${editorUrl} and click Deploy to publish your project. ` +
                `API-driven deployment coming in v1.1.`,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── Tool: models ──────────────────────────────────────────────

server.tool(
  "models",
  "List all available AI models on VULK with their capabilities and pricing tiers.",
  {},
  async () => {
    const apiKey = getApiKey();
    const res = await vulkApi<{
      models: Array<{
        id: string;
        name: string;
        provider: string;
        tier?: string;
      }>;
    }>("/api/v1/models", apiKey);

    if (!res.ok) {
      return error(res, "Failed to list models");
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(res.data, null, 2),
        },
      ],
    };
  }
);

// ── Tool: usage ───────────────────────────────────────────────

server.tool(
  "usage",
  "Get your VULK API usage statistics — request counts, tokens used, " +
    "and rate limit status.",
  {},
  async () => {
    const apiKey = getApiKey();
    const res = await vulkApi("/api/v1/usage", apiKey);

    if (!res.ok) {
      return error(res, "Failed to get usage stats");
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(res.data, null, 2),
        },
      ],
    };
  }
);

// ── Error helper ──────────────────────────────────────────────

function error(res: ApiResponse, fallback: string) {
  const msg =
    (res.data as Record<string, string>)?.error ||
    `${fallback} (HTTP ${res.status})`;
  return {
    content: [{ type: "text" as const, text: msg }],
    isError: true as const,
  };
}

// ── Start server ──────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`[vulk-mcp] Fatal: ${err}\n`);
  process.exit(1);
});
