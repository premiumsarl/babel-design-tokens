#!/usr/bin/env node
/**
 * Babel design-token + shared-contract generator.
 *
 * Reads the two sources of truth and emits, per ecosystem:
 *
 *   tokens.json  →  dist/tokens.css              theme-adaptive CSS custom properties → admin panel
 *                   dist/tokens.values.css       flat (no-@media) CSS values          → website
 *                   dist/tokens.flat.json        resolved flat map                    → tooling / CI ratchet
 *                   dart/lib/babel_tokens.dart   Dart constants (a pub package)       → mobile
 *
 *   contracts/   →  dist/contracts.mjs           frozen const maps                    → admin + api
 *                   dist/contracts.d.ts          literal types for the above
 *                   dist/contracts.flat.json     flat map                             → tooling / CI ratchet
 *                   dart/lib/babel_contracts.dart Dart constants                      → mobile
 *
 * Contracts ride the token pipeline deliberately: it is the only distribution
 * we have that already reaches all three clients (npm for web, pub for Flutter)
 * off ONE git tag. A second mechanism would be a second thing to keep in sync.
 *
 * No external dependencies: alias resolution ({color.brand.500}) is done here,
 * so the pipeline runs anywhere Node runs. Never hand-edit dist/ — regenerate.
 *
 * `node build.mjs --check` generates everything in memory and compares it to
 * what is on disk WITHOUT writing, exiting 1 on any drift. That is what makes
 * "the committed output matches the source" checkable from a script rather
 * than only from CI's `git status --porcelain`.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
const CONTRACTS = join(ROOT, 'contracts');
const CHECK_ONLY = process.argv.includes('--check');
const tokens = JSON.parse(readFileSync(join(ROOT, 'tokens.json'), 'utf8'));

/* ---------- alias resolution ---------- */
const get = (path) =>
  path.split('.').reduce((o, k) => (o == null ? o : o[k]), tokens);

function resolve(value, seen = new Set()) {
  if (typeof value !== 'string') return value;
  const m = value.match(/^\{([^}]+)\}$/);
  if (!m) return value;
  const path = m[1];
  if (seen.has(path)) throw new Error(`Alias cycle at {${path}}`);
  const target = get(path);
  if (target === undefined) throw new Error(`Unknown alias {${path}}`);
  return resolve(target, new Set(seen).add(path));
}

const isHex = (v) => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
const hexToArgb = (hex) => `0x${'FF'}${hex.slice(1).toUpperCase()}`;
const dartName = (s) =>
  s.replace(/[^a-zA-Z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
   .replace(/^(\d)/, '_$1');

/* ---------- flatten for the ratchet ---------- */
const flat = {};
const walkFlat = (obj, prefix) => {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue;
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !('light' in v && 'dark' in v)) {
      walkFlat(v, key);
    } else if (v && typeof v === 'object') {
      flat[`${key}.light`] = resolve(v.light);
      flat[`${key}.dark`] = resolve(v.dark);
    } else {
      flat[key] = resolve(v);
    }
  }
};
// Every group, not a hand-kept list: the list this replaces had no `border`,
// so v0.7.0 shipped the border widths to CSS and Dart but not to the default
// export, and nothing failed. A new group now reaches the flat map by default.
Object.keys(tokens)
  .filter((g) => !g.startsWith('$'))
  .forEach((g) => walkFlat(tokens[g], g));

/* ---------- spacing emit helpers ---------- */

/**
 * A space rung as a CSS length.
 *
 * rem, not px, so spacing scales with the reader's root font size. Both web
 * consumers currently pin `html { font-size: 16px }`, which makes this change
 * a provable no-op today AND the thing that makes removing those pins an
 * improvement rather than a regression.
 *
 * The `px` rung is the exception and stays absolute: it is a HAIRLINE, used to
 * nudge something by the width of a border. Scaled to 1.3px it is not more
 * accessible, just blurry.
 */
const spaceLength = (key, v) =>
  key === 'px' ? '1px' : v === 0 ? '0' : `${+(v / 16).toFixed(6)}rem`;

const cssVarName = (key) => `--space-${String(key).replace('_', '-')}`;

/**
 * Emit-as-reference. `resolve()` flattens {space.6} to the number 24, which is
 * right for a colour alias and wrong for a role: a role's whole job is to name
 * WHICH rung a job uses, so it has to survive into the stylesheet as
 * `var(--space-6)`. Handles multi-value roles ("{space.3} {space.4}") and
 * literal values (40 -> 40px, "60ch" -> 60ch).
 */
const roleValue = (v) => {
  if (typeof v === 'number') return `${v}px`;
  return String(v).replace(
    /\{space\.([^}]+)\}/g,
    (_, k) => `var(${cssVarName(k)})`,
  );
};

/* ---------- z-scale invariant ---------- */

/**
 * The z rungs must be strictly ascending in declaration order, with a gap
 * big enough to slip a literal between two of them.
 *
 * Not decoration. Consumers DO reach between the rungs: the admin panel's
 * address-autocomplete portal carries a literal `zIndex: 410` with a comment
 * reading "Above --z-modal (400) ... Still below --z-toast (500)" — because
 * React's zIndex type takes numbers, not a var(). A rung silently reordered
 * here, or two rungs closed up, breaks that call site with nothing failing in
 * this repo. The gap is what makes such an escape hatch legal at all.
 */
const Z_MIN_GAP = 100;
{
  const rungs = Object.entries(tokens.z);
  for (let i = 1; i < rungs.length; i++) {
    const [prevName, prev] = rungs[i - 1];
    const [name, val] = rungs[i];
    if (!(val > prev)) {
      throw new Error(
        `z.${name} (${val}) must be greater than z.${prevName} (${prev}). `
        + `The z group is ordered by declaration; a rung out of order changes `
        + `stacking everywhere without anything else failing.`,
      );
    }
    if (val - prev < Z_MIN_GAP) {
      throw new Error(
        `z.${name} (${val}) is only ${val - prev} above z.${prevName} (${prev}); `
        + `keep at least ${Z_MIN_GAP} so a caller that cannot use a var() can `
        + `still land a literal between two rungs.`,
      );
    }
  }
}

/* ---------- motion emit helpers ---------- */

/**
 * Motion roles are emitted AS REFERENCES, for the same reason spacing roles
 * are (see $meta.roleSyntax): a role's job is to say WHICH rung a given job
 * uses. `--motion-hover: var(--duration-fast) var(--easing-standard)` keeps
 * that chain visible in DevTools and keeps a ladder change propagating;
 * flattening it to `150ms cubic-bezier(...)` would sever both.
 *
 * The pair is emitted in `transition` shorthand order (duration then
 * timing-function) so a caller can write the whole thing in one go:
 *
 *   transition: background-color var(--motion-hover);
 */
