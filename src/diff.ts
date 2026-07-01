const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const CONTEXT_LINES = 5;

type Op = {
  kind: "equal" | "add" | "remove";
  line: string;
  oldLine: number | null;
  newLine: number | null;
};

/** Line-based LCS diff, rendered unified-diff style with +/- markers, line numbers, and hunk context. */
export function renderDiff(before: string, after: string): string {
  const a = before.split("\n");
  const b = after.split("\n");
  const ops = diffLines(a, b);

  if (ops.every((op) => op.kind === "equal")) {
    return `${DIM}No changes.${RESET}`;
  }

  const keep = new Array(ops.length).fill(false);
  ops.forEach((op, idx) => {
    if (op.kind === "equal") return;
    for (
      let k = Math.max(0, idx - CONTEXT_LINES);
      k <= Math.min(ops.length - 1, idx + CONTEXT_LINES);
      k++
    ) {
      keep[k] = true;
    }
  });

  const oldWidth = String(a.length).length;
  const newWidth = String(b.length).length;
  const gutter = (op: Op) =>
    `${(op.oldLine ?? "").toString().padStart(oldWidth)} ${(op.newLine ?? "").toString().padStart(newWidth)}`;

  const lines: string[] = [];
  for (let idx = 0; idx < ops.length; idx++) {
    if (!keep[idx]) {
      if (keep[idx - 1]) {
        lines.push(
          `${DIM}${" ".repeat(oldWidth)} ${" ".repeat(newWidth)}   ⋮${RESET}`,
        );
      }
      continue;
    }
    const op = ops[idx];
    if (op.kind === "add")
      lines.push(`${GREEN}${gutter(op)} + ${op.line}${RESET}`);
    else if (op.kind === "remove")
      lines.push(`${RED}${gutter(op)} - ${op.line}${RESET}`);
    else lines.push(`${DIM}${gutter(op)}   ${op.line}${RESET}`);
  }

  return lines.join("\n");
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
      ops.push({ kind: "equal", line: a[i], oldLine: i + 1, newLine: j + 1 });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ kind: "remove", line: a[i], oldLine: i + 1, newLine: null });
      i++;
    } else {
      ops.push({ kind: "add", line: b[j], oldLine: null, newLine: j + 1 });
      j++;
    }
  }
  while (i < n) {
    ops.push({ kind: "remove", line: a[i], oldLine: i + 1, newLine: null });
    i++;
  }
  while (j < m) {
    ops.push({ kind: "add", line: b[j], oldLine: null, newLine: j + 1 });
    j++;
  }

  return ops;
}
