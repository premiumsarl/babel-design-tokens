// Tokens + contracts integrity gate — everything .github/workflows/verify.yml
// ran until GitHub Actions was removed on 2026-09-14. dist/ and dart/lib/ are
// COMMITTED but GENERATED, and consumers install straight from git, so this
// is the only enforcement point. Runs from `npm run verify` and the pre-push
// hook (.githooks/pre-push, installed by `npm install`). ~25s.
//
//   1. regenerate from tokens.json + contracts/ and fail on drift
//   2. WCAG contrast gate
//   3. contract invariants (also re-asserts freshness via build.mjs --check)
//   4. the generated Dart analyzes — babel_tokens.dart AND babel_contracts.dart
//      (needs `flutter` on PATH for the tokens file, `dart` for the contracts;
//      whatever cannot run is SKIPPED with a warning naming the file, never
//      silently)
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

// Both generated files. This used to copy babel_contracts.dart alone, so
// babel_tokens.dart — the file babel-mobile imports everywhere — was analyzed
// by nothing here, and a broken emit surfaced only after a consumer bumped
// its pin. It imports flutter/widgets.dart, so it needs the Flutter SDK.
console.log('\n▶ generated Dart analyzes (babel_tokens.dart + babel_contracts.dart)');
const onPath = (bin) => !spawnSync(bin, ['--version'], { stdio: 'ignore' }).error;
if (!onPath('dart')) {
  console.warn('  ⚠ `dart` not on PATH — SKIPPED: NEITHER dart/lib/babel_tokens.dart NOR dart/lib/babel_contracts.dart was analyzed. Install Flutter (it ships `dart`) to run this step; a file that does not analyze is a build break in babel-mobile.');
} else {
  const flutter = onPath('flutter');
  const files = flutter ? ['babel_tokens.dart', 'babel_contracts.dart'] : ['babel_contracts.dart'];
  const dir = mkdtempSync(join(tmpdir(), 'dartcheck-'));
  mkdirSync(join(dir, 'lib'));
  for (const f of files) copyFileSync(join(root, 'dart/lib', f), join(dir, 'lib', f));
  // With Flutter, the package's own pubspec: the check then resolves what a
  // consumer resolves. Without it, a pure-Dart one that only the contracts fit.
  writeFileSync(join(dir, 'pubspec.yaml'), flutter
    ? readFileSync(join(root, 'dart/pubspec.yaml'), 'utf8')
    : 'name: contracts_check\nenvironment:\n  sdk: ">=3.0.0 <4.0.0"\n');
  for (const [cmd, args] of [[flutter ? 'flutter' : 'dart', ['pub', 'get']], ['dart', ['analyze']]]) {
    const r = spawnSync(cmd, args, { cwd: dir, stdio: 'inherit' });
    if (r.status !== 0) { rmSync(dir, { recursive: true, force: true }); console.error(`✗ generated Dart does not analyze (${files.join(', ')})`); process.exit(1); }
  }
  rmSync(dir, { recursive: true, force: true });
  if (flutter) console.log(`  analyzed ${files.join(' + ')}`);
  else console.warn('  ⚠ `flutter` not on PATH — dart/lib/babel_tokens.dart was NOT analyzed (it imports flutter/widgets.dart); only babel_contracts.dart was. Install Flutter to check both.');
}

run('ratchet scope (test files excluded, real literals counted)', 'node', ['scripts/__tests__/ratchet-scope.test.mjs']);

console.log('\n▶ version parity (package.json == dart/pubspec.yaml)');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const m = readFileSync(join(root, 'dart/pubspec.yaml'), 'utf8').match(/^version:\s*(\S+)/m);
if (pkg !== (m && m[1])) { console.error(`✗ version mismatch: package.json ${pkg} != dart/pubspec.yaml ${m && m[1]}`); process.exit(1); }
console.log(`  ${pkg}`);
console.log('\n✓ verify passed');
