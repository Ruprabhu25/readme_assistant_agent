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

const DEFAULT_IGNORES = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage"]);

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
      if (DEFAULT_IGNORES.has(entry.name)) continue;
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
