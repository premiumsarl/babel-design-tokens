# @premiumsarl/babel-design-tokens

Single source of truth for Babel's design tokens — **black core + bronze accent** (`#B08D57`).
Generates CSS custom properties (admin panel + website) and Dart constants (mobile) from one JSON file.

See **[DESIGN.md](./DESIGN.md)** for the full design system (palette, type, spacing, usage, governance, migration).

## Layout

```
tokens.json              ← the ONLY file you edit
build.mjs                ← generator (no deps): resolves aliases, emits the outputs
scripts/check-tokens.mjs ← the drift ratchet (fails CI on new raw color literals)
dist/                    ← GENERATED — never hand-edit
  tokens.css             → import in admin (theme-adaptive: light/dark)
  tokens.values.css      → import in website (flat, single-theme — see note)
  tokens.flat.json       → tooling / resolved token map / the default export
dart/                    ← a Flutter pub package (consumed by mobile)
  pubspec.yaml
  lib/babel_tokens.dart  → GENERATED — BabelColors / BabelSpace / BabelType …
```

## One source, per-ecosystem delivery

The truth is one `tokens.json`. It ships to each app through that ecosystem's own
package manager — **npm** for the web apps, **pub** for Flutter — so a token change
is a version bump, not a file copy.

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

## Editing tokens / releasing

```bash
npm run build                       # regenerate all outputs from tokens.json
npm run check -- ./path/to/src      # count raw color literals vs a baseline
```

1. Edit `tokens.json` (alias with `{color.brand.500}`). Changing the brand is a one-line edit.
2. `npm run build` — regenerates `dist/*` **and** `dart/lib/babel_tokens.dart`.
3. Bump `version` in **both** `package.json` and `dart/pubspec.yaml` (keep them equal).
4. Commit `tokens.json`, `dist/`, and `dart/lib/`, then tag `vX.Y.Z` so npm and pub consumers pin the same release.

> Currently `"private": true` — safe for the git-dependency flow above. To publish to a
> registry (e.g. GitHub Packages) later, set `private:false` + add `publishConfig`; the
> `prepublishOnly` build+contrast gate then runs on `npm publish`.
