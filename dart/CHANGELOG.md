# Changelog

One version covers both deliveries: the npm package (`dist/`) and this pub
package (`lib/`) come off the same `vX.Y.Z` tag. Entries name the CSS and
Dart surface of each change. 0.3.0–0.7.0 were backfilled in 0.8.0 from the
commit history; this file had stopped at 0.2.0.

## 0.9.0
- **Errors that say what happened (owner ruling, 2026-10-20: "Nothing this
  generic is acceptable").** New `## Errors` section in
  `principles/COMMON.md`: `ERROR-1` to `ERROR-10` bind every brand (owner
  decision, 2026-10-20). Babel's measurements are `BABEL-ERROR-1` and
  `BABEL-ERROR-2` (money errors state where the money is); Rendee's are
  `RENDEE-ERROR-1` (admin copy says "the admin panel's server" / "the booking
  service", never the brand) and `RENDEE-ERROR-2` (admin error copy English
  only for now; support contact help@rendee.ca from one constant).
  `principles.json` and `BabelPrinciples` gain these 14 IDs. **Apps that map
  every rule** (`principles-map.test.ts` in the admin, `principles_map_test.dart`
  in mobile) see them as unmapped on their next pin bump: add the §0 rows in
  the same pull request as the bump.
- New `ERRORS.md` (ships in the npm package): failure kinds, detection per
  platform, EN/FR wording, the Rendee screenshot case rewritten, and the guard.
- New contracts, all additive:
  - `contracts/failure-kinds.json` → `FAILURE_KINDS`, `FAILURE_KIND_VALUES`,
    `type FailureKind`, `FailureKindSpec` (npm); `BabelFailureKind` (Dart:
    one constant per kind plus `values`, `retry`, `savedOnWrite`,
    `showReference`, `silent`, `unreachableWhere`). 23 kinds.
  - `contracts/error-envelope.json` → `ERROR_ENVELOPE`, `GENERIC_ERROR_CODES`,
    `type ErrorGateKind` (npm); `BabelErrorEnvelope` (Dart). 12 generic codes.
  - `contracts/rules/generic-error-phrases.json` → `GENERIC_ERROR_PHRASES`
    (npm); `BabelGenericErrorPhrases` (Dart). 11 locales (en, fr, es, zh, pt,
    ar, de, it, ja, ko, ru), each with whole / opening / anywhere lists.
  - npm exports `./failure-kinds.json`, `./error-envelope.json` and
    `./generic-error-phrases.json` for tools that read the raw JSON.
  - `contracts.flat.json` gains `failureKind.*`, `errorEnvelope.*` and
    `genericErrorPhrases.*` keys.
- **`error-codes.json` refreshed from the API** (babel-lambda-api develop
  b950f1b6): 215 → 510 codes. 295 added; none renamed. 3 codes the API no
  longer declares (`SUBSCRIPTION_TRIAL_ACTIVE`, `PORTAL_NOT_FOUND`,
  `PORTAL_INVALID_CONFIG`) are kept and listed in `$meta.retiredFromApi`,
  because a contract value is never removed in one release. 13 codes still
  have no API translation (`$meta.untranslated`). `ERROR_CODES` /
  `BabelErrorCodes` grow accordingly; existing members are unchanged.
- Tooling (does not ship): `scripts/check-error-copy.mjs`, the one error-copy
  scanner every app vendors (catalogue JSON + source literals with adjacent
  literals joined, JSX text, title-repeats-body siblings, app counters, an
  exact per-key baseline that `--update-baseline` only lowers).
  `check-contracts.mjs` gains the failure-kind, envelope, phrase and
  ERRORS.md invariants; `npm run verify` runs the scanner's self-test
  (`npm run check:error-copy`).

## 0.8.1
- **`PREVENT-1` revised (owner ruling, 2026-10-07): errors show when the user
  leaves a field.** The visible "Still needed" line is retired. An incomplete
  submit stays dimmed but pressable and a press only moves focus to the first
  missing field; that field's error shows when the user leaves it, and a
  screen reader hears what is missing as the button's description. `FORM-2`,
  `FORM-3` and `A11Y-6` follow. Rule IDs are unchanged, so no app's map
  breaks; only the text and the `PREVENT-1` title in `principles.json` /
  `BabelPrinciples` change.

## 0.8.0
- **UX principles.** New `principles/` folder: `COMMON.md` holds the rules every
  Premium SARL brand follows, and one file per brand sits beside it:
  `BABEL.md`, `CUTSHEET.md`, `DIDACTIKOS.md`, `PANTRY.md`, `RENDEE.md`. Each
  rule has a stable ID (`FOCUS-1`, `BABEL-ID-1`).
  The build emits an index of those IDs: `dist/principles.json` (npm export
  `./principles.json`) and `lib/babel_principles.dart` (`BabelPrinciples`,
  pure Dart). Apps check the IDs their design docs cite against it. The
  markdown ships in the npm package. Additive only.
- **Shadows reach Dart.** New `BabelShadowLight` / `BabelShadowDark`, each with
  `sm`, `md` and `lg` as `List<BoxShadow>`, one `BoxShadow` per layer of the
  matching `--shadow-*`. Until now the `shadow` group was CSS-only, so Flutter
  had no shadow token to use. Per theme, like `BabelColorsLight` /
  `BabelColorsDark`, because the light arm's warm tint does not carry to a dark
  surface. Numbers carry over verbatim (a 16px CSS blur becomes
  `blurRadius: 16.0`); Flutter blurs slightly softer than CSS at the same
  number. Additive only.
- **`tokens.flat.json` (the npm default export) gains `border.hairline` and
  `border.accent-rail`.** 0.7.0 shipped the `border` group to CSS and Dart but
  left it out here, because the flat walk used a hand-kept group list. The walk
  now covers every group, so a new one can no longer be dropped. Keys now follow
  `tokens.json` order; no other key or value changed.
- `DESIGN.md` now ships in the npm package (the README linked to it, and the
  link was dead inside `node_modules`).
- Tooling (does not ship): `npm run verify` now analyzes `babel_tokens.dart` as
  well as `babel_contracts.dart`, names the file it could not check when an SDK
  is missing, and fails a release that has no entry here. With `VERIFY_STRICT=1`,
  which the release steps use, a Dart file it could not analyze fails the run
  instead of being skipped with a warning.

## 0.7.0
- `radius.pill` = 40 (the CTA shape) and `radius.sheet` = 20 (the bottom-sheet
  top radius): `--radius-pill` / `--radius-sheet`, `BabelRadius.pill` /
  `BabelRadius.sheet`.
- New `border` group: `hairline` = 1, `accent-rail` = 3 (the tone rail on a
  card). `--border-hairline` / `--border-accent-rail`, `BabelBorder.hairline` /
  `BabelBorder.accentRail`. Missing from `tokens.flat.json` until 0.8.0.

## 0.6.0
- **Behaviour change for CSS consumers.** The z scale is corrected from
  `overlay 900 · modal 1000 · toast 1100` to the values that actually rendered
  in the admin panel: `dropdown 100 · sticky 200 · overlay 300 · modal 400 ·
  toast 500`, plus a new `chatbot 600`. A consumer that spends `var(--z-*)`
  without redeclaring it restacks. Dart does not emit z, so nothing changes for
  Flutter.
- The build fails when z rungs are out of order or less than 100 apart.

## 0.5.0
- Motion tokens. There is a `duration` ladder (`instant` 100 … `ambient` 1500),
  an `easing` set (`standard`, `enter`, `exit`, `spring`, `linear`) and
  `motionRole` pairs (`hover`, `control`, `overlay`, `dismiss`, `page`,
  `emphasis`, `loop`).
- CSS gets `--duration-*` and `--easing-*`, plus `--motion-*`, which holds
  duration then easing in `transition` shorthand order.
- Dart gets `BabelDuration`, `BabelEasing` (exact `Cubic`s rather than the
  nearest `Curves.*`), `BabelMotionRole` and `BabelMotion`.
- Includes everything in 0.4.0, which was never tagged.

## 0.4.0
- **Never tagged**, so it cannot be pinned. Pin 0.5.0 or later instead.
- Shared contracts ship for the first time. They merged while the version still
  read 0.3.0, but the `v0.3.0` tag predates them, so this is the first version
  number that contains them. The new pure-Dart `babel_contracts.dart` provides:
  - `BabelErrorCodes`, `BabelFieldErrorCodes` and `BabelFieldErrorParams`
  - `BabelNotificationType`, `BabelTaskStatus`, `BabelTaskPriority`,
    `BabelVendorTradeType` and `BabelComponentCondition`
  - `BabelLimits` and `resolveContractValue`

  npm exposes the same data as `./contracts` and `./contracts.json`.
- `BabelRole`: the spacing roles, generated from `spaceRole` (`padCard`,
  `gapPage`, `padCell`, …, `padPageFor(width)`).
- **Breaking, no known consumer.** The hand-written `BabelInsets.card` (16) is
  removed. Use `BabelRole.padCard`, which is 24 and matches `--pad-card`.

## 0.3.0
- Spacing roles in CSS (`--gap-page`, `--gap-section`, `--pad-card`,
  `--pad-cell`, …), emitted as `var(--space-N)` references. `--pad-page` is
  responsive via a new `breakpoint` group.
- `space.24` (96) and `space.32` (128) join the ladder.
- The web builds emit spacing in `rem`. The `px` rung stays `1px`.
- Dart gets `BabelGap`, `BabelInsets` and `BabelSize` (`controlH`).

## 0.2.0
- First packaged release of the Flutter delivery: `babel_design_tokens` is now a
  real pub package (git-dependency consumable) instead of a loose vendored file.
- `lib/babel_tokens.dart` is generated from `../tokens.json`: `BabelColors`,
  `BabelColorsLight`, `BabelColorsDark`, `BabelSpace`, `BabelRadius`, `BabelType`.
