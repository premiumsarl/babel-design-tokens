# babel_design_tokens (Flutter)

The Flutter/Dart delivery of the Babel design tokens — **black core + bronze
accent (#B08D57)**. This package is one output of the token pipeline; the source
of truth is [`../tokens.json`](../tokens.json), and `lib/babel_tokens.dart` is
**generated** by [`../build.mjs`](../build.mjs). Never hand-edit `lib/`.

The web apps consume the same tokens over npm (`../dist/*.css`); Flutter can't
use npm, so mobile consumes this package over **pub**.

## Consume it (git dependency)

Flutter can install straight from the repo — no pub.dev publish needed. In the
mobile app's `pubspec.yaml`:

```yaml
dependencies:
  babel_design_tokens:
    git:
      url: https://github.com/premiumsarl/babel-design-tokens.git
      ref: v0.2.0        # pin to a release tag
      path: dart         # this package lives in the repo's /dart subfolder
```

Then:

```dart
import 'package:babel_design_tokens/babel_tokens.dart';

Container(color: BabelColors.brand500);          // #B08D57
final ok  = BabelColorsLight.successText;         // semantic, light
final pad = BabelSpace.s4;                         // 16.0
final r   = BabelRadius.lg;                         // 12.0
```

## What's exported

- `BabelColors` — the theme-invariant color ramps (`brand50…brand900`, neutrals, status).
- `BabelColorsLight` / `BabelColorsDark` — semantic roles per theme.
- `BabelSpace` — the 4px spacing ladder. `BabelRadius` — corner radii. `BabelType` — type scale + families.

## Regenerate

From the repo root: `npm run build` (writes `dart/lib/babel_tokens.dart` plus the
CSS/JSON outputs). Bump `version` here and in the root `package.json` together, then
tag the repo `vX.Y.Z` so both the npm and pub consumers can pin the same release.
