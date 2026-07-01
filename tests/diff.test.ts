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
    expect(plain).toBe("1 1   a\n  2 + b");
  });

  it("marks purely removed lines with a -", () => {
    const result = renderDiff("a\nb", "a");
    const plain = stripAnsi(result);
    expect(plain).toBe("1 1   a\n2   - b");
  });

  it("renders a mix of equal, added, and removed lines", () => {
    const before = "line1\nline2\nline3";
    const after = "line1\nchanged\nline3";
    const plain = stripAnsi(renderDiff(before, after));
    const lines = plain.split("\n");
    expect(lines).toContain("1 1   line1");
    expect(lines).toContain("2   - line2");
    expect(lines).toContain("  2 + changed");
    expect(lines).toContain("3 3   line3");
  });

  it("treats an empty before string as one removed blank line plus additions", () => {
    // "".split("\n") is [""], so an empty before is one blank line, not zero lines.
    const plain = stripAnsi(renderDiff("", "new content"));
    expect(plain).toBe("1   - \n  1 + new content");
  });

  it("treats an empty after string as one added blank line plus removals", () => {
    const plain = stripAnsi(renderDiff("old content", ""));
    expect(plain).toBe("1   - old content\n  1 + ");
  });

  it("wraps added lines in green and removed lines in red", () => {
    const result = renderDiff("a", "b");
    expect(result).toContain("\x1b[32m");
    expect(result).toContain("\x1b[31m");
    expect(result).toContain("\x1b[0m");
  });

  it("collapses unchanged spans beyond the context window into a single marker", () => {
    const before = Array.from({ length: 20 }, (_, i) => `line${i + 1}`).join(
      "\n",
    );
    const after = before.replace("line10", "changed");
    const plain = stripAnsi(renderDiff(before, after));
    const lines = plain.split("\n");
    expect(lines.filter((l) => l.includes("⋮"))).toHaveLength(1);
    expect(lines).not.toContain(" 1  1   line1");
    expect(lines).toContain(" 5  5   line5");
    expect(lines).toContain("15 15   line15");
    expect(lines).not.toContain("16 16   line16");
  });
});
