import { appendFileSync } from "node:fs";

export interface DebugLogger {
  log(event: string, data?: unknown): void;
}

const noopLogger: DebugLogger = { log() {} };

/** Looks for --debug or --debug=<path> in argv, returning the log file path (default "debug.log") or null. */
export function parseDebugFlag(argv: string[]): string | null {
  const arg = argv.find((a) => a === "--debug" || a.startsWith("--debug="));
  if (!arg) return null;
  const eq = arg.indexOf("=");
  return eq === -1 ? "debug.log" : arg.slice(eq + 1);
}

/** Strips --debug/--debug=<path> flags out of argv, leaving positional args. */
export function stripDebugFlag(argv: string[]): string[] {
  return argv.filter((a) => a !== "--debug" && !a.startsWith("--debug="));
}

export function createDebugLogger(filePath: string | null): DebugLogger {
  if (!filePath) return noopLogger;
  return {
    log(event, data) {
      const entry = { time: new Date().toISOString(), event, data };
      appendFileSync(filePath, `${JSON.stringify(entry)}\n`, "utf8");
    },
  };
}
