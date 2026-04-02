/**
 * VULK API client for MCP server.
 * Makes authenticated HTTP requests to the VULK backend.
 */

const VULK_API_BASE = process.env.VULK_API_BASE || "https://vulk.dev";

export interface ApiResponse<T = Record<string, unknown>> {
  ok: boolean;
  status: number;
  data: T;
}

export async function vulkApi<T = Record<string, unknown>>(
  path: string,
  apiKey: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
    timeout?: number;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, timeout = 30_000 } = options;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-MCP-Client": "vulk-mcp/1.0.0",
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${VULK_API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = (await res.json().catch(() => ({}))) as T;
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return {
        ok: false,
        status: 408,
        data: { error: "Request timeout" } as T,
      };
    }
    return {
      ok: false,
      status: 0,
      data: {
        error: `Network error: ${err instanceof Error ? err.message : String(err)}`,
      } as T,
    };
  } finally {
    clearTimeout(timer);
  }
}
