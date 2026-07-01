import { execFile } from "node:child_process";
import { chmod, copyFile, mkdir } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const outName =
  process.platform === "win32" ? "readme_assistant.exe" : "readme_assistant";
const outPath = `dist-bin/${outName}`;

await mkdir("dist-bin", { recursive: true });

if (process.platform === "darwin") {
  // The system `node` is often a universal (fat) binary containing both
  // x86_64 and arm64 slices, each embedding the SEA sentinel fuse string.
  // postject rejects binaries with multiple sentinel occurrences, so we
  // extract just the native-arch slice before injecting. Some builds of
  // node (e.g. GitHub-hosted runners) ship single-arch binaries already,
  // where `lipo -thin` errors out — copy those as-is instead.
  const { stdout: archs } = await execFileAsync("lipo", [
    "-archs",
    process.execPath,
  ]);
  if (archs.trim().split(/\s+/).length > 1) {
    await execFileAsync("lipo", [
      process.execPath,
      "-thin",
      process.arch === "arm64" ? "arm64" : "x86_64",
      "-output",
      outPath,
    ]);
  } else {
    await copyFile(process.execPath, outPath);
  }
  await execFileAsync("codesign", ["--remove-signature", outPath]);
} else {
  await copyFile(process.execPath, outPath);
}

await execFileAsync("npx", [
  "postject",
  outPath,
  "NODE_SEA_BLOB",
  "dist-bin/sea-prep.blob",
  "--sentinel-fuse",
  "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
  ...(process.platform === "darwin"
    ? ["--macho-segment-name", "NODE_SEA"]
    : []),
]);

if (process.platform === "darwin") {
  await execFileAsync("codesign", ["--sign", "-", outPath]);
}

await chmod(outPath, 0o755);

console.log(`Built ${outPath}`);
