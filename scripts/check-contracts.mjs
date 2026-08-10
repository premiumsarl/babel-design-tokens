#!/usr/bin/env node
/**
 * Integrity self-check for the shared contracts.
 *
 * A design token that is wrong looks wrong. A CONTRACT that is wrong looks
 * fine and fails in production six weeks later, on one client, for one value —
 * so the invariants have to be machine-checked rather than reviewed.
 *
 * Two halves:
 *
 *   1. FRESHNESS — delegates to `node build.mjs --check`, which regenerates
 *      every output in memory and compares it to what is committed. Consumers
 *      install this repo straight from git, so the COMMITTED dist/ and
 *      dart/lib/ are what they get; a stale one is shipped, not caught.
 *
 *   2. INVARIANTS — over contracts/ itself:
 *        · every enum non-empty
 *        · no duplicate value inside an enum
 *        · no duplicate JSON key (JSON.parse keeps the LAST silently, so a
 *          copy-pasted error code would delete its twin with no error)
 *        · no two error-code names sharing one wire value
 *        · no alias colliding with a canonical value — the case that matters:
 *          an alias that IS a value makes the alias table a no-op, so a
 *          rename would silently stop being applied
 *        · every alias target and every subset member is a real value
 *        · deprecated disjoint from values
 *        · code values match their declared convention
 *        · identifiers survive the Dart transform uniquely
 *
 * Run: node scripts/check-contracts.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACTS = join(ROOT, 'contracts');

const problems = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);
let checks = 0;
const ok = (label) => {
  checks++;
  console.log(`  ✓ ${label}`);
};

/* ── 1. freshness ───────────────────────────────────────────────────────── */
console.log('\nFRESHNESS');
try {
  execFileSync(process.execPath, [join(ROOT, 'build.mjs'), '--check'], {
    cwd: ROOT,
    stdio: 'pipe',
  });
  ok('committed dist/ + dart/lib match tokens.json and contracts/');
} catch (err) {
  const out = `${err.stdout ?? ''}${err.stderr ?? ''}`.trim();
  fail('build', `committed output is stale\n${out.replace(/^/gm, '      ')}`);
  console.log('  ✗ committed output is STALE — run `npm run build`');
}

/* ── helpers ────────────────────────────────────────────────────────────── */
const readRaw = (p) => readFileSync(p, 'utf8');
const readJson = (p) => JSON.parse(readRaw(p));

/**
 * Duplicate keys in a JSON object literal.
 *
 * JSON.parse resolves a duplicate key to the LAST occurrence without
 * complaining, so `"TASK_NOT_FOUND"` pasted twice silently drops whichever
 * copy came first. Scanned textually because by the time it is parsed the
 * evidence is gone. Depth-tracked so a key repeated across two DIFFERENT
 * objects (`"note"` in several $meta blocks) is not a false positive.
 */
function duplicateKeys(text) {
  const dups = [];
  const stack = [new Set()];
  const re = /"((?:[^"\\]|\\.)*)"\s*:|([{[])|([}\]])/g;
  let m;
  while ((m = re.exec(text))) {
    if (m[2]) stack.push(new Set());
    else if (m[3]) stack.pop();
    else {
      const top = stack[stack.length - 1];
      if (top.has(m[1])) dups.push(m[1]);
      else top.add(m[1]);
    }
  }
  return dups;
}

const dupsOf = (arr) => [...new Set(arr.filter((v, i) => arr.indexOf(v) !== i))];

