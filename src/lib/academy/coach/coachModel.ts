import { callAnthropicTool, type AnthropicTool } from "../aiClient";

export interface PlanResult {
  talkingPoints: string[];
  watchFor: string[];
  groupingSuggestion: string;
}

export interface NoteResult {
  polishedNote: string;
}

const PROVIDE_PLAN_TOOL: AnthropicTool = {
  name: "provide_plan",
  description: "Return a short prep briefing for the teacher's next class.",
  input_schema: {
    type: "object",
    properties: {
      talkingPoints: { type: "array", items: { type: "string" }, description: "2-4 short, concrete points." },
      watchFor: { type: "array", items: { type: "string" }, description: "Misconceptions trending in this class." },
      groupingSuggestion: { type: "string", description: "How to split the class by mastery level, no names." },
    },
    required: ["talkingPoints", "watchFor", "groupingSuggestion"],
  },
};

const PROVIDE_NOTE_TOOL: AnthropicTool = {
  name: "provide_note",
  description: "Return a polished version of the teacher's session note.",
  input_schema: {
    type: "object",
    properties: {
      polishedNote: { type: "string", description: "2-4 clear sentences. Only information present in the original note." },
    },
    required: ["polishedNote"],
  },
};

export async function callPlanModel(params: {
  apiKey: string;
  model: string | undefined;
  systemPrompt: string;
  userContent: string;
}): Promise<PlanResult> {
  const input = await callAnthropicTool({ ...params, tool: PROVIDE_PLAN_TOOL });
  if (!Array.isArray(input.talkingPoints) || !Array.isArray(input.watchFor) || !input.groupingSuggestion) {
    throw new Error("Malformed plan tool response");
  }
  return {
    talkingPoints: input.talkingPoints as string[],
    watchFor: input.watchFor as string[],
    groupingSuggestion: input.groupingSuggestion as string,
  };
}

export async function callNoteModel(params: {
  apiKey: string;
  model: string | undefined;
  systemPrompt: string;
  userContent: string;
}): Promise<NoteResult> {
  const input = await callAnthropicTool({ ...params, tool: PROVIDE_NOTE_TOOL });
  if (!input.polishedNote) {
    throw new Error("Malformed note tool response");
  }
  return { polishedNote: input.polishedNote as string };
}
