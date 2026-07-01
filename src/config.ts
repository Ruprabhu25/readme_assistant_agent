import { promises as fs } from "node:fs";
import "dotenv/config";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

const DEFAULT_MODEL = "gpt-4o-mini";

/** Looks for --model=<id> in argv, returning the requested model id or null. */
export function parseModelFlag(argv: string[]): string | null {
  const arg = argv.find((a) => a.startsWith("--model="));
  if (!arg) return null;
  return arg.slice("--model=".length);
}

/** Strips --model=<id> flags out of argv, leaving positional args. */
export function stripModelFlag(argv: string[]): string[] {
  return argv.filter((a) => !a.startsWith("--model="));
}

/** Looks for --api-key-file=<path> in argv, returning the path or null. */
export function parseApiKeyFileFlag(argv: string[]): string | null {
  const arg = argv.find((a) => a.startsWith("--api-key-file="));
  if (!arg) return null;
  return arg.slice("--api-key-file=".length);
}

/** Strips --api-key-file=<path> flags out of argv, leaving positional args. */
export function stripApiKeyFileFlag(argv: string[]): string[] {
  return argv.filter((a) => !a.startsWith("--api-key-file="));
}

/** Looks for --api-key-env=<VAR> in argv, returning the env var name or null. */
export function parseApiKeyEnvFlag(argv: string[]): string | null {
  const arg = argv.find((a) => a.startsWith("--api-key-env="));
  if (!arg) return null;
  return arg.slice("--api-key-env=".length);
}

/** Strips --api-key-env=<VAR> flags out of argv, leaving positional args. */
export function stripApiKeyEnvFlag(argv: string[]): string[] {
  return argv.filter((a) => !a.startsWith("--api-key-env="));
}

export interface LoadModelOptions {
  modelId?: string | null;
  /** Path to a file whose (trimmed) contents are the API key. Takes precedence over apiKeyEnv. */
  apiKeyFile?: string | null;
  /** Name of an env var to read the API key from, instead of OPENAI_API_KEY. */
  apiKeyEnv?: string | null;
}

async function resolveApiKey(options: LoadModelOptions): Promise<string> {
  if (options.apiKeyFile) {
    const raw = await fs.readFile(options.apiKeyFile, "utf8");
    const trimmed = raw.trim();
    if (!trimmed) {
      throw new Error(`API key file "${options.apiKeyFile}" is empty.`);
    }
    return trimmed;
  }

  const envVar = options.apiKeyEnv ?? "OPENAI_API_KEY";
  const value = process.env[envVar];
  if (!value) {
    throw new Error(
      `${envVar} is not set. Copy .env.example to .env and add your OpenAI API key, ` +
        "or pass --api-key-file=<path> / --api-key-env=<VAR>.",
    );
  }
  return value;
}

export async function loadModel(
  options: LoadModelOptions = {},
): Promise<LanguageModel> {
  const apiKey = await resolveApiKey(options);
  const modelId = options.modelId ?? process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
  const provider = createOpenAI({ apiKey });
  // Use the Chat Completions API (not Responses): Responses relies on OpenAI
  // persisting message items server-side, which fails with a 404 on
  // Zero Data Retention orgs when a later turn references an earlier item.
  return provider.chat(modelId);
}
