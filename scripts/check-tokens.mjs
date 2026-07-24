#!/usr/bin/env node
/**
 * Token ratchet — the drift guard.
 *
 * Fails when a target directory gains NEW raw color literals that bypass the
 * tokens (hex like #a97035 / 0xFFA97035, or rgb()/rgba() with literal channels).
 * Modeled on babel-admin-panel/scripts/check-changed.mjs, generalized to run in
 * any repo. A baseline file records the current (legacy) count so the number can
 * only go DOWN — you don't have to fix 5,000 literals on day one, you just can't
 * add more.
 *
 * Usage:
 *   node check-tokens.mjs <dir> [--ext=.css,.ts,.tsx,.dart] [--update-baseline]
 *
 * Exit 1 when the count exceeds the baseline. `--update-baseline` rewrites the
 * baseline to the current count (do this only when intentionally lowering it).
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith('--'));
const extArg = args.find((a) => a.startsWith('--ext='));
const update = args.includes('--update-baseline');
if (!dir) {
  console.error('usage: check-tokens.mjs <dir> [--ext=.css,.ts,.tsx,.dart] [--update-baseline]');
  process.exit(2);
}
const exts = (extArg ? extArg.slice(6) : '.css,.scss,.ts,.tsx,.js,.dart').split(',');
const SKIP = new Set(['node_modules', '.next', 'dist', 'build', '.git', '.dart_tool', 'coverage']);

// Raw hex (#rrggbb / #rgb), Dart ARGB (0xFFrrggbb), and literal rgb()/rgba().
const PATTERNS = [
  /#[0-9a-fA-F]{6}\b/g,
  /#[0-9a-fA-F]{3}\b/g,
  /0x[fF]{2}[0-9a-fA-F]{6}\b/g,
  /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g,
];

function walk(d, acc = []) {
  for (const entry of readdirSync(d)) {
    if (SKIP.has(entry)) continue;
    const p = join(d, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else if (exts.includes(extname(p))) acc.push(p);
  }
  return acc;
}

let count = 0;
const hits = [];
for (const file of walk(dir)) {
  const text = readFileSync(file, 'utf8');
  // Generated token files ARE the definitions — never count them as drift.
  if (/GENERATED from tokens\.json/.test(text.slice(0, 300))) continue;
  let fileCount = 0;
  for (const re of PATTERNS) fileCount += (text.match(re) || []).length;
  if (fileCount) {
    count += fileCount;
    hits.push([file, fileCount]);
  }
}

const baselineFile = join(dir, '.token-baseline.json');
const baseline = existsSync(baselineFile)
  ? JSON.parse(readFileSync(baselineFile, 'utf8')).count
  : Infinity;

if (update) {
  writeFileSync(baselineFile, JSON.stringify({ count }, null, 2) + '\n');
  console.log(`baseline set: ${count} raw color literals in ${dir}`);
  process.exit(0);
}

hits.sort((a, b) => b[1] - a[1]);
console.log(`Raw color literals bypassing tokens in ${dir}: ${count} (baseline ${baseline})`);
for (const [f, n] of hits.slice(0, 12)) console.log(`  ${n.toString().padStart(4)}  ${f}`);

if (count > baseline) {
  console.error(`\n✗ ${count - baseline} MORE than baseline — new hardcoded colors added. Use a token from tokens.css / babel_tokens.dart.`);
  process.exit(1);
}
console.log(`\n✓ within baseline${baseline === Infinity ? ' (no baseline yet — run with --update-baseline to set one)' : ''}.`);