const motionRoleRef = (name, role) => {
  const pick = (field, group) => {
    const raw = role?.[field];
    const m = typeof raw === 'string' && raw.match(new RegExp(`^\\{${group}\\.([^}]+)\\}$`));
    if (!m) {
      throw new Error(
        `motionRole.${name}.${field} must be a {${group}.*} alias, got ${JSON.stringify(raw)}. `
        + `Roles are emitted as references, so a literal here would sever the chain.`,
      );
    }
    if (tokens[group][m[1]] === undefined) {
      throw new Error(`motionRole.${name}.${field} points at {${group}.${m[1]}}, which does not exist.`);
    }
    return m[1];
  };
  return { duration: pick('duration', 'duration'), easing: pick('easing', 'easing') };
};

const motionRoleValue = (name, role) => {
  const { duration, easing } = motionRoleRef(name, role);
  return `var(--duration-${duration}) var(--easing-${easing})`;
};

/**
 * A CSS cubic-bezier() as a Dart curve.
 *
 * Emitted as an explicit `Cubic(...)` rather than the nearest named
 * `Curves.*` constant, so web and Flutter animate on the IDENTICAL curve
 * instead of a visually-close approximation. (`Curves.easeInOut` is
 * Cubic(0.42, 0, 0.58, 1) — near the Material standard curve, not equal to
 * it. That gap is exactly the drift this token set exists to remove.)
 * `linear` has no bezier spelling and maps to the built-in.
 */
const dartCurve = (css) => {
  if (css === 'linear') return 'Curves.linear';
  const m = css.match(/^cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/);
  if (!m) throw new Error(`easing value is neither linear nor cubic-bezier(): ${css}`);
  return `Cubic(${m.slice(1).map((n) => Number(n).toFixed(2)).join(', ')})`;
};

/* ---------- shadow emit helpers ---------- */

/**
 * One shadow length as logical pixels: a px value or a bare 0, nothing else.
 * A unitless non-zero number is invalid CSS, so the browser drops the whole
 * --shadow-* declaration and the web would show no shadow while Flutter drew
 * one. A unitless zero is valid however it is spelled (`0`, `0.0`, `-0`):
 * browsers test the number's value, not its text, and so does this. em/rem/%
 * have no fixed pixel value to carry. A malformed number (`1.2.3px`) would
 * half-parse into a different length.
 */
const dartShadowLength = (len, where) => {
  const m = len.match(/^(-?(?:\d+(?:\.\d+)?|\.\d+))([a-zA-Z%]*)$/);
  if (m && !m[2] && Number(m[1]) === 0) return 0;
  if (m && m[2].toLowerCase() === 'px') return Number(m[1]);
  throw new Error(
    `${where}: "${len}" ${!m ? 'is not a well-formed number'
      : !m[2] ? 'has no unit, which CSS allows only for 0: the browser would drop the whole shadow while Dart drew it'
        : `is in ${m[2]}, which has no fixed pixel value`}. `
    + 'A shadow length is a px value or a bare 0.',
  );
};

/** A Dart double literal, never rounded: 16 → `16.0`, 1.25 → `1.25`. */
const dartDouble = (n) => (Number.isInteger(n) ? n.toFixed(1) : String(n));

/**
 * A CSS box-shadow value as Dart `BoxShadow(...)` expressions, one per layer.
 *
 * Until v0.8.0 the shadow group was CSS-only, so mobile had no shadow token to
 * spend and every card picked its own. Only the shape tokens.json uses is
 * accepted — `x y blur [spread] rgba(r,g,b,a)` per layer, comma-separated —
 * and anything else fails the build by name, as dartCurve does: a half-parsed
 * shadow would be a different token wearing this one's name. `inset` has no
 * BoxShadow equivalent and is refused for the same reason, and so is any
 * length dartShadowLength cannot carry exactly. So is a negative blur: CSS
 * rejects one, so the browser drops the whole shadow, and Flutter's Shadow
 * asserts blurRadius >= 0, which in a const is a compile error.
 *
 * Numbers cross verbatim (a 16px blur is `blurRadius: 16.0`, a 1.25px offset
 * is `1.25`, never rounded), so the Dart reads the same as tokens.json. That
 * is the usual mapping, not a pixel-exact one: CSS blurs with sigma = blur / 2
 * and Flutter with 0.57735 * blurRadius + 0.5, so the Flutter shadow is
 * slightly softer at the same number.
 */
const dartShadowLayers = (css, where) =>
  // Split on the commas BETWEEN layers, not the ones inside rgba(...).
  css.split(/,(?![^(]*\))/).map((raw) => {
    const layer = raw.trim();
    const m = layer.match(/^((?:\S+\s+){2,4})rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+(?:\.\d+)?|\.\d+)\s*\)$/);
    if (!m || /\binset\b/.test(layer)) {
      throw new Error(
        `${where}: "${layer}" is not "x y blur [spread] rgba(r, g, b, a)". `
        + `Extend dartShadowLayers in build.mjs rather than approximating it in Dart.`,
      );
    }
    const lengths = m[1].trim().split(/\s+/);
    const [x, y, blur = 0, spread = 0] = lengths.map((n) => dartShadowLength(n, where));
    if (blur < 0) {
      throw new Error(
        `${where}: blur "${lengths[2]}" is negative, which CSS rejects (the browser drops `
        + `the whole shadow) and Flutter's Shadow asserts against. A blur is 0 or more.`,
      );
    }
    const [r, g, b] = m.slice(2, 5).map(Number);
    const a = Number(m[5]);
    if (Number.isNaN(a) || a > 1 || [r, g, b].some((c) => c > 255)) {
      throw new Error(`${where}: "${layer}" has an out-of-range number.`);
    }
    return `BoxShadow(color: Color.fromRGBO(${r}, ${g}, ${b}, ${a}), `
      + `offset: Offset(${dartDouble(x)}, ${dartDouble(y)}), `
      + `blurRadius: ${dartDouble(blur)}, spreadRadius: ${dartDouble(spread)})`;
  });

