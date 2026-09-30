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
| Superseded | indigo `#6366f1`, the slate/Tailwind palette, the 5 divergent bronzes, 8 greens / 6 reds / 4 golds | Replaced by the ramps + semantic roles below. **Superseded, not yet gone** — the admin panel still renders its own dark status ramp and `error-solid` over the package's; see the adoption note in §2. |

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

`success #32BA7C`, `warning #FFA800`, `error #FF5050`, `info #3b82f6` were already the agreed values in admin *and* mobile, and they still agree — those four **500** rungs are identical in the package and in every consumer.

> **Adoption is partial, and this section used to overstate it.** It read "this just makes them the **only** ones … nothing hardcodes a hex." Neither half was true, and saying so hid real drift for months. Measured **2026-08-31** against v0.6.0; the admin line re-measured **2026-09-30** against v0.7.0:
>
> - **Mobile — reconciled.** 20 files read `BabelColorsLight/Dark.{success,warning,error,info}`. No raw status hex in `lib/`.
> - **Admin — light reconciled, dark not.** On 2026-08-31 `globals.css` declared 27 of these names and 22 diverged. Since then admin deleted its light status ramps and six compatibility aliases (its `shadowedLegacy` ratchet went 91 → 66), so the package's **light** status palette now renders, with one exception: `--color-error-solid`, which admin still declares in both themes (`#b91c1c` against the package's `#dc2626`). The **dark** status ramp is still admin's own: 19 rungs under `[data-theme='dark']`. The package has no dark value for those names, so admin treats this as a deliberate per-theme divergence. That makes **21** status declarations that render instead of the package's. Because they sit **after** the `@import`, the local values win.
> - **Website —** defines no status colours at all, and was pinned to **v0.2.0** on 2026-08-31.
> - **"Nothing hardcodes a hex" was never true.** Admin carried **490** raw colour literals on 2026-08-31. That is exactly why the ratchet in §8 exists; a doc claiming zero is a doc arguing the ratchet is unnecessary. The live count is in the baseline file named in §8, not here.
>
> Closing the remaining 21 is a **design decision per value** — which dark green is the success green? — not a rename, so it is not a sweep anyone should do unasked. They are held at a baseline by `check-motion.mjs` check 3 in the admin panel (`shadowedLegacy` in `scripts/motion-baseline.json`), so the number can only go down.

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

## 4 · Spacing — a ladder and a set of roles

### 4.1 The ladder — which numbers are legal

`0 · 1(px) · 2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 128`

This is the **only** scale. `96` and `128` exist so the website's `--space-4xl` / `--space-5xl` (6rem / 8rem) have a rung to land on; without them the claim that this ladder covers the website was simply false.

Web builds emit **rem** (`--space-4: 1rem`), Dart emits **logical pixels** (`BabelSpace.s_4 = 16.0`). The `px` rung stays absolute in CSS: it is a hairline used to nudge something by a border width, and a scaled 1.3px hairline is blurry, not accessible.

### 4.2 The roles — which number a given job uses

The ladder alone did not produce consistency. Admin shipped four page roots with four vertical rhythms — 24 / 20 / 16 / 1.25rem — and **three of the four were already tokenised**, so a value-level lint passed all four. A scale can only say a number is legal; it cannot say it is the right one for this job.

| Role | Value | What it governs |
|---|---|---|
| `--gap-page` | `{space.6}` 24 | between blocks at page level |
| `--gap-section` | `{space.4}` 16 | between blocks inside a page section |
| `--gap-inline` | `{space.2}` 8 | between controls sitting side by side |
| `--pad-page` | 16 / 24 / 32 | the page's outer padding, responsive |
| `--pad-card` | `{space.6}` 24 | a card's own padding |
| `--pad-cell` | `{space.3} {space.4}` | table cell padding |
| `--pad-control` | `{space.2} {space.3}` | a form control's padding |
| `--pad-pill` | `{space.0_5} {space.2}` | badges and chips |
| `--control-h` | `40px` | every full-size form control |
| `--measure-prose` | `60ch` | the cap on a line of running text |

Roles are emitted **as references** — `--gap-page: var(--space-6)`, never a flattened `24px`. Flattening severs the chain: DevTools would show a number with no hint of which role produced it, and a ladder change would stop propagating.

Dart gets the same roles as **`BabelRole`** — `padCard`, `gapPage`, `padCell`, … — generated from the same `spaceRole` block, plus `BabelGap` (`h4`, `w2`, …) and `BabelInsets` (`a4`, `h6`, `v2`, …) so a widget tree never has to hand-build a `SizedBox` or `EdgeInsets`.

Three roles do not cross to Dart, and are skipped rather than approximated:

