import { createInterface } from "node:readline/promises";
import { Readable, Writable } from "node:stream";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  askYesNo,
  printAssistantPrefix,
  printError,
  printNewline,
  printSystem,
  printTextDelta,
  printToolCall,
  printToolResult,
  startThinkingIndicator,
} from "../src/ui.js";

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9]+m|\x1b\[K/g, "");
}

function fakeTerminal() {
  const input = new Readable({ read() {} });
  const output = new Writable({
    write(_chunk, _enc, cb) {
      cb();
    },
  });
  const rl = createInterface({ input, output });
  return { input, rl };
}

describe("askYesNo", () => {
  it("reuses the given readline interface instead of closing it", async () => {
    const { input, rl } = fakeTerminal();

    const firstAnswer = askYesNo(rl, "Accept?");
    input.push("y\n");
    expect(await firstAnswer).toBe(true);

    // A closed readline interface throws/hangs on further use; this proves
    // askYesNo did not close the shared interface out from under the caller.
    const secondAnswer = askYesNo(rl, "Accept again?");
    input.push("n\n");
    expect(await secondAnswer).toBe(false);

    rl.close();
  });

  it("reprompts until it receives an explicit y/n answer", async () => {
    const { input, rl } = fakeTerminal();

    const answer = askYesNo(rl, "Accept?");
    input.push("maybe\n");
    await new Promise((resolve) => setImmediate(resolve));
    input.push("n\n");
    expect(await answer).toBe(false);

    rl.close();
  });
});

describe("stdout/stderr printers", () => {
  // biome-ignore lint/suspicious/noExplicitAny: spy type varies by which stream method is mocked
  let stdoutSpy: any;
  // biome-ignore lint/suspicious/noExplicitAny: spy type varies by which stream method is mocked
  let stderrSpy: any;

  afterEach(() => {
    stdoutSpy?.mockRestore();
    stderrSpy?.mockRestore();
  });

  function captureStdout() {
    const chunks: string[] = [];
    stdoutSpy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation((chunk: unknown) => {
        chunks.push(String(chunk));
        return true;
      });
    return chunks;
  }

  function captureStderr() {
    const chunks: string[] = [];
    stderrSpy = vi
      .spyOn(process.stderr, "write")
      .mockImplementation((chunk: unknown) => {
        chunks.push(String(chunk));
        return true;
      });
    return chunks;
  }

  it("printAssistantPrefix writes an assistant label", () => {
    const chunks = captureStdout();
    printAssistantPrefix();
    expect(stripAnsi(chunks.join(""))).toBe("assistant> ");
  });

  it("printTextDelta writes the delta verbatim", () => {
    const chunks = captureStdout();
    printTextDelta("hello");
    expect(chunks.join("")).toBe("hello");
  });

  it("printNewline writes a single newline", () => {
    const chunks = captureStdout();
    printNewline();
    expect(chunks.join("")).toBe("\n");
  });

  it("printError writes to stderr with an error prefix", () => {
    const chunks = captureStderr();
    printError("boom");
    expect(stripAnsi(chunks.join(""))).toBe("error: boom\n");
  });

  it("printSystem writes to stdout", () => {
    const chunks = captureStdout();
    printSystem("hello system");
    expect(stripAnsi(chunks.join(""))).toBe("hello system\n");
  });

  it("startThinkingIndicator renders a spinner frame immediately and stops cleanly", () => {
    const chunks = captureStdout();
    const stop = startThinkingIndicator();
    expect(chunks.join("")).toContain("thinking...");
    stop();
    // Calling stop a second time must not throw or write again.
    const lengthAfterFirstStop = chunks.length;
    expect(() => stop()).not.toThrow();
    expect(chunks.length).toBe(lengthAfterFirstStop);
  });

  describe("printToolCall", () => {
    it.each([
      ["listFiles", { dir: "." }, "Checking directory structure..."],
      ["listFiles", { dir: "src" }, 'Checking directory structure of "src"...'],
      ["readFile", { path: "a.ts" }, 'Reading "a.ts"...'],
      ["searchFiles", { query: "foo", dir: "." }, 'Searching for "foo"...'],
      [
        "searchFiles",
        { query: "foo", dir: "src" },
        'Searching for "foo" in "src"...',
      ],
      ["inspectPackageJson", {}, "Inspecting package.json..."],
      ["findExistingReadme", {}, "Checking for an existing README..."],
      ["summarizeFile", { path: "a.ts" }, 'Summarizing "a.ts"...'],
      [
        "saveReadme",
        { path: "README.md" },
        'Drafting a documentation proposal for "README.md"...',
      ],
      ["someUnknownTool", {}, "Running someUnknownTool..."],
    ])("describes a %s call as %j -> %s", (toolName, input, expected) => {
      const chunks = captureStdout();
      printToolCall(toolName, input);
      expect(stripAnsi(chunks.join(""))).toContain(expected);
    });

    it("includes the raw input for most tools", () => {
      const chunks = captureStdout();
      printToolCall("readFile", { path: "a.ts" });
      expect(stripAnsi(chunks.join(""))).toContain('{"path":"a.ts"}');
    });

    it("omits raw input detail for saveReadme", () => {
      const chunks = captureStdout();
      printToolCall("saveReadme", { path: "README.md", content: "secret" });
      expect(stripAnsi(chunks.join(""))).not.toContain("secret");
    });
  });

  describe("printToolResult", () => {
    it.each([
      ["listFiles", { count: 3 }, "Found 3 file(s)."],
      ["readFile", { totalChars: 10, truncated: false }, "Read 10 character(s)."],
      [
        "readFile",
        { totalChars: 10, truncated: true },
        "Read 10 character(s) (truncated).",
      ],
      ["readFile", { error: "File not found" }, "File not found"],
      ["searchFiles", { matchCount: 2 }, "Found 2 match(es)."],
      [
        "inspectPackageJson",
        { found: true, name: "pkg" },
        'Found package.json for "pkg".',
      ],
      ["inspectPackageJson", { found: false }, "No package.json found."],
      [
        "findExistingReadme",
        { found: true, path: "README.md" },
        'Found an existing README at "README.md".',
      ],
      [
        "findExistingReadme",
        { found: false },
        "No existing README found.",
      ],
      [
        "summarizeFile",
        { lineCount: 5, sizeBytes: 100 },
        "5 line(s), 100 byte(s).",
      ],
      ["summarizeFile", { error: "File not found" }, "File not found"],
      ["saveReadme", { chars: 42 }, "Staged a documentation proposal (42 character(s))."],
      ["someUnknownTool", {}, "Done."],
    ])("describes a %s result as %j -> %s", (toolName, output, expected) => {
      const chunks = captureStdout();
      printToolResult(toolName, output);
      expect(stripAnsi(chunks.join(""))).toContain(expected);
    });

    it("omits raw output detail for saveReadme", () => {
      const chunks = captureStdout();
      printToolResult("saveReadme", { chars: 42, content: "secret" });
      expect(stripAnsi(chunks.join(""))).not.toContain("secret");
    });

    it("truncates a long raw detail with an ellipsis", () => {
      const chunks = captureStdout();
      printToolResult("listFiles", {
        count: 1,
        files: Array.from({ length: 100 }, (_, i) => `file-${i}.ts`),
      });
      expect(stripAnsi(chunks.join(""))).toContain("…");
    });
  });
});