/* ── 2. error-code catalogues ───────────────────────────────────────────── */
console.log('\nCODE CATALOGUES');
for (const [file, convention] of [
  ['error-codes.json', /^error\.[a-z0-9_]+\.[a-z0-9_]+$/],
  ['field-error-codes.json', /^error\.field\.[a-z0-9_]+$/],
]) {
  const path = join(CONTRACTS, file);
  if (!existsSync(path)) {
    fail(file, 'missing');
    continue;
  }
  const dups = duplicateKeys(readRaw(path));
  if (dups.length) fail(file, `duplicate JSON key(s): ${dups.join(', ')}`);

  const c = readJson(path);
  const names = Object.keys(c.codes);
  const values = Object.values(c.codes);

  if (names.length === 0) fail(file, 'no codes');

  const badName = names.filter((n) => !/^[A-Z][A-Z0-9_]*$/.test(n));
  if (badName.length) fail(file, `not SCREAMING_SNAKE: ${badName.join(', ')}`);

  const badValue = values.filter((v) => !convention.test(v));
  if (badValue.length)
    fail(file, `value(s) off-convention (${convention}): ${badValue.join(', ')}`);

  const dupValue = dupsOf(values);
  if (dupValue.length)
    fail(file, `two names share one wire value: ${dupValue.join(', ')}`);

  // The Dart emit lowerCamels each name; a collision would drop a constant.
  const dartNames = names.map((n) => n.toLowerCase().replace(/_(.)/g, (_, x) => x.toUpperCase()));
  const dupDart = dupsOf(dartNames);
  if (dupDart.length) fail(file, `Dart identifier collision: ${dupDart.join(', ')}`);

  if (!c.$meta?.description) fail(file, '$meta.description is required');

  ok(`${file} — ${names.length} codes, unique names + values, Dart-safe`);
}

/* field-error params must line up with the codes they annotate */
{
  const c = readJson(join(CONTRACTS, 'field-error-codes.json'));
  const missing = Object.keys(c.codes).filter((n) => !(n in (c.params ?? {})));
  const extra = Object.keys(c.params ?? {}).filter((n) => !(n in c.codes));
  if (missing.length) fail('field-error-codes.json', `params missing for: ${missing.join(', ')}`);
  if (extra.length) fail('field-error-codes.json', `params for unknown code(s): ${extra.join(', ')}`);
  if (!missing.length && !extra.length) ok('field-error params cover exactly the field-error codes');
}

/* ── 3. enums ───────────────────────────────────────────────────────────── */
console.log('\nENUMS');
const enumDir = join(CONTRACTS, 'enums');
const enumFiles = existsSync(enumDir)
  ? readdirSync(enumDir).filter((f) => f.endsWith('.json')).sort()
  : [];
if (enumFiles.length === 0) fail('contracts/enums', 'no enum contracts found');

