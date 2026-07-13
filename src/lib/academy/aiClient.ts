/**
 * Shared low-level client for calling the Anthropic Messages API directly via
 * fetch (edge-runtime-safe, no SDK dependency) with tool-use forced so every
 * caller gets structured output instead of parsing free-text JSON. Used by
 * both the student-facing tutor (src/lib/academy/tutor/) and the
 * teacher-facing coach (src/lib/academy/coach/) — same transport, different
 * tool schemas and system prompts per caller.
 */
export const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
export const DEFAULT_MODEL = "claude-haiku-4-5-20251001"; // fast/cheap — right fit for real-time use
const TIMEOUT_MS = 8000;

export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

/**
 * Sends a single-turn message with a tool forced via tool_choice, and returns
 * that tool's raw `input` object. Throws on any HTTP failure, timeout, or
 * missing tool_use block — callers are responsible for a non-AI fallback.
 */
export async function callAnthropicTool(params: {
  apiKey: string;
  model: string | undefined;
  systemPrompt: string;
  userContent: string;
  tool: AnthropicTool;
}): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": params.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: params.model || DEFAULT_MODEL,
        max_tokens: 500,
        system: params.systemPrompt,
        messages: [{ role: "user", content: params.userContent }],
        tools: [params.tool],
        tool_choice: { type: "tool", name: params.tool.name },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Anthropic API returned ${response.status}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; input?: unknown }>;
    };
    const toolUse = data.content.find((block) => block.type === "tool_use");
    if (!toolUse?.input) {
      throw new Error("No tool_use block in Anthropic response");
    }
    return toolUse.input as Record<string, unknown>;
  } finally {
    clearTimeout(timeout);
  }
}
