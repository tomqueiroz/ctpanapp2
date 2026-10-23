import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const base = path.dirname(fileURLToPath(import.meta.url));
const snapshot = path.join(base, "v69-2026-10-23");
const manifestPath = path.join(base, "v69-2026-10-23.manifest.json");

function inventory(directory, prefix = "") {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink not allowed: ${relative}`);
    if (entry.isDirectory()) files.push(...inventory(absolute, relative));
    else if (entry.isFile()) {
      const data = fs.readFileSync(absolute);
      files.push({
        path: relative,
        bytes: data.length,
        sha256: crypto.createHash("sha256").update(data).digest("hex"),
      });
    } else throw new Error(`Unsupported file: ${relative}`);
  }
  return files.sort((a, b) => a.path.localeCompare(b.path, "en"));
}

try {
  const files = inventory(snapshot);
  if (process.argv[2] === "--create") {
    if (fs.existsSync(manifestPath)) throw new Error("Manifest already exists");
    const manifest = {
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      repository: "https://github.com/tomqueiroz/ctpanapp2",
      websiteId: "019fb9b9-b873-7bdc-8fa9-2399c9f61b24",
      websiteVersion: 69,
      skyworkCommit: "f46f294a225c359b557a7292bbd216f518839136",
      sourceRevision: "src_569a58f79af7",
      snapshot: "v69-2026-10-23",
      excludedFromSourceArchive: ["supabase/.temp/**"],
      includesDatabaseDump: false,
      includesAuthUsers: false,
      includesStorageObjects: false,
      includesVaultSecrets: false,
      fileCount: files.length,
      totalBytes: files.reduce((total, file) => total + file.bytes, 0),
      files,
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", {
      flag: "wx",
    });
    console.log(JSON.stringify({
      status: "created",
      fileCount: manifest.fileCount,
      totalBytes: manifest.totalBytes,
    }));
  } else {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const actual = new Map(files.map((file) => [file.path, file]));
    const failures = [];
    for (const expected of manifest.files) {
      const found = actual.get(expected.path);
      if (!found) failures.push({ path: expected.path, issue: "missing" });
      else if (found.sha256 !== expected.sha256 || found.bytes !== expected.bytes) {
        failures.push({ path: expected.path, issue: "changed" });
      }
      actual.delete(expected.path);
    }
    for (const extra of actual.keys()) failures.push({ path: extra, issue: "extra" });
    const totalBytes = files.reduce((total, file) => total + file.bytes, 0);
    if (manifest.fileCount !== files.length || manifest.totalBytes !== totalBytes) {
      failures.push({ issue: "inventory_totals_mismatch" });
    }
    console.log(JSON.stringify({
      status: failures.length ? "failed" : "verified",
      fileCount: files.length,
      totalBytes,
      failures,
    }, null, 2));
    if (failures.length) process.exitCode = 1;
  }
} catch (error) {
  console.error(JSON.stringify({ status: "failed", error: error.message }));
  process.exitCode = 1;
}
