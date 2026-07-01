import { describe, expect, it } from "vitest";
import { renderDiff } from "../src/diff.js";

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9]+m/g, "");
}

describe("renderDiff", () => {
  it("reports no changes when before and after are identical", () => {
    const result = renderDiff("a\nb\nc", "a\nb\nc");
    expect(stripAnsi(result)).toBe("No changes.");
  });

  it("marks purely added lines with a +", () => {
    const result = renderDiff("a", "a\nb");
    const plain = stripAnsi(result);
    expect(plain).toBe("  a\n+ b");
  });

  it("marks purely removed lines with a -", () => {
    const result = renderDiff("a\nb", "a");
    const plain = stripAnsi(result);
    expect(plain).toBe("  a\n- b");
  });

  it("renders a mix of equal, added, and removed lines", () => {
    const before = "line1\nline2\nline3";
    const after = "line1\nchanged\nline3";
    const plain = stripAnsi(renderDiff(before, after));
    const lines = plain.split("\n");
    expect(lines).toContain("  line1");
    expect(lines).toContain("- line2");
    expect(lines).toContain("+ changed");
    expect(lines).toContain("  line3");
  });

  it("treats an empty before string as one removed blank line plus additions", () => {
    // "".split("\n") is [""], so an empty before is one blank line, not zero lines.
    const plain = stripAnsi(renderDiff("", "new content"));
    expect(plain).toBe("- \n+ new content");
  });

  it("treats an empty after string as one added blank line plus removals", () => {
    const plain = stripAnsi(renderDiff("old content", ""));
    expect(plain).toBe("- old content\n+ ");
  });

  it("wraps added lines in green and removed lines in red", () => {
    const result = renderDiff("a", "b");
    expect(result).toContain("\x1b[32m");
    expect(result).toContain("\x1b[31m");
    expect(result).toContain("\x1b[0m");
  });
});
