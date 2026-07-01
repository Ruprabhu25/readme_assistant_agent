import { describe, expect, it } from "vitest";
import {
  DEFAULT_DOC_MODE,
  DOC_MODES,
  describeModes,
  isDocModeId,
  parseModeFlag,
  stripModeFlag,
} from "../src/docModes.js";

describe("isDocModeId", () => {
  it("accepts every key of DOC_MODES", () => {
    for (const id of Object.keys(DOC_MODES)) {
      expect(isDocModeId(id)).toBe(true);
    }
  });

  it("rejects unknown strings", () => {
    expect(isDocModeId("not-a-mode")).toBe(false);
  });
});

describe("parseModeFlag", () => {
  it("parses --mode=<id> form", () => {
    expect(parseModeFlag(["--mode=api-docs"])).toBe("api-docs");
  });

  it("parses --mode <id> form", () => {
    expect(parseModeFlag(["--mode", "quickstart"])).toBe("quickstart");
  });

  it("returns null when no --mode flag is present", () => {
    expect(parseModeFlag(["some", "other", "args"])).toBeNull();
  });

  it("returns null for an unrecognized mode id", () => {
    expect(parseModeFlag(["--mode=bogus"])).toBeNull();
  });

  it("returns null when --mode is passed with no value", () => {
    expect(parseModeFlag(["--mode"])).toBeNull();
  });
});

describe("stripModeFlag", () => {
  it("removes --mode and its value", () => {
    expect(stripModeFlag(["--mode", "api-docs", "positional"])).toEqual([
      "api-docs",
      "positional",
    ]);
  });

  it("removes --mode=<id> form", () => {
    expect(stripModeFlag(["--mode=api-docs", "positional"])).toEqual([
      "positional",
    ]);
  });

  it("leaves argv untouched when no --mode flag is present", () => {
    expect(stripModeFlag(["positional", "--other"])).toEqual([
      "positional",
      "--other",
    ]);
  });
});

describe("describeModes", () => {
  it("marks the current mode with a leading asterisk", () => {
    const described = describeModes("quickstart");
    const lines = described.split("\n");
    const currentLine = lines.find((line) => line.includes("quickstart"));
    expect(currentLine).toMatch(/^\s*\*/);
  });

  it("lists every mode exactly once", () => {
    const described = describeModes(DEFAULT_DOC_MODE);
    for (const id of Object.keys(DOC_MODES)) {
      expect(described).toContain(id);
    }
  });
});
