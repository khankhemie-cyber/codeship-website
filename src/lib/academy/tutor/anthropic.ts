import { callAnthropicTool, type AnthropicTool } from "../aiClient";

export interface TutorResult {
  hintText: string;
  diagnosedMisconceptionId: string;
  escalationLevel: number;
}

const PROVIDE_HINT_TOOL: AnthropicTool = {
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
 * Throws on any failure; the route's caller falls back to a canned hint
 * (see cannedHints.ts) rather than surfacing the error to the student.
 */
export async function callTutorModel(params: {
  apiKey: string;
  model: string | undefined;
  systemPrompt: string;
  userContent: string;
}): Promise<TutorResult> {
  const input = await callAnthropicTool({ ...params, tool: PROVIDE_HINT_TOOL });
  if (!input.hintText || !input.diagnosedMisconceptionId || !input.escalationLevel) {
    throw new Error("Malformed tutor tool response");
  }
  return {
    hintText: input.hintText as string,
    diagnosedMisconceptionId: input.diagnosedMisconceptionId as string,
    escalationLevel: input.escalationLevel as number,
  };
}
