import type { Workspace } from "../workspace.js";
import { makeListFilesTool } from "./listFiles.js";
import { makeReadFileTool } from "./readFile.js";
import { makeSearchFilesTool } from "./searchFiles.js";
import { makeInspectPackageJsonTool } from "./inspectPackageJson.js";
import { makeFindExistingReadmeTool } from "./findExistingReadme.js";
import { makeSummarizeFileTool } from "./summarizeFile.js";
import { makeSaveReadmeTool, type SaveReadmeProposal } from "./saveReadme.js";

export function buildTools(workspace: Workspace, onProposeReadme: (p: SaveReadmeProposal) => void) {
  return {
    listFiles: makeListFilesTool(workspace),
    readFile: makeReadFileTool(workspace),
    searchFiles: makeSearchFilesTool(workspace),
    inspectPackageJson: makeInspectPackageJsonTool(workspace),
    findExistingReadme: makeFindExistingReadmeTool(workspace),
    summarizeFile: makeSummarizeFileTool(workspace),
    saveReadme: makeSaveReadmeTool(workspace, onProposeReadme),
  };
}

export type { SaveReadmeProposal };
