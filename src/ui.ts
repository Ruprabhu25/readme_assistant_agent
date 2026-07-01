import { createInterface } from "node:readline/promises";

const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

export function printAssistantPrefix(): void {
  process.stdout.write(`${GREEN}assistant>${RESET} `);
}

export function printTextDelta(delta: string): void {
  process.stdout.write(delta);
}

export function printToolCall(toolName: string, input: unknown): void {
  process.stdout.write(`\n${CYAN}[tool call]${RESET} ${toolName} ${DIM}${summarize(input)}${RESET}\n`);
}

export function printToolResult(toolName: string, output: unknown): void {
  process.stdout.write(`${CYAN}[tool result]${RESET} ${toolName} -> ${DIM}${summarize(output)}${RESET}\n`);
}

export function printNewline(): void {
  process.stdout.write("\n");
}

export function printError(message: string): void {
  process.stderr.write(`${YELLOW}error:${RESET} ${message}\n`);
}

export function printSystem(message: string): void {
  process.stdout.write(`${DIM}${message}${RESET}\n`);
}

function summarize(value: unknown, maxLen = 160): string {
  let text: string;
  try {
    text = JSON.stringify(value);
  } catch {
    text = String(value);
  }
  if (text.length > maxLen) {
    return `${text.slice(0, maxLen)}…`;
  }
  return text;
}

/** Prompts until the user gives an explicit yes/no answer, reprompting on anything else. */
export async function askYesNo(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    while (true) {
      const answer = (await rl.question(`${YELLOW}${question} (y/n)${RESET} `)).trim();
      if (/^y(es)?$/i.test(answer)) return true;
      if (/^n(o)?$/i.test(answer)) return false;
      process.stdout.write(`${DIM}Please answer "y" or "n".${RESET}\n`);
    }
  } finally {
    rl.close();
  }
}

export function createPromptInterface() {
  return createInterface({ input: process.stdin, output: process.stdout });
}
