/**
 * The principles parse, pinned: every refusal fires, and the real folder
 * parses clean.
 *
 * Apps check the IDs their design docs cite against the index this parse
 * feeds. Each refusal below is a way that check could pass while wrong: a
 * malformed heading drops a rule from the index, a reused ID points two docs
 * at different rules, a misplaced ID hides which file owns it, and a dangling
 * cross-reference cites a rule nobody wrote. Each case is a FAIL/PASS pair
 * differing in one line, so a refusal that matches everything cannot pass.
 *
 * Run: node scripts/__tests__/principles.test.mjs
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePrinciples, principleFileOrder, readPrinciples } from '../principles.mjs';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let failures = 0;
const fail = (msg) => { console.error(`✗ ${msg}`); failures += 1; };

const COMMON = '# Common\n\n### FOCUS-1 · First\n\nBody.\n\n### FOCUS-2 · Second, see `FOCUS-1`\n';
const BRAND = '# Brand\n\n### BABEL-ID-1 · Identity, applies `FOCUS-2`\n';
const files = (common = COMMON, brand = BRAND, brandName = 'BABEL.md') =>
  [{ name: 'COMMON.md', text: common }, { name: brandName, text: brand }];

const expectClean = (label, input) => {
  const { errors } = parsePrinciples(input);
  if (errors.length) fail(`${label}: expected no errors, got:\n    ${errors.join('\n    ')}`);
};
const expectError = (label, input, fragment) => {
  const { errors } = parsePrinciples(input);
  if (!errors.some((e) => e.includes(fragment))) {
    fail(`${label}: expected an error containing "${fragment}", got:\n    ${errors.join('\n    ') || '(none)'}`);
  }
};

// The control: the fixture itself parses, with both scopes and every rule.
expectClean('control', files());
{
  const { principles, scopes } = parsePrinciples(files());
  if (scopes.join() !== 'common,babel') fail(`control: scopes ${scopes.join()} != common,babel`);
  if (Object.keys(principles).join() !== 'FOCUS-1,FOCUS-2,BABEL-ID-1') {
    fail(`control: ids ${Object.keys(principles).join()} != FOCUS-1,FOCUS-2,BABEL-ID-1`);
  }
  if (principles['FOCUS-2']?.title !== 'Second, see `FOCUS-1`') fail('control: the title is not kept verbatim');
}

// A rule heading without the middle dot is dropped by the index, so refuse it.
expectError('malformed heading', files(COMMON.replace('FOCUS-1 · First', 'FOCUS-1: First')), 'a rule heading reads');

// A common rule shaped like a brand rule, and a brand rule shaped like a common one.
expectError('brand-shaped id in COMMON.md', files(COMMON.replace('FOCUS-1 ·', 'BABEL-FOCUS-1 ·').replace('`FOCUS-1`', '`BABEL-FOCUS-1`')), 'is not an ID of this file\'s shape');
expectError('common-shaped id in BABEL.md', files(COMMON, BRAND.replace('BABEL-ID-1', 'ID-1')), 'is not an ID of this file\'s shape');
expectError('another brand\'s prefix', files(COMMON, BRAND.replace('BABEL-ID-1', 'GROOME-ID-1')), 'is not an ID of this file\'s shape');

// The same ID twice. Within a file it is refused as a duplicate; across files
// the shape rule already makes it impossible, because every brand ID carries
// its own file's prefix, so another file claiming it is refused for its shape.
expectError('duplicate within a file', files(COMMON + '\n### FOCUS-1 · Again\n'), 'is already defined');
expectError('another file claims a brand ID', [...files(), { name: 'GROOME.md', text: '### BABEL-ID-1 · Taken\n' }], 'is not an ID of this file\'s shape');

// A cited ID nobody defines.
expectError('dangling reference', files(COMMON, BRAND.replace('`FOCUS-2`', '`FOCUS-9`')), '`FOCUS-9` is cited but no principles file defines it');

// A heading inside a code fence is an example, not a rule; an unclosed fence hides the rest.
expectClean('fenced example', files(COMMON + '\n```\n### NOT A RULE\n```\n'));
expectError('unclosed fence', files(COMMON + '\n```\n### FOCUS-3 · Hidden\n'), 'a code fence is never closed');

// A file not named for a brand, and a missing COMMON.md.
expectError('lowercase file name', files(COMMON, BRAND, 'babel.md'), 'is named for its brand in capitals');
expectError('no COMMON.md', [{ name: 'BABEL.md', text: '### BABEL-ID-1 · Identity\n' }], 'COMMON.md is missing');

// File order: COMMON first, README skipped, brands alphabetical.
{
  const order = principleFileOrder(['README.md', 'GROOME.md', 'BABEL.md', 'COMMON.md', 'notes.txt']).join();
  if (order !== 'COMMON.md,BABEL.md,GROOME.md') fail(`file order: ${order}`);
}

// The real folder parses clean, and holds rules (a parse matching nothing would pass the rest).
{
  const { principles, scopes, errors } = readPrinciples(join(repo, 'principles'));
  if (errors.length) fail(`principles/: ${errors.join('\n    ')}`);
  if (scopes[0] !== 'common' || !scopes.includes('babel')) fail(`principles/: scopes ${scopes.join()}`);
  const common = Object.values(principles).filter((p) => p.scope === 'common').length;
  if (common < 40) fail(`principles/: only ${common} common rules parsed; the folder holds more than 40`);
}

if (failures) {
  console.error(`\n✗ principles parse: ${failures} failure(s)`);
  process.exit(1);
}
console.log('✓ principles parse: every refusal fires, and principles/ parses clean');
