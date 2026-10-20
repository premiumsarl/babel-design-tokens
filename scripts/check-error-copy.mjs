#!/usr/bin/env node
/**
 * Error-copy guard: fails the build on NEW generic error wording (ERROR-2,
 * ERROR-10).
 *
 * One scanner for every app, vendored the way check-tokens.mjs is. It reads
 * the banned phrases from contracts/rules/generic-error-phrases.json and
 * counts four kinds of debt:
 *
 *   generic          a catalogue value, or a source literal that reads as
 *                    prose, matching a banned phrase for its locale (whole,
 *                    opening or anywhere; see the JSON's $meta.matching).
 *                    Adjacent string literals are JOINED first, so
 *                    'Something went ' + 'wrong' and Dart's
 *                    'Something went ' 'wrong' are one message.
 *   title-repeats    a title whose body repeats it: sibling catalogue keys
 *                    (`x_title` beside `x_message` / `x_description_message`
 *                    / `x.body` …), or `title` beside `body`/`message`/…
 *                    in one source object literal or JSX tag (ERROR-1).
 *   counter:<name>   an app-specific pattern counted per file, from the
 *                    config (raw `err.message` rendered, a call that falls
 *                    back to a shared generic key, …).
 *
 * The baseline is EXACT and per key (DONE-6, owner decision 2026-10-20):
 *   - a finding the baseline does not hold fails at once: a new generic
 *     string fails whatever the totals;
 *   - a count above its baseline fails;
 *   - a count BELOW its baseline also fails, until the baseline is lowered
 *     with --update-baseline, so the debt on record is always the real debt.
 * --update-baseline only lowers and removes entries; it never adds or raises
 * one. --init-baseline writes the first baseline and refuses when one exists.
 *
 * Usage:
 *   node check-error-copy.mjs --config <file> [--baseline <file>]
 *        [--update-baseline | --init-baseline] [--json]
 *
 * Config (JSON; every path is relative to the config file's folder, which is
 * also the root the report's paths are relative to):
 *   {
 *     "phrases":    "node_modules/@premiumsarl/babel-design-tokens/contracts/rules/generic-error-phrases.json",
 *     "catalogues": ["src/i18n"],              JSON/ARB files, or folders of them
 *     "sources":    ["src"],                   files, or folders walked recursively
 *     "extensions": [".ts", ".tsx"],           default .js .jsx .mjs .cjs .ts .tsx .dart
 *     "skip":       ["generated"],             extra folder names to skip
 *     "counters":   { "rendered-err-message": "\\b(?:err|e|error)\\.message\\b" },
 *     "allow":      { "<finding id>": "why this one is not a message (ERROR-2 status badge, …)" },
 *     "baseline":   ".error-copy-baseline.json"
 *   }
 *
 * Exit: 0 clean · 1 a finding over its baseline, a baseline above the real
 * count, or a stale allow · 2 usage or config error.
 *
 * Canonical copy: premiumsarl/babel-design-tokens scripts/check-error-copy.mjs.
 * `scripts/` is outside the package's `files`, so consumers hold copies.
 * Re-vendor by patch, and keep the `Vendored from …` header each copy adds.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

/* ── normalization + matching (the spec is generic-error-phrases.json $meta.matching) ── */

