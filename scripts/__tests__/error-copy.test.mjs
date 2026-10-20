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
import { appendFileSync, cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  compare, extractLiterals, lowerBaseline, matchGeneric, normalize, readsAsProse, scan,
  catalogueTitlePairs, catalogueLocale, baselineRaised, allowAddedWithoutApproval,
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
  // the "Could not / Unable to … Please try again" family: an opening, no cause
  'Could not load the tasks. Please try again.',
  'Unable to load tasks.',
  'Unable to load transactions. Please try again.',
  'Unable to connect. Please try again.',
  "Couldn't save, sorry.",
  'Cannot connect',
  'An error occured. Please retry.',
  'Whoops!',
  'Load failed',                               // Safari's fetch TypeError
  'Request timed out',
  'Service unavailable',
]) if (!caught(msg, ['en'])) fail(`en: should be caught: ${JSON.stringify(msg)}`);
for (const msg of [
  'Une erreur est survenue. Réessayez.',
  'Une\u00A0erreur est survenue\u202F!', // no-break spaces, as French typesetting puts them
  'Réessayez plus tard.',
  'Échec du chargement',
  'Impossible de charger les tâches. Réessayez.',
  "Impossible d'enregistrer",                 // an elided opening needs no boundary
  'Veuillez réessayer.',
]) if (!caught(msg, ['fr'])) fail(`fr: should be caught: ${JSON.stringify(msg)}`);
if (!caught('No se pudo cargar. Por favor, inténtalo de nuevo.', ['es'])) fail('es: no se pudo + filler should be caught');
if (!caught('无法加载任务。请重试。', ['zh'])) fail('zh: 无法 + 请重试 should be caught');
if (!caught('Не удалось загрузить.', ['ru'])) fail('ru: не удалось with no cause should be caught');
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
  // the same openings WITH a cause pass
  'Could not save: the server did not answer within 30 s.',
  'Could not save the building because the server did not answer.',
  'Cannot delete this room: 3 bookings use it.',
  'The sign-in code could not be sent. Check the number and try again.',
]) if (caught(msg, ['en'])) fail(`en: should NOT be caught: ${JSON.stringify(msg)} (${JSON.stringify(matchGeneric(phrases, msg, ['en']))})`);
// Locale parity: a plain "try again" is a button label in every locale, and
// an opening that can carry a cause passes when one follows.
for (const [msg, locale] of [
  ['Réessayez', 'fr'], ['Inténtalo de nuevo', 'es'], ['Vuelve a intentarlo', 'es'], ['Tente novamente', 'pt'],
  ["Échec de l'enregistrement : le serveur n'a pas répondu en 30 s.", 'fr'],
  ['Не удалось загрузить: сервер не ответил за 30 с.', 'ru'],
  ['无法加载任务，因为服务器没有响应。', 'zh'],
]) if (caught(msg, [locale])) fail(`${locale}: should NOT be caught: ${JSON.stringify(msg)} (${JSON.stringify(matchGeneric(phrases, msg, [locale]))})`);
if (caught('Something went wrong', ['fr'])) fail('matchGeneric checks only the locales it is given');
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
{
  const tsx = (src) => extractLiterals(src, '.tsx').strings.map((s) => s.value);
  eq('JSX text beside an expression', tsx('const x = <p>Something went wrong. {reference}</p>;'), ['Something went wrong. {}']);
  eq('JSX text after an expression', tsx('const x = <p>Ref {ref}. Something went wrong</p>;'), ['Ref {}. Something went wrong']);
  eq('a quote in JSX text does not split it', tsx('const x = <p>Press "Retry". Something went wrong</p>;').at(-1), 'Press "Retry". Something went wrong');
  eq('pieces around inline tags are one message', tsx('const x = <p>Something went <b>wrong</b>.</p>;'), ['Something went wrong.']);
  eq('an arrow in an attribute is not JSX text', tsx('const x = <button onClick={() => go()}>Retry</button>;'), ['Retry']);
  eq('a ternary between elements is not JSX text', tsx('const x = ok ? <p>Yes</p> : error ? <Err /> : null;'), ['Yes']);
  eq('generics and comparisons are not JSX', tsx('const f = <T,>(x: T) => x; const s = useState<string>(null); const y = a < b && c > d;'), []);
  eq('JSX nested in an expression is read', tsx("const x = <div>{ok ? <b>Fine</b> : <span>Don't stop</span>}</div>;"), ['Fine', "Don't stop"]);
  eq('a tagged template is a string', extractLiterals('const v = html`Something went wrong`;', '.ts').strings.map((s) => s.value), ['Something went wrong']);
  const { code, source } = extractLiterals("toast(t('common_error_generic_message')); // t('x')", '.ts');
  eq('counters see literals in `source`, not in `code`; comments in neither', [/common_error/.test(source), /common_error/.test(code), /'x'/.test(source)], [true, false, false]);
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
  'i18n/en.json#bank_transactions_error_generic_message generic',
  'i18n/en.json#error_page_title title-repeats error_page_description_message',
  'i18n/en.json#nested.dialog.title title-repeats nested.dialog.body',
  'i18n/en.json#payments_status_failed_label generic',
  'i18n/en.json#tasks_load_failed_title title-repeats tasks_load_failed_message',
  'i18n/fr.json#common_error_generic_message generic',
  'i18n/fr.json#tasks_load_error_message generic',
  'i18n/fr.json#untranslated_line generic',          // English left in fr.json is checked against en too
  'src/error-recovery.tsx: "saved" title-repeats',
  'src/error-recovery.tsx: "something went wrong. try again in a moment." generic',
  'src/error-recovery.tsx: "something went wrong." generic',
  'src/error-recovery.tsx: "something went wrong. {}" generic',
  'src/error-recovery.tsx: "press \\"retry\\". something went wrong" generic',
  'src/error-recovery.tsx: "still not responding." generic',
  'src/error-recovery.tsx: "that didn\'t work, so we\'ll stop." generic',
  'src/screen.dart: "error: $e" generic',
  'src/screen.dart: "oops! something went wrong" generic',
  'src/screen.dart: "réessayez plus tard." generic',
  'src/split.ts counter:rendered-err-message',
  'src/split.ts: "error: {}" generic',
  'src/split.ts: "oops, that broke" generic',
  'src/split.ts: "something went wrong. try again." generic',
  'src/toast.ts counter:generic-key-fallback',
];
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const findings = scan(config, fixtures);
eq('fixture findings (test file, doc comment, log call, wire value, retry labels and good copy skipped)', [...findings.keys()].sort(), [...EXPECTED].sort());
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