- **`--measure-prose`** is `60ch`. `ch` is font-relative and has no Dart equivalent; a pixel guess would be a different token wearing this one's name.
- **`--control-h`** is a plain number and already ships as `BabelSize.controlH`. Emitting it twice would let the two copies disagree.
- **`--pad-page`** is responsive, and a Dart `const` cannot depend on a width known only at layout time. Its steps ship as `BabelRole.padPageBase` / `padPageAtMd` / `padPageAt2xl` plus `padPageFor(width)`, so the breakpoints stay in the token source instead of being re-typed per app.

> Until v0.4.0 the Dart side carried a single hand-written `BabelInsets.card = all({space.4})` — **16**, while `--pad-card` resolved to **24**. One role name, two numbers, in the package whose purpose is one vocabulary. Nothing consumed the Dart constant, so the divergence was invisible and free to correct; generating the roles is what stops it recurring.

### 4.3 The four rhythm rules

1. **Rhythm is produced by the nearest container's `gap`.** An element never sets `margin-bottom` to create rhythm.
2. **Two levels only:** page (`--gap-page`) and section (`--gap-section`).
3. **A component declares its role token, never a primitive.** `padding: var(--space-6)` on a card is a violation *even though the number is right*.
4. **New page roots must register** in the consumer's role registry, or CI fails.

### 4.4 What this actually retires

- **Admin**: its private rem fork of `--space-*`, and four disagreeing page rhythms.
- **Website**: `--space-xs…5xl` become aliases onto the ladder. Seven of the nine were already exact (`0.25/0.5/1/1.5/2/3/4rem`); `4xl`/`5xl` needed the new 96/128 rungs.
- **Mobile**: `BabelDecorations.kSpacing*` — which had **zero call sites** and was dead weight, not a ladder in use. The live vocabulary is `SizedBoxUtil` (defined in `base_mobile_library`) and literal `EdgeInsets`: 931 and 1,704 uses when this was written on 2026-08-06, and `SizedBoxUtil` had grown to 1,156 by 2026-09-30. Those are what `BabelGap` / `BabelInsets` are for.

## 5 · Radius · Border · Shadow · Z

- **Radius**: `sm 6 · md 9 · lg 12 · xl 16 · 2xl 22 · full`. One card radius (`lg = 12`) — retires the 12‑vs‑15 disagreement.
  Two named shapes sit beside `full`, which is itself a role rather than a scale step: `pill 40`, Babel's CTA shape, and `sheet 20`, the top radius of a bottom sheet. Both were house decisions that lived only in babel-mobile's theme until v0.7.0 (`--radius-pill` / `--radius-sheet`, `BabelRadius.pill` / `.sheet`).
- **Border**: `hairline 1 · accent-rail 3` (`--border-*`, `BabelBorder`). The accent rail is the tone rail down the side of a card, the same 3px on the admin StatCard and the mobile verdict band.
- **Shadow**: `sm · md · lg`, warm‑tinted in light, black in dark. CSS gets `--shadow-*` per theme. Since v0.8.0 Dart gets `BabelShadowLight` / `BabelShadowDark`, each step a `List<BoxShadow>` with one entry per CSS layer.
  **Not adopted anywhere yet.** Admin redeclares all three steps in both themes to keep its own subtler ramp, and those declarations are counted in its `shadowedLegacy`. Mobile's cards still use `base_mobile_library`'s `UIConstants.defaultBoxShadow`, because until v0.8.0 there was no Dart token to use. Choosing between the package ramp and admin's is an owner decision. Until someone makes it, "retires the conflicting mobile shadows" is the plan, not the state.
