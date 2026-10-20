/**
 * check-error-copy.mjs, pinned: what it catches, what it leaves alone, and
 * the exact baseline.
 *
 * The scanner is vendored into every app, so a regression here reddens (or,
 * worse, silently blinds) every consumer's guard. Each property below fails
 * in one direction or the other: a phrase it stops catching lets generic copy
 * ship; a label it starts catching turns a baseline into noise.
 *
 * Also checks the standard against itself: every sentence ERRORS.md offers as
 * good copy must pass, and the screenshot case it rewrites must fail before
 * and pass after.
 *
 * Run: node scripts/__tests__/error-copy.test.mjs
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  compare, extractLiterals, lowerBaseline, matchGeneric, normalize, readsAsProse, scan,
  catalogueTitlePairs, catalogueLocale,
} from '../check-error-copy.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');
const script = join(here, '..', 'check-error-copy.mjs');
const fixtures = join(here, '..', '__fixtures__', 'error-copy');
const configPath = join(fixtures, 'error-copy.config.json');
const phrases = JSON.parse(readFileSync(join(repo, 'contracts', 'rules', 'generic-error-phrases.json'), 'utf8')).phrases;

let failures = 0;
const fail = (msg) => { console.error(`✗ ${msg}`); failures += 1; };
const eq = (label, got, want) => {
  if (JSON.stringify(got) !== JSON.stringify(want)) fail(`${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
};

/* ── 1. phrase matching ── */
const caught = (msg, locales = null) => Boolean(matchGeneric(phrases, msg, locales));
for (const msg of [
  'Something went wrong.',
  'Something went wrong. Try again in a moment.',
  'Still not responding.',
  'That didn’t work',                        // curly apostrophe
  'Failed to load tasks',
  'Error: connection refused',
  'Error',
  '❌ An error occurred',                    // leading emoji
  'Tasks could not be loaded. Please try again later.',
  'Saved. Our team has been notified.',
]) if (!caught(msg, ['en'])) fail(`en: should be caught: ${JSON.stringify(msg)}`);
for (const msg of [
  'Une erreur est survenue. Réessayez.',
  'Une\u00A0erreur est survenue\u202F!', // no-break spaces, as French typesetting puts them
  'Réessayez plus tard.',
  'Échec du chargement',
]) if (!caught(msg, ['fr'])) fail(`fr: should be caught: ${JSON.stringify(msg)}`);
if (!caught('请稍后重试', ['zh'])) fail('zh: 请稍后重试 should be caught (no word boundary in Han)');
if (!caught('出现错误，请重试', ['zh'])) fail('zh: an opening followed by more Han text should be caught');
if (!caught('Algo salió mal', ['es'])) fail('es: Algo salió mal should be caught');
if (!caught('عذرًا، حدث خطأ ما', ['ar'])) fail('ar: tashkil must be normalized away');
for (const msg of [
  'Errors in 3 fields',                        // "error" is a word boundary away from "errors"
  'Failed payments',                           // a filter label, not a message
  'Try again',                                 // a button label
  'The invoice was not saved',
  "The admin panel's server stopped answering at 14:02.",
  'Terror',                                    // no boundary before "error"
]) if (caught(msg, ['en'])) fail(`en: should NOT be caught: ${JSON.stringify(msg)} (${JSON.stringify(matchGeneric(phrases, msg, ['en']))})`);
if (caught('Something went wrong', ['fr'])) fail('a catalogue is checked against its own locale only');
if (!caught('Something went wrong')) fail('a source literal (no locale) is checked against every locale');
eq('normalize', normalize('  ⚠️ Une  erreur est   survenue ’ '), "une erreur est survenue '");

