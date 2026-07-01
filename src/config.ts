import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export function loadModel(): LanguageModel {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set. Copy .env.example to .env and add your OpenAI API key.",
    );
  }
  const modelId = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  // Use the Chat Completions API (not Responses): Responses relies on OpenAI
  // persisting message items server-side, which fails with a 404 on
  // Zero Data Retention orgs when a later turn references an earlier item.
  return openai.chat(modelId);
}
