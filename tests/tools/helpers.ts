import { afterEach } from "vitest";
import { createFixtureWorkspace } from "../fixtures.js";

export const toolCallOpts = { toolCallId: "test-call", messages: [] };

/** Registers cleanup via afterEach and returns a fixture() factory for use within a describe block. */
export function useFixtures() {
  let cleanupFns: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(cleanupFns.map((fn) => fn()));
    cleanupFns = [];
  });

  return async function fixture() {
    const f = await createFixtureWorkspace();
    cleanupFns.push(f.cleanup);
    return f;
  };
}
