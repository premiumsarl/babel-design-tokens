/**
 * The Dart codegen's guards, pinned: shadow lengths, names and strings.
 *
 * Each used to fail quietly. dartShadowLayers read `2 4 8` (invalid CSS, so
 * the web drew no shadow) as pixels, half-read `1.2.3px` as 1.2, rounded
 * 1.25px to 1.3, and passed a negative blur, which CSS drops and Flutter's
 * Shadow asserts against. dartShadows turned a `2xl` step into `_2xl`, a
 * member no app importing the file can reach, and a `default` key became
 * `static const double default`, which does not compile (a built-in word
 * such as `show` does, and must still build). The build passed
 * every time, and the only thing that noticed the names was `dart analyze`
 * with Flutter. Last, a contract string must reach Dart as the same text:
 * a bare `$` in one interpolated, and nothing at all noticed.
 *
 * Each case builds a scratch copy of the repo with tokens.json (or a
 * contract) edited, so it runs the real build.mjs rather than a re-typed
 * copy of its regex.
 *
 * Run: node scripts/__tests__/dart-codegen.test.mjs
 */
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Each copy runs its own build.mjs, and Node will not import a module whose
// path holds a backslash on POSIX (ERR_INVALID_MODULE_SPECIFIER), so a
// TMPDIR with one gives way to /tmp.
const scratchBase = process.platform !== 'win32' && tmpdir().includes('\\') ? '/tmp' : tmpdir();
const readJson = (p) => JSON.parse(readFileSync(join(repo, p), 'utf8'));

/* Build a scratch copy. `edit` changes tokens.json, the limits contract and
 * the task-priority contract in place. */
