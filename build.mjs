#!/usr/bin/env node
/**
 * Babel design-token generator.
 *
 * Reads tokens.json (the single source of truth) and emits, into dist/:
 *   - tokens.css        CSS custom properties  → admin panel + website
 *   - babel_tokens.dart Dart constants          → mobile (base_mobile_library)
 *   - tokens.flat.json  resolved flat map       → tooling / the CI ratchet
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
['color', 'semantic', 'font', 'space', 'radius', 'shadow', 'z'].forEach(
  (g) => walkFlat(tokens[g], g),
);

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
  // space / radius / z
  for (const [k, v] of Object.entries(tokens.space))
    L.push(`${indent}--space-${k.replace('_', '-')}: ${v}px;`);
  for (const [k, v] of Object.entries(tokens.radius))
    L.push(`${indent}--radius-${k}: ${v === 9999 ? '9999px' : v + 'px'};`);
  for (const [k, v] of Object.entries(tokens.z))
    L.push(`${indent}--z-${k}: ${v};`);
  return L.join('\n');
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
const dart = `// Babel Design Tokens — GENERATED from tokens.json. Do not edit.
// Brand: black core + bronze accent (#B08D57). Consumed by mobile (base_mobile_library).
import 'dart:ui';

${dartColors()}

${dartSemantic('light')}

${dartSemantic('dark')}

/// Spacing scale (logical px). One 4px-based ladder for the whole app.
abstract final class BabelSpace {
${Object.entries(tokens.space).map(([k, v]) => `  static const double s${dartName(k)} = ${Number(v).toFixed(1)};`).join('\n')}
}

/// Corner radii (logical px).
abstract final class BabelRadius {
${Object.entries(tokens.radius).map(([k, v]) => `  static const double ${dartName(k)} = ${Number(v).toFixed(1)};`).join('\n')}
}

/// Type scale (logical px) + families.
abstract final class BabelType {
  static const String display = 'Space Grotesk';
  static const String body = 'Inter';
${Object.entries(tokens.font.size).map(([k, v]) => `  static const double size${dartName(k).replace(/^_/, 'S')} = ${Number(v).toFixed(1)};`).join('\n')}
}
`;

/* ---------- write ---------- */
mkdirSync(DIST, { recursive: true });
writeFileSync(join(DIST, 'tokens.css'), css);
writeFileSync(join(DIST, 'babel_tokens.dart'), dart);
writeFileSync(join(DIST, 'tokens.flat.json'), JSON.stringify(flat, null, 2) + '\n');

const nColors = Object.values(tokens.color).reduce((n, r) => n + Object.keys(r).length, 0);
console.log(
  `✓ built dist/  (${nColors} color steps, ${Object.keys(tokens.semantic).length} semantic roles, ` +
  `${Object.keys(flat).length} flat tokens)\n  → tokens.css  babel_tokens.dart  tokens.flat.json`,
);
