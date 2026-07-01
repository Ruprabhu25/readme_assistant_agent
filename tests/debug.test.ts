import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createDebugLogger,
  parseDebugFlag,
  stripDebugFlag,
} from "../src/debug.js";

describe("parseDebugFlag", () => {
  it("returns the default log path for a bare --debug flag", () => {
    expect(parseDebugFlag(["--debug"])).toBe("debug.log");
  });

  it("returns the given path for --debug=<path>", () => {
    expect(parseDebugFlag(["--debug=custom.log"])).toBe("custom.log");
  });

  it("returns null when no --debug flag is present", () => {
    expect(parseDebugFlag(["some", "other", "args"])).toBeNull();
  });
});

describe("stripDebugFlag", () => {
  it("removes a bare --debug flag", () => {
    expect(stripDebugFlag(["--debug", "positional"])).toEqual(["positional"]);
  });

  it("removes --debug=<path> form", () => {
    expect(stripDebugFlag(["--debug=custom.log", "positional"])).toEqual([
      "positional",
    ]);
  });

  it("leaves argv untouched when no --debug flag is present", () => {
    expect(stripDebugFlag(["positional", "--other"])).toEqual([
      "positional",
      "--other",
    ]);
  });
});

describe("createDebugLogger", () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), "readme-assistant-debug-"));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("returns a no-op logger when filePath is null", () => {
    const logger = createDebugLogger(null);
    expect(() => logger.log("event", { a: 1 })).not.toThrow();
  });

  it("appends a JSON line with event and data to the given file", async () => {
    const filePath = path.join(root, "debug.log");
    const logger = createDebugLogger(filePath);

    logger.log("user-input", "hello");
    logger.log("tool-call", { toolName: "readFile" });

    const contents = await readFile(filePath, "utf8");
    const lines = contents.trim().split("\n");
    expect(lines).toHaveLength(2);

    const first = JSON.parse(lines[0]);
    expect(first.event).toBe("user-input");
    expect(first.data).toBe("hello");
    expect(typeof first.time).toBe("string");

    const second = JSON.parse(lines[1]);
    expect(second.event).toBe("tool-call");
    expect(second.data).toEqual({ toolName: "readFile" });
  });

  it("logs an entry with no data", async () => {
    const filePath = path.join(root, "debug.log");
    const logger = createDebugLogger(filePath);

    logger.log("chat-start");

    const contents = await readFile(filePath, "utf8");
    const entry = JSON.parse(contents.trim());
    expect(entry.event).toBe("chat-start");
    expect(entry.data).toBeUndefined();
  });
});
