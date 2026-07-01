import { promises as fs } from "node:fs";
import path from "node:path";

export class WorkspaceBoundsError extends Error {
  constructor(relPath: string) {
    super(`Path "${relPath}" escapes the workspace root`);
    this.name = "WorkspaceBoundsError";
  }
}

export class Workspace {
  readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  static async create(rootArg: string): Promise<Workspace> {
    const root = path.resolve(rootArg);
    const stat = await fs.stat(root).catch(() => null);
    if (!stat || !stat.isDirectory()) {
      throw new Error(`Workspace path "${rootArg}" is not a directory`);
    }
    return new Workspace(root);
  }

  /** Resolves a workspace-relative path, rejecting anything that escapes root. */
  resolve(relPath: string): string {
    const resolved = path.resolve(this.root, relPath);
    const relFromRoot = path.relative(this.root, resolved);
    if (relFromRoot.startsWith("..") || path.isAbsolute(relFromRoot)) {
      throw new WorkspaceBoundsError(relPath);
    }
    return resolved;
  }

  relative(absPath: string): string {
    return path.relative(this.root, absPath) || ".";
  }
}

const DEFAULT_IGNORES = new Set([
  "node_modules",
  ".git",
  "dist",
  "dist-bin",
  "build",
  ".next",
  "coverage",
  ".claude",
  "history.json",
]);

/** Matches .env and .env.* (e.g. .env.local), but not .env.example. */
function isEnvFile(name: string): boolean {
  return (
    name !== ".env.example" && (name === ".env" || name.startsWith(".env."))
  );
}

/** Recursively lists files under `dirAbs`, returning paths relative to `root`. */
export async function listFilesRecursive(
  root: string,
  dirAbs: string,
  maxDepth = 6,
): Promise<string[]> {
  const results: string[] = [];

  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (DEFAULT_IGNORES.has(entry.name) || isEnvFile(entry.name)) continue;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(abs, depth + 1);
      } else if (entry.isFile()) {
        results.push(path.relative(root, abs));
      }
    }
  }

  await walk(dirAbs, 0);
  return results.sort();
}

interface TreeNode {
  children: Map<string, TreeNode>;
  isFile: boolean;
}

/** Renders a flat list of relative paths as an ASCII tree, directories first, alphabetical within each. */
export function formatFileTree(paths: string[]): string {
  const root: TreeNode = { children: new Map(), isFile: false };

  for (const p of paths) {
    const parts = p.split(path.sep);
    let cur = root;
    parts.forEach((part, i) => {
      let next = cur.children.get(part);
      if (!next) {
        next = { children: new Map(), isFile: i === parts.length - 1 };
        cur.children.set(part, next);
      }
      cur = next;
    });
  }

  function sortedEntries(node: TreeNode): [string, TreeNode][] {
    return [...node.children.entries()].sort(
      ([aName, aNode], [bName, bNode]) => {
        if (aNode.isFile !== bNode.isFile) return aNode.isFile ? 1 : -1;
        return aName.localeCompare(bName);
      },
    );
  }

  const lines: string[] = [];
  function render(node: TreeNode, prefix: string): void {
    const entries = sortedEntries(node);
    entries.forEach(([name, child], idx) => {
      const isLast = idx === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      lines.push(`${prefix}${connector}${child.isFile ? name : `${name}/`}`);
      if (!child.isFile) {
        render(child, prefix + (isLast ? "    " : "│   "));
      }
    });
  }
  render(root, "");

  return lines.join("\n");
}
