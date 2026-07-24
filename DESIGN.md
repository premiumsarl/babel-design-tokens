# Babel Design System

**One source of truth for every Babel surface — admin panel, mobile app, and website.**
Edit [`tokens.json`](./tokens.json), run `npm run build`, and every platform regenerates. Never hand-edit `dist/`.

Brand in one line: **black / charcoal core, bronze accent.** The core carries primary actions; the bronze `#B08D57` (the logo) carries brand moments — links, focus rings, highlights, verified states.

> Why this exists: before it, "the Babel brand color" resolved to **five** different hexes across the repos, an off-brand indigo `#6366f1` was still lurking as a CSS fallback, one task status rendered in **three** different colors depending on the screen, and mobile carried **8 greens, 6 reds, 4 golds** and **3 incompatible spacing ladders**. No design doc existed in any repo or in Notion. This is that doc, and it is enforced.

---

## 1 · Brand identity

| Decision | Value | Notes |
|---|---|---|
| Canonical brand | **`#B08D57`** (brand‑500) | The logo fill — the brand mark is the source of truth. |
| Primary action | **Core** (near‑black `#14110c` light → near‑white `#f4f1ea` dark) | Neutral, not a hue. Black buttons in light; they invert on dark. |
| Brand accent | **Bronze** | `accent` = brand‑500 (decorative/large); `accent-strong` = brand‑700 `#7c6139` for anything that must pass contrast — buttons, links, accent text, focus. |
| Retired | indigo `#6366f1`, the slate/Tailwind palette, the 5 divergent bronzes, 8 greens / 6 reds / 4 golds | Collapsed into the ramps + semantic roles below. |

The bronze is deliberately split: **`accent` (500)** is the brand hue for fills and dark‑mode surfaces; **`accent-strong` (700)** is the *working* bronze. Never set body text or a white‑text button on `accent` — it's ~3:1. Use `accent-strong`, which is verified ≥4.5:1 for text and buttons in both themes (`scripts/check-contrast.mjs`).

---

## 2 · Color

### Brand ramp (theme‑invariant)
| Step | Hex | Use |
|---|---|---|
| 50 | `#faf5ec` | wash / hover tint |
| 100 | `#f2e6d0` | subtle fill |
| 200 | `#e6cfa8` | |
| 300 | `#d6b37e` | **dark‑mode accent‑strong** |
| 400 | `#c39e6a` | dark‑mode accent |
| **500** | **`#b08d57`** | **brand identity, decorative fills** |
| 600 | `#96774a` | hover / pressed |
| **700** | **`#7c6139`** | **buttons, links, accent text, focus (light)** — AA‑verified |
| 800 | `#5f4a2c` | |
| 900 | `#45351f` | |

### Neutral ramp (warm — the "black" side of the brand)
`25 #faf8f5 · 50 #f4f1ea · 100 #e9e4d9 · 200 #ddd5c7 · 300 #c4bbaa · 400 #968c79 · 500 #6f6656 · 600 #564e40 · 700 #3f3830 · 800 #2a251d · 900 #201a12 · 950 #14110c`

### Semantic roles (resolve per theme)
| Token | Light | Dark |
|---|---|---|
| `core` / `on-core` | `#14110c` / `#fff` | `#f4f1ea` / `#14110c` |
| `accent` | brand‑500 | brand‑400 |
| `accent-strong` · `link` · `focus-ring` | brand‑700 | brand‑300 |
| `canvas` / `surface` | `#f4f1ea` / `#fff` | `#14110c` / `#201a12` |
| `border` / `border-strong` | neutral‑200 / 300 | neutral‑800 / 700 |
| `text` / `secondary` / `muted` | neutral‑900 / 600 / 400 | neutral‑50 / 300 / 500 |

### Status (one set — kills the divergent maps)
| Role | 500 | Solid button | Text (light) | Dark text |
|---|---|---|---|---|
| success | `#32ba7c` | `#1f9e66` | `#0f7a4d` | `#56d29a` |
| warning | `#ffa800` | `#cc8600` | `#8a5a00` | `#f0c04a` |
| error | `#ff5050` | `#dc2626` | `#c62828` | `#ff9a8f` |
| info | `#3b82f6` | `#2f6fe0` | `#1d63d1` | `#6fb0ff` |

`success #32BA7C`, `warning #FFA800`, `error #FF5050`, `info #3b82f6` were already the agreed values in admin *and* mobile — this just makes them the **only** ones. All status pills, badges, and calendar dots read from these; nothing hardcodes a hex.

### Charts (categorical — kills the ad‑hoc rainbows)
`chart‑1` brand‑500 · `chart‑2` info · `chart‑3` success · `chart‑4` warning · `chart‑5 #8b5cf6` · `chart‑6 #ef4444` · `chart‑7 #14b8a6` · `chart‑8 #ec4899`. Data‑viz cycles this order; no chart file defines its own palette.

---

## 3 · Typography

| Role | Family | Where |
|---|---|---|
| `display` | **Space Grotesk** | marketing headings, hero |
| `body` | **Inter** | product UI + running text |
| `mono` | system mono stack | code, references, tabular data |