{
  // A NEW call that falls back to the shared generic key fails, although the
  // key itself is already baselined in the catalogue.
  const dir = mkdtempSync(join(tmpdir(), 'error-copy-counter-'));
  try {
    cpSync(fixtures, dir, { recursive: true });
    appendFileSync(join(dir, 'src', 'toast.ts'), "export const again = (t, toast) => toast(t(\"common_error_generic_message\"));\n");
    const moved = scan({ ...config, phrases: join(repo, 'contracts', 'rules', 'generic-error-phrases.json') }, dir);
    const r = compare(moved, baseline, config.allow);
    eq('a new t(\'common_error_generic_message\') call fails the counter', r.over.map((o) => [o.id, o.count, o.base]), [['src/toast.ts counter:generic-key-fallback', 2, 1]]);
    const codeScope = scan({ ...config, phrases: join(repo, 'contracts', 'rules', 'generic-error-phrases.json'),
      counters: { k: { pattern: config.counters['generic-key-fallback'].pattern, scope: 'code' } } }, dir);
    eq('scope "code" empties literals, so a key is invisible to it', [...codeScope.keys()].filter((id) => id.includes('counter:')), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
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

/* ── 5b. the baseline only goes down: --base <git-ref> ── */
eq('baselineRaised: a raised or hand-added entry', baselineRaised({ a: 2, b: 1 }, { a: 3, b: 1, c: 1 }).map((r) => r.id), ['a', 'c']);
eq('baselineRaised: lowering and removing pass', baselineRaised({ a: 2, b: 1 }, { a: 1 }), []);
eq('allowAddedWithoutApproval', allowAddedWithoutApproval(
  { old: 'reason' },
  { old: 'reason', plain: 'a new reason', ok: { reason: 'status badge', approved: 'owner, 2026-10-21' }, half: { reason: 'x' } },
), ['plain', 'half']);
{
  const git = (cwd, ...args) => spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (git(tmpdir(), '--version').status !== 0) {
    fail('git is needed for the --base test');
  } else {
    const dir = mkdtempSync(join(tmpdir(), 'error-copy-base-'));
    try {
      cpSync(fixtures, dir, { recursive: true });
      const cfgPath = join(dir, 'error-copy.config.json');
      const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
      writeFileSync(cfgPath, JSON.stringify({ ...cfg, phrases: join(repo, 'contracts', 'rules', 'generic-error-phrases.json') }));
      for (const args of [['init', '-q'], ['config', 'user.email', 't@example.com'], ['config', 'user.name', 't'], ['add', '.'], ['commit', '-qm', 'base']]) git(dir, ...args);
      const run = () => spawnSync(process.execPath, [script, '--config', cfgPath, '--base', 'HEAD'], { encoding: 'utf8' });
      const clean = run();
      if (clean.status !== 0) fail(`--base on an unchanged baseline should pass; got ${clean.status}\n${clean.stderr}`);
      // A new generic string, with a hand-added baseline entry to match.
      appendFileSync(join(dir, 'src', 'split.ts'), "export const sneaky = 'Something went wrong here.';\n");
      const bPath = join(dir, 'baseline.json');
      const b = JSON.parse(readFileSync(bPath, 'utf8'));
      b.findings['src/split.ts: "something went wrong here." generic'] = 1;
      writeFileSync(bPath, JSON.stringify(b, null, 2));
      if (spawnSync(process.execPath, [script, '--config', cfgPath], { encoding: 'utf8' }).status !== 0) fail('without --base the hand-added entry passes (the hole --base closes)');
      const raised = run();
      if (raised.status !== 1 || !raised.stderr.includes('RAISED src/split.ts: "something went wrong here." generic')) fail(`--base: a hand-added baseline entry should fail; got ${raised.status}\n${raised.stderr}`);
      // An allow entry added without approval.
      git(dir, 'checkout', '-q', '--', '.');
      rmSync(join(dir, 'src', 'split.ts'));
      git(dir, 'checkout', '-q', '--', 'src/split.ts');
      const c2 = JSON.parse(readFileSync(cfgPath, 'utf8'));
      writeFileSync(cfgPath, JSON.stringify({ ...c2, allow: { ...c2.allow, 'i18n/en.json#error_page_title generic': 'looks fine to me' } }));
      const b2 = JSON.parse(readFileSync(bPath, 'utf8'));
      delete b2.findings['i18n/en.json#error_page_title generic'];
      writeFileSync(bPath, JSON.stringify(b2, null, 2));
      const unapproved = run();
      if (unapproved.status !== 1 || !unapproved.stderr.includes('NEW ALLOW i18n/en.json#error_page_title generic')) fail(`--base: an unapproved new allow should fail; got ${unapproved.status}\n${unapproved.stderr}`);
      writeFileSync(cfgPath, JSON.stringify({ ...c2, allow: { ...c2.allow, 'i18n/en.json#error_page_title generic': { reason: 'the alert really fires', approved: 'owner, 2026-10-21' } } }));
      const approved = run();
      if (approved.status !== 0) fail(`--base: an approved new allow should pass; got ${approved.status}\n${approved.stderr}`);
      const badRef = spawnSync(process.execPath, [script, '--config', cfgPath, '--base', 'no-such-ref'], { encoding: 'utf8' });
      if (badRef.status !== 2) fail(`--base with an unknown ref should exit 2; got ${badRef.status}`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
}

/* ── 6. the standard against itself ── */
const doc = readFileSync(join(repo, 'ERRORS.md'), 'utf8');
/** Problems in section 5's wording table: a row that does not parse, or a cell that is itself generic. */
function wordingTableProblems(text) {
  const problems = [];
  const table = text.split('<!-- wording-table')[1]?.split('\n\n')[0] ?? '';
  const rows = table.split('\n').filter((l) => l.startsWith('| ') && !l.startsWith('| Kind') && !l.startsWith('| ---'));
  if (rows.length < 25) problems.push(`only ${rows.length} rows parsed`);
  for (const row of rows) {
    const cells = row.slice(2, -2).split(' | ');
    if (cells.length !== 3) { problems.push(`a row without exactly 3 cells: ${row}`); continue; }
    const [kind, en, fr] = cells;
    if (caught(en, ['en'])) problems.push(`"${kind}" EN is itself generic: ${en}`);
    if (caught(fr, ['fr'])) problems.push(`"${kind}" FR est générique : ${fr}`);
  }
  return problems;
}
for (const p of wordingTableProblems(doc)) fail(`ERRORS.md wording table: ${p}`);
{
  // The check reads the right columns: a generic EN or FR cell fails it.
  const offlineRow = doc.split('\n').find((l) => l.startsWith('| offline | '));
  const [, en, fr] = offlineRow.slice(2, -2).split(' | ');
  const badEn = doc.replace(offlineRow, offlineRow.replace(en, 'Something went wrong. Please try again later.'));
  const badFr = doc.replace(offlineRow, offlineRow.replace(fr, 'Une erreur est survenue.'));
  if (!wordingTableProblems(badEn).some((p) => p.startsWith('"offline" EN'))) fail('the wording-table check misses a generic EN cell');
  if (!wordingTableProblems(badFr).some((p) => p.startsWith('"offline" FR'))) fail('the wording-table check misses a generic FR cell');
}
const BEFORE = ['Something went wrong.', 'Something went wrong. Try again in a moment.', 'Still not responding.'];
const AFTER = [
  'This page did not load',
  "The admin panel's server stopped answering at 14:02, so this page could not be fetched. If other sites work on this device, the problem is on our side. Nothing you saved before is affected.",
  'Not answering since 14:02 · 3 attempts · next try in 12 s',
  'Not answering since 14:02 · help@rendee.ca',
  'Still not answering after 5 minutes (since 14:02). Automatic retries have stopped. Try again from this page when you are ready, or contact help@rendee.ca and say the admin panel has not answered since 14:02.',
  'The booking service did not answer within 10 s, so the bookings did not load. Nothing you saved is affected. Next try in 12 s.',
];
for (const s of [...BEFORE, ...AFTER]) if (!doc.includes(s)) fail(`ERRORS.md no longer holds the screenshot line: ${s}`);
for (const s of BEFORE) if (!caught(s, ['en'])) fail(`screenshot BEFORE should be caught: ${s}`);
for (const s of AFTER) if (caught(s, ['en'])) fail(`screenshot AFTER should pass: ${s}`);
if (!catalogueTitlePairs({ x_title: BEFORE[0], x_message: BEFORE[1] }).length) fail('screenshot BEFORE: the body repeats the title and should be caught');
for (const s of AFTER) if (/\bRendee\b/.test(s)) fail(`RENDEE-ERROR-1: the admin's copy never names the brand: ${s}`);
// While the panel's server is down, a minted reference could not reach any
// store support can query (ERROR-7): the screenshot fix shows the time.
for (const s of AFTER) if (/E-[0-9A-F]{6}/.test(s)) fail(`ERROR-7: the screenshot fix shows a reference support cannot look up: ${s}`);
// The browser cannot know the person's connection works (navigator.onLine is
// true behind a captive portal); the copy never claims it without a probe.
for (const s of AFTER) if (/connection is working/i.test(s)) fail(`the screenshot fix asserts the connection works: ${s}`);

if (failures) {
  console.error(`\n✗ error copy scanner: ${failures} failure(s)`);
  process.exit(1);
}
console.log('✓ error copy scanner: catches generic copy (JSX text, cause-less openings, untranslated English), leaves labels and wire values alone, exact baseline that --base keeps going down, ERRORS.md passes its own check');