const seenPascal = new Set();
for (const f of enumFiles) {
  const where = `enums/${f}`;
  const dups = duplicateKeys(readRaw(join(enumDir, f)));
  if (dups.length) fail(where, `duplicate JSON key(s): ${dups.join(', ')}`);

  const c = readJson(join(enumDir, f));
  const values = c.values ?? [];
  const deprecated = c.deprecated ?? [];
  const aliases = c.aliases ?? {};
  const subsets = c.subsets ?? {};
  const known = new Set([...values, ...deprecated]);

  if (values.length === 0) fail(where, 'enum is EMPTY — an empty contract admits nothing');

  const dupV = dupsOf(values);
  if (dupV.length) fail(where, `duplicate value(s): ${dupV.join(', ')}`);

  const dupD = dupsOf(deprecated);
  if (dupD.length) fail(where, `duplicate deprecated value(s): ${dupD.join(', ')}`);

  const bothVD = deprecated.filter((v) => values.includes(v));
  if (bothVD.length)
    fail(where, `value(s) both canonical AND deprecated: ${bothVD.join(', ')}`);

  // The headline invariant: an alias that is also a canonical value is a no-op
  // that reads like a rename. Whatever it was meant to redirect never gets
  // redirected, and nothing anywhere errors.
  const aliasIsValue = Object.keys(aliases).filter((a) => values.includes(a));
  if (aliasIsValue.length)
    fail(where, `alias(es) collide with a canonical value: ${aliasIsValue.join(', ')}`);

  const aliasIsDeprecated = Object.keys(aliases).filter((a) => deprecated.includes(a));
  if (aliasIsDeprecated.length)
    fail(where, `alias(es) collide with a deprecated value: ${aliasIsDeprecated.join(', ')}`);

  const danglingTarget = Object.entries(aliases)
    .filter(([, to]) => !known.has(to))
    .map(([from, to]) => `${from} → ${to}`);
  if (danglingTarget.length)
    fail(where, `alias target(s) are not a value: ${danglingTarget.join(', ')}`);

  for (const [name, members] of Object.entries(subsets)) {
    if (members.length === 0) fail(where, `subset "${name}" is empty`);
    const outside = members.filter((v) => !values.includes(v));
    if (outside.length)
      fail(where, `subset "${name}" has member(s) outside values: ${outside.join(', ')}`);
    const dupS = dupsOf(members);
    if (dupS.length) fail(where, `subset "${name}" repeats: ${dupS.join(', ')}`);
  }

  const meta = c.$meta ?? {};
  if (!meta.name) fail(where, '$meta.name is required (it names the generated symbols)');
  if (!meta.description) fail(where, '$meta.description is required');
  if (!['preserve', 'reject'].includes(meta.onUnknown))
    fail(where, `$meta.onUnknown must be "preserve" or "reject", got ${JSON.stringify(meta.onUnknown)}`);
  if (!['exact', 'case-insensitive'].includes(meta.aliasMatch ?? 'exact'))
    fail(where, `$meta.aliasMatch must be "exact" or "case-insensitive", got ${JSON.stringify(meta.aliasMatch)}`);
  if (meta.name && !/^[A-Z][A-Za-z0-9]*$/.test(meta.name))
    fail(where, `$meta.name must be PascalCase, got ${meta.name}`);
  if (meta.name && seenPascal.has(meta.name))
    fail(where, `$meta.name "${meta.name}" is used by another enum — the exports would clash`);
  seenPascal.add(meta.name);

  // Under case-insensitive matching, two values that differ only in case are
  // indistinguishable on the wire.
  if (meta.aliasMatch === 'case-insensitive') {
    const folded = [...values, ...Object.keys(aliases)].map((v) => v.toLowerCase());
    const dupF = dupsOf(folded);
    if (dupF.length)
      fail(where, `case-insensitive collision(s): ${dupF.join(', ')}`);
  }

  ok(
    `${where} — ${values.length} values`
    + (deprecated.length ? `, ${deprecated.length} deprecated` : '')
    + (Object.keys(aliases).length ? `, ${Object.keys(aliases).length} aliases` : '')
    + (Object.keys(subsets).length ? `, ${Object.keys(subsets).length} subsets` : ''),
  );
}

/* ── 4. rules ───────────────────────────────────────────────────────────── */
console.log('\nRULES');
const ruleDir = join(CONTRACTS, 'rules');
const ruleFiles = existsSync(ruleDir)
  ? readdirSync(ruleDir).filter((f) => f.endsWith('.json')).sort()
  : [];
const allRules = {};
for (const f of ruleFiles) {
  const where = `rules/${f}`;
  const dups = duplicateKeys(readRaw(join(ruleDir, f)));
  if (dups.length) fail(where, `duplicate JSON key(s): ${dups.join(', ')}`);

  const c = readJson(join(ruleDir, f));
  for (const [k, v] of Object.entries(c.rules ?? {})) {
    if (k in allRules) fail(where, `rule "${k}" is also declared in ${allRules[k]}`);
    allRules[k] = f;
    if (!Number.isInteger(v))
      fail(where, `rule "${k}" must be an integer (it is emitted as a Dart int), got ${JSON.stringify(v)}`);
    if (!/^[a-z][A-Za-z0-9]*$/.test(k))
      fail(where, `rule "${k}" must be lowerCamelCase — it becomes an identifier in two languages`);
  }
  // A min above its max is the one bound error that reads as correct.
  for (const k of Object.keys(c.rules ?? {})) {
    if (!k.endsWith('Min')) continue;
    const maxKey = `${k.slice(0, -3)}Max`;
    if (maxKey in c.rules && c.rules[k] > c.rules[maxKey])
      fail(where, `${k} (${c.rules[k]}) is greater than ${maxKey} (${c.rules[maxKey]})`);
  }
  ok(`${where} — ${Object.keys(c.rules ?? {}).length} bounds, integer + uniquely named`);
}

/* ── report ─────────────────────────────────────────────────────────────── */
if (problems.length) {
  console.error(`\n✗ ${problems.length} contract problem(s):`);
  for (const p of problems) console.error(`    ${p}`);
  process.exit(1);
}
console.log(`\n✓ ${checks} contract check(s) passed`);
