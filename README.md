# @premiumsarl/babel-design-tokens

Single source of truth for Babel's design tokens — **black core + bronze accent** (`#B08D57`).
Generates CSS custom properties (admin panel + website) and Dart constants (mobile) from one JSON file.

See **[DESIGN.md](./DESIGN.md)** for the full design system (palette, type, spacing, usage, governance, migration).

## Layout

```
tokens.json              ← the ONLY file you edit
build.mjs                ← generator (no deps): resolves aliases, emits dist/
scripts/check-tokens.mjs ← the drift ratchet (fails CI on new raw color literals)
dist/                    ← GENERATED — never hand-edit
  tokens.css             → import in admin + website
  babel_tokens.dart      → vendor into base_mobile_library (mobile)
  tokens.flat.json       → tooling / resolved token map
```

## Use

```bash
npm run build                       # regenerate dist/ from tokens.json
npm run check -- ./path/to/src      # count raw color literals vs baseline
npm run check -- ./src --update-baseline   # snapshot the current count
```

**Admin / website (CSS):**
```css
@import "@premiumsarl/babel-design-tokens/tokens.css";
.button-primary { background: var(--color-core); color: var(--color-on-core); }
.link          { color: var(--color-link); }
```

**Mobile (Flutter):** vendor `dist/babel_tokens.dart` into `base_mobile_library`, then
`BabelColorsLight.accentStrong`, `BabelSpace.s4`, `BabelType.body`, etc.

## Editing tokens

1. Edit `tokens.json`. Alias other tokens with `{color.brand.500}`.
2. `npm run build`.
3. Commit `tokens.json` **and** `dist/`.

Changing the brand is a one-line edit here — every platform follows on rebuild.
