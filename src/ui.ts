import { createInterface, type Interface } from "node:readline/promises";

const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

export function printAssistantPrefix(): void {
  process.stdout.write(`${GREEN}assistant>${RESET} `);
}

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

/** Shows an animated "thinking..." indicator; call the returned function to stop and clear it. */
export function startThinkingIndicator(): () => void {
  let frame = 0;
  const render = () => {
    process.stdout.write(
      `\r${DIM}${SPINNER_FRAMES[frame]} thinking...${RESET}`,
    );
    frame = (frame + 1) % SPINNER_FRAMES.length;
  };
  render();
  const timer = setInterval(render, 80);
  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    clearInterval(timer);
    process.stdout.write("\r\x1b[K");
  };
}

export function printTextDelta(delta: string): void {
  process.stdout.write(delta);
}

const NO_RAW_DETAIL = new Set(["saveReadme"]);

export function printToolCall(toolName: string, input: unknown): void {
  const detail = NO_RAW_DETAIL.has(toolName)
    ? ""
    : ` ${DIM}(${toolName} ${summarize(input)})${RESET}`;
  process.stdout.write(
    `\n${CYAN}[tool call]${RESET} ${describeToolCall(toolName, input)}${detail}\n`,
  );
}

export function printToolResult(toolName: string, output: unknown): void {
  const detail = NO_RAW_DETAIL.has(toolName)
    ? ""
    : ` ${DIM}(${summarize(output)})${RESET}`;
  process.stdout.write(
    `${CYAN}[tool result]${RESET} ${describeToolResult(toolName, output)}${detail}\n`,
  );
}

/** Renders a plain-language narration of what a tool call is about to do, for verbosity between calls. */
function describeToolCall(toolName: string, input: unknown): string {
  const i = (input ?? {}) as Record<string, unknown>;
  switch (toolName) {
    case "listFiles": {
      const dir = typeof i.dir === "string" && i.dir !== "." ? i.dir : null;
      return dir
        ? `Checking directory structure of "${dir}"...`
        : "Checking directory structure...";
    }
    case "readFile":
      return `Reading "${i.path ?? "unknown file"}"...`;
    case "searchFiles": {
      const dir =
        typeof i.dir === "string" && i.dir !== "." ? ` in "${i.dir}"` : "";
      return `Searching for "${i.query ?? ""}"${dir}...`;
    }
    case "inspectPackageJson":
      return "Inspecting package.json...";
    case "findExistingReadme":
      return "Checking for an existing README...";
    case "summarizeFile":
      return `Summarizing "${i.path ?? "unknown file"}"...`;
    case "saveReadme":
      return `Drafting a README proposal for "${i.path ?? "README.md"}"...`;
    default:
      return `Running ${toolName}...`;
  }
}

/** Renders a plain-language narration of what a tool call returned, for verbosity between calls. */
function describeToolResult(toolName: string, output: unknown): string {
  const o = (output ?? {}) as Record<string, unknown>;
  switch (toolName) {
    case "listFiles":
      return `Found ${o.count ?? "?"} file(s).`;
    case "readFile":
      return o.error
        ? String(o.error)
        : `Read ${o.totalChars ?? "?"} character(s)${o.truncated ? " (truncated)" : ""}.`;
    case "searchFiles":
      return `Found ${o.matchCount ?? 0} match(es).`;
    case "inspectPackageJson":
      return o.found
        ? `Found package.json${o.name ? ` for "${o.name}"` : ""}.`
        : "No package.json found.";
    case "findExistingReadme":
      return o.found
        ? `Found an existing README at "${o.path}".`
        : "No existing README found.";
    case "summarizeFile":
      return o.error
        ? String(o.error)
        : `${o.lineCount ?? "?"} line(s), ${o.sizeBytes ?? "?"} byte(s).`;
    case "saveReadme":
      return `Staged a README proposal (${o.chars ?? "?"} character(s)).`;
    default:
      return "Done.";
  }
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
export async function askYesNo(
  rl: Interface,
  question: string,
): Promise<boolean> {
  while (true) {
    const answer = (
      await rl.question(`${YELLOW}${question} (y/n)${RESET} `)
    ).trim();
    if (/^y(es)?$/i.test(answer)) return true;
    if (/^n(o)?$/i.test(answer)) return false;
    process.stdout.write(`${DIM}Please answer "y" or "n".${RESET}\n`);
  }
}

export function createPromptInterface() {
  return createInterface({ input: process.stdin, output: process.stdout });
}
