/**
 * The ratchet's SCOPE, pinned.
 *
 * check-tokens.mjs had no CI coverage in its own repo while being COPIED
 * into every consumer — so a change here was validated by nothing until it
 * had already reddened someone else's build. That is exactly how a test
 * asserting `'Pat Dubois (#183)'` came to fail babel-admin-panel's
 * guardrails workflow for every PR branched off develop: a three-digit id
 * printed after a `#` is indistinguishable from a short hex colour, and
 * nothing here would have caught the regression either way.
 *
 * Two properties matter and both are asserted below, because a scope fix
 * can fail in either direction: excluding too little leaves the false
 * positive, and excluding too much silently stops counting real drift.
 *
 * Run: node scripts/__tests__/ratchet-scope.test.mjs
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, '..', 'check-tokens.mjs');
const fixtures = join(here, '..', '__fixtures__', 'ratchet');

const out = execFileSync(
  process.execPath,
  [script, fixtures, '--ext=.css,.ts,.dart'],
  { encoding: 'utf8' },
);

const parsed = /literals bypassing tokens in .*: (\d+)/.exec(out);
if (!parsed) {
  console.error('✗ could not parse a count from:\n' + out);
  process.exit(1);
}
const count = Number(parsed[1]);

/* real.css contributes exactly two — one hex and one rgba(). The
 * `.test.ts` and the `_test.dart` must contribute nothing: the first is a
 * person id that only looks like a colour, the second is a colour-drift
 * test that necessarily carries colours as fixtures. */
const EXPECTED = 2;

if (count !== EXPECTED) {
  console.error(
    `✗ ratchet scope: counted ${count}, expected ${EXPECTED}.\n` +
      (count > EXPECTED
        ? '  A TEST FILE IS BEING COUNTED — the false positive is back.\n'
        : '  A REAL LITERAL IS BEING MISSED — the ratchet has gone blind.\n') +
      out,
  );
  process.exit(1);
}

/* The per-file table must name the real file and neither test file. A
 * count that happens to total 2 for the wrong reasons still fails here. */
if (!/real\.css/.test(out)) {
  console.error('✗ real.css is not in the per-file table:\n' + out);
  process.exit(1);
}
for (const excluded of ['person-label.test.ts', 'color_drift_test.dart']) {
  if (out.includes(excluded)) {
    console.error(`✗ ${excluded} was scanned but must be skipped:\n` + out);
    process.exit(1);
  }
}

console.log(
  `✓ ratchet scope: ${count} literal(s) counted in real.css; `
  + 'the .test.ts and _test.dart fixtures were skipped.',
);
