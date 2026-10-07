// Tokens + contracts integrity gate — everything .github/workflows/verify.yml
// ran until GitHub Actions was removed on 2026-09-14. dist/ and dart/lib/ are
// COMMITTED but GENERATED, and consumers install straight from git, so this
// is the only enforcement point. Runs from `npm run verify`, the pre-push
// hook (.githooks/pre-push, installed by `npm install`), and README release
// step 6, as `VERIFY_STRICT=1 npm run verify`, on a clean checkout of the
// commit being tagged. ~25s.
//
//   1. regenerate from tokens.json + contracts/ and fail on drift
//   2. WCAG contrast gate
//   3. contract invariants (also re-asserts freshness via build.mjs --check)
//   4. the generated Dart analyzes, infos included (--fatal-infos):
//      babel_contracts.dart alone with no dependencies, as it is pure Dart
//      (needs `dart`; a no-Flutter-import text check runs regardless), and
//      babel_tokens.dart under dart/pubspec.yaml (needs `flutter`). Packages
//      resolve offline first. Whatever cannot run (no SDK, or no network and
//      a cold pub cache) is SKIPPED with a warning naming the file, never
//      silently; with VERIFY_STRICT set, verify fails at the end, naming
//      every skip
//   5. self-tests: the ratchet's scope, the Dart codegen (shadow lengths,
//      no private or reserved-word names), and the principles parse
//   6. npm/pub version parity (package.json == dart/pubspec.yaml), and the
//      version has a dart/CHANGELOG.md entry
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
// VERIFY_STRICT=1 (any non-empty value, as with the hook's SKIP_VERIFY)
// turns any SKIPPED below into a failure: every step still runs, and verify
// then exits 1 naming each skip. Release step 6 runs verify this way:
// otherwise a run that could not analyze a Dart file still exits 0, and the
// one sign is a warning among ~100 lines of output.
const strict = Boolean(process.env.VERIFY_STRICT);
if (strict) console.log('VERIFY_STRICT is set: a check that has to be SKIPPED fails verify.');
const skipped = [];
const skip = (msg) => {
  console.warn(`  ⚠ ${msg}`);
  skipped.push(msg);
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

// Each generated file in a scratch package of its own, under the pubspec it
// promises to work with. babel_contracts.dart is documented as pure Dart, so
// it goes alone under one with no dependencies: next to Flutter, a Flutter
// import it USED would resolve and pass. babel_tokens.dart, the file
// babel-mobile imports everywhere (analyzed by nothing here before 0.8.0),
// imports flutter/widgets.dart, so it goes under dart/pubspec.yaml and needs
// the Flutter SDK. --fatal-infos: plain `dart analyze` exits 0 on an info,
// and deprecated_member_use is how a Flutter API removal announces itself.
console.log('\n▶ generated Dart analyzes (babel_contracts.dart and babel_principles.dart as pure Dart, babel_tokens.dart under Flutter)');
for (const pureDart of ['dart/lib/babel_contracts.dart', 'dart/lib/babel_principles.dart']) {
  const flutterImport = readFileSync(join(root, pureDart), 'utf8').split('\n')
    .find((l) => /^\s*(?:import|export)\s+['"](?:package:flutter\w*\/|dart:ui(?:_web)?['"])/.test(l));
  if (flutterImport) { console.error(`✗ ${pureDart} must stay pure Dart (see its header), but has: ${flutterImport.trim()}`); process.exit(1); }
  console.log(`  ${pureDart} imports neither Flutter nor dart:ui`);
}
const onPath = (bin) => !spawnSync(bin, ['--version'], { stdio: 'ignore' }).error;
// pub's words for "could not reach the server". Any other failure to resolve
// fails the step, so a wording this does not know fails closed.
const unreachable = /socket error|SocketException|Failed host lookup|Connection (?:refused|reset|closed|timed out)|Network is unreachable|TLS error|HandshakeException/i;
// Resolve, then analyze. Offline first: the pub cache nearly always has the
// packages, and a push without a network should still check the file.
// Returns where the packages came from, or null when the file was SKIPPED.
const analyze = (file, pub, pubspec) => {
  const dir = mkdtempSync(join(tmpdir(), 'dartcheck-'));
  const cleanup = () => rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, 'lib'));
  copyFileSync(join(root, 'dart/lib', file), join(dir, 'lib', file));
  writeFileSync(join(dir, 'pubspec.yaml'), pubspec);
  // dart analyze takes its options from the nearest analysis_options.yaml up
  // from the package, so one in TMPDIR or above (on a shared /tmp, anyone's)
  // could switch an error off. One here, with no options in it, ends that
  // search: the generated code is held to the SDK defaults.
  writeFileSync(join(dir, 'analysis_options.yaml'), '# SDK defaults only: stops dart analyze using an ancestor directory\'s options\n');
  const offline = spawnSync(pub, ['pub', 'get', '--offline'], { cwd: dir, encoding: 'utf8' });
  const got = offline.status === 0 ? offline : spawnSync(pub, ['pub', 'get'], { cwd: dir, encoding: 'utf8' });
  if (got.status !== 0) {
    cleanup();
    const out = `${got.stdout ?? ''}${got.stderr ?? ''}${got.error ?? ''}`;
    process.stderr.write(out);
    if (unreachable.test(out)) {
      skip(`pub.dev unreachable and the pub cache lacks what ${file} needs — SKIPPED: dart/lib/${file} was NOT analyzed. Run \`npm run verify\` once online to fill the cache.`);
      return null;
    }
    console.error(`✗ \`${pub} pub get\` could not resolve the packages dart/lib/${file} is analyzed against, from the pub cache or pub.dev (output above). The generated code itself was not analyzed.`);
    process.exit(1);
  }
  const r = spawnSync('dart', ['analyze', '--fatal-infos'], { cwd: dir, stdio: 'inherit' });
  cleanup();
  if (r.status !== 0) { console.error(`✗ generated Dart does not analyze (dart/lib/${file})`); process.exit(1); }
  return offline.status === 0 ? 'the pub cache' : 'pub.dev';
};
if (!onPath('dart')) {
  skip('`dart` not on PATH — SKIPPED: NONE of dart/lib/babel_tokens.dart, babel_contracts.dart or babel_principles.dart was analyzed. Install Flutter (it ships `dart`) to run this step; a file that does not analyze is a build break in babel-mobile.');
} else {
  const contractsFrom = analyze('babel_contracts.dart', 'dart', 'name: contracts_check\nenvironment:\n  sdk: ">=3.0.0 <4.0.0"\n');
  if (contractsFrom) console.log(`  analyzed babel_contracts.dart alone, with no dependencies (resolved from ${contractsFrom})`);
  const principlesFrom = analyze('babel_principles.dart', 'dart', 'name: principles_check\nenvironment:\n  sdk: ">=3.0.0 <4.0.0"\n');
  if (principlesFrom) console.log(`  analyzed babel_principles.dart alone, with no dependencies (resolved from ${principlesFrom})`);
  if (!onPath('flutter')) {
    skip('`flutter` not on PATH — SKIPPED: dart/lib/babel_tokens.dart was NOT analyzed (it imports flutter/widgets.dart). Install Flutter to check it.');
  } else {
    const tokensFrom = analyze('babel_tokens.dart', 'flutter', readFileSync(join(root, 'dart/pubspec.yaml'), 'utf8'));
    if (tokensFrom) console.log(`  analyzed babel_tokens.dart under dart/pubspec.yaml (resolved from ${tokensFrom})`);
  }
}

run('ratchet scope (test files excluded, real literals counted)', 'node', ['scripts/__tests__/ratchet-scope.test.mjs']);
run('Dart codegen (shadow lengths exact or refused, no private or reserved-word names)', 'node', ['scripts/__tests__/dart-codegen.test.mjs']);
run('principles parse (every refusal fires, principles/ parses clean)', 'node', ['scripts/__tests__/principles.test.mjs']);

console.log('\n▶ version parity (package.json == dart/pubspec.yaml) + CHANGELOG entry');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const m = readFileSync(join(root, 'dart/pubspec.yaml'), 'utf8').match(/^version:\s*(\S+)/m);
if (pkg !== (m && m[1])) { console.error(`✗ version mismatch: package.json ${pkg} != dart/pubspec.yaml ${m && m[1]}`); process.exit(1); }
// The CHANGELOG sat at 0.2.0 through five releases because nothing read it;
// consumers decide a pin bump from it, so a release without an entry fails.
const changelog = readFileSync(join(root, 'dart/CHANGELOG.md'), 'utf8');
if (!changelog.split('\n').some((l) => l.trim() === `## ${pkg}`)) { console.error(`✗ dart/CHANGELOG.md has no "## ${pkg}" entry — add one for this release`); process.exit(1); }
console.log(`  ${pkg}`);
if (strict && skipped.length) {
  console.error(`\n✗ VERIFY_STRICT is set, and ${skipped.length} check(s) were SKIPPED, so this run cannot gate a release:\n`
    + skipped.map((msg) => `  - ${msg}`).join('\n'));
  process.exit(1);
}
console.log('\n✓ verify passed');
if (skipped.length) console.warn(`  ⚠ but with ${skipped.length} check(s) SKIPPED (above), so this run cannot gate a release: release step 6 runs \`VERIFY_STRICT=1 npm run verify\`, which fails instead.`);
