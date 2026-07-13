export interface TutorResult {
  hintText: string;
  diagnosedMisconceptionId: string;
  escalationLevel: number;
}

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001"; // fast/cheap — right fit for a real-time hint
const TIMEOUT_MS = 8000;

const PROVIDE_HINT_TOOL = {
  name: "provide_hint",
  description: "Return the diagnosed misconception and a single Socratic hint.",
  input_schema: {
    type: "object",
    properties: {
      diagnosedMisconceptionId: { type: "string", description: "One of the listed misconception ids, or \"none\"." },
      hintText: { type: "string", description: "1-3 short sentences. Never the literal answer." },
      escalationLevel: { type: "integer", description: "1, 2, or 3 — how direct the hint is." },
    },
    required: ["diagnosedMisconceptionId", "hintText", "escalationLevel"],
  },
};

/**
 * Calls the Anthropic Messages API directly via fetch (edge-runtime-safe, no SDK
 * dependency) with tool-use forced so the response is always structured — no
 * fragile prompt-based JSON parsing. Throws on any failure; the route's caller
 * is responsible for falling back to a canned hint (see cannedHints.ts).
 */
export async function callTutorModel(params: {
  apiKey: string;
  model: string | undefined;
  systemPrompt: string;
  userContent: string;
}): Promise<TutorResult> {
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
        tools: [PROVIDE_HINT_TOOL],
        tool_choice: { type: "tool", name: "provide_hint" },
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

    const input = toolUse.input as Partial<TutorResult>;
    if (!input.hintText || !input.diagnosedMisconceptionId || !input.escalationLevel) {
      throw new Error("Malformed tutor tool response");
    }
    return {
      hintText: input.hintText,
      diagnosedMisconceptionId: input.diagnosedMisconceptionId,
      escalationLevel: input.escalationLevel,
    };
  } finally {
    clearTimeout(timeout);
  }
}
