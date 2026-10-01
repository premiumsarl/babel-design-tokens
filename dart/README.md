# babel_design_tokens (Flutter)

The Flutter/Dart delivery of two things: the Babel **design tokens** (black core
+ bronze accent, #B08D57) and the Babel **shared contracts** (the wire vocabulary
common to the API, the admin panel and this app). Both are outputs of the same
pipeline; the sources of truth are [`../tokens.json`](../tokens.json) and
[`../contracts/`](../contracts), and everything in `lib/` is **generated** by
[`../build.mjs`](../build.mjs). Never hand-edit `lib/`.

The web apps consume the same sources over npm (`../dist/*`); Flutter can't use
npm, so mobile consumes this package over **pub** — off the same git tag, which
is what makes "the client and the server agree" a property of the pin rather
than of anyone's diligence.

> The package is still named `babel_design_tokens`. Contracts ride it because it
> is the distribution that already reaches every client off one tag; renaming it
> would break the existing pin in the mobile app for no functional gain.

## Consume it (git dependency)

Flutter can install straight from the repo — no pub.dev publish needed. In the
mobile app's `pubspec.yaml`:

```yaml
dependencies:
  babel_design_tokens:
    git:
      url: https://github.com/premiumsarl/babel-design-tokens.git
      ref: v0.8.0        # pin the latest release tag (see CHANGELOG.md)
      path: dart         # this package lives in the repo's /dart subfolder
```

Then:

```dart
import 'package:babel_design_tokens/babel_tokens.dart';

Container(color: BabelColors.brand500);          // #B08D57
final ok  = BabelColorsLight.successText;         // semantic, light
final pad = BabelSpace.s_4;                        // 16.0
final r   = BabelRadius.lg;                         // 12.0
const lift = BoxDecoration(boxShadow: BabelShadowLight.sm);
```

## What's exported

`package:babel_design_tokens/babel_tokens.dart` (imports `flutter/widgets.dart`):

- `BabelColors` — the theme-invariant color ramps (`brand50…brand900`, neutrals, status, `chart1…chart8`).
- `BabelColorsLight` / `BabelColorsDark` — semantic roles per theme.
- `BabelSpace` — the 4px spacing ladder (`s_0`, `spx`, `s_05`, `s_1` … `s_32`).
- `BabelGap` — ladder gaps as `SizedBox`es (`h4` vertical, `w2` horizontal).
- `BabelInsets` — ladder `EdgeInsets` (`a4` all, `h4` horizontal, `v4` vertical).
- `BabelRole` — spacing roles: which rung a job uses (`padCard`, `gapPage`, `padCell`, …, `padPageFor(width)`).
- `BabelSize` — control sizes (`controlH`).
- `BabelRadius` — corner radii, including `pill` and `sheet`. `BabelBorder` — shared border widths (`hairline`, `accentRail`).
- `BabelShadowLight` / `BabelShadowDark` — elevation `sm` / `md` / `lg` as `List<BoxShadow>`, per theme.
- `BabelDuration` / `BabelEasing` — the motion ladder and exact curves. `BabelMotion` — motion roles, each a `BabelMotionRole` (`duration` + `curve`).
- `BabelType` — type scale + families.

`package:babel_design_tokens/babel_contracts.dart` (**pure Dart**, no Flutter —
usable from a plain isolate and from tests with no binding):

- `BabelErrorCodes` / `BabelFieldErrorCodes` / `BabelFieldErrorParams` — the API's error vocabulary.
- `BabelNotificationType`, `BabelTaskStatus`, `BabelTaskPriority`, `BabelVendorTradeType`,
  `BabelComponentCondition` — each with `values`, `deprecated`, `aliases`, any named
  subsets, and a `resolve()` that maps a wire value to its canonical spelling.
- `BabelLimits` — bounds more than one repo enforces (`otpCodeLength`, `unitNameMaxLength`, …).

```dart
import 'package:babel_design_tokens/babel_contracts.dart';

if (e.errorCode == BabelErrorCodes.permissionDenied) { … }

// Build a picker from a SUBSET, not from `values`: the rest of the vocabulary is
// engine- or endpoint-only, so `values` would offer moves the server refuses.
final options = BabelTaskStatus.writableService;

// Legacy spellings resolve; an unknown trade is PRESERVED (the list is client-owned).
BabelVendorTradeType.resolve('plumbing');   // 'serviceProviderPlumbing'
BabelVendorTradeType.resolve('dowsing');    // 'dowsing'
BabelTaskPriority.resolve('bogus');         // null — this vocabulary is closed
```

These are `String`s, not a generated Dart `enum`, deliberately: an enum makes an
unrecognised server value unrepresentable, and an old binary meeting a new value
must keep working. Wrap them in your own enum where you want exhaustiveness and
keep a fallback member — `NotificationType.unknown` already does exactly this.

## Regenerate

From the repo root: `npm run build` (writes `dart/lib/babel_tokens.dart` and
`dart/lib/babel_contracts.dart` plus the CSS/JSON outputs). Bump `version` here and in
the root `package.json` together, add the release to [`CHANGELOG.md`](./CHANGELOG.md),
and commit. Then, on a clean checkout of the commit you will tag, run `npm run verify`
with Flutter on `PATH` (it analyzes both Dart files; no line may say `SKIPPED`), and tag
that commit `vX.Y.Z` so both the npm and pub consumers can pin the same release. The
[release steps](../README.md#editing-tokens--releasing) say why the pre-push hook does
not stand in for this.
