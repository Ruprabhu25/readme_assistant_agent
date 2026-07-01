const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

type Op = { kind: "equal" | "add" | "remove"; line: string };

/** Line-based LCS diff, rendered unified-diff style with +/- markers. */
export function renderDiff(before: string, after: string): string {
  const a = before.split("\n");
  const b = after.split("\n");
  const ops = diffLines(a, b);

  if (ops.every((op) => op.kind === "equal")) {
    return `${DIM}No changes.${RESET}`;
  }

  return ops
    .map((op) => {
      if (op.kind === "add") return `${GREEN}+ ${op.line}${RESET}`;
      if (op.kind === "remove") return `${RED}- ${op.line}${RESET}`;
      return `${DIM}  ${op.line}${RESET}`;
    })
    .join("\n");
}

function diffLines(a: string[], b: string[]): Op[] {
  const n = a.length;
  const m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0),
  );

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ kind: "equal", line: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ kind: "remove", line: a[i] });
      i++;
    } else {
      ops.push({ kind: "add", line: b[j] });
      j++;
    }
  }
  while (i < n) ops.push({ kind: "remove", line: a[i++] });
  while (j < m) ops.push({ kind: "add", line: b[j++] });

  return ops;
}
