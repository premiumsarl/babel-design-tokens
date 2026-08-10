# @premiumsarl/babel-design-tokens

Single source of truth for two things Babel's apps must agree on exactly:

- **design tokens** — black core + bronze accent (`#B08D57`), as CSS custom properties (admin panel + website) and Dart constants (mobile);
- **shared contracts** — the wire vocabulary (error codes, enums, bounds) shared by `babel-lambda-api`, `babel-admin-panel` and `babel-mobile`.

See **[DESIGN.md](./DESIGN.md)** for the full design system (palette, type, spacing, usage, governance, migration)
and **[Contracts](#contracts)** below for the vocabulary half.

## Layout

```
tokens.json                 ← design tokens: the ONLY file you edit
contracts/                  ← shared vocabulary: the ONLY files you edit
  error-codes.json          → the `error.<domain>.<action>` catalogue
  field-error-codes.json    → the `error.field.*` family + their params
  enums/*.json              → one file per enum (values, aliases, deprecated, subsets)
  rules/*.json              → numeric + string bounds more than one repo enforces
build.mjs                   ← generator (no deps): resolves aliases, emits the outputs
                              `--check` compares instead of writing
scripts/check-tokens.mjs    ← the drift ratchet (fails CI on new raw color literals)
scripts/check-contrast.mjs  ← the WCAG gate
scripts/check-contracts.mjs ← the contract invariants (see Contracts below)
dist/                       ← GENERATED — never hand-edit
  tokens.css                → import in admin (theme-adaptive: light/dark)
  tokens.values.css         → import in website (flat, single-theme — see note)
  tokens.flat.json          → tooling / resolved token map / the default export
  contracts.mjs             → import in admin + api (frozen const maps)
  contracts.d.ts            → literal types for the above
  contracts.flat.json       → tooling / flat contract map
dart/                       ← a Flutter pub package (consumed by mobile)
  pubspec.yaml
  lib/babel_tokens.dart     → GENERATED — BabelColors / BabelSpace / BabelType …
  lib/babel_contracts.dart  → GENERATED — BabelErrorCodes / BabelTaskStatus / BabelLimits …
```

## One source, per-ecosystem delivery

The truth is `tokens.json` and `contracts/`. It ships to each app through that
ecosystem's own package manager — **npm** for the web apps, **pub** for Flutter —
so a token or vocabulary change is a version bump, not a file copy.

### Admin / Website — npm (CSS)

Install (a git dependency needs no registry; pin a tag):
```jsonc
// package.json
"@premiumsarl/babel-design-tokens": "github:premiumsarl/babel-design-tokens#v0.2.0"
```
```css
/* Admin — theme-adaptive (drives light/dark off :root[data-theme]) */
@import "@premiumsarl/babel-design-tokens/tokens.css";
.button-primary { background: var(--color-core); color: var(--color-on-core); }

/* Website — flat VALUES only. Import tokens.values.css, NOT tokens.css: the
   theme-adaptive file's @media/[data-theme] dark rules would override a
   single-theme site's own accent. */
@import "@premiumsarl/babel-design-tokens/tokens.values.css";
```
`import tokens from "@premiumsarl/babel-design-tokens"` returns the resolved flat map (`tokens.flat.json`).

### Mobile — pub (Dart)

Flutter can't use npm; it consumes the [`dart/`](./dart) package over pub, as a git
dependency (see [dart/README.md](./dart/README.md)):
```yaml
dependencies:
  babel_design_tokens:
    git: { url: https://github.com/premiumsarl/babel-design-tokens.git, ref: v0.2.0, path: dart }
```
```dart
import 'package:babel_design_tokens/babel_tokens.dart';
BabelColors.brand500;  BabelColorsLight.accentStrong;  BabelSpace.s4;  BabelType.body;
```

---

# Contracts

A design token is a **value**. A contract is a **vocabulary** — the strings the
API, the admin panel and the mobile app must spell identically or a feature
quietly does nothing.

They live here because this repo already solved the hard part: one source, a git
tag, and delivery to all three clients over each ecosystem's own package manager.
A second distribution mechanism would be a second thing to keep in sync.

## What's in it, and why each one earned a file

Every enum here was chosen because its drift was **measured**, not suspected
(counts as of 2026-08-10; each file's `$meta.drift` carries the detail and the
file:line provenance).

| Contract | Why |
|---|---|
| `error-codes.json` | 215 codes the API can return. Admin ships 172 translations, mobile 125 — and mobile names only 21 of them in code. 13 have no translation in the API's own map. |
| `field-error-codes.json` | The 16 `error.field.*` codes on a 400. **Neither client ships a single translation for any of them**, and mobile discards the `code` and `params` at parse, so it could not localize them today even if the keys existed. |
| `enums/notification-type.json` | API 124 · mobile 129 · admin **79**. 45 server notification types have no entry in admin's `TYPE_GROUPS`, so they are invisible and unsettable on the web preference screen. |
| `enums/task-status.json` | Four spellings inside the API alone. `WRITABLE_TASK_STATUSES` is hand-listed rather than composed from the two per-type sets; admin carries a second bare-lowercase vocabulary in `status-badges.ts`. |
| `enums/task-priority.json` | Two vocabularies for four values, and the top tier has two names: canonical `taskPriorityCritical`, admin's short form `urgent`. |
| `enums/vendor-trade-type.json` | The three code lists agree; the **data** does not. Two spellings reached production and cost a live defect — the CAPEX engine silently returned no suggestion for bare-typed vendors. |
| `enums/component-condition.json` | The honest outlier: values have **not** diverged (4/4/4). Declared three times, labelled three ways, already widened once locally. Cheapest to freeze *before* it drifts. |
| `rules/limits.json` | 30 bounds that more than one repo enforces independently. Only bounds measured to **agree** are canon; the measured *disagreements* sit in `$meta.$conflicts` with their evidence, because picking a winner is an owner decision. |

## Consume it — npm (admin + api)

```ts
import { ERROR_CODES, NOTIFICATION_TYPE, TASK_STATUS, LIMITS } from
  "@premiumsarl/babel-design-tokens/contracts";
import type { ErrorCode, TaskStatus } from
  "@premiumsarl/babel-design-tokens/contracts";

if (err.errorCode === ERROR_CODES.PERMISSION_DENIED) { /* narrows to the literal */ }
```

### The intended consumption shape: **derive, never re-type**

Importing the package and then hand-copying its values into a local list
re-creates the drift. Derive instead. The API already has the pattern, and it is
there because the hand-maintained copy had drifted so badly that both preference
screens rendered ~40 notification types the save endpoint then rejected with a
400 — see `babel-lambda-api/src/schemas/notification.schema.ts:36-52`:

```ts
// Derived from CHANNEL_DEFAULTS rather than hand-listed. […] Deriving it makes
// the two endpoints agree by construction, and a new type can never again be
// settable-in-theory but unsettable-in-practice.
const notificationTypeEnum = z.enum(
    Object.keys(CHANNEL_DEFAULTS) as [string, ...string[]],
);
```

The same shape, sourced from this package:

```ts
import { NOTIFICATION_TYPE, TASK_STATUS } from "@premiumsarl/babel-design-tokens/contracts";

// `values` is a readonly tuple; Zod wants a mutable non-empty one.
const notificationTypeEnum = z.enum([...NOTIFICATION_TYPE.values] as [string, ...string[]]);

// Build a PICKER from a subset, never from `values` — the rest of the vocabulary
// is engine- or endpoint-only, so a picker built from `values` offers moves the
// server will refuse.
const statusOptions = TASK_STATUS.subsets.writableService;
```

## Consume it — pub (mobile)

Same package, same tag (see [dart/README.md](./dart/README.md)):

```dart
import 'package:babel_design_tokens/babel_contracts.dart';

BabelErrorCodes.permissionDenied;              // 'error.auth.permission_denied'
BabelTaskStatus.writableMaintenance;           // the picker list
BabelLimits.taskRejectionReasonMaxLength;      // 1000
BabelVendorTradeType.resolve('plumbing');      // 'serviceProviderPlumbing'
```

`babel_contracts.dart` is **pure Dart** — no Flutter import, unlike
`babel_tokens.dart` — so it works from a plain isolate and from tests with no
binding. Values are `String`s rather than a generated Dart `enum` on purpose: an
enum would make an unrecognised server value unrepresentable, which is exactly
what `onUnknown: preserve` forbids. Wrap them in your own enum where you want
exhaustiveness, and keep a fallback member.

## How to read a contract file

```jsonc
{
  "$meta": { … },        // description, owner, provenance, MEASURED drift. Never emitted.
  "values":     [ … ],   // canonical. A writer emits ONLY these.
  "deprecated": [ … ],   // still arrives from old clients / unswept rows.
                         //   A READER must accept them; a WRITER must not emit them.
  "aliases":    { … },   // legacy spelling → canonical value. Readers map through this.
  "subsets":    { … }    // named sub-vocabularies (per task type, writable-only…)
}
```

Two `$meta` fields carry behaviour rather than prose:

- **`onUnknown`** — `preserve` means an unrecognised value is stored/rendered
  verbatim; `reject` means it is a 400. This is not a style preference. For
  `vendorTradeType` it is `preserve` because the list is **client-owned**: an
  installed mobile binary cannot be recalled, so a trade we have never seen is
  legitimate. The server's job there is to spell a known trade consistently,
  never to police which trades exist.
- **`aliasMatch`** — `exact` or `case-insensitive`, matching what the server
  actually does today.

`resolveContractValue` (npm) and `Babel<Enum>.resolve` (Dart) implement exactly
this, identically. It is the one piece of behaviour shipped rather than
described, because every consumer would otherwise re-implement it and a
coerce-vs-reject mistake in that re-implementation is silent.

## Ownership is not always the server's

`vendorTradeType` and several bounds in `rules/limits.json` are **client-owned**,
and the values here are seeded from mobile rather than from the API. Do not
"correct" them toward the server: the server declares no bound on a vendor's
licence/GST/QST/NEQ fields at all, and the two clients already agree with each
other. Each such case is marked `"owner": "client"` with the reasoning in
`$meta.ownerNote`.

## Editing contracts

```bash
npm run build            # regenerate dist/* and dart/lib/* from tokens.json + contracts/
npm run check:contracts  # freshness + every invariant below
```

`check:contracts` fails on: stale committed output · an empty enum · a duplicate
value · a duplicate JSON key (which `JSON.parse` would otherwise resolve
silently to the *last* one, deleting a code) · two names sharing one wire value ·
an alias colliding with a canonical **or** deprecated value · an alias pointing
at nothing · a subset member outside `values` · a value both canonical and
deprecated · a case-insensitive collision · an off-convention code · a
non-integer or misnamed rule · a `min` above its `max`.

The alias-collision check is the one worth naming: an alias that *is* a canonical
value is a silent no-op — the rename it was written to apply simply never
happens, and nothing anywhere errors.

## Adopting a contract in a consumer repo

This package only makes the shared source **exist**. Migrating each repo to
derive from it is a separate per-repo change, and the canonical definitions are
deliberately still in place in all three repos today. When you migrate one:

1. Pin the tag (npm or pub, below).
2. Replace the local declaration with a **derivation** from the imported values.
3. Keep anything marked `excluded` in `$meta` — e.g. mobile's `garbage_reminder`
   is an on-device local notification that never crosses the API boundary, and
   its `unknown` member is a parse sentinel. Neither belongs in the contract, and
   neither should be deleted from mobile.
4. Keep anything marked `derived` — e.g. admin's `taskStatusDormant` is computed,
   never stored, never sent.

## Editing tokens / releasing

```bash
npm run build                       # regenerate all outputs from tokens.json + contracts/
npm run build:check                 # compare the committed output instead of writing
npm run check -- ./path/to/src      # count raw color literals vs a baseline
npm run verify                      # build + contrast gate + contract gate
```

1. Edit `tokens.json` (alias with `{color.brand.500}`) and/or `contracts/*.json`.
2. `npm run build` — regenerates `dist/*` **and** `dart/lib/*`.
3. `npm run verify` — WCAG contrast plus the contract invariants.
4. Bump `version` in **both** `package.json` and `dart/pubspec.yaml` (keep them equal).
5. Commit the sources, `dist/`, and `dart/lib/`, then tag `vX.Y.Z` so npm and pub consumers pin the same release.

> A contract change is a **wire** change: a consumer only sees it after step 5
> and a pin bump on its side. Removing a value is therefore never safe in one
> release — move it to `deprecated` first, let every client ship, then drop it.

> Currently `"private": true` — safe for the git-dependency flow above. To publish to a
> registry (e.g. GitHub Packages) later, set `private:false` + add `publishConfig`; the
> `prepublishOnly` build+contrast+contracts gate then runs on `npm publish`.
