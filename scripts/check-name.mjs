#!/usr/bin/env node
/*
 * Name-spelling guard (spec 0.1).
 *
 * The coach's name is "Linda Clemons". The common misspelling is forbidden.
 * This script fails the build (exit 1) if the misspelling appears anywhere
 * under the scanned roots. It passes (exit 0) when there are zero occurrences.
 *
 * The forbidden token is assembled from parts so the literal string never
 * appears in this repository (keeping `grep -ri` over the tree at zero).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FORBIDDEN = ["Cl", "em", "en", "s"].join(""); // the misspelling of "Clemons"
const FORBIDDEN_RE = new RegExp(FORBIDDEN, "i");

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Scan these roots only. The scripts/ dir is intentionally excluded.
const ROOTS = ["src", "db", "knowledge-base", "README.md", "CHANGELOG.md"];
const TEXT_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".md", ".sql",
  ".txt", ".json", ".html", ".mts",
]);

const hits = [];

function scanFile(abs, rel) {
  const ext = path.extname(abs).toLowerCase();
  if (ext && !TEXT_EXT.has(ext)) return;
  let content;
  try {
    content = fs.readFileSync(abs, "utf8");
  } catch {
    return;
  }
  const lines = content.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (FORBIDDEN_RE.test(line)) {
      hits.push(`${rel}:${i + 1}: ${line.trim().slice(0, 120)}`);
    }
  });
}

function walk(abs, rel) {
  let stat;
  try {
    stat = fs.statSync(abs);
  } catch {
    return;
  }
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(abs)) {
      if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
      walk(path.join(abs, entry), path.join(rel, entry));
    }
  } else if (stat.isFile()) {
    scanFile(abs, rel);
  }
}

for (const root of ROOTS) {
  walk(path.join(repoRoot, root), root);
}

if (hits.length > 0) {
  console.error(`\n❌ check:name FAILED - found ${hits.length} misspelling(s) of "Clemons":\n`);
  for (const h of hits) console.error("  " + h);
  console.error('\nThe coach\'s name must always be spelled "Clemons" (Linda Clemons / Ms. Linda).\n');
  process.exit(1);
}

console.log('✅ check:name passed - name spelling is correct (0 misspellings).');
process.exit(0);