/* ── 2. source literals ── */
{
  const { strings } = extractLiterals("const a = 'Something went ' +\n  'wrong.';\nconst b = ['x', 'y'];", '.ts');
  eq('JS: adjacent literals joined across + and a newline', strings.map((s) => s.value), ['Something went wrong.', 'x', 'y']);
}
{
  const { strings } = extractLiterals("final a = 'Oops! ' 'Something';\nfinal b = 'x' + 'y';", '.dart');
  eq('Dart: juxtaposed and + literals joined', strings.map((s) => s.value), ['Oops! Something', 'xy']);
}
{
  const { strings } = extractLiterals("const re = /['\"]/g;\nconst m = 'After the regex';", '.ts');
  eq('a quote inside a regex literal does not open a string', strings.map((s) => s.value), ['After the regex']);
}
{
  const { strings } = extractLiterals('const t = `Error: ${err.message} (${a + "b"})`;', '.ts');
  eq('template interpolation becomes {}', strings.map((s) => s.value), ['Error: {} ({})']);
}
{
  const { strings } = extractLiterals("const x = <p>That didn't work, so we'll stop.</p>;\nconst y = 'next';", '.tsx');
  eq('JSX apostrophes do not open strings', strings.map((s) => s.value).sort(), ["That didn't work, so we'll stop.", 'next'].sort());
}
{
  const { strings } = extractLiterals("console.error('Something went wrong', e);\nlogger.warn(`Failed to sync`);\nshow('Something went wrong');", '.ts');
  eq('log call arguments are marked, others are not', strings.map((s) => s.logged), [true, true, false]);
}
eq('readsAsProse', ['failed', 'error.generic.internal', 'common_error_generic_message', 'Failed', 'try again later', '出现错误'].map(readsAsProse),
  [false, false, false, true, true, true]);

/* ── 3. catalogues ── */
eq('title/body siblings', catalogueTitlePairs({
  a_title: 'Saved', a_message: 'Saved.',                       // equal
  b_title: 'Oops', b_description_message: 'Oops. Try again.',   // body opens with the title
  c_title: 'The tasks did not load', c_message: 'The server did not answer.', // fine
  'd.title': 'Done', 'd.body': 'Done!',                          // nested
  e_title: 'Saved', e_button_label: 'Saved',                     // a label is not a body
}).map((p) => `${p.titleKey}>${p.bodyKey}`), ['a_title>a_message', 'b_title>b_description_message', 'd.title>d.body']);
const known = new Set(Object.keys(phrases));
eq('locale from the file name', ['src/i18n/fr.json', 'lib/l10n/app_zh.arb', 'public/locales/es/translation.json', 'src/i18n/messages.json']
  .map((f) => catalogueLocale(f, known)), ['fr', 'zh', 'es', null]);

/* ── 4. the fixture app, end to end ── */
const EXPECTED = [
  'i18n/en.json#common_error_generic_message generic',
  'i18n/en.json#error_page_description_message generic',
  'i18n/en.json#error_page_title generic',
  'i18n/en.json#error_page_title title-repeats error_page_description_message',
  'i18n/en.json#nested.dialog.title title-repeats nested.dialog.body',
  'i18n/en.json#payments_status_failed_label generic',
  'i18n/en.json#tasks_load_failed_title title-repeats tasks_load_failed_message',
  'i18n/fr.json#common_error_generic_message generic',
  'src/error-recovery.tsx: "saved" title-repeats',
  'src/error-recovery.tsx: "something went wrong. try again in a moment." generic',
  'src/error-recovery.tsx: "something went wrong." generic',
  'src/error-recovery.tsx: "still not responding." generic',
  'src/error-recovery.tsx: "that didn\'t work, so we\'ll stop." generic',
  'src/screen.dart: "error: $e" generic',
  'src/screen.dart: "oops! something went wrong" generic',
  'src/screen.dart: "réessayez plus tard." generic',
  'src/split.ts counter:rendered-err-message',
  'src/split.ts: "error: {}" generic',
  'src/split.ts: "something went wrong. try again." generic',
];
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const findings = scan(config, fixtures);
eq('fixture findings (test file, doc comment, log call, wire value and good copy skipped)', [...findings.keys()].sort(), [...EXPECTED].sort());
const baseline = JSON.parse(readFileSync(join(fixtures, 'baseline.json'), 'utf8')).findings;

{
  const r = compare(findings, baseline, config.allow);
  eq('committed fixture baseline is exact', [r.over.length, r.under.length, r.staleAllow.length, r.allowed], [0, 0, 0, 1]);
}
{
  const { [EXPECTED[0]]: _dropped, ...without } = baseline;
  const r = compare(findings, without, config.allow);
  eq('a finding the baseline lacks is NEW and fails', r.over.map((o) => [o.id, o.base]), [[EXPECTED[0], 0]]);
}
{
  const r = compare(findings, { ...baseline, [EXPECTED[0]]: 2, 'gone.json#k generic': 1 }, config.allow);
  eq('a baseline above the real count fails until lowered', r.under.map((u) => u.id).sort(), [EXPECTED[0], 'gone.json#k generic'].sort());
}
{
  const r = compare(findings, baseline, { ...config.allow, 'nothing#matches generic': 'reason' });
  eq('an allow that matches nothing is stale', r.staleAllow, ['nothing#matches generic']);
}
{
  const raised = new Map(findings);
  raised.set(EXPECTED[0], { count: 3, detail: '' });
  const lowered = lowerBaseline(raised, { [EXPECTED[0]]: 1, 'gone.json#k generic': 4, [EXPECTED[1]]: 1 });
  eq('--update-baseline only lowers: never raises, never adds, drops fixed', lowered, { [EXPECTED[0]]: 1, [EXPECTED[1]]: 1 });
}

