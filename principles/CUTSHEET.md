# Cutsheet UX principles

Cutsheet is a B2B distribution platform for meat and produce: catalogue,
inventory and purchase orders. It has one client, the Cutsheet Admin web app
(Next.js), and its API. There is no mobile app.

Cutsheet follows every rule in [COMMON.md](./COMMON.md). This file adds its
own. No app doc maps these rules yet.

## Identity

### CUTSHEET-ID-1 · Burgundy and gold

The brand is burgundy `#6B2D3E` (`#d4849a` in dark mode), with a gold accent
(`#C4933F`, `#a87b32`). Inter throughout.

### CUTSHEET-ID-2 · Light, dark or system, chosen by the user

The admin offers light, dark and system themes, and starts on system.

## Language

### CUTSHEET-LANG-1 · Four locales

Every string ships in English, French, Chinese and Spanish; the default is
English. Implements `COPY-5`.
