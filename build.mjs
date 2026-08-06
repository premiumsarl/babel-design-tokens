#!/usr/bin/env node
/**
 * Babel design-token generator.
 *
 * Reads tokens.json (the single source of truth) and emits:
 *   - dist/tokens.css            theme-adaptive CSS custom properties → admin panel
 *   - dist/tokens.values.css     flat (no-@media) CSS values          → website
 *   - dist/tokens.flat.json      resolved flat map                    → tooling / CI ratchet
 *   - dart/lib/babel_tokens.dart Dart constants (a pub package)       → mobile
 *
 * No external dependencies: alias resolution ({color.brand.500}) is done here,
 * so the pipeline runs anywhere Node runs. Never hand-edit dist/ — regenerate.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
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
['color', 'semantic', 'font', 'space', 'spaceRole', 'radius', 'shadow', 'z',
 'breakpoint'].forEach(
  (g) => walkFlat(tokens[g], g),
);

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
  // The card/screen padding role, so a screen does not have to remember 16.
  L.push(`  static const EdgeInsets card = EdgeInsets.all(BabelSpace.s${dartName('4')});`);
  L.push('}');
  return L.join('\n');
}

const dart = `// Babel Design Tokens — GENERATED from tokens.json. Do not edit.
// Brand: black core + bronze accent (#B08D57). Consumed by mobile via the
// babel_design_tokens pub package (import 'package:babel_design_tokens/babel_tokens.dart').
//
// Imports flutter/widgets (not just dart:ui) because BabelGap and BabelInsets
// are Widget and EdgeInsets constants. The package already depends on Flutter.
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

/// Type scale (logical px) + families.
abstract final class BabelType {
  static const String display = 'Space Grotesk';
  static const String body = 'Inter';
${Object.entries(tokens.font.size).map(([k, v]) => `  static const double size${dartName(k).replace(/^_/, 'S')} = ${Number(v).toFixed(1)};`).join('\n')}
}
`;

/* ---------- write ---------- */
const DART_LIB = join(ROOT, 'dart', 'lib');
mkdirSync(DIST, { recursive: true });
mkdirSync(DART_LIB, { recursive: true });
writeFileSync(join(DIST, 'tokens.css'), css);
writeFileSync(join(DIST, 'tokens.values.css'), valuesCss);
writeFileSync(join(DIST, 'tokens.flat.json'), JSON.stringify(flat, null, 2) + '\n');
writeFileSync(join(DART_LIB, 'babel_tokens.dart'), dart);

const nColors = Object.values(tokens.color).reduce((n, r) => n + Object.keys(r).length, 0);
console.log(
  `✓ built  (${nColors} color steps, ${Object.keys(tokens.semantic).length} semantic roles, ` +
  `${Object.keys(flat).length} flat tokens)\n` +
  `  → dist/tokens.css  dist/tokens.values.css  dist/tokens.flat.json  dart/lib/babel_tokens.dart`,
);