/* ---------- CSS ---------- */
function cssBlock(indent = '  ') {
  const L = [];
  // color ramps (theme-invariant)
  for (const [group, ramp] of Object.entries(tokens.color)) {
    for (const [step, val] of Object.entries(ramp))
      L.push(`${indent}--color-${group}-${step}: ${resolve(val)};`);
  }
  // brand as rgb channels, for rgba(var(--color-brand-rgb), a) usage
  const bh = resolve(tokens.color.brand['500']).slice(1);
  L.push(
    `${indent}--color-brand-rgb: ${parseInt(bh.slice(0, 2), 16)}, ` +
    `${parseInt(bh.slice(2, 4), 16)}, ${parseInt(bh.slice(4, 6), 16)};`,
  );
  // typography
  for (const [k, v] of Object.entries(tokens.font.family))
    L.push(`${indent}--font-${k}: ${v};`);
  for (const [k, v] of Object.entries(tokens.font.size))
    L.push(`${indent}--text-${k}: ${v}px;`);
  for (const [k, v] of Object.entries(tokens.font.weight))
    L.push(`${indent}--weight-${k}: ${v};`);
  for (const [k, v] of Object.entries(tokens.font.leading))
    L.push(`${indent}--leading-${k}: ${v};`);
  for (const [k, v] of Object.entries(tokens.font.tracking))
    L.push(`${indent}--tracking-${k}: ${v};`);
  // space — the ladder: which numbers are legal
  for (const [k, v] of Object.entries(tokens.space))
    L.push(`${indent}${cssVarName(k)}: ${spaceLength(k, v)};`);
  // spaceRole — which number a given job uses. Emitted as references to the
  // ladder above (see roleValue), so the alias chain survives into DevTools.
  for (const [k, v] of Object.entries(tokens.spaceRole)) {
    // pad-page is responsive; its base value goes here, the steps below.
    const val = v && typeof v === 'object' ? v.base : v;
    L.push(`${indent}--${k}: ${roleValue(val)};`);
  }
  for (const [k, v] of Object.entries(tokens.radius))
    L.push(`${indent}--radius-${k}: ${v === 9999 ? '9999px' : v + 'px'};`);
  /* Border widths. Small numbers, but shared ones: the accent rail is
     the same 3px on the admin StatCard and the mobile verdict band, and
     it was hard-coded in both until it lived here. */
  for (const [k, v] of Object.entries(tokens.border))
    L.push(`${indent}--border-${k}: ${v}px;`);
  // motion — the ladder: which durations and curves are legal
  for (const [k, v] of Object.entries(tokens.duration))
    L.push(`${indent}--duration-${k}: ${v}ms;`);
  for (const [k, v] of Object.entries(tokens.easing))
    L.push(`${indent}--easing-${k}: ${v};`);
  // motionRole — which pair a given job uses, as references (see motionRoleValue)
  for (const [k, v] of Object.entries(tokens.motionRole))
    L.push(`${indent}--motion-${k}: ${motionRoleValue(k, v)};`);
  for (const [k, v] of Object.entries(tokens.z))
    L.push(`${indent}--z-${k}: ${v};`);
  return L.join('\n');
}

/**
 * Media-query steps for any role declared as { base, <breakpoint>… }.
 *
 * Only --pad-page uses this today: the page's outer padding was a flat 24px at
 * every viewport in admin, which is too tight on a phone and too mean on a
 * 27-inch monitor. Breakpoint keys must exist in tokens.breakpoint.
 */
function responsiveRoleCss() {
  const blocks = [];
  for (const [role, v] of Object.entries(tokens.spaceRole)) {
    if (!v || typeof v !== 'object') continue;
    for (const [bp, val] of Object.entries(v)) {
      if (bp === 'base') continue;
      const min = tokens.breakpoint[bp];
      if (min === undefined) throw new Error(`Unknown breakpoint {${bp}} on spaceRole.${role}`);
      blocks.push(
        `@media (min-width: ${min}px) {\n  :root { --${role}: ${roleValue(val)}; }\n}`,
      );
    }
  }
  return blocks.join('\n\n');
}

function semanticCss(theme, indent = '  ') {
  const L = [];
  for (const [name, pair] of Object.entries(tokens.semantic)) {
    const kebab = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    L.push(`${indent}--color-${kebab}: ${resolve(pair[theme])};`);
  }
  for (const [name, pair] of Object.entries(tokens.shadow))
    L.push(`${indent}--shadow-${name}: ${pair[theme]};`);
  return L.join('\n');
}

const css = `/* Babel Design Tokens — GENERATED from tokens.json. Do not edit. */
/* Brand: black core + bronze accent (#B08D57). Consumed by admin panel + website. */
:root {
${cssBlock()}

  /* semantic — light (default) */
${semanticCss('light')}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${semanticCss('dark', '    ')}
  }
}

:root[data-theme="light"] {
${semanticCss('light')}
}

:root[data-theme="dark"] {
${semanticCss('dark')}
}

/* Responsive spacing roles — see responsiveRoleCss in build.mjs. */
${responsiveRoleCss()}
`;

/* ---------- CSS (values only, single theme) ----------
   A flat :root with the ramp + scales + LIGHT semantic values and NO
   @media / [data-theme] theme-switching. For single-theme consumers (the
   website) that pull token VALUES and drive their own theming: importing the
   theme-adaptive tokens.css above would let its dark rules override the
   consumer's own accent. */
const valuesCss = `/* Babel Design Tokens (values only) — GENERATED from tokens.json. Do not edit. */
/* Flat single-theme values (ramp + type + space + radius + z + light semantics),
   no @media / [data-theme] rules. For consumers that theme themselves (website). */
:root {
${cssBlock()}

  /* semantic values (light) — plain, no theme switching */
${semanticCss('light')}
}

/* Responsive spacing roles — see responsiveRoleCss in build.mjs. These are
   viewport rules, not theme rules, so they belong in the values build too. */
${responsiveRoleCss()}
`;

/* ---------- Dart ---------- */
function dartColors() {
  const L = [];
  L.push('/// Color ramps (theme-invariant).');
  L.push('abstract final class BabelColors {');
  for (const [group, ramp] of Object.entries(tokens.color)) {
    for (const [step, val] of Object.entries(ramp)) {
      const v = resolve(val);
      if (isHex(v))
        L.push(`  static const Color ${dartName(group + '-' + step)} = Color(${hexToArgb(v)});`);
    }
  }
  L.push('}');
  return L.join('\n');
}
function dartSemantic(theme) {
  const L = [];
  L.push(`/// Semantic colors — ${theme} theme.`);
  L.push(`abstract final class BabelColors${theme[0].toUpperCase() + theme.slice(1)} {`);
  for (const [name, pair] of Object.entries(tokens.semantic)) {
    const v = resolve(pair[theme]);
    if (isHex(v)) L.push(`  static const Color ${dartName(name)} = Color(${hexToArgb(v)});`);
  }
  L.push('}');
  return L.join('\n');
}
/* Elevation per theme — the same --shadow-* ramp semanticCss emits. Named
   BabelShadowLight/Dark after BabelColorsLight/Dark: in this file a bare
   `Babel<Thing>` class is theme-invariant, and these are not — the light
   arm's warm tint vanishes on a dark surface. A digit-leading step gets a
   letter, as BabelRadius.r2xl does: dartName's `_2xl` would be private. */
function dartShadows(theme) {
  const Theme = theme[0].toUpperCase() + theme.slice(1);
  const L = [];
  L.push(`/// Elevation shadows — ${theme} theme. The web's \`--shadow-*\` ramp, one`);
  L.push('/// [BoxShadow] per CSS layer: `BoxDecoration(boxShadow: BabelShadow' + Theme + '.sm)`.');
  L.push(`abstract final class BabelShadow${Theme} {`);
  for (const [name, pair] of Object.entries(tokens.shadow)) {
    if (typeof pair?.[theme] !== 'string')
      throw new Error(`shadow.${name} has no ${theme} value; every step needs both themes.`);
    L.push(`  static const List<BoxShadow> ${dartName(name).replace(/^_/, 's')} = <BoxShadow>[`);
    for (const layer of dartShadowLayers(pair[theme], `shadow.${name}.${theme}`))
      L.push(`    ${layer},`);
    L.push('  ];');
  }
  L.push('}');
  return L.join('\n');
}
/* Layout helpers, generated from the same ladder as the CSS.
   `BabelSpace.s_4` is a number; the point of these is that a widget tree
   should not have to build an EdgeInsets or a SizedBox by hand every time,
   which is how 1,704 literal EdgeInsets accumulated in the mobile app. */