/** The normalized form a message is matched in. Phrases are stored in it. */
export function normalize(text) {
  return String(text)
    .normalize('NFC')
    .toLowerCase()
    .replace(/[‘’ʼ´`]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/[ً-ْـ]/g, '')
    .replace(/[\s   ⁠]+/gu, ' ')
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .trim();
}

const NO_SPACE_SCRIPT = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
const WORD_CHAR = /[\p{L}\p{N}]/u;
const TRAILING_PUNCT = /[\s.!?。！？…:;,，、"')\]]+$/u;

const boundaryAfter = (phrase, text, end) =>
  end >= text.length || NO_SPACE_SCRIPT.test(phrase.at(-1)) || !WORD_CHAR.test(text[end]);
const boundaryBefore = (phrase, text, start) =>
  start === 0 || NO_SPACE_SCRIPT.test(phrase[0]) || !WORD_CHAR.test(text[start - 1]);

/**
 * The first banned phrase a message matches, or null.
 * @param {object} phrases  the JSON's `phrases` ({ en: { whole, opening, anywhere }, … })
 * @param {string} message  raw text
 * @param {string[]|null} locales  the message's locale(s); null = every locale (a source literal)
 * @returns {{locale: string, mode: 'whole'|'opening'|'anywhere', phrase: string}|null}
 */
export function matchGeneric(phrases, message, locales = null) {
  const text = normalize(message);
  if (!text) return null;
  const bare = text.replace(TRAILING_PUNCT, '');
  for (const locale of locales ?? Object.keys(phrases)) {
    const list = phrases[locale];
    if (!list) continue;
    for (const phrase of list.whole ?? []) {
      if (bare === phrase) return { locale, mode: 'whole', phrase };
    }
    for (const phrase of list.opening ?? []) {
      if (text.startsWith(phrase) && boundaryAfter(phrase, text, phrase.length)) {
        return { locale, mode: 'opening', phrase };
      }
    }
    for (const phrase of list.anywhere ?? []) {
      let at = text.indexOf(phrase);
      while (at !== -1) {
        if (boundaryBefore(phrase, text, at) && boundaryAfter(phrase, text, at + phrase.length)) {
          return { locale, mode: 'anywhere', phrase };
        }
        at = text.indexOf(phrase, at + 1);
      }
    }
  }
  return null;
}

/** A title its body repeats: equal, or the body opens with it (ERROR-1). */
export function titleRepeatsBody(title, body) {
  const t = normalize(title).replace(TRAILING_PUNCT, '');
  const b = normalize(body);
  if (t.length < 2 || !b) return false;
  return b.replace(TRAILING_PUNCT, '') === t || (b.startsWith(t) && boundaryAfter(t, b, t.length));
}

/* ── source literals ── */

/** Reads as prose: an upper-case or non-Latin letter first, or a space between words. */
export const readsAsProse = (text) => {
  const t = String(text).trim();
  if (!/\p{L}/u.test(t)) return false;
  return /\s/.test(t) || /^[^\p{L}]*[\p{Lu}\p{Lo}]/u.test(t);
};

const LOG_CALL = /(?:\b(?:console|logger|log|_log|_logger|Logger|developer)\s*\.\s*\w+|\b(?:debugPrint|print|log))\s*\(\s*$/;
// `<` and `>` are left out on purpose: in JSX, `</p>` would read as a regex.
const REGEX_PRECEDER = /(?:^|[(,=:[!&|?{};+\-*%~^]|\breturn|\btypeof|\bcase|\bdo|\belse|\bin|\bof)\s*$/;

/**
 * Split a JS/TS/Dart source into code and string literals, joining adjacent
 * literals ('a' + 'b', and Dart's 'a' 'b') into one message. Comments are
 * dropped. Interpolations (`${…}`) become `{}`.
 * @returns {{strings: {value: string, line: number, logged: boolean}[], code: string, skeleton: string}}
 *   `code` is the source without comments; `skeleton` replaces each joined
 *   literal with \u0000<index>\u0000, for the object-literal title check.
 */
export function extractLiterals(src, ext = '.ts') {
  const dart = ext === '.dart';
  const jsx = ext === '.tsx' || ext === '.jsx';
  const parts = []; // {type:'code'|'str', text, line}
  let i = 0;
  let line = 1;
  let code = '';
  const pushCode = (s) => {
    if (!s) return;
    const last = parts.at(-1);
    if (last && last.type === 'code') last.text += s;
    else parts.push({ type: 'code', text: s });
    code += s;
  };
  const countLines = (s) => { for (const c of s) if (c === '\n') line += 1; };

  // Skip a `${ … }` expression starting at src[j] === '{'; returns the index after '}'.
  const skipInterpolation = (j) => {
    let depth = 0;
    for (; j < src.length; j += 1) {
      const c = src[j];
      if (c === '\n') line += 1;
      if (c === '{') depth += 1;
      else if (c === '}') { depth -= 1; if (depth === 0) return j + 1; }
      else if (c === '\'' || c === '"' || c === '`') {
        const q = c;
        for (j += 1; j < src.length && src[j] !== q; j += 1) {
          if (src[j] === '\\') j += 1;
          else if (src[j] === '\n') line += 1;
        }
      }
    }
    return j;
  };

  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    // comments
    if (c === '/' && next === '/') {
      const end = src.indexOf('\n', i);
      i = end === -1 ? src.length : end;
      continue;
    }
    if (c === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? src.length : end + 2;
      countLines(src.slice(i, stop));
      pushCode(' ');
      i = stop;
      continue;
    }
    // JS regex literal: skip it whole, or a quote inside it would open a string.
    if (!dart && c === '/' && REGEX_PRECEDER.test(code.slice(-40))) {
      let j = i + 1;
      let inClass = false;
      for (; j < src.length && src[j] !== '\n'; j += 1) {
        if (src[j] === '\\') { j += 1; continue; }
        if (src[j] === '[') inClass = true;
        else if (src[j] === ']') inClass = false;
        else if (src[j] === '/' && !inClass) break;
      }
      if (src[j] === '/') {
        let k = j + 1;
        while (k < src.length && /[a-z]/i.test(src[k])) k += 1;
        pushCode(src.slice(i, k));
        i = k;
        continue;
      }
    }
    if (c === '\'' || c === '"' || c === '`') {
      const prev = src[i - 1] ?? '';
      // A quote straight after a letter is an apostrophe in prose (JSX text:
      // "didn't"), never a string opener, except Dart's raw-string `r'`.
      const rawPrefix = dart && prev === 'r' && !/[\w$]/.test(src[i - 2] ?? '');
      if (/[\p{L}\p{N}_$]/u.test(prev) && !rawPrefix) {
        pushCode(c);
        i += 1;
        continue;
      }
      const startLine = line;
      const triple = dart && src.startsWith(c.repeat(3), i);
      const quote = triple ? c.repeat(3) : c;
      let j = i + quote.length;
      let value = '';
      while (j < src.length && !src.startsWith(quote, j)) {
        const ch = src[j];
        if (ch === '\\' && !rawPrefix) {
          const esc = src[j + 1];
          value += esc === 'n' ? '\n' : esc === 't' ? '\t' : (esc ?? '');
          j += 2;
          continue;
        }
        if (ch === '\n') {
          line += 1;
          if (!triple && c !== '`') break; // an unterminated single-line string: stop at the line
        }
        if (ch === '$' && src[j + 1] === '{' && (c === '`' || (dart && !rawPrefix))) {
          j = skipInterpolation(j + 1);
          value += '{}';
          continue;
        }
        value += ch;
        j += 1;
      }
      j = Math.min(src.length, j + quote.length);
      const gap = parts.at(-1);
      const before = gap && gap.type === 'code' ? gap.text : '';
      const prevStr = gap && gap.type === 'code' ? parts.at(-2) : gap;
      const joinable = prevStr && prevStr.type === 'str'
        && (gap === prevStr || (dart ? /^\s*\+?\s*$/ : /^\s*\+\s*$/).test(before));
      if (joinable) {
        if (gap !== prevStr) { parts.pop(); code = code.slice(0, code.length - before.length); }
        prevStr.text += value;
      } else {
        parts.push({ type: 'str', text: value, line: startLine, logged: LOG_CALL.test(code.slice(-60)) });
      }
      code += quote + quote; // keep the code shape, without the text
      i = j;
      continue;
    }
    pushCode(c);
    if (c === '\n') line += 1;
    i += 1;
  }

  const strings = [];
  let skeleton = '';
  for (const p of parts) {
    if (p.type === 'str') {
      skeleton += `\u0000${strings.length}\u0000`;
      strings.push({ value: p.text, line: p.line, logged: p.logged });
    } else {
      skeleton += p.text;
    }
  }
  // JSX text between tags is prose too: `<p>Something went wrong</p>`.
  if (jsx) {
    for (const p of parts) {
      if (p.type !== 'code') continue;
      for (const m of p.text.matchAll(/>([^<>{}\u0000]*\p{L}[^<>{}\u0000]*)</gu)) {
        if (m[1].trim()) strings.push({ value: m[1].trim(), line: 0, logged: false, jsxText: true });
      }
    }
  }
  return { strings, code, skeleton };
}

