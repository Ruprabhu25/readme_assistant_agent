import { createInterface } from "node:readline/promises";
import { Readable, Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { askYesNo } from "../src/ui.js";

function fakeTerminal() {
  const input = new Readable({ read() {} });
  const output = new Writable({
    write(_chunk, _enc, cb) {
      cb();
    },
  });
  const rl = createInterface({ input, output });
  return { input, rl };
}

describe("askYesNo", () => {
  it("reuses the given readline interface instead of closing it", async () => {
    const { input, rl } = fakeTerminal();

    const firstAnswer = askYesNo(rl, "Accept?");
    input.push("y\n");
    expect(await firstAnswer).toBe(true);

    // A closed readline interface throws/hangs on further use; this proves
    // askYesNo did not close the shared interface out from under the caller.
    const secondAnswer = askYesNo(rl, "Accept again?");
    input.push("n\n");
    expect(await secondAnswer).toBe(false);

    rl.close();
  });

  it("reprompts until it receives an explicit y/n answer", async () => {
    const { input, rl } = fakeTerminal();

    const answer = askYesNo(rl, "Accept?");
    input.push("maybe\n");
    await new Promise((resolve) => setImmediate(resolve));
    input.push("n\n");
    expect(await answer).toBe(false);

    rl.close();
  });
});