const dartSpaceKeys = Object.keys(tokens.space);
const gapName = (k) => (k === 'px' ? 'px' : String(k).replace('_', ''));

function dartGaps() {
  const L = [];
  L.push('/// Fixed gaps between widgets, on the ladder. `BabelGap.h4` is a');
  L.push('/// 16-logical-pixel vertical gap; `BabelGap.w2` an 8px horizontal one.');
  L.push('abstract final class BabelGap {');
  for (const k of dartSpaceKeys)
    L.push(`  static const Widget h${gapName(k)} = SizedBox(height: BabelSpace.s${dartName(k)});`);
  for (const k of dartSpaceKeys)
    L.push(`  static const Widget w${gapName(k)} = SizedBox(width: BabelSpace.s${dartName(k)});`);
  L.push('}');
  return L.join('\n');
}

function dartInsets() {
  const L = [];
  L.push('/// EdgeInsets on the ladder. `a` = all, `h` = horizontal, `v` = vertical.');
  L.push('abstract final class BabelInsets {');
  for (const k of dartSpaceKeys)
    L.push(`  static const EdgeInsets a${gapName(k)} = EdgeInsets.all(BabelSpace.s${dartName(k)});`);
  for (const k of dartSpaceKeys)
    L.push(`  static const EdgeInsets h${gapName(k)} = EdgeInsets.symmetric(horizontal: BabelSpace.s${dartName(k)});`);
  for (const k of dartSpaceKeys)
    L.push(`  static const EdgeInsets v${gapName(k)} = EdgeInsets.symmetric(vertical: BabelSpace.s${dartName(k)});`);
  L.push('}');
  return L.join('\n');
}

/**
 * spaceRole for Dart — the SAME roles the CSS build emits, generated from
 * the same source instead of restated by hand.
 *
 * This exists because the hand-written line it replaces had drifted. Dart
 * carried `BabelInsets.card = all(space.4)` = 16 while CSS resolved
 * `--pad-card` to space.6 = 24: one role name, two numbers, in the package
 * whose whole purpose is one vocabulary. Nothing consumed the Dart side, so
 * the divergence was invisible and free to fix — which is exactly the window
 * in which to fix it.
 *
 * Three roles do not survive the trip, and are skipped deliberately rather
 * than approximated:
 *   - `measure-prose` is 60ch. `ch` is a font-relative CSS unit with no
 *     Dart equivalent; a hardcoded pixel guess would be a different token
 *     wearing this one's name.
 *   - numeric roles (`control-h`) already ship as [BabelSize], and emitting
 *     them twice would let the two copies disagree later.
 *   - responsive roles cannot be `const` in Dart, because the value depends
 *     on a width only known at layout time. Their steps are emitted as
 *     separate constants plus a resolver, so the breakpoints stay in the
 *     token source rather than being re-typed in each app.
 */
function dartRoles() {
  const rung = (v) => {
    const m = String(v).trim().match(/^\{space\.([^}]+)\}$/);
    return m ? `BabelSpace.s${dartName(m[1])}` : null;
  };
  const L = [];
  L.push('/// Spacing ROLES — which number a given JOB uses, as opposed to');
  L.push('/// [BabelSpace], which says which numbers are legal at all.');
  L.push('///');
  L.push('/// Spend these when the job has a name: a card inset is');
  L.push('/// [BabelRole.padCard], not `BabelInsets.a6`. The rung is an');
  L.push('/// implementation detail of the role and may move; the job does not.');
  L.push('abstract final class BabelRole {');
  for (const [k, v] of Object.entries(tokens.spaceRole)) {
    const name = dartName(k);
    if (typeof v === 'number') continue; // BabelSize carries these
    if (v && typeof v === 'object') continue; // responsive, below
    const single = rung(v);
    if (single) {
      L.push(
        k.startsWith('gap-')
          ? `  static const double ${name} = ${single};`
          : `  static const EdgeInsets ${name} = EdgeInsets.all(${single});`,
      );
      continue;
    }
    const parts = String(v).trim().split(/\s+/).map(rung);
    if (parts.length === 2 && parts.every(Boolean)) {
      L.push(
        `  static const EdgeInsets ${name} = EdgeInsets.symmetric(` +
          `vertical: ${parts[0]}, horizontal: ${parts[1]});`,
      );
      continue;
    }
    L.push(`  // ${k}: ${v} — no Dart equivalent; see the note above.`);
  }
  for (const [k, v] of Object.entries(tokens.spaceRole)) {
    if (!v || typeof v !== 'object') continue;
    const name = dartName(k);
    const steps = [];
    for (const [bp, val] of Object.entries(v)) {
      const r = rung(val);
      if (!r) throw new Error(`spaceRole.${k}.${bp} is not a single {space.N}`);
      if (bp === 'base') {
        L.push(`  static const double ${name}Base = ${r};`);
      } else {
        const min = tokens.breakpoint[bp];
        if (min === undefined) throw new Error(`Unknown breakpoint {${bp}} on spaceRole.${k}`);
        const step = `${name}At${bp[0].toUpperCase()}${bp.slice(1)}`;
        L.push(`  static const double ${step} = ${r};`);
        steps.push({ min, ref: step });
      }
    }
    steps.sort((a, b) => b.min - a.min);
    L.push('');
    L.push(`  /// [${name}] for a viewport [width], mirroring the CSS media`);
    L.push('  /// steps exactly. Not a constant: the value depends on a width');
    L.push('  /// only known at layout time.');
    L.push(`  static double ${name}For(double width) =>`);
    for (const st of steps) L.push(`      width >= ${st.min} ? ${st.ref} :`);
    L.push(`      ${name}Base;`);
  }
  L.push('}');
  return L.join('\n');
}

function dartDurations() {
  const L = ['/// Animation durations. One ladder for every transition in the app.',
             'abstract final class BabelDuration {'];
  for (const [k, v] of Object.entries(tokens.duration))
    L.push(`  static const Duration ${dartName(k)} = Duration(milliseconds: ${v});`);
  L.push('}');
  return L.join('\n');
}

function dartEasings() {
  const L = ['/// Easing curves, as exact `Cubic`s rather than the nearest named',
             '/// `Curves.*` constant — so a sheet opens on the IDENTICAL curve here and',
             '/// on the web, instead of a visually-close approximation.',
             'abstract final class BabelEasing {'];
  for (const [k, v] of Object.entries(tokens.easing))
    L.push(`  static const Curve ${dartName(k)} = ${dartCurve(v)};`);
  L.push('}');
  return L.join('\n');
}

