// Tokens + contracts integrity gate — everything .github/workflows/verify.yml
// ran until GitHub Actions was removed on 2026-09-14. dist/ and dart/lib/ are
// COMMITTED but GENERATED, and consumers install straight from git, so this
// is the only enforcement point. Runs from `npm run verify` and the pre-push
// hook (.githooks/pre-push, installed by `npm install`). ~25s.
//
//   1. regenerate from tokens.json + contracts/ and fail on drift
//   2. WCAG contrast gate
//   3. contract invariants (also re-asserts freshness via build.mjs --check)
//   4. the generated Dart analyzes (needs `dart` on PATH — Flutter ships it;
//      SKIPPED with a warning when absent, never silently)
//   5. ratchet scope self-test
//   6. npm/pub version parity (package.json == dart/pubspec.yaml)
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const run = (label, cmd, args, opts = {}) => {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', ...opts });
  if (r.status !== 0) { console.error(`✗ ${label}`); process.exit(r.status ?? 1); }
};

run('build from tokens.json + contracts/', 'node', ['build.mjs']);

console.log('\n▶ committed generated output matches the source');
const drift = execFileSync('git', ['status', '--porcelain', 'dist', 'dart/lib'], { cwd: root }).toString().trim();
if (drift) {
  console.error('✗ dist/ or dart/lib is out of sync with tokens.json / contracts/ — run `npm run build` and commit:\n' + drift);
  process.exit(1);
}
console.log('  in sync');

run('WCAG contrast gate', 'node', ['scripts/check-contrast.mjs']);
run('contract integrity gate', 'node', ['scripts/check-contracts.mjs']);

console.log('\n▶ generated Dart analyzes');
const dart = spawnSync('dart', ['--version'], { stdio: 'ignore' });
if (dart.error) {
  console.warn('  ⚠ `dart` not on PATH — SKIPPED. Install Flutter (or the Dart SDK) to run this step; a file that does not analyze is a build break in babel-mobile.');
} else {
  const dir = mkdtempSync(join(tmpdir(), 'dartcheck-'));
  mkdirSync(join(dir, 'lib'));
  copyFileSync(join(root, 'dart/lib/babel_contracts.dart'), join(dir, 'lib/babel_contracts.dart'));
  writeFileSync(join(dir, 'pubspec.yaml'), 'name: contracts_check\nenvironment:\n  sdk: ">=3.0.0 <4.0.0"\n');
  for (const args of [['pub', 'get'], ['analyze']]) {
    const r = spawnSync('dart', args, { cwd: dir, stdio: 'inherit' });
    if (r.status !== 0) { rmSync(dir, { recursive: true, force: true }); console.error('✗ generated Dart does not analyze'); process.exit(1); }
  }
  rmSync(dir, { recursive: true, force: true });
}

run('ratchet scope (test files excluded, real literals counted)', 'node', ['scripts/__tests__/ratchet-scope.test.mjs']);

console.log('\n▶ version parity (package.json == dart/pubspec.yaml)');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const m = readFileSync(join(root, 'dart/pubspec.yaml'), 'utf8').match(/^version:\s*(\S+)/m);
if (pkg !== (m && m[1])) { console.error(`✗ version mismatch: package.json ${pkg} != dart/pubspec.yaml ${m && m[1]}`); process.exit(1); }
console.log(`  ${pkg}`);
console.log('\n✓ verify passed');
