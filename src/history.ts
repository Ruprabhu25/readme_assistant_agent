import { promises as fs } from "node:fs";
import type { ModelMessage } from "ai";

/** Looks for --history or --history=<path> in argv, returning the history file path (default "history.json") or null. */
export function parseHistoryFlag(argv: string[]): string | null {
  const arg = argv.find((a) => a === "--history" || a.startsWith("--history="));
  if (!arg) return null;
  const eq = arg.indexOf("=");
  return eq === -1 ? "history.json" : arg.slice(eq + 1);
}

/** Strips --history/--history=<path> flags out of argv, leaving positional args. */
export function stripHistoryFlag(argv: string[]): string[] {
  return argv.filter((a) => a !== "--history" && !a.startsWith("--history="));
}

export async function loadHistory(filePath: string): Promise<ModelMessage[]> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as ModelMessage[];
  } catch {
    return [];
  }
}

export async function saveHistory(filePath: string, history: ModelMessage[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(history, null, 2), "utf8");
}