function dartMotionRoles() {
  const L = [
    '/// A duration + curve pair.',
    '///',
    '/// Roles exist so a call site names the JOB ("this is a hover") rather than',
    '/// picking a number, which is what let 18 durations and 7 curves accumulate.',
    'final class BabelMotionRole {',
    '  final Duration duration;',
    '  final Curve curve;',
    '  const BabelMotionRole(this.duration, this.curve);',
    '}',
    '',
    '/// Motion roles — which duration/curve pair a given job uses.',
    '///',
    '/// Usage: `AnimatedContainer(duration: BabelMotion.hover.duration,',
    '/// curve: BabelMotion.hover.curve, ...)`.',
    'abstract final class BabelMotion {',
  ];
  for (const [k, v] of Object.entries(tokens.motionRole)) {
    const { duration, easing } = motionRoleRef(k, v);
    L.push(`  static const BabelMotionRole ${dartName(k)} = `
      + `BabelMotionRole(BabelDuration.${dartName(duration)}, BabelEasing.${dartName(easing)});`);
  }
  L.push('}');
  return L.join('\n');
}

const dart = `// Babel Design Tokens — GENERATED from tokens.json. Do not edit.
// Brand: black core + bronze accent (#B08D57). Consumed by mobile via the
// babel_design_tokens pub package (import 'package:babel_design_tokens/babel_tokens.dart').
//
// Imports flutter/widgets (not just dart:ui) because BabelGap, BabelInsets and
// BabelShadowLight/Dark are Widget, EdgeInsets and BoxShadow constants. The
// package already depends on Flutter.
import 'package:flutter/widgets.dart';

${dartColors()}

${dartSemantic('light')}

${dartSemantic('dark')}

/// Spacing scale (logical px). One 4px-based ladder for the whole app.
abstract final class BabelSpace {
${Object.entries(tokens.space).map(([k, v]) => `  static const double s${dartName(k)} = ${Number(v).toFixed(1)};`).join('\n')}
}

${dartGaps()}

${dartInsets()}

${dartRoles()}

/// Control sizes. One height for every full-size form control, so labels and
/// fields line up by construction instead of each caller nudging its own.
abstract final class BabelSize {
${Object.entries(tokens.spaceRole)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => `  static const double ${dartName(k)} = ${Number(v).toFixed(1)};`)
  .join('\n')}
}

/// Corner radii (logical px).
abstract final class BabelRadius {
${Object.entries(tokens.radius).map(([k, v]) => `  static const double ${dartName(k).replace(/^_/, 'r')} = ${Number(v).toFixed(1)};`).join('\n')}
}

/// Border widths shared across the products — see the border group in tokens.json.
abstract final class BabelBorder {
${Object.entries(tokens.border).map(([k, v]) => `  static const double ${dartName(k)} = ${Number(v).toFixed(1)};`).join('\n')}
}

${dartShadows('light')}

${dartShadows('dark')}

${dartDurations()}

${dartEasings()}

${dartMotionRoles()}

/// Type scale (logical px) + families.
abstract final class BabelType {
  static const String display = 'Space Grotesk';
  static const String body = 'Inter';
${Object.entries(tokens.font.size).map(([k, v]) => `  static const double size${dartName(k).replace(/^_/, 'S')} = ${Number(v).toFixed(1)};`).join('\n')}
}
`;

/* ══════════════════════════════════════════════════════════════════════════
   CONTRACTS

   Same shape as the token half above: read JSON, emit one artefact per
   ecosystem. The difference is that a token is a VALUE and a contract is a
   VOCABULARY, so the outputs carry three things a colour never needs —
   `aliases` (legacy spellings a reader must accept), `deprecated` (values
   still on the wire but never emitted again) and `onUnknown` (whether an
   unrecognised value is a 400 or is passed through untouched).
   ══════════════════════════════════════════════════════════════════════════ */

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const jsonFiles = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
    : [];

const errorCodes = readJson(join(CONTRACTS, 'error-codes.json'));
const fieldErrorCodes = readJson(join(CONTRACTS, 'field-error-codes.json'));

/** One entry per contracts/enums/*.json, in filename order. */
const enums = jsonFiles(join(CONTRACTS, 'enums')).map((f) => {
  const c = readJson(join(CONTRACTS, 'enums', f));
  const pascal = c.$meta.name;                       // NotificationType
  return {
    file: f,
    pascal,
    // NotificationType → NOTIFICATION_TYPE → notificationType
    screaming: pascal.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase(),
    camel: pascal[0].toLowerCase() + pascal.slice(1),
    values: c.values,
    deprecated: c.deprecated ?? [],
    aliases: c.aliases ?? {},
    subsets: c.subsets ?? null,
    onUnknown: c.$meta.onUnknown,
    aliasMatch: c.$meta.aliasMatch ?? 'exact',
    description: c.$meta.description,
  };
});

/** contracts/rules/*.json merged into one flat scalar map. */
const rules = {};
const ruleSource = {};
for (const f of jsonFiles(join(CONTRACTS, 'rules'))) {
  const c = readJson(join(CONTRACTS, 'rules', f));
  for (const [k, v] of Object.entries(c.rules)) {
    if (k in rules)
      throw new Error(`Duplicate rule "${k}" in rules/${f} and rules/${ruleSource[k]}`);
    rules[k] = v;
    ruleSource[k] = f;
  }
}

/* ---------- contracts: flat map ----------
   Scalars flatten to dotted keys exactly like tokens.flat.json. A value LIST
   does NOT flatten: the list IS the atomic unit of an enum, and exploding
   `values` into `enum.x.values.0` would make the one thing every consumer
   reads unreadable. */
const contractsFlat = {};
for (const [name, value] of Object.entries(errorCodes.codes))
  contractsFlat[`errorCode.${name}`] = value;
for (const [name, value] of Object.entries(fieldErrorCodes.codes))
  contractsFlat[`fieldErrorCode.${name}`] = value;
for (const [name, params] of Object.entries(fieldErrorCodes.params))
  contractsFlat[`fieldErrorParams.${name}`] = params;
for (const e of enums) {
  contractsFlat[`enum.${e.camel}.values`] = e.values;
  contractsFlat[`enum.${e.camel}.onUnknown`] = e.onUnknown;
  contractsFlat[`enum.${e.camel}.aliasMatch`] = e.aliasMatch;
  if (e.deprecated.length) contractsFlat[`enum.${e.camel}.deprecated`] = e.deprecated;
  for (const [from, to] of Object.entries(e.aliases))
    contractsFlat[`enum.${e.camel}.aliases.${from}`] = to;
  for (const [sub, vals] of Object.entries(e.subsets ?? {}))
    contractsFlat[`enum.${e.camel}.subsets.${sub}`] = vals;
}
for (const [k, v] of Object.entries(rules)) contractsFlat[`limit.${k}`] = v;

/* ---------- contracts: ESM ---------- */
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const jsList = (arr, indent = '  ') =>
  arr.length === 0
    ? '[]'
    : `[\n${arr.map((v) => `${indent}  ${q(v)},`).join('\n')}\n${indent}]`;