const build = (edit) => {
  const dir = mkdtempSync(join(scratchBase, 'codegen-test-'));
  try {
    cpSync(join(repo, 'build.mjs'), join(dir, 'build.mjs'));
    cpSync(join(repo, 'contracts'), join(dir, 'contracts'), { recursive: true });
    const tokens = readJson('tokens.json');
    const limits = readJson('contracts/rules/limits.json');
    const taskPriority = readJson('contracts/enums/task-priority.json');
    edit({ tokens, limits, taskPriority });
    writeFileSync(join(dir, 'tokens.json'), JSON.stringify(tokens, null, 2));
    writeFileSync(join(dir, 'contracts/rules/limits.json'), JSON.stringify(limits, null, 2));
    writeFileSync(join(dir, 'contracts/enums/task-priority.json'), JSON.stringify(taskPriority, null, 2));
    const r = spawnSync(process.execPath, ['build.mjs'], { cwd: dir, encoding: 'utf8' });
    const out = (f) => (r.status === 0 ? readFileSync(join(dir, 'dart/lib', f), 'utf8') : '');
    return {
      ok: r.status === 0,
      error: r.stderr,
      dart: out('babel_tokens.dart'),
      contractsDart: out('babel_contracts.dart'),
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

/* The six shadows tokens.json carries at 0.8.0, as the input to every
 * shadow case, so a later edit to the real ramp does not move this test. */
const SHADOWS_0_8_0 = {
  sm: {
    light: '0 6px 16px -10px rgba(45,32,15,.30)',
    dark: '0 8px 20px -12px rgba(0,0,0,.60)',
  },
  md: {
    light: '0 12px 30px -14px rgba(45,32,15,.32), 0 2px 6px -2px rgba(45,32,15,.10)',
    dark: '0 16px 40px -16px rgba(0,0,0,.66), 0 2px 8px -2px rgba(0,0,0,.5)',
  },
  lg: {
    light: '0 22px 56px -22px rgba(45,32,15,.34), 0 2px 8px -2px rgba(45,32,15,.12)',
    dark: '0 26px 64px -22px rgba(0,0,0,.72), 0 2px 10px -2px rgba(0,0,0,.5)',
  },
};
/* ...and the Dart 0.8.0 ships for them, byte for byte. */
const EXPECTED = {
  BabelShadowLight: [
    '  static const List<BoxShadow> sm = <BoxShadow>[',
    '    BoxShadow(color: Color.fromRGBO(45, 32, 15, 0.3), offset: Offset(0.0, 6.0), blurRadius: 16.0, spreadRadius: -10.0),',
    '  ];',
    '  static const List<BoxShadow> md = <BoxShadow>[',
    '    BoxShadow(color: Color.fromRGBO(45, 32, 15, 0.32), offset: Offset(0.0, 12.0), blurRadius: 30.0, spreadRadius: -14.0),',
    '    BoxShadow(color: Color.fromRGBO(45, 32, 15, 0.1), offset: Offset(0.0, 2.0), blurRadius: 6.0, spreadRadius: -2.0),',
    '  ];',
    '  static const List<BoxShadow> lg = <BoxShadow>[',
    '    BoxShadow(color: Color.fromRGBO(45, 32, 15, 0.34), offset: Offset(0.0, 22.0), blurRadius: 56.0, spreadRadius: -22.0),',
    '    BoxShadow(color: Color.fromRGBO(45, 32, 15, 0.12), offset: Offset(0.0, 2.0), blurRadius: 8.0, spreadRadius: -2.0),',
    '  ];',
  ],
  BabelShadowDark: [
    '  static const List<BoxShadow> sm = <BoxShadow>[',
    '    BoxShadow(color: Color.fromRGBO(0, 0, 0, 0.6), offset: Offset(0.0, 8.0), blurRadius: 20.0, spreadRadius: -12.0),',
    '  ];',
    '  static const List<BoxShadow> md = <BoxShadow>[',
    '    BoxShadow(color: Color.fromRGBO(0, 0, 0, 0.66), offset: Offset(0.0, 16.0), blurRadius: 40.0, spreadRadius: -16.0),',
    '    BoxShadow(color: Color.fromRGBO(0, 0, 0, 0.5), offset: Offset(0.0, 2.0), blurRadius: 8.0, spreadRadius: -2.0),',
    '  ];',
    '  static const List<BoxShadow> lg = <BoxShadow>[',
    '    BoxShadow(color: Color.fromRGBO(0, 0, 0, 0.72), offset: Offset(0.0, 26.0), blurRadius: 64.0, spreadRadius: -22.0),',
    '    BoxShadow(color: Color.fromRGBO(0, 0, 0, 0.5), offset: Offset(0.0, 2.0), blurRadius: 10.0, spreadRadius: -2.0),',
    '  ];',
  ],
};
const classBody = (dart, name) =>
  (dart.match(new RegExp(`\\nabstract final class ${name} \\{\\n([\\s\\S]*?)\\n\\}\\n`)) ?? [])[1];

const failures = [];
const expectBuilds = (name, edit, check) => {
  const r = build(edit);
  if (!r.ok) return failures.push(`${name}: the build failed:\n${r.error}`);
  const problem = check(r.dart, r.contractsDart);
  if (problem) failures.push(`${name}: ${problem}`);
};
const expectRefused = (name, edit, ...mustSay) => {
  const r = build(edit);
  if (r.ok) return failures.push(`${name}: the build passed; it must refuse this.`);
  const missing = mustSay.filter((s) => !r.error.includes(s));
  if (missing.length)
    failures.push(`${name}: refused, but without naming ${missing.map((s) => JSON.stringify(s)).join(', ')}:\n${r.error}`);
};
const shadow = (css) => ({ tokens }) => {
  tokens.shadow = { ...SHADOWS_0_8_0, sm: { ...SHADOWS_0_8_0.sm, light: css } };
};

/* ---- shadow lengths: carried exactly, or refused by name ---- */
expectBuilds('the 0.8.0 shadows', ({ tokens }) => { tokens.shadow = SHADOWS_0_8_0; }, (dart) => {
  for (const [cls, lines] of Object.entries(EXPECTED)) {
    const got = classBody(dart, cls);
    if (got !== lines.join('\n')) return `${cls} changed:\n--- expected\n${lines.join('\n')}\n--- got\n${got}`;
  }
});
expectBuilds('a fractional px length', shadow('0 1.25px 0.25px rgba(0,0,0,.5)'), (dart) => {
  const want = 'BoxShadow(color: Color.fromRGBO(0, 0, 0, 0.5), offset: Offset(0.0, 1.25), blurRadius: 0.25, spreadRadius: 0.0)';
  if (!classBody(dart, 'BabelShadowLight')?.includes(want))
    return `expected 1.25 and 0.25 verbatim:\n  ${want}\n${classBody(dart, 'BabelShadowLight')}`;
});
expectBuilds('a unitless zero spelled 0.0, -0 or 00', shadow('0.0 1px -0 00 rgba(0,0,0,.5)'), (dart) => {
  const want = 'BoxShadow(color: Color.fromRGBO(0, 0, 0, 0.5), offset: Offset(0.0, 1.0), blurRadius: 0.0, spreadRadius: 0.0)';
  if (!classBody(dart, 'BabelShadowLight')?.includes(want))
    return `CSS reads each of these as 0, so Dart must too:\n  ${want}\n${classBody(dart, 'BabelShadowLight')}`;
});
expectRefused('a unitless non-zero length', shadow('2 4 8 rgba(0,0,0,.5)'),
  'shadow.sm.light: "2" has no unit');
expectRefused('a negative blur', shadow('0 4px -8px rgba(0,0,0,.5)'),
  'shadow.sm.light: blur "-8px" is negative');
expectRefused('a malformed number', shadow('1.2.3px 0 rgba(0,0,0,.5)'),
  'shadow.sm.light: "1.2.3px" is not a well-formed number');
expectRefused('a length in em', shadow('4em 0 8px rgba(0,0,0,.5)'),
  'shadow.sm.light: "4em" is in em');
expectRefused('an inset shadow', shadow('inset 0 1px 2px rgba(0,0,0,.5)'),
  'shadow.sm.light: "inset 0 1px 2px rgba(0,0,0,.5)" is not');

/* ---- every generated name is public ---- */
expectBuilds('a digit-leading shadow step', ({ tokens }) => {
  tokens.shadow = { ...SHADOWS_0_8_0, '2xl': SHADOWS_0_8_0.lg };
}, (dart) => {
  for (const cls of ['BabelShadowLight', 'BabelShadowDark']) {
    const body = classBody(dart, cls) ?? '';
    if (/\b_2xl\b/.test(body) || !body.includes('  static const List<BoxShadow> s2xl = <BoxShadow>['))
      return `${cls} must carry the 2xl step as public \`s2xl\`, as BabelRadius has r2xl:\n${body}`;
  }
});
expectRefused('a digit-leading key in a group with no rename', ({ tokens }) => { tokens.border['2x'] = 2; },
  'babel_tokens.dart:', '`BabelBorder._2x` would be library-private');
expectRefused('an underscore-led contract name', ({ limits }) => { limits.rules._probe = 1; },
  'babel_contracts.dart:', '`BabelLimits._probe` would be library-private');
expectRefused('a reserved-word key', ({ tokens }) => { tokens.radius.default = 8; },
  'babel_tokens.dart:', '`BabelRadius.default` is a Dart reserved word');
expectRefused('a reserved-word key in another group', ({ tokens }) => { tokens.duration.in = 100; },
  'babel_tokens.dart:', '`BabelDuration.in` is a Dart reserved word');
expectRefused('a key reserved in async code', ({ tokens }) => { tokens.duration.await = 100; },
  'babel_tokens.dart:', '`BabelDuration.await` is a Dart reserved word', 'no async function or generator');
expectBuilds('a key that is a built-in identifier, not a reserved word', ({ tokens }) => {
  tokens.motionRole.show = tokens.motionRole.hover;
  tokens.easing.on = tokens.easing.standard;
}, (dart) => ((!dart.includes('  static const BabelMotionRole show = ') || !dart.includes('  static const Curve on = '))
  ? 'show and on compile as member names' : undefined));

/* ---- a contract string reaches Dart as the same text ---- */
expectBuilds('a $ in a contract string', ({ taskPriority }) => {
  taskPriority.aliases.$values = 'taskPriorityLow';
}, (dart, contractsDart) => {
  const want = "    '\\$values': 'taskPriorityLow',";
  if (!contractsDart.includes(want))
    return `a bare $ interpolates in Dart, so the alias must be escaped:\n${want}\n${classBody(contractsDart, 'BabelTaskPriority')}`;
});

if (failures.length) {
  console.error(`✗ Dart codegen: ${failures.length} case(s) failed\n\n` + failures.join('\n\n'));
  process.exit(1);
}
console.log('✓ Dart codegen: shadow lengths cross exactly or fail by name; no generated name is private or a reserved word; a $ stays text.');
