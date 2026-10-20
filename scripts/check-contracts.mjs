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
 *        · failure kinds: every kind declares retry / savedOnWrite /
 *          showReference / toast from the declared vocabulary, and ERRORS.md
 *          documents exactly these kinds, with the same retry, saved state
 *          and reference (the first word of each cell)
 *        · the classify table: every rule names a real kind, ERRORS.md
 *          section 4 lists the same rules and statuses, and every
 *          error-codes.json value runs through it: no outage inferred from
 *          an _unavailable suffix, every *.not_found / *_not_found code
 *          reaches not_found
 *        · the error envelope: genericCodes ⊂ error-codes.json, every field
 *          typed and documented, status/errorCode/message required
 *        · the generic error phrases: every required locale present, no
 *          empty list where one is required, no duplicate, every phrase
 *          already normalized and caught by the scanner as a message
 *        · ERRORS.md cites only rule IDs principles/ defines
 *
 * Run: node scripts/check-contracts.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { normalize, matchGeneric } from './check-error-copy.mjs';
import { readPrinciples } from './principles.mjs';

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
const phraseFiles = [];
for (const f of ruleFiles) {
  const where = `rules/${f}`;
  const dups = duplicateKeys(readRaw(join(ruleDir, f)));
  if (dups.length) fail(where, `duplicate JSON key(s): ${dups.join(', ')}`);

  const c = readJson(join(ruleDir, f));
  if (c.phrases) { phraseFiles.push(f); continue; }
  if (!c.rules) { fail(where, 'holds neither `rules` (bounds) nor `phrases` (generic error phrases); build.mjs would refuse it'); continue; }
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

/* ── 5. failure kinds ───────────────────────────────────────────────────── */
console.log('\nFAILURE KINDS');
{
  const where = 'failure-kinds.json';
  const path = join(CONTRACTS, where);
  const dups = duplicateKeys(readRaw(path));
  if (dups.length) fail(where, `duplicate JSON key(s): ${dups.join(', ')}`);
  const c = readJson(path);
  const attrs = c.$meta?.attributes ?? {};
  const kinds = Object.entries(c.kinds ?? {});
  if (kinds.length === 0) fail(where, 'no kinds: an empty vocabulary classifies nothing');
  if (!c.$meta?.description) fail(where, '$meta.description is required');
  for (const [kind, k] of kinds) {
    if (!/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/.test(kind)) fail(where, `kind "${kind}" must be snake_case (it is a wire value and a Dart lowerCamel constant)`);
    if (!k.meaning) fail(where, `kind "${kind}" has no meaning`);
    for (const attr of ['retry', 'savedOnWrite', 'toast']) {
      if (!(attr in k)) fail(where, `kind "${kind}" does not declare ${attr}`);
      else if (!(k[attr] in (attrs[attr] ?? {}))) fail(where, `kind "${kind}": ${attr} "${k[attr]}" is not one of ${Object.keys(attrs[attr] ?? {}).join(', ')}`);
    }
    if (typeof k.showReference !== 'boolean') fail(where, `kind "${kind}" must declare showReference as true or false`);
    if ('where' in k && (!Array.isArray(k.where) || k.where.length === 0 || dupsOf(k.where).length)) fail(where, `kind "${kind}": where must be a non-empty list without repeats`);
  }
  const camels = kinds.map(([kind]) => kind.replace(/_(.)/g, (_, x) => x.toUpperCase()));
  const dupCamel = dupsOf(camels);
  if (dupCamel.length) fail(where, `Dart identifier collision: ${dupCamel.join(', ')}`);
  const reserved = ['values', 'retry', 'savedOnWrite', 'showReference', 'silent', 'unreachableWhere', 'where'];
  const clash = camels.filter((n) => reserved.includes(n));
  if (clash.length) fail(where, `kind name(s) collide with a BabelFailureKind member: ${clash.join(', ')}`);

  // ERRORS.md documents the kinds in one table; it must list exactly these,
  // and agree on the attributes the copy depends on. Each cell's first word
  // is the value: `after (automatic)` → after, `**unknown** (…)` → unknown,
  // `yes (minted)` → true.
  const doc = readRaw(join(ROOT, 'ERRORS.md'));
  const firstWord = (cell) => cell.replace(/\*\*/g, '').trim().split(/[\s(]/)[0];
  const rows = [...doc.matchAll(/^\| `([a-z_]+)` \|(.*)\|\s*$/gm)].map((m) => [m[1], m[2].split(' | ').map((c) => c.trim())]);
  const table = rows.map(([kind]) => kind);
  const names = kinds.map(([kind]) => kind);
  const missingDoc = names.filter((n) => !table.includes(n));
  const extraDoc = table.filter((n) => !names.includes(n));
  if (missingDoc.length) fail('ERRORS.md', `the failure-kind table lacks: ${missingDoc.join(', ')}`);
  if (extraDoc.length) fail('ERRORS.md', `the failure-kind table lists kinds the contract does not: ${extraDoc.join(', ')}`);
  for (const [kind, cells] of rows) {
    const k = c.kinds[kind];
    if (!k) continue;
    if (cells.length !== 4) { fail('ERRORS.md', `failure-kind row "${kind}" has ${cells.length + 1} cells, not 5 (Kind, Meaning, Retry, Saved, Ref)`); continue; }
    const [, retry, saved, ref] = cells.map(firstWord);
    if (retry !== k.retry) fail('ERRORS.md', `"${kind}": Retry says ${retry}, the contract says ${k.retry}`);
    if (saved !== k.savedOnWrite) fail('ERRORS.md', `"${kind}": Saved says ${saved}, the contract says ${k.savedOnWrite}`);
    if (!['yes', 'no'].includes(ref)) fail('ERRORS.md', `"${kind}": Ref must start with yes or no, got ${ref}`);
    else if ((ref === 'yes') !== k.showReference) fail('ERRORS.md', `"${kind}": Ref says ${ref}, the contract says showReference ${k.showReference}`);
  }
  ok(`${where} — ${kinds.length} kinds, each with retry/savedOnWrite/showReference/toast; ERRORS.md lists the same ${table.length}, with the same retry, saved state and reference`);

  /* the classify table: section 4, step 4, as data */
  const cls = c.classify ?? {};
  const codeRules = cls.codes ?? [];
  if (codeRules.length === 0) fail(where, 'classify.codes is empty');
  const globRe = (p) => new RegExp(`^${p.split('*').map((x) => x.replace(/[.]/g, '\\.')).join('[a-z0-9_.]*')}$`);
  for (const [i, r] of codeRules.entries()) {
    if (!(r.kind in c.kinds)) fail(where, `classify.codes[${i}]: kind "${r.kind}" is not a kind`);
    if (!Array.isArray(r.match) || r.match.length === 0) fail(where, `classify.codes[${i}]: match must be a non-empty list`);
    for (const p of r.match ?? []) {
      if (!/^[a-z0-9_.*]+$/.test(p)) fail(where, `classify.codes[${i}]: pattern "${p}" may hold only a-z 0-9 _ . *`);
      // An outage is never inferred from a suffix: `*_unavailable` would turn
      // a 409 "passkeys are not available on this site" into "the service is down".
      if (r.kind === 'unavailable' && /^\*[._]?unavailable$/.test(p)) fail(where, `classify.codes[${i}]: "${p}" infers an outage from a suffix; name the outage codes`);
    }
    if (r.where && !(c.kinds[r.kind]?.where ?? []).includes(r.where)) fail(where, `classify.codes[${i}]: where "${r.where}" is not one of ${r.kind}'s`);
  }
  for (const [st, kind] of Object.entries(cls.status ?? {})) {
    if (!/^(?:[1-5]\d\d|[45]xx)$/.test(st)) fail(where, `classify.status: "${st}" is neither a status nor 4xx/5xx`);
    if (!(kind in c.kinds)) fail(where, `classify.status.${st}: "${kind}" is not a kind`);
  }
  if (!cls.status?.['4xx'] || !cls.status?.['5xx']) fail(where, 'classify.status must end with 4xx and 5xx, so no status is left unclassified');
  const classifyCode = (code) => {
    for (const r of codeRules) if ((r.match ?? []).some((p) => globRe(p).test(code))) return r.kind;
    return null;
  };

  // Every code the API declares, through the rules.
  const allCodes = readJson(join(CONTRACTS, 'error-codes.json')).codes;
  let matched = 0;
  for (const [name, value] of Object.entries(allCodes)) {
    const kind = classifyCode(value);
    if (kind) matched += 1;
    const last = value.split('.').at(-1);
    if ((last === 'not_found' || last.endsWith('_not_found')) && !value.startsWith('error.session.') && !value.startsWith('error.subscription.') && !last.endsWith('route_not_found') && kind !== 'not_found') {
      fail(where, `${name} (${value}) is a not-found code but classifies as ${kind ?? 'nothing (status fallback)'}`);
    }
    if (kind === 'unavailable' && /_unavailable$/.test(last) && !codeRules.some((r) => r.kind === 'unavailable' && r.match.includes(value)) && !/\.ai_unavailable$/.test(value)) {
      fail(where, `${name} (${value}) classifies as an outage only by its suffix`);
    }
  }
  // The refusals that once read as outages (program finding, 2026-10-20).
  for (const name of ['PASSKEY_UNAVAILABLE', 'SCHEDULE_BANK_AUTOPAY_UNAVAILABLE', 'SCHEDULE_COLLECT_NOW_UNAVAILABLE', 'INFORMATION_SHARE_UNAVAILABLE']) {
    if (name in allCodes && classifyCode(allCodes[name]) === 'unavailable') fail(where, `${name} is a 4xx refusal, not an outage`);
  }
  for (const [name, kind] of [['SERVICE_UNAVAILABLE', 'unavailable'], ['INTERNAL_ERROR', 'server_bug'], ['UNIT_NOT_FOUND', 'not_found'], ['ASSOCIATION_NOT_FOUND', 'not_found'], ['SESSION_EXPIRED', 'session_ended'], ['DATABASE_BUSY', 'busy']]) {
    if (classifyCode(allCodes[name]) !== kind) fail(where, `${name} (${allCodes[name]}) should classify as ${kind}, got ${classifyCode(allCodes[name])}`);
  }

  // ERRORS.md section 4, step 4 lists the same rules and statuses.
  const step4 = doc.split('4. **Our envelope.**')[1]?.split('\n5. ')[0] ?? '';
  if (!step4) fail('ERRORS.md', 'section 4 has no "4. **Our envelope.**" step');
  const docPairs = new Set();
  for (const line of step4.split('\n')) {
    const m = line.match(/^\s+- (.+?) → (.+)$/);
    if (!m) continue;
    // The kind is the first backticked kind name after the arrow
    // ("→ a silent refetch, then `session_ended`").
    const kind = [...m[2].matchAll(/`([a-z_]+)`/g)].map((x) => x[1]).find((x) => x in c.kinds);
    if (!kind) { fail('ERRORS.md', `section 4, step 4: no kind after the arrow in "${line.trim()}"`); continue; }
    for (const [, p] of m[1].matchAll(/`([a-z0-9_.*]+)`/g)) if (/[.*]/.test(p)) docPairs.add(`${p} → ${kind}`);
  }
  const jsonPairs = new Set(codeRules.flatMap((r) => (r.match ?? []).map((p) => `${p} → ${r.kind}`)));
  const onlyDoc = [...docPairs].filter((x) => !jsonPairs.has(x));
  const onlyJson = [...jsonPairs].filter((x) => !docPairs.has(x));
  if (onlyDoc.length) fail('ERRORS.md', `section 4 maps codes classify does not: ${onlyDoc.join('; ')}`);
  if (onlyJson.length) fail('ERRORS.md', `section 4 lacks classify rules: ${onlyJson.join('; ')}`);
  const docStatus = {};
  for (const m of step4.replace(/\s+/g, ' ').matchAll(/((?:\d{3}\/)*\d{3}|any other [45]xx) → `([a-z_]+)`/g)) {
    const keys = m[1].startsWith('any other') ? [m[1].slice(-3)] : m[1].split('/');
    for (const k of keys) docStatus[k] = m[2];
  }
  const statusDiff = [...new Set([...Object.keys(docStatus), ...Object.keys(cls.status ?? {})])]
    .filter((k) => docStatus[k] !== cls.status?.[k]).map((k) => `${k}: doc ${docStatus[k] ?? '—'}, contract ${cls.status?.[k] ?? '—'}`);
  if (statusDiff.length) fail('ERRORS.md', `section 4's status fallback differs from classify.status: ${statusDiff.join('; ')}`);
  ok(`classify — ${codeRules.length} code rules (ERRORS.md lists the same), ${Object.keys(cls.status ?? {}).length} statuses; ${matched} of ${Object.keys(allCodes).length} error codes match a rule, the rest fall back to their status`);
}

/* ── 6. error envelope ──────────────────────────────────────────────────── */
console.log('\nERROR ENVELOPE');
{
  const where = 'error-envelope.json';
  const path = join(CONTRACTS, where);
  const dups = duplicateKeys(readRaw(path));
  if (dups.length) fail(where, `duplicate JSON key(s): ${dups.join(', ')}`);
  const c = readJson(path);
  const codes = readJson(join(CONTRACTS, 'error-codes.json')).codes;
  const generic = c.genericCodes ?? [];
  if (generic.length === 0) fail(where, 'genericCodes is empty');
  const outside = generic.filter((n) => !(n in codes));
  if (outside.length) fail(where, `genericCodes not in error-codes.json: ${outside.join(', ')}`);
  const dupG = dupsOf(generic);
  if (dupG.length) fail(where, `genericCodes repeats: ${dupG.join(', ')}`);
  const fields = c.fields ?? {};
  for (const req of ['status', 'errorCode', 'message']) {
    if (fields[req]?.required !== true) fail(where, `field "${req}" must be required`);
  }
  for (const [name, f] of Object.entries(fields)) {
    if (!f.type || !f.doc || typeof f.required !== 'boolean') fail(where, `field "${name}" needs type, required (true/false) and doc`);
    if (name.includes('.') && !(name.split('.')[0] in fields)) fail(where, `field "${name}" nests under a field the envelope does not declare`);
    for (const alt of f.alsoReadFrom ?? []) {
      if (!alt.startsWith('header:') && !/^[a-z][A-Za-z.]*$/.test(alt)) fail(where, `field "${name}": alsoReadFrom "${alt}" is neither a body path nor header:<Name>`);
    }
  }
  const gateKinds = c.gate?.kinds ?? [];
  if (gateKinds.length === 0 || dupsOf(gateKinds).length) fail(where, 'gate.kinds must be a non-empty list without repeats');
  for (const k of ['serverLength', 'clientLength']) {
    if (!Number.isInteger(c.reference?.[k]) || c.reference[k] < 4) fail(where, `reference.${k} must be an integer of at least 4`);
  }
  if (!c.reference?.clientPrefix) fail(where, 'reference.clientPrefix is required');
  ok(`${where} — ${Object.keys(fields).length} fields, ${generic.length} generic codes all in error-codes.json`);
}

/* ── 7. generic error phrases ───────────────────────────────────────────── */
console.log('\nGENERIC ERROR PHRASES');
{
  // en, fr, es, zh: Babel's admin + mobile and Rendee; pt: Babel's website;
  // the rest: Babel's chatbot. A guard for a locale with no list checks nothing.
  const REQUIRED = ['en', 'fr', 'es', 'zh', 'pt', 'ar', 'de', 'it', 'ja', 'ko', 'ru'];
  if (phraseFiles.length !== 1) fail('rules/', `expected exactly one phrases file, found ${phraseFiles.length}: ${phraseFiles.join(', ')}`);
  for (const f of phraseFiles) {
    const where = `rules/${f}`;
    const c = readJson(join(ruleDir, f));
    const missing = REQUIRED.filter((l) => !(l in c.phrases));
    if (missing.length) fail(where, `missing locale(s): ${missing.join(', ')}`);
    let n = 0;
    // causeless needs filler + causeWords; the space-less scripts (ja, ko)
    // may leave all three empty, the languages of the admin and app may not.
    const CAUSELESS_REQUIRED = ['en', 'fr', 'es', 'zh'];
    for (const [locale, lists] of Object.entries(c.phrases)) {
      for (const mode of ['whole', 'opening', 'anywhere', 'causeless', 'filler', 'causeWords']) {
        const list = lists[mode];
        if (!Array.isArray(list)) { fail(where, `${locale}.${mode} must be a list`); continue; }
        if (['opening', 'anywhere'].includes(mode) && list.length === 0) fail(where, `${locale}.${mode} is empty: that locale's guard would catch nothing`);
        if (['causeless', 'filler'].includes(mode) && list.length === 0 && CAUSELESS_REQUIRED.includes(locale)) fail(where, `${locale}.${mode} is empty: "could not …, please try again" would pass in ${locale}`);
        const dupP = dupsOf(list);
        if (dupP.length) fail(where, `${locale}.${mode} repeats: ${dupP.join(', ')}`);
        for (const phrase of list) {
          n += 1;
          if (normalize(phrase) !== phrase) fail(where, `${locale}.${mode} "${phrase}" is not normalized (expected "${normalize(phrase)}"); it would never match`);
          // Each banned phrase, said as a whole message, must be caught in its
          // own locale. filler and causeWords are not banned on their own.
          else if (!['filler', 'causeWords'].includes(mode) && !matchGeneric(c.phrases, phrase, [locale])) fail(where, `${locale}.${mode} "${phrase}" is not caught by check-error-copy.mjs as a message`);
        }
      }
      if ((lists.causeless ?? []).length && !(lists.filler ?? []).length) fail(where, `${locale}: causeless without filler`);
    }
    ok(`${where} — ${Object.keys(c.phrases).length} locales, ${n} phrases, normalized and each caught by the scanner`);
  }
}

/* ── 8. ERRORS.md cites only defined rules ──────────────────────────────── */
console.log('\nERRORS.md');
{
  const { principles } = readPrinciples(join(ROOT, 'principles'));
  const doc = readRaw(join(ROOT, 'ERRORS.md'));
  const cited = [...new Set([...doc.matchAll(/`([A-Z][A-Z0-9]*(?:-[A-Z][A-Z0-9]*)*-[1-9]\d*)`/g)].map((m) => m[1]))];
  const dangling = cited.filter((id) => !principles[id]);
  if (dangling.length) fail('ERRORS.md', `cites rule ID(s) no principles file defines: ${dangling.join(', ')}`);
  if (/^### [A-Z][A-Z0-9]*(?:-[A-Z][A-Z0-9]*)*-[1-9]\d* · /m.test(doc)) fail('ERRORS.md', 'holds a rule heading; rules live in principles/, ERRORS.md only cites them');
  ok(`ERRORS.md — ${cited.length} cited rule IDs, all defined`);
}

/* ── report ─────────────────────────────────────────────────────────────── */
if (problems.length) {
  console.error(`\n✗ ${problems.length} contract problem(s):`);
  for (const p of problems) console.error(`    ${p}`);
  process.exit(1);
}
console.log(`\n✓ ${checks} contract check(s) passed`);