const jsMap = (obj, indent = '  ') =>
  Object.keys(obj).length === 0
    ? '{}'
    : `{\n${Object.entries(obj)
        .map(([k, v]) => `${indent}  ${q(k)}: ${typeof v === 'number' ? v : q(v)},`)
        .join('\n')}\n${indent}}`;

function mjsEnum(e) {
  const L = [`/** ${e.description} */`, `export const ${e.screaming} = Object.freeze({`];
  L.push(`  values: Object.freeze(${jsList(e.values)}),`);
  L.push(`  deprecated: Object.freeze(${jsList(e.deprecated)}),`);
  L.push(`  aliases: Object.freeze(${jsMap(e.aliases)}),`);
  if (e.subsets) {
    L.push('  subsets: Object.freeze({');
    for (const [k, vals] of Object.entries(e.subsets))
      L.push(`    ${k}: Object.freeze(${jsList(vals, '    ')}),`);
    L.push('  }),');
  }
  L.push(`  onUnknown: ${q(e.onUnknown)},`);
  L.push(`  aliasMatch: ${q(e.aliasMatch)},`);
  L.push('});');
  return L.join('\n');
}

const contractsMjs = `// Babel shared contracts — GENERATED from contracts/. Do not edit.
// The wire vocabulary shared by babel-lambda-api, babel-admin-panel and
// babel-mobile. Ships over npm here and over pub as dart/lib/babel_contracts.dart;
// both come off the SAME git tag, so a client and a server that pin the same
// release cannot disagree about what a value is called.
//
// See the package README for the intended consumption shape: DERIVE from these
// (\`z.enum(NOTIFICATION_TYPE.values)\`), never re-type them by hand — a
// hand-copied list is exactly the drift this file exists to end.

/** Stable \`error.<domain>.<action>\` codes on the \`errorCode\` field. */
export const ERROR_CODES = Object.freeze(${jsMap(errorCodes.codes, '')});

/** Stable \`error.field.*\` codes on the \`fieldErrors[]\` array of a 400. */
export const FIELD_ERROR_CODES = Object.freeze(${jsMap(fieldErrorCodes.codes, '')});

/** Constraint params each field-error code carries, for placeholder rendering. */
export const FIELD_ERROR_PARAMS = Object.freeze({
${Object.entries(fieldErrorCodes.params)
  .map(([k, v]) => `  ${k}: Object.freeze(${jsList(v)}),`)
  .join('\n')}
});

${enums.map(mjsEnum).join('\n\n')}

/** Every enum contract, keyed by name — for generic tooling. */
export const ENUMS = Object.freeze({
${enums.map((e) => `  ${e.camel}: ${e.screaming},`).join('\n')}
});

/** Numeric and string bounds more than one repo enforces independently. */
export const LIMITS = Object.freeze({
${Object.entries(rules).map(([k, v]) => `  ${k}: ${v},`).join('\n')}
});

/**
 * Resolve one wire value against a contract: an alias maps to its canonical
 * value, a canonical or deprecated value passes through, and anything else
 * obeys the contract's own \`onUnknown\` — \`preserve\` returns it verbatim
 * (the caller stores what the client sent), \`reject\` returns null (the
 * caller 400s). Honours \`aliasMatch\`.
 *
 * This is the one piece of behaviour worth shipping rather than describing:
 * every consumer would otherwise re-implement it, and a coerce-vs-reject
 * mistake in that re-implementation is silent.
 */
export function resolveContractValue(contract, value) {
  if (typeof value !== 'string') return null;
  const fold = contract.aliasMatch === 'case-insensitive'
    ? (s) => s.trim().toLowerCase()
    : (s) => s;
  const needle = fold(value);
  for (const v of contract.values) if (fold(v) === needle) return v;
  for (const [from, to] of Object.entries(contract.aliases))
    if (fold(from) === needle) return to;
  for (const v of contract.deprecated) if (fold(v) === needle) return v;
  return contract.onUnknown === 'preserve' ? value : null;
}
`;

/* ---------- contracts: .d.ts ----------
   Literal object types, not \`Record<string, string>\`: the point is that
   ERROR_CODES.PERMISSION_DENIED narrows to its exact string so a typo in a
   comparison is a compile error, and \`ErrorCode\` derives from the object
   rather than being a second hand-maintained union. */
const dtsMap = (obj) =>
  Object.entries(obj).map(([k, v]) => `  readonly ${k}: ${q(v)};`).join('\n');
const dtsTuple = (arr) =>
  arr.length === 0 ? 'readonly []' : `readonly [${arr.map(q).join(', ')}]`;

function dtsEnum(e) {
  const L = [`/** ${e.description} */`, `export declare const ${e.screaming}: {`];
  L.push(`  readonly values: ${dtsTuple(e.values)};`);
  L.push(`  readonly deprecated: ${dtsTuple(e.deprecated)};`);
  L.push(
    `  readonly aliases: ${Object.keys(e.aliases).length === 0
      ? 'Readonly<Record<never, never>>'
      : `{\n${Object.entries(e.aliases)
          .map(([k, v]) => `    readonly ${q(k)}: ${q(v)};`)
          .join('\n')}\n  }`};`,
  );
  if (e.subsets) {
    L.push('  readonly subsets: {');
    for (const [k, vals] of Object.entries(e.subsets))
      L.push(`    readonly ${k}: ${dtsTuple(vals)};`);
    L.push('  };');
  }
  L.push(`  readonly onUnknown: ${q(e.onUnknown)};`);
  L.push(`  readonly aliasMatch: ${q(e.aliasMatch)};`);
  L.push('};');
  L.push(`export type ${e.pascal} = (typeof ${e.screaming})['values'][number];`);
  if (e.deprecated.length)
    L.push(
      `/** ${e.pascal} plus the values still readable off the wire. Use this for a PARSER, `
      + `\`${e.pascal}\` for a WRITER. */`,
      `export type ${e.pascal}OrDeprecated = ${e.pascal} | (typeof ${e.screaming})['deprecated'][number];`,
    );
  return L.join('\n');
}

