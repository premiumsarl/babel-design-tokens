/**
 * The UX principles index: principles/*.md → the rule IDs apps cite.
 *
 * principles/COMMON.md holds the rules every brand follows; one file per brand
 * (BABEL.md, DIDACTIKOS.md, …) holds that brand's own. Each rule is a heading
 *
 *     ### FOCUS-1 · The object the user came for is in the first viewport
 *
 * App design docs cite the ID instead of restating the rule, and check the IDs
 * they cite against the index build.mjs generates from this parse. So the
 * parse refuses anything that would make that check lie:
 *
 *   - a `### ` heading that is not "<ID> · <title>" (a rule the index would
 *     silently drop);
 *   - an ID of the wrong shape for its file: `AREA-n` in COMMON.md,
 *     `BRAND-AREA-n` in BRAND.md (so an ID says where it lives);
 *   - the same ID twice, anywhere in the folder;
 *   - a backticked ID that no file defines (a dangling cross-reference).
 *
 * Pure: no filesystem access in parsePrinciples, so the test can feed it
 * fixtures. readPrinciples is the filesystem half.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const FILE = /^([A-Z][A-Z0-9]*)\.md$/;
const RULE = /^### (\S+) · (\S.*)$/;
const COMMON_ID = /^[A-Z][A-Z0-9]*-[1-9]\d*$/;
const brandId = (prefix) => new RegExp(`^${prefix}-[A-Z][A-Z0-9]*-[1-9]\\d*$`);
const REF = /`([A-Z][A-Z0-9]*(?:-[A-Z][A-Z0-9]*)*-[1-9]\d*)`/g;

/** COMMON.md first, then the brands alphabetically. README.md is not a rule file. */
export const principleFileOrder = (names) =>
  names
    .filter((n) => n.endsWith('.md') && n !== 'README.md')
    .sort((a, b) => (a === 'COMMON.md' ? -1 : b === 'COMMON.md' ? 1 : a.localeCompare(b)));

/**
 * @param {{name: string, text: string}[]} files  principles/*.md, README.md excluded
 * @returns {{principles: Record<string, {title: string, scope: string, file: string}>,
 *            scopes: string[], errors: string[]}}
 */
export function parsePrinciples(files) {
  const errors = [];
  const principles = {};
  const scopes = [];
  const refs = [];
  if (!files.some((f) => f.name === 'COMMON.md')) {
    errors.push('principles/COMMON.md is missing: it holds the rules every brand follows.');
  }
  for (const { name, text } of files) {
    const file = `principles/${name}`;
    const m = name.match(FILE);
    if (!m) {
      errors.push(`${file}: a principles file is named for its brand in capitals (BABEL.md), or COMMON.md.`);
      continue;
    }
    const scope = m[1] === 'COMMON' ? 'common' : m[1].toLowerCase();
    const idShape = scope === 'common' ? COMMON_ID : brandId(m[1]);
    const shapeName = scope === 'common' ? 'AREA-n, e.g. FOCUS-1' : `${m[1]}-AREA-n, e.g. ${m[1]}-ID-1`;
    scopes.push(scope);
    let fenced = false;
    text.split('\n').forEach((line, i) => {
      if (/^\s*```/.test(line)) fenced = !fenced;
      if (fenced) return;
      const where = `${file}:${i + 1}`;
      if (line.startsWith('### ')) {
        const r = line.match(RULE);
        if (!r) {
          errors.push(`${where}: a rule heading reads "### <ID> · <title>" (a middle dot between them). Got: ${line}`);
        } else if (!idShape.test(r[1])) {
          errors.push(`${where}: \`${r[1]}\` is not an ID of this file's shape (${shapeName}).`);
        } else if (principles[r[1]]) {
          errors.push(`${where}: \`${r[1]}\` is already defined in ${principles[r[1]].file}. An ID is never reused.`);
        } else {
          principles[r[1]] = { title: r[2].trim(), scope, file };
        }
      }
      for (const ref of line.matchAll(REF)) refs.push({ id: ref[1], where });
    });
    if (fenced) errors.push(`${file}: a code fence is never closed, so the rules after it were not read.`);
  }
  for (const { id, where } of refs) {
    if (!principles[id]) errors.push(`${where}: \`${id}\` is cited but no principles file defines it.`);
  }
  return { principles, scopes, errors };
}

/** Read and parse the principles folder. */
export function readPrinciples(dir) {
  const names = principleFileOrder(readdirSync(dir));
  return parsePrinciples(names.map((name) => ({ name, text: readFileSync(join(dir, name), 'utf8') })));
}
