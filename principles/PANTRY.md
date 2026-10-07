# Panora (PantryAI) UX principles

Panora is a voice-first household pantry manager: a native Flutter app for
iOS and Android, with its API. The name on the device is Panora; the app's own
text still says PantryAI.

Panora follows every rule in [COMMON.md](./COMMON.md). This file adds its own.
No app doc maps these rules yet.

## Identity

### PANTRY-ID-1 · "Paper": monochrome, with colour only for status

The UI is zinc monochrome: primary `#18181B` in light mode, `#FAFAFA` in
dark. Colour appears only where it carries meaning.

### PANTRY-ID-2 · Status colours name a food's state

Fresh is sage `#3F6B4C`, expiring is amber `#9A6B28`, expired is red
`#8C3030`, and the fridge is blue `#3A6080`. Each state also needs a word or
icon; colour alone is never enough (`A11Y-2`).

### PANTRY-ID-3 · Typeface and theme

Inter throughout. The theme follows the device's light or dark setting.

## Language

### PANTRY-LANG-1 · Four locales

Every string ships in English, French, Chinese and Spanish, falling back to
English. Implements `COPY-5`.

## Open questions

- Which name is canonical, Panora or PantryAI? The rule IDs here use
  `PANTRY-` either way.