const contractsDts = `// Babel shared contracts — GENERATED from contracts/. Do not edit.

export declare const ERROR_CODES: {
${dtsMap(errorCodes.codes)}
};
/** Every value ERROR_CODES can hold. */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
/** Every KEY of ERROR_CODES (\`'PERMISSION_DENIED'\`), for exhaustive maps. */
export type ErrorCodeName = keyof typeof ERROR_CODES;

export declare const FIELD_ERROR_CODES: {
${dtsMap(fieldErrorCodes.codes)}
};
export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[keyof typeof FIELD_ERROR_CODES];
export type FieldErrorCodeName = keyof typeof FIELD_ERROR_CODES;

export declare const FIELD_ERROR_PARAMS: {
${Object.entries(fieldErrorCodes.params)
  .map(([k, v]) => `  readonly ${k}: ${dtsTuple(v)};`)
  .join('\n')}
};

/** One entry of the \`fieldErrors\` array on a 400 response. */
export interface FieldError {
  /** Body-relative dotted path a client maps to an input; empty for form-level issues. */
  field: string;
  /** Full transport path including the scope segment (\`body.email\`). */
  path: string;
  /** A FieldErrorCode — but typed \`string\`: an older client meets newer codes. */
  code: string;
  /** Localized per the request's Accept-Language. The fallback when \`code\` is unknown. */
  message: string;
  /** Constraint values for rendering — see FIELD_ERROR_PARAMS. */
  params: Record<string, unknown>;
}

${enums.map(dtsEnum).join('\n\n')}

export declare const ENUMS: {
${enums.map((e) => `  readonly ${e.camel}: typeof ${e.screaming};`).join('\n')}
};

export declare const LIMITS: {
${Object.entries(rules).map(([k, v]) => `  readonly ${k}: ${v};`).join('\n')}
};

/** Shape shared by every enum contract above. */
export interface EnumContract {
  readonly values: readonly string[];
  readonly deprecated: readonly string[];
  readonly aliases: Readonly<Record<string, string>>;
  readonly subsets?: Readonly<Record<string, readonly string[]>>;
  readonly onUnknown: 'preserve' | 'reject';
  readonly aliasMatch: 'exact' | 'case-insensitive';
}

/**
 * Resolve a wire value against a contract. Returns the canonical value, or the
 * input verbatim when the contract preserves unknowns, or null when it rejects.
 */
export declare function resolveContractValue(
  contract: EnumContract,
  value: unknown,
): string | null;
`;

/* ---------- contracts: Dart ---------- */
/** SCREAMING_SNAKE → lowerCamel, the Dart constant convention. */
const dartConst = (s) => s.toLowerCase().replace(/_(.)/g, (_, c) => c.toUpperCase());
/** Reserved words cannot be identifiers; suffix rather than silently mangle. */
const DART_RESERVED = new Set([
  'abstract', 'as', 'assert', 'async', 'await', 'break', 'case', 'catch', 'class',
  'const', 'continue', 'covariant', 'default', 'deferred', 'do', 'dynamic', 'else',
  'enum', 'export', 'extends', 'extension', 'external', 'factory', 'false', 'final',
  'finally', 'for', 'get', 'hide', 'if', 'implements', 'import', 'in', 'interface',
  'is', 'late', 'library', 'mixin', 'new', 'null', 'on', 'operator', 'part',
  'required', 'rethrow', 'return', 'set', 'show', 'static', 'super', 'switch',
  'sync', 'this', 'throw', 'true', 'try', 'typedef', 'var', 'void', 'while',
  'with', 'yield',
]);
const dartId = (s) => (DART_RESERVED.has(s) ? `${s}_` : s);
/**
 * The names a generated member cannot take, which is fewer than DART_RESERVED
 * above: that set also holds the built-in and contextual identifiers (`show`,
 * `on`, `get`, `set`, ...), and those are legal member names. These 33
 * reserved words do not compile as one. `await` and `yield` do, but are
 * reserved inside an async function or a generator, so no such function in
 * an app could read the member.
 */
const DART_RESERVED_WORDS = new Set([
  'assert', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'do',
  'else', 'enum', 'extends', 'false', 'final', 'finally', 'for', 'if', 'in', 'is',
  'new', 'null', 'rethrow', 'return', 'super', 'switch', 'this', 'throw', 'true',
  'try', 'var', 'void', 'while', 'with',
]);
const DART_ASYNC_RESERVED = new Set(['await', 'yield']);
/**
 * A Dart string literal. `$` is escaped as well as `\` and `'`: bare, it
 * interpolates, so an alias key `$onUnknown` would read the class's own
 * onUnknown in Dart while dist kept the literal text.
 */
const dartStr = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\$/g, '\\$')}'`;
const dartList = (arr, indent = '  ') =>
  arr.length === 0
    ? '<String>[]'
    : `<String>[\n${arr.map((v) => `${indent}  ${dartStr(v)},`).join('\n')}\n${indent}]`;
const dartMap = (obj, indent = '  ') =>
  Object.keys(obj).length === 0
    ? '<String, String>{}'
    : `<String, String>{\n${Object.entries(obj)
        .map(([k, v]) => `${indent}  ${dartStr(k)}: ${dartStr(v)},`)
        .join('\n')}\n${indent}}`;

function dartCodeClass(className, doc, codes) {
  const L = [`/// ${doc}`, `abstract final class ${className} {`];
  for (const [name, value] of Object.entries(codes))
    L.push(`  static const String ${dartId(dartConst(name))} = ${dartStr(value)};`);
  L.push('');
  L.push('  /// Every value above, for membership tests.');
  L.push(`  static const List<String> values = ${dartList(Object.values(codes))};`);
  L.push('}');
  return L.join('\n');
}

function dartEnumClass(e) {
  const L = [`/// ${e.description}`, `abstract final class Babel${e.pascal} {`];
  L.push(`  static const List<String> values = ${dartList(e.values)};`);
  L.push('');
  L.push('  /// Still readable off the wire; never emit these.');
  L.push(`  static const List<String> deprecated = ${dartList(e.deprecated)};`);
  L.push('');
  L.push('  /// Legacy spelling -> canonical value.');
  L.push(`  static const Map<String, String> aliases = ${dartMap(e.aliases)};`);
  if (e.subsets) {
    for (const [k, vals] of Object.entries(e.subsets)) {
      L.push('');
      L.push(`  static const List<String> ${dartId(k)} = ${dartList(vals)};`);
    }
  }
  L.push('');
  L.push(`  static const String onUnknown = ${dartStr(e.onUnknown)};`);
  L.push(`  static const String aliasMatch = ${dartStr(e.aliasMatch)};`);
  L.push('');
  L.push('  /// See [resolveContractValue] — the Dart twin of the npm helper.');
  L.push('  static String? resolve(String? value) => resolveContractValue(');
  L.push('        value,');
  L.push('        values: values,');
  L.push('        aliases: aliases,');
  L.push('        deprecated: deprecated,');
  L.push('        onUnknown: onUnknown,');
  L.push('        aliasMatch: aliasMatch,');
  L.push('      );');
  L.push('}');
  return L.join('\n');
}