- **Z**: `dropdown 100 · sticky 200 · overlay 300 · modal 400 · toast 500 · chatbot 600`.
  One rung per stacking job, 100 apart. **The gap is load-bearing**: a caller that cannot
  spend a `var()` — React's `zIndex` prop takes a number — has to land a literal *between*
  two rungs, and the admin panel does exactly that (`zIndex: 410`, "above `--z-modal`,
  below `--z-toast`"). `build.mjs` enforces both the ascending order and the 100 minimum.

  These were **corrected in v0.6.0** from `overlay 900 · modal 1000 · toast 1100`, which
  shipped in v0.1.0 and which **nothing ever rendered**: the admin panel — the only
  consumer of this scale — redefined all of them locally *after* the `@import`, so
  later-wins meant its own `300/400/500` were what painted. Raising admin to the old
  token numbers would have restacked live UI, because four raw `z-index: 1000` literals
  and the `410` above sit at fixed heights relative to the LOCAL scale. So the tokens
  moved to the values that were actually on screen, not the reverse.

---

## 6 · Motion — a ladder and a set of roles

Same shape as spacing (§4), for the same reason: a **ladder** says which timings are
legal, **roles** say which timing a given job uses.

### 6.1 The ladder

| Token | ms | |
|---|---|---|
| `instant` | 100 | micro-feedback — a checkmark, a tick |
| `fast` | 150 | hover, colour and border change |
| `normal` | 200 | a control changing state |
| `moderate` | 250 | a dropdown or sheet opening |
| `slow` | 300 | a route or panel transition |
| `slower` | 400 | large or complex movement |
| `slowest` | 500 | the ceiling for anything a user waits on |
| `ambient` | 1500 | looping, non-blocking — skeletons, pulses, shimmer |

### 6.2 The easings

| Token | Curve | Use |
|---|---|---|
| `standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | the default — anything moving within the screen |
| `enter` | `cubic-bezier(0, 0, 0.2, 1)` | something appearing (decelerates in) |
| `exit` | `cubic-bezier(0.4, 0, 1, 1)` | something leaving (accelerates out) |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | deliberate overshoot; emphasis only |
| `linear` | `linear` | loops only — a spinner must not ease |

Flutter gets these as **exact `Cubic`s**, not the nearest named `Curves.*` constant. That
matters more than it sounds: `Curves.easeInOut` is `Cubic(0.42, 0, 0.58, 1)` — *near* the
standard curve, not equal to it. Emitting the identical bezier is what makes a sheet open
the same way in admin and on mobile instead of merely similarly.

### 6.3 The roles

| Role | Duration | Easing | Job |
|---|---|---|---|
| `hover` | fast 150 | standard | hover / focus / colour feedback |
| `control` | normal 200 | standard | toggle, checkbox, segmented control |
| `overlay` | moderate 250 | enter | dropdown, popover, sheet, modal opening |
| `dismiss` | fast 150 | exit | the same things closing |
| `page` | slow 300 | standard | route and panel transitions |
| `emphasis` | slower 400 | spring | deliberate attention — only where it is earned |
| `loop` | ambient 1500 | linear | skeletons, shimmer, pulse |

Open and close are **deliberately asymmetric** — 250ms decelerating in, 150ms accelerating
out. Dismissal should feel quicker than arrival; symmetric timing is the most common way a
UI reads as sluggish.

### 6.4 What this retires

Motion was the last unguarded scale, and it had drifted exactly the way colour had before
§2 collapsed it. Measured on 2026-08-25:

| Surface | Durations | Easings |
|---|---|---|
| `babel-admin-panel/src` CSS | **23 distinct** raw values (65 raw `transition` occurrences alone: `150ms` ×32, `200ms` ×11, `120ms` ×9, `300`, `400`, `600`, `1000`…) | bare `ease` ×208, `linear` ×30, plus **5 distinct** `cubic-bezier()` |
| `babel-mobile/lib` | **18 distinct** `Duration(milliseconds:)` | **7 distinct** `Curves.*` |

`150ms` and `0.15s` appeared in the same stylesheet — the same failure as "the Babel brand
colour resolved to five different hexes", one axis over.

Admin already had a private `--duration-fast/normal/slow` + `--ease-default/in/out/spring`
block in `globals.css`, and it was **well adopted** (142 `var(--duration-*)` and 122
`var(--ease-*)` uses). It was never a bad vocabulary — it was an *unshared* one: mobile
could not reach it, nothing versioned it, and `--duration-slow: 350ms` had drifted to zero
uses while `300ms` and `400ms` accumulated raw. Promoting it here is what makes it real.

**Display durations are not motion.** A snackbar showing for 3s, a debounce, a network
timeout — none of these are animation, none of them belong on this ladder, and the guards
below deliberately do not count them.

---

## 7 · Consuming the tokens

The pipeline: **`tokens.json` → `build.mjs` →** `dist/{tokens.css, tokens.values.css, tokens.flat.json}` (web, via npm) **and** `dart/lib/babel_tokens.dart` (Flutter, via the `dart/` pub package). One source, delivered through each ecosystem's own package manager — see [README.md](./README.md) for install snippets.

**Admin panel (Next.js / vanilla CSS).** Import the theme-adaptive `tokens.css` at the top of `globals.css`; point the existing compatibility‑alias block at these tokens (`--color-primary: var(--color-accent-strong)` etc.); delete the `var(--color-primary, #6366f1)` fallbacks. Its `check-changed.mjs` ratchet already enforces "no undefined token" — this just gives it a real vocabulary to check against.

**Website (vanilla CSS, single-theme).** Import `tokens.values.css` (the flat, no-`@media` build) — *not* `tokens.css`, whose `[data-theme]`/`@media` dark rules would override a single-theme site's own accent. Migrate `src/css/variables.css` to *reference* these values instead of redefining bronze; retire the slate palette (adopt the neutral ramp) and the standalone stylesheets (`blog.css`, `admin-login.css`, …) that consume zero tokens today.

**Mobile (Flutter).** Depend on the `babel_design_tokens` pub package (the [`dart/`](./dart) folder) as a git dependency pinned to a release tag, and re-export it from the app's own barrel (`lib/common/imports.dart` in babel-mobile, which already does this). **Never** re-export it from `base_mobile_library`. Other Premium SARL products share that library, and it stays brand-neutral: it is themed through `ThemeData` and injected palettes, and Babel overrides it in its own theme rather than changing it. Map Babel's `ColorScheme` / theme to `BabelColorsLight` / `BabelColorsDark` and its type sizes to `BabelType`. At call sites, prefer `BabelGap` / `BabelInsets` over the library's `SizedBoxUtil`. Fold `babel_theme.dart` financial/realtor colors into semantic roles.

Same token names, three renderings — so a change to `tokens.json` reaches all three the same way.

---

## 8 · Governance — the ratchet

`scripts/check-tokens.mjs <dir>` counts raw color literals (hex, `0xFF…`, `rgb/rgba`) that bypass the tokens and fails when the count rises above a per‑repo **baseline**. You don't fix every legacy literal on day one — you snapshot the current count (`--update-baseline`) and it can only go **down**. The numbers live in each consumer's baseline file, not here: this table used to copy them, and the copies went stale within weeks.

| Repo | Baseline (the live count) |
|---|---|
| admin | `src/.token-baseline.json` (vendored `scripts/check-tokens.mjs`, run by `npm run check:tokens`) |
| website | `.token-baseline.json` (vendored `scripts/check-tokens.mjs`) |
| mobile | `hexBaseline` in `test/design/color_drift_test.dart` (its own scanner, which asserts equality rather than an upper bound) |

The org's GitHub Actions were removed on 2026-09-14, so the pre-push hooks (`.githooks/pre-push` in admin and mobile) are what run the ratchets now. The team already learned drift "regressed within a week" without a ratchet — this is the ratchet.

A second guard, `scripts/check-contrast.mjs` (`npm run check:contrast`), verifies every foreground/background pair the palette promises against WCAG AA in both themes. It runs in `npm run verify`, which this repo's pre-push hook runs, so the tokens can't ship a combination that fails contrast. (`prepublishOnly` runs it too, but a git-dependency install never fires that hook.) It has already caught and fixed the interactive bronze: `brand-600` measured 3.7–4.2:1 on light grounds, so the working step is `brand-700`.

---

## 9 · Migration plan (incremental, non‑breaking)

0. **Land the package** (this repo) — done. Publish as `@premiumsarl/babel-design-tokens` or consume via path/git.
1. **Wire the package in** each repo (import the CSS / depend on the `dart/` pub package) and **set baselines**. No visual change yet — tokens sit alongside the old values.
2. **Reconcile the brand**: repoint each repo's brand/accent to `#B08D57` / `accent-strong`; delete the indigo & slate fallbacks. (This is the change you already previewed in the mockups.)
3. **Collapse duplicates**: status maps → the one status set; spacing → the one ladder; shadows/radius → the tokens.
4. **Self‑host fonts**; drop the Google Fonts `@import`.
5. **Ratchet down**: as feature CSS is touched, swap literals for tokens and lower the baseline. Never let it rise.

---

## 10 · Rules of thumb

- **Never** write a raw hex, `0xFF…`, or `rgb()` in a component. Use a token.
- **Brand text / buttons / links → `accent-strong`**, not `accent`. `accent` (500) is decorative only.
- **Status → the semantic role** (`success` / `warning` / `error` / `info`), never a raw green/red.
- **Charts → `chart-1…8` in order.** No per‑chart palettes.
- **Primary action → `core`.** It's near‑black in light and near‑white in dark automatically.
- 🔴 **Never redeclare a name this package owns.** A consumer's `--color-success-600:` or
  `--z-modal:` does not duplicate the token, it **shadows** it — the consumer's block sits after
  the `@import`, so the local value renders and the package's is dead. Both values are legal in
  their own scale, so no value-level lint goes red. It has happened three times: the whole z
  scale (dead since v0.1.0), `--duration-normal`, and 22 status colours. If the rendered value
  is the right one, **fix the token** — don't fork it locally. On 2026-09-30 the admin panel still
  carried **66** declarations of package-owned names, **45** of them with a different value. The
  live count is `shadowedLegacy` in admin's `scripts/motion-baseline.json`, which can only go down.
- **Motion → a role** (`--motion-overlay`, `BabelMotion.overlay`), never a raw `150ms` or `Curves.easeInOut`.
- **A spinner or skeleton uses `loop`.** Anything that repeats forever eases `linear` — never `standard`.
- Changing a brand value is a **one‑line edit to `tokens.json`** + `npm run build`. If you're editing `dist/`, stop.