/* ── 5. the CLI ── */
{
  const out = execFileSync(process.execPath, [script, '--config', configPath], { encoding: 'utf8' });
  if (!/nothing new is generic/.test(out)) fail(`CLI on the fixture should pass:\n${out}`);
}
{
  const dir = mkdtempSync(join(tmpdir(), 'error-copy-'));
  try {
    const { [EXPECTED[1]]: _d, ...without } = baseline;
    const tmpBaseline = join(dir, 'baseline.json');
    writeFileSync(tmpBaseline, JSON.stringify({ findings: without }));
    const r = spawnSync(process.execPath, [script, '--config', configPath, '--baseline', tmpBaseline], { encoding: 'utf8' });
    if (r.status !== 1 || !r.stderr.includes(`NEW  ${EXPECTED[1]}`)) fail(`CLI: a new generic string should exit 1 naming it; got ${r.status}\n${r.stderr}`);
    const init = spawnSync(process.execPath, [script, '--config', configPath, '--baseline', tmpBaseline, '--init-baseline'], { encoding: 'utf8' });
    if (init.status !== 2) fail(`CLI: --init-baseline over an existing baseline should exit 2; got ${init.status}`);
    const lower = spawnSync(process.execPath, [script, '--config', configPath, '--baseline', tmpBaseline, '--update-baseline'], { encoding: 'utf8' });
    const after = JSON.parse(readFileSync(tmpBaseline, 'utf8')).findings;
    if (lower.status !== 1 || EXPECTED[1] in after) fail('CLI: --update-baseline must not add the new finding, and the run still fails');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/* ── 6. the standard against itself ── */
const doc = readFileSync(join(repo, 'ERRORS.md'), 'utf8');
{
  const table = doc.split('<!-- wording-table')[1]?.split('\n\n')[0] ?? '';
  const rows = table.split('\n').filter((l) => l.startsWith('| ') && !l.startsWith('| Kind') && !l.startsWith('| ---'));
  if (rows.length < 25) fail(`ERRORS.md wording table: only ${rows.length} rows parsed`);
  for (const row of rows) {
    const [, kind, en, fr] = row.split(' | ').map((c) => c.replace(/^\| |\s\|$/g, ''));
    if (caught(en, ['en'])) fail(`ERRORS.md wording "${kind}" EN is itself generic: ${en}`);
    if (caught(fr, ['fr'])) fail(`ERRORS.md wording "${kind}" FR est générique : ${fr}`);
  }
}
const BEFORE = ['Something went wrong.', 'Something went wrong. Try again in a moment.', 'Still not responding.'];
const AFTER = [
  'This page did not load',
  "The admin panel's server stopped answering at 14:02, so this page could not be fetched. Your connection is working; the problem is on our side. Nothing you saved before is affected.",
  'Not answering since 14:02 · 3 attempts · next try in 12 s',
  'Still not answering after 5 minutes (since 14:02). Automatic retries have stopped. Try again from this page when you are ready, or contact help@rendee.ca with the reference E-7F3C91.',
  'The booking service did not answer within 10 s, so the bookings did not load. Nothing you saved is affected. Next try in 12 s.',
];
for (const s of [...BEFORE, ...AFTER]) if (!doc.includes(s)) fail(`ERRORS.md no longer holds the screenshot line: ${s}`);
for (const s of BEFORE) if (!caught(s, ['en'])) fail(`screenshot BEFORE should be caught: ${s}`);
for (const s of AFTER) if (caught(s, ['en'])) fail(`screenshot AFTER should pass: ${s}`);
if (!catalogueTitlePairs({ x_title: BEFORE[0], x_message: BEFORE[1] }).length) fail('screenshot BEFORE: the body repeats the title and should be caught');
for (const s of AFTER) if (/\bRendee\b/.test(s)) fail(`RENDEE-ERROR-1: the admin's copy never names the brand: ${s}`);

if (failures) {
  console.error(`\n✗ error copy scanner: ${failures} failure(s)`);
  process.exit(1);
}
console.log('✓ error copy scanner: catches generic copy, leaves labels and wire values alone, exact baseline, ERRORS.md passes its own check');