const contractsDart = `// Babel shared contracts — GENERATED from contracts/. Do not edit.
//
// The wire vocabulary shared with babel-lambda-api and babel-admin-panel. This
// is the pub half of the same release the web apps get over npm, so a mobile
// binary and a server on the same tag cannot disagree about what a value is
// called.
//
// Pure Dart — no Flutter import, unlike babel_tokens.dart. A contract is a
// string vocabulary; nothing here needs a Widget, so this file is usable from
// a plain \`dart\` isolate and from tests without a binding.
//
// Values are Strings rather than a Dart \`enum\` ON PURPOSE. A generated enum
// would make an unrecognised server value unrepresentable, and the whole point
// of \`onUnknown: preserve\` is that an old binary meeting a new value must keep
// working. Wrap these in your own enum where you want exhaustiveness, and keep
// a fallback member (mobile already does: NotificationType.unknown).

${dartCodeClass(
  'BabelErrorCodes',
  'Stable `error.<domain>.<action>` codes on the `errorCode` field.',
  errorCodes.codes,
)}

${dartCodeClass(
  'BabelFieldErrorCodes',
  'Stable `error.field.*` codes on the `fieldErrors` array of a 400.',
  fieldErrorCodes.codes,
)}

/// Constraint params each field-error code carries, for placeholder rendering.
abstract final class BabelFieldErrorParams {
  static const Map<String, List<String>> byCode = <String, List<String>>{
${Object.entries(fieldErrorCodes.params)
  .map(([k, v]) => `    ${dartStr(fieldErrorCodes.codes[k])}: ${dartList(v, '    ')},`)
  .join('\n')}
  };
}

${enums.map(dartEnumClass).join('\n\n')}

/// Numeric and string bounds more than one repo enforces independently.
abstract final class BabelLimits {
${Object.entries(rules)
  .map(([k, v]) => `  static const int ${dartId(k)} = ${v};`)
  .join('\n')}
}

/// Resolve one wire value against a contract: an alias maps to its canonical
/// value, a canonical or deprecated value passes through, and anything else
/// obeys [onUnknown] — \`preserve\` returns it verbatim, \`reject\` returns null.
///
/// Kept as a free function so the generated classes stay pure data.
String? resolveContractValue(
  String? value, {
  required List<String> values,
  required Map<String, String> aliases,
  required List<String> deprecated,
  required String onUnknown,
  required String aliasMatch,
}) {
  if (value == null) return null;
  String fold(String s) =>
      aliasMatch == 'case-insensitive' ? s.trim().toLowerCase() : s;
  final needle = fold(value);
  for (final v in values) {
    if (fold(v) == needle) return v;
  }
  for (final entry in aliases.entries) {
    if (fold(entry.key) == needle) return entry.value;
  }
  for (final v in deprecated) {
    if (fold(v) == needle) return v;
  }
  return onUnknown == 'preserve' ? value : null;
}
`;

/* ---------- the generated Dart is all public ----------
   A leading underscore makes a Dart name library-private, and dartName gives
   one to every digit-leading key (`2xl` → `_2xl`) for the emitter to swap
   for a letter (BabelRadius.r2xl, BabelType.sizeS2xl, BabelShadowLight.s2xl).
   An emitter that forgets still builds, ships `--<group>-2xl` to the web, and
   hands Flutter a member no importer can reach. So the emitted source is
   scanned rather than each emitter trusted to remember: every group, one
   added later included, fails here by name. Comments and string literals are
   skipped; only code is API.
   A key that is a Dart reserved word is refused the same way. dartName
   passes `default` through, so `radius.default` emitted `static const
   double default`, which does not compile, and only `dart analyze` under
   Flutter saw it. It is refused rather than suffixed as dartId does, because
   dartName's result is also spliced into longer names (`s_4`, `sizelg`)
   where a suffix would rename a legal one. A built-in identifier such as
   `show` or `on` is a legal member name and passes (DART_RESERVED_WORDS). */
const assertDartPublic = (source, file) => {
  let owner = '';
  source.split('\n').forEach((line, i) => {
    const code = line.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, "''").replace(/\/\/.*/, '');
    const priv = code.match(/(?<![\w$])_[\w$]*/);
    if (priv) {
      throw new Error(
        `${file}:${i + 1}: \`${owner}${priv[0]}\` would be library-private, so no app `
        + `importing ${file} could use it. Rename the source key, or have its emitter `
        + `put a letter first, as BabelRadius does for 2xl (r2xl).\n    ${line.trim()}`,
      );
    }
    const decl = code.match(/\bstatic\s+const\s+.+?\s(\w+)\s*=/);
    if (decl && (DART_RESERVED_WORDS.has(decl[1]) || DART_ASYNC_RESERVED.has(decl[1]))) {
      throw new Error(
        `${file}:${i + 1}: \`${owner}${decl[1]}\` is a Dart reserved word: `
        + (DART_ASYNC_RESERVED.has(decl[1])
          ? `it compiles as a name, but no async function or generator could read it`
          : `a reserved word such as \`default\` or \`in\` does not compile as a name`)
        + ` (the contracts emitter suffixes them, as \`default_\`). Rename the `
        + `source key.\n    ${line.trim()}`,
      );
    }
    const cls = code.match(/\bclass\s+(\w+)/);
    if (cls) owner = `${cls[1]}.`;
    else if (line.startsWith('}')) owner = '';
  });
};
assertDartPublic(dart, 'babel_tokens.dart');
assertDartPublic(contractsDart, 'babel_contracts.dart');

/* ---------- write (or, with --check, compare) ---------- */
const DART_LIB = join(ROOT, 'dart', 'lib');
const outputs = [
  [join(DIST, 'tokens.css'), css],
  [join(DIST, 'tokens.values.css'), valuesCss],
  [join(DIST, 'tokens.flat.json'), JSON.stringify(flat, null, 2) + '\n'],
  [join(DART_LIB, 'babel_tokens.dart'), dart],
  [join(DIST, 'contracts.mjs'), contractsMjs],
  [join(DIST, 'contracts.d.ts'), contractsDts],
  [join(DIST, 'contracts.flat.json'), JSON.stringify(contractsFlat, null, 2) + '\n'],
  [join(DART_LIB, 'babel_contracts.dart'), contractsDart],
];

const rel = (p) => p.slice(ROOT.length + 1);

if (CHECK_ONLY) {
  const stale = outputs.filter(
    ([p, content]) => !existsSync(p) || readFileSync(p, 'utf8') !== content,
  );
  if (stale.length) {
    console.error(
      `✗ ${stale.length} generated file(s) do not match the source:\n`
      + stale.map(([p]) => `    ${rel(p)}`).join('\n')
      + '\n\n  Run `npm run build` and commit the result.',
    );
    process.exit(1);
  }
  console.log(`✓ all ${outputs.length} generated files match tokens.json + contracts/`);
} else {
  mkdirSync(DIST, { recursive: true });
  mkdirSync(DART_LIB, { recursive: true });
  for (const [p, content] of outputs) writeFileSync(p, content);

  const nColors = Object.values(tokens.color).reduce((n, r) => n + Object.keys(r).length, 0);
  console.log(
    `✓ tokens     ${nColors} color steps, ${Object.keys(tokens.semantic).length} semantic roles, `
    + `${Object.keys(flat).length} flat tokens\n`
    + `✓ contracts  ${Object.keys(errorCodes.codes).length} error codes, `
    + `${Object.keys(fieldErrorCodes.codes).length} field-error codes, `
    + `${enums.length} enums (${enums.reduce((n, e) => n + e.values.length, 0)} values), `
    + `${Object.keys(rules).length} limits\n`
    + `  → ${outputs.map(([p]) => rel(p)).join('  ')}`,
  );
}
