import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  loadModel,
  parseApiKeyEnvFlag,
  parseApiKeyFileFlag,
  parseModelFlag,
  stripApiKeyEnvFlag,
  stripApiKeyFileFlag,
  stripModelFlag,
} from "../src/config.js";

describe("loadModel", () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.OPENAI_MODEL;

  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;
  });

  afterEach(() => {
    if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalApiKey;
    if (originalModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = originalModel;
  });

  it("throws a descriptive error when OPENAI_API_KEY is not set", async () => {
    await expect(loadModel()).rejects.toThrow(/OPENAI_API_KEY is not set/);
  });

  it("returns a model when OPENAI_API_KEY is set, defaulting to gpt-4o-mini", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const model = await loadModel();
    expect(model).toBeDefined();
    expect((model as { modelId?: string }).modelId).toBe("gpt-4o-mini");
  });

  it("respects OPENAI_MODEL when set", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-4.1";
    const model = await loadModel();
    expect((model as { modelId?: string }).modelId).toBe("gpt-4.1");
  });

  it("respects an explicit modelId option over OPENAI_MODEL", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-4.1";
    const model = await loadModel({ modelId: "gpt-4-turbo" });
    expect((model as { modelId?: string }).modelId).toBe("gpt-4-turbo");
  });

  it("reads the API key from a named env var via apiKeyEnv", async () => {
    process.env.CUSTOM_KEY = "custom-key-value";
    try {
      const model = await loadModel({ apiKeyEnv: "CUSTOM_KEY" });
      expect(model).toBeDefined();
    } finally {
      delete process.env.CUSTOM_KEY;
    }
  });

  it("throws a descriptive error when the named env var is not set", async () => {
    await expect(loadModel({ apiKeyEnv: "CUSTOM_KEY" })).rejects.toThrow(
      /CUSTOM_KEY is not set/,
    );
  });

  it("reads the API key from a file via apiKeyFile", async () => {
    const path = join(tmpdir(), `api-key-${Date.now()}.txt`);
    await fs.writeFile(path, "file-key-value\n", "utf8");
    try {
      const model = await loadModel({ apiKeyFile: path });
      expect(model).toBeDefined();
    } finally {
      await fs.unlink(path);
    }
  });

  it("throws a descriptive error when apiKeyFile is empty", async () => {
    const path = join(tmpdir(), `api-key-empty-${Date.now()}.txt`);
    await fs.writeFile(path, "   \n", "utf8");
    try {
      await expect(loadModel({ apiKeyFile: path })).rejects.toThrow(/is empty/);
    } finally {
      await fs.unlink(path);
    }
  });
});

describe("parseModelFlag / stripModelFlag", () => {
  it("parses --model=<id>", () => {
    expect(parseModelFlag(["--model=gpt-4.1", "foo"])).toBe("gpt-4.1");
  });

  it("returns null when absent", () => {
    expect(parseModelFlag(["foo"])).toBeNull();
  });

  it("strips the flag out of argv", () => {
    expect(stripModelFlag(["--model=gpt-4.1", "foo"])).toEqual(["foo"]);
  });
});

describe("parseApiKeyFileFlag / stripApiKeyFileFlag", () => {
  it("parses --api-key-file=<path>", () => {
    expect(parseApiKeyFileFlag(["--api-key-file=/tmp/key", "foo"])).toBe(
      "/tmp/key",
    );
  });

  it("returns null when absent", () => {
    expect(parseApiKeyFileFlag(["foo"])).toBeNull();
  });

  it("strips the flag out of argv", () => {
    expect(stripApiKeyFileFlag(["--api-key-file=/tmp/key", "foo"])).toEqual([
      "foo",
    ]);
  });
});

describe("parseApiKeyEnvFlag / stripApiKeyEnvFlag", () => {
  it("parses --api-key-env=<VAR>", () => {
    expect(parseApiKeyEnvFlag(["--api-key-env=MY_KEY", "foo"])).toBe("MY_KEY");
  });

  it("returns null when absent", () => {
    expect(parseApiKeyEnvFlag(["foo"])).toBeNull();
  });

  it("strips the flag out of argv", () => {
    expect(stripApiKeyEnvFlag(["--api-key-env=MY_KEY", "foo"])).toEqual([
      "foo",
    ]);
  });
});
