import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { ModelMessage } from "ai";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  loadHistory,
  parseHistoryFlag,
  saveHistory,
  stripHistoryFlag,
} from "../src/history.js";

describe("parseHistoryFlag", () => {
  it("returns the default history path for a bare --history flag", () => {
    expect(parseHistoryFlag(["--history"])).toBe("history.json");
  });

  it("returns the given path for --history=<path>", () => {
    expect(parseHistoryFlag(["--history=chat.json"])).toBe("chat.json");
  });

  it("returns null when no --history flag is present", () => {
    expect(parseHistoryFlag(["some", "other", "args"])).toBeNull();
  });
});

describe("stripHistoryFlag", () => {
  it("removes a bare --history flag", () => {
    expect(stripHistoryFlag(["--history", "positional"])).toEqual([
      "positional",
    ]);
  });

  it("removes --history=<path> form", () => {
    expect(stripHistoryFlag(["--history=chat.json", "positional"])).toEqual([
      "positional",
    ]);
  });

  it("leaves argv untouched when no --history flag is present", () => {
    expect(stripHistoryFlag(["positional", "--other"])).toEqual([
      "positional",
      "--other",
    ]);
  });
});

describe("loadHistory / saveHistory", () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), "readme-assistant-history-"));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("returns an empty array when the history file does not exist", async () => {
    const history = await loadHistory(path.join(root, "missing.json"));
    expect(history).toEqual([]);
  });

  it("returns an empty array when the history file contains invalid JSON", async () => {
    const filePath = path.join(root, "bad.json");
    await writeFile(filePath, "{not valid json", "utf8");
    const history = await loadHistory(filePath);
    expect(history).toEqual([]);
  });

  it("round-trips a history array through saveHistory and loadHistory", async () => {
    const filePath = path.join(root, "history.json");
    const messages: ModelMessage[] = [
      { role: "user", content: "hello" },
      { role: "assistant", content: "hi there" },
    ];

    await saveHistory(filePath, messages);
    const loaded = await loadHistory(filePath);
    expect(loaded).toEqual(messages);
  });

  it("writes pretty-printed JSON to disk", async () => {
    const filePath = path.join(root, "history.json");
    await saveHistory(filePath, [{ role: "user", content: "hello" }]);
    const raw = await readFile(filePath, "utf8");
    expect(raw).toContain("\n");
    expect(raw).toBe(
      JSON.stringify([{ role: "user", content: "hello" }], null, 2),
    );
  });
});