const TITLE_PROP = /(?:^|[\s,{(])(?:title|heading|headline)\s*[:=]\s*\{?\s*\u0000(\d+)\u0000/g;
const BODY_PROP = /(?:^|[\s,{(])(?:body|message|description|text|subtitle|details?)\s*[:=]\s*\{?\s*\u0000(\d+)\u0000/g;

/** Title/body pairs that repeat each other inside one object literal or JSX tag. */
export function sourceTitlePairs(skeleton, strings) {
  const pairs = [];
  const scopes = [...skeleton.matchAll(/\{[^{}]*\}/g), ...skeleton.matchAll(/<[A-Za-z][^<>]*>/g)];
  for (const [scope] of scopes) {
    const titles = [...scope.matchAll(TITLE_PROP)].map((m) => strings[Number(m[1])]?.value);
    const bodies = [...scope.matchAll(BODY_PROP)].map((m) => strings[Number(m[1])]?.value);
    for (const t of titles) {
      for (const b of bodies) {
        if (t != null && b != null && titleRepeatsBody(t, b)) pairs.push({ title: t, body: b });
      }
    }
  }
  return pairs;
}

/* ── catalogues ── */

/** Flatten a JSON catalogue to { 'a.b.c': 'value' }. ARB metadata (`@key`) is skipped. */
export function flattenCatalogue(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('@')) continue;
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[key] = v;
    else if (v && typeof v === 'object') flattenCatalogue(v, key, out);
  }
  return out;
}

const TITLE_SUFFIX = /(?:[._]title|Title)$/;
const BODY_WORDS = new Set(['message', 'description', 'body', 'subtitle', 'text', 'detail', 'details']);
const segments = (rest) => rest.split(/[._]|(?=[A-Z])/).filter(Boolean).map((s) => s.toLowerCase());

/** Sibling title/body keys in one catalogue whose values repeat each other. */
export function catalogueTitlePairs(flat) {
  const pairs = [];
  const keys = Object.keys(flat).sort();
  // First index whose key is >= stem: every key starting with stem follows it.
  const lowerBound = (stem) => {
    let lo = 0;
    let hi = keys.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (keys[mid] < stem) lo = mid + 1; else hi = mid;
    }
    return lo;
  };
  for (const titleKey of keys) {
    const m = titleKey.match(TITLE_SUFFIX);
    if (!m) continue;
    const stem = titleKey.slice(0, m.index);
    for (let i = lowerBound(stem); i < keys.length && keys[i].startsWith(stem); i += 1) {
      const bodyKey = keys[i];
      if (bodyKey === titleKey) continue;
      const rest = bodyKey.slice(stem.length);
      if (!/^[._A-Z]/.test(rest)) continue;
      const segs = segments(rest);
      if (segs.length === 0 || segs.length > 2 || !BODY_WORDS.has(segs.at(-1))) continue;
      if (titleRepeatsBody(flat[titleKey], flat[bodyKey])) pairs.push({ titleKey, bodyKey });
    }
  }
  return pairs;
}

/** The catalogue's locale: a known locale among the file name's parts, else a parent folder's name. */
export function catalogueLocale(file, known) {
  const fromName = basename(file).replace(/\.(json|arb)$/i, '').split(/[._-]/).reverse();
  for (const part of fromName) if (known.has(part.toLowerCase())) return part.toLowerCase();
  for (const dir of dirname(file).split(/[\\/]/).reverse()) {
    const lang = dir.toLowerCase().split(/[-_]/)[0];
    if (known.has(lang)) return lang;
  }
  return null;
}

/* ── walking ── */

const SKIP = new Set([
  'node_modules', '.next', 'dist', 'build', '.git', '.dart_tool', 'coverage', '.vercel', '.turbo',
  '__tests__', '__fixtures__', '__mocks__', 'test', 'tests', 'integration_test',
]);
const isTestFile = (p) => /(?:\.|_)(?:test|spec|stories)\.(?:[jt]sx?|[mc]js|dart)$/.test(p) || /\.d\.ts$/.test(p);
const DEFAULT_EXTS = ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.dart'];

function walk(path, accept, skip, acc = []) {
  if (!existsSync(path)) throw new UsageError(`${path} does not exist`);
  const s = statSync(path);
  if (s.isFile()) { if (accept(path)) acc.push(path); return acc; }
  for (const entry of readdirSync(path).sort()) {
    if (skip.has(entry)) continue;
    const p = join(path, entry);
    if (statSync(p).isDirectory()) walk(p, accept, skip, acc);
    else if (accept(p)) acc.push(p);
  }
  return acc;
}

class UsageError extends Error {}

/* ── the scan ── */

/**
 * Scan an app. Returns every finding as { id → {count, detail} }.
 * Ids are stable across line moves: `<file>#<key> <rule>` for a catalogue,
 * `<file>: "<normalized text>" <rule>` for a source literal.
 */
export function scan(config, root) {
  const posix = (p) => relative(root, p).split(sep).join('/');
  const phrasesFile = resolve(root, config.phrases ?? '');
  if (!config.phrases || !existsSync(phrasesFile)) throw new UsageError(`phrases file not found: ${config.phrases}`);
  const phrases = JSON.parse(readFileSync(phrasesFile, 'utf8')).phrases;
  const known = new Set(Object.keys(phrases));
  const skip = new Set([...SKIP, ...(config.skip ?? [])]);
  const findings = new Map();
  const add = (id, detail) => {
    const f = findings.get(id);
    if (f) f.count += 1;
    else findings.set(id, { count: 1, detail });
  };

  for (const entry of config.catalogues ?? []) {
    const files = walk(resolve(root, entry), (p) => /\.(json|arb)$/i.test(p), skip);
    for (const file of files) {
      const rel = posix(file);
      let flat;
      try { flat = flattenCatalogue(JSON.parse(readFileSync(file, 'utf8'))); }
      catch (err) { throw new UsageError(`${rel}: not valid JSON (${err.message})`); }
      const locale = catalogueLocale(rel, known);
      for (const [key, value] of Object.entries(flat)) {
        const hit = matchGeneric(phrases, value, locale ? [locale] : null);
        if (hit) add(`${rel}#${key} generic`, `${JSON.stringify(value)} — ${hit.mode} "${hit.phrase}" (${hit.locale})`);
      }
      for (const { titleKey, bodyKey } of catalogueTitlePairs(flat)) {
        add(`${rel}#${titleKey} title-repeats ${bodyKey}`, `${JSON.stringify(flat[titleKey])} / ${JSON.stringify(flat[bodyKey])}`);
      }
    }
  }

  const exts = config.extensions ?? DEFAULT_EXTS;
  const counters = Object.entries(config.counters ?? {}).map(([name, re]) => {
    try { return [name, new RegExp(re, 'g')]; }
    catch (err) { throw new UsageError(`counter "${name}": ${err.message}`); }
  });
  for (const entry of config.sources ?? []) {
    const files = walk(resolve(root, entry), (p) => exts.includes(extname(p)) && !isTestFile(p), skip);
    for (const file of files) {
      const rel = posix(file);
      const { strings, code, skeleton } = extractLiterals(readFileSync(file, 'utf8'), extname(file));
      for (const s of strings) {
        if (s.logged || !readsAsProse(s.value)) continue;
        const hit = matchGeneric(phrases, s.value, null);
        if (hit) {
          add(`${rel}: ${JSON.stringify(normalize(s.value))} generic`,
            `${s.line ? `line ${s.line}` : 'JSX text'} — ${hit.mode} "${hit.phrase}" (${hit.locale})`);
        }
      }
      for (const { title, body } of sourceTitlePairs(skeleton, strings)) {
        add(`${rel}: ${JSON.stringify(normalize(title))} title-repeats`, `${JSON.stringify(title)} / ${JSON.stringify(body)}`);
      }
      for (const [name, re] of counters) {
        const n = [...code.matchAll(re)].length;
        if (n) {
          const id = `${rel} counter:${name}`;
          findings.set(id, { count: n, detail: `${n} × /${re.source}/` });
        }
      }
    }
  }
  return findings;
}

/**
 * Compare findings with the exact baseline.
 * @returns {{over: object[], under: object[], staleAllow: string[], allowed: number}}
 */
export function compare(findings, baseline, allow = {}) {
  const over = [];
  const under = [];
  let allowed = 0;
  for (const [id, f] of findings) {
    if (id in allow) { allowed += 1; continue; }
    const base = baseline[id] ?? 0;
    if (f.count > base) over.push({ id, count: f.count, base, detail: f.detail });
  }
  for (const [id, base] of Object.entries(baseline)) {
    const count = findings.get(id)?.count ?? 0;
    if (count < base) under.push({ id, count, base });
  }
  const staleAllow = Object.keys(allow).filter((id) => !findings.has(id));
  return { over, under, staleAllow, allowed };
}

/** The lowered baseline: every entry at most its real count, zeros dropped. Never adds or raises. */
export function lowerBaseline(findings, baseline) {
  const out = {};
  for (const [id, base] of Object.entries(baseline)) {
    const n = Math.min(base, findings.get(id)?.count ?? 0);
    if (n > 0) out[id] = n;
  }
  return out;
}

/* ── CLI ── */

function main(argv) {
  const arg = (name) => {
    const i = argv.indexOf(name);
    return i === -1 ? null : argv[i + 1];
  };
  const configPath = arg('--config');
  if (!configPath) throw new UsageError('usage: check-error-copy.mjs --config <file> [--baseline <file>] [--update-baseline | --init-baseline] [--json]');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const root = dirname(resolve(configPath));
  const baselinePath = resolve(arg('--baseline') ? process.cwd() : root, arg('--baseline') ?? config.baseline ?? '.error-copy-baseline.json');
  const findings = scan(config, root);
  const comment = 'Exact per-key baseline of generic error copy (ERROR-10, DONE-6). Generated by check-error-copy.mjs: --update-baseline only lowers it; a new entry is never added by hand.';

  if (argv.includes('--init-baseline')) {
    if (existsSync(baselinePath)) throw new UsageError(`${baselinePath} exists: --init-baseline writes only the first baseline. Use --update-baseline to lower it.`);
    const out = Object.fromEntries([...findings].filter(([id]) => !(id in (config.allow ?? {}))).map(([id, f]) => [id, f.count]).sort(([a], [b]) => a.localeCompare(b)));
    writeFileSync(baselinePath, JSON.stringify({ $comment: comment, findings: out }, null, 2) + '\n');
    console.log(`wrote ${Object.keys(out).length} finding(s) to ${baselinePath}`);
    return 0;
  }

  const stored = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : { findings: {} };
  let baseline = stored.findings ?? {};
  if (argv.includes('--update-baseline')) {
    baseline = lowerBaseline(findings, baseline);
    writeFileSync(baselinePath, JSON.stringify({ ...stored, $comment: stored.$comment ?? comment, findings: baseline }, null, 2) + '\n');
    console.log(`baseline lowered to ${Object.keys(baseline).length} entr(ies): ${baselinePath}`);
  }
  const result = compare(findings, baseline, config.allow ?? {});
  const failed = result.over.length + result.under.length + result.staleAllow.length;

  if (argv.includes('--json')) {
    console.log(JSON.stringify({ ...result, findings: Object.fromEntries([...findings].map(([id, f]) => [id, f.count])) }, null, 2));
    return failed ? 1 : 0;
  }
  const total = [...findings.values()].reduce((n, f) => n + f.count, 0);
  console.log(`error copy: ${findings.size} finding id(s), ${total} occurrence(s); baseline holds ${Object.keys(baseline).length}; ${result.allowed} allowed`);
  for (const o of result.over) {
    console.error(o.base === 0
      ? `  ✗ NEW  ${o.id}\n         ${o.detail}`
      : `  ✗ UP   ${o.id}: ${o.count} > baseline ${o.base}\n         ${o.detail}`);
  }
  for (const u of result.under) {
    console.error(`  ✗ DOWN ${u.id}: ${u.count} < baseline ${u.base} — fixed; run with --update-baseline to lower it`);
  }
  for (const id of result.staleAllow) console.error(`  ✗ STALE ALLOW ${id}: nothing matches it any more; remove it from the config`);
  if (failed) {
    console.error(`\n✗ error copy: ${result.over.length} over the baseline, ${result.under.length} below it, ${result.staleAllow.length} stale allow(s).`
      + (result.over.length ? '\n  Say what failed, why, what to do and what was kept (ERROR-1); see ERRORS.md in babel-design-tokens.' : ''));
    return 1;
  }
  console.log('✓ error copy matches its baseline: nothing new is generic');
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (err) {
    if (!(err instanceof UsageError) && !(err instanceof SyntaxError)) throw err;
    console.error(`✗ ${err.message}`);
    process.exitCode = 2;
  }
}
