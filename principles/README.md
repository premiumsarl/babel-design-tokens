# UX principles

The UX rules of every Premium SARL brand, in one folder: the rules all brands
share, and one file per brand next to them (owner decision, 2026-10-07).

| File | Holds |
| --- | --- |
| [COMMON.md](./COMMON.md) | The rules every brand follows, on every surface |
| [BABEL.md](./BABEL.md) | Babel: condo and HOA management (admin panel, mobile app, website) |
| [CUTSHEET.md](./CUTSHEET.md) | Cutsheet: B2B meat and produce distribution (admin web app) |
| [DIDACTIKOS.md](./DIDACTIKOS.md) | Didactikos: digital textbooks (web, used on desktop and phones) |
| [PANTRY.md](./PANTRY.md) | Panora (PantryAI): household pantry (native mobile app) |
| [RENDEE.md](./RENDEE.md) | Rendee (formerly SlotBase): white-label booking (admin, tenant sites, mobile app) |

Only Babel's apps check their docs against these rules today (see "How apps
use them"). The other brands read their file here; each lists the open
questions its rules are waiting on.

## What a brand file holds

A brand file adds what COMMON.md leaves to each brand:

- its identity: colours, typefaces, shapes and voice;
- its measurements for common rules: the viewport for `FOCUS-1`, the device
  floor for `DONE-2`, the locales for `COPY-5`;
- its legal facts that are never defaulted (`PREVENT-6`) and what it masks
  (`DATA-1`);
- its own rulings.

It never restates a common rule. It may set one aside only by naming it and
saying why, in a sentence such as "Sets aside `FORM-3` on the checkout
sheet, because …".

## Rule IDs

- A common rule is `AREA-n` (`FOCUS-1`); a brand rule is `BRAND-AREA-n`
  (`BABEL-ID-1`), so an ID says which file owns it.
- Each rule is one heading: `### FOCUS-1 · The object the user came for is in
  the first viewport`.
- Cite a rule by its ID in backticks: `` `FOCUS-1` ``.
- An ID is permanent. To retire a rule, delete it and say so in
  `dart/CHANGELOG.md`; never give its ID to another rule.

`npm run build` refuses a malformed rule heading, an ID of the wrong shape for
its file, a duplicate ID, and a backticked ID that no file defines.

## How apps use them

An app's design doc cites rule IDs and maps each one to the component and the
check that implement it on that platform. It does not restate the rule.

The build turns this folder into an index of rule IDs, titles and scopes, in
the same release as the tokens:

- npm: `@premiumsarl/babel-design-tokens/principles.json`
- pub: `package:babel_design_tokens/babel_principles.dart` (`BabelPrinciples`)

An app's own test checks the IDs its doc cites against the release it pins,
so a doc cannot cite a rule that does not exist, and a new rule shows up as
unmapped after the next pin bump.

A brand whose apps do not depend on this package reads its rules here.

## Changing a rule or adding a brand

1. Edit the brand's file, or add `<BRAND>.md` (the brand's name in capitals)
   for a new brand. Its IDs start with that name.
2. `npm run build` regenerates the index; `npm run verify` runs every gate.
3. Release it like a token change: see "Editing tokens / releasing" in the
   [package README](../README.md#editing-tokens--releasing). Apps see the
   change when they bump their pin.