Scale (px): `xs 11 · sm 12 · base 14 · md 15 · lg 17 · xl 20 · 2xl 24 · 3xl 30 · 4xl 36`. Weights `400/500/600/700/800`; leading `tight 1.15 / normal 1.5 / relaxed 1.65`.

**Self‑host the fonts.** Admin and the website currently pull Inter / Space Grotesk from a live Google Fonts `@import` — a CSP and offline liability. Bundle the woff2 files and drop the `@import`.

---

## 4 · Spacing — one 4px ladder

`0 · 1(px) · 2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80`

This is the **only** scale. It retires mobile's `5/10/15/20` (UIConstants) and `kSpacing` ladders and the website's ad‑hoc px. Existing `4/8/16/24/32` usage (SizedBoxUtil, admin `--space-*`) already maps 1:1.

## 5 · Radius · Shadow · Z

- **Radius**: `sm 6 · md 9 · lg 12 · xl 16 · 2xl 22 · full`. One card radius (`lg = 12`) — retires the 12‑vs‑15 disagreement.
- **Shadow**: `sm · md · lg`, warm‑tinted in light, black in dark. Retires the 3 conflicting mobile shadow tokens.
- **Z**: `dropdown 100 · sticky 200 · overlay 900 · modal 1000 · toast 1100`.

---

## 6 · Consuming the tokens

The pipeline: **`tokens.json` → `build.mjs` → `dist/{tokens.css, babel_tokens.dart, tokens.flat.json}`**.

**Admin panel (Next.js / vanilla CSS).** Import `dist/tokens.css` at the top of `globals.css`; point the existing 59‑entry compatibility‑alias block at these tokens (`--color-primary: var(--color-accent-strong)` etc.); delete the `var(--color-primary, #6366f1)` fallbacks. Its `check-changed.mjs` ratchet already enforces "no undefined token" — this just gives it a real vocabulary to check against.

**Website (Vite / vanilla CSS).** Import `dist/tokens.css`; migrate `src/css/variables.css` to *reference* these tokens instead of redefining bronze; retire the slate palette (adopt the neutral ramp) and the standalone stylesheets (`blog.css`, `admin-login.css`, …) that consume zero tokens today.

**Mobile (Flutter).** Vendor `dist/babel_tokens.dart` into `base_mobile_library` (the existing shared host). Map `ColorScheme` / `AppTheme` to `BabelColorsLight` / `BabelColorsDark`, `AppTypography` sizes to `BabelType`, and `SizedBoxUtil` to `BabelSpace`. Fold `babel_theme.dart` financial/realtor colors into semantic roles.

Same token names, three renderings — so a change to `tokens.json` reaches all three the same way.

---

## 7 · Governance — the ratchet

`scripts/check-tokens.mjs <dir>` counts raw color literals (hex, `0xFF…`, `rgb/rgba`) that bypass the tokens and fails CI when the count rises above a per‑repo **baseline**. You don't fix every legacy literal on day one — you snapshot the current count (`--update-baseline`) and it can only go **down**. Today's baselines from this repo's own scan:

| Repo | Raw color literals (current) |
|---|---|
| admin `src/` | **962** |
| website `src/` | **728** |
| mobile `lib/` | **196** |

Add it to each repo's `lint`/CI step: `node …/check-tokens.mjs ./src`. The team already learned drift "regressed within a week" without a ratchet — this is the ratchet.

A second guard, `scripts/check-contrast.mjs` (`npm run check:contrast`), verifies every foreground/background pair the palette promises against WCAG AA in both themes — it runs on `prepublish`, so the tokens can't ship a combination that fails contrast. (It already caught and fixed the interactive bronze: `brand-600` measured 3.7–4.2:1 on light grounds, so the working step is `brand-700`.)

---

## 8 · Migration plan (incremental, non‑breaking)

0. **Land the package** (this repo) — done. Publish as `@premiumsarl/babel-design-tokens` or consume via path/git.
1. **Wire `dist/` in** each repo (import CSS / vendor Dart) and **set baselines**. No visual change yet — tokens sit alongside the old values.
2. **Reconcile the brand**: repoint each repo's brand/accent to `#B08D57` / `accent-strong`; delete the indigo & slate fallbacks. (This is the change you already previewed in the mockups.)
3. **Collapse duplicates**: status maps → the one status set; spacing → the one ladder; shadows/radius → the tokens.
4. **Self‑host fonts**; drop the Google Fonts `@import`.
5. **Ratchet down**: as feature CSS is touched, swap literals for tokens and lower the baseline. Never let it rise.

---

## 9 · Rules of thumb

- **Never** write a raw hex, `0xFF…`, or `rgb()` in a component. Use a token.
- **Brand text / buttons / links → `accent-strong`**, not `accent`. `accent` (500) is decorative only.
- **Status → the semantic role** (`success` / `warning` / `error` / `info`), never a raw green/red.
- **Charts → `chart-1…8` in order.** No per‑chart palettes.
- **Primary action → `core`.** It's near‑black in light and near‑white in dark automatically.
- Changing a brand value is a **one‑line edit to `tokens.json`** + `npm run build`. If you're editing `dist/`, stop.
