#!/usr/bin/env node
/**
 * Accessibility self-check for the semantic palette.
 *
 * Verifies WCAG contrast for the foreground/background pairs the tokens
 * promise (button text on core, accent text/buttons, body text, status
 * pills) in BOTH themes. Fails if a pair that should be readable isn't.
 * Run after build: node scripts/check-contrast.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const flat = JSON.parse(readFileSync(join(ROOT, '..', 'dist', 'tokens.flat.json'), 'utf8'));

const lin = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const S = (k) => flat[`semantic.${k}`];

// [fg, bg, minimum, label]  — 4.5 = AA text, 3.0 = AA large/UI element
const checks = (t) => [
  [S(`onCore.${t}`), S(`core.${t}`), 4.5, 'button text on core (primary)'],
  [S(`onAccent.${t}`), S(`accentStrong.${t}`), 4.5, 'text on accent-strong button'],
  [S(`accentStrong.${t}`), S(`surface.${t}`), 4.5, 'accent text / link on surface'],
  [S(`link.${t}`), S(`canvas.${t}`), 4.5, 'link on canvas'],
  [S(`text.${t}`), S(`canvas.${t}`), 4.5, 'body text on canvas'],
  [S(`text.${t}`), S(`surface.${t}`), 4.5, 'body text on surface'],
  [S(`textSecondary.${t}`), S(`canvas.${t}`), 4.5, 'secondary text on canvas'],
  [S(`successText.${t}`), S(`successBg.${t}`), 4.5, 'success pill'],
  [S(`warningText.${t}`), S(`warningBg.${t}`), 4.5, 'warning pill'],
  [S(`errorText.${t}`), S(`errorBg.${t}`), 4.5, 'error pill'],
  [S(`infoText.${t}`), S(`infoBg.${t}`), 4.5, 'info pill'],
  ['#ffffff', S(`errorSolid.${t}`), 4.5, 'white text on error-solid button'],
  [S(`accent.${t}`), S(`surface.${t}`), 3.0, 'accent (decorative) on surface — UI/large only'],
  [S(`focusRing.${t}`), S(`surface.${t}`), 3.0, 'focus ring vs surface'],
];

let failed = 0;
for (const theme of ['light', 'dark']) {
  console.log(`\n${theme.toUpperCase()}`);
  for (const [fg, bg, min, label] of checks(theme)) {
    const r = ratio(fg, bg);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`  ${ok ? '✓' : '✗'} ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${label}`);
  }
}
console.log(failed ? `\n✗ ${failed} pair(s) below target` : `\n✓ all pairs pass their WCAG target`);
process.exit(failed ? 1 : 0);
