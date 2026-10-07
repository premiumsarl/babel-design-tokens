# Rendee UX principles

Rendee (rendee.ca, formerly SlotBase, and GrooMe before that) is a
white-label booking platform. Businesses such as barbers, studios and gyms get
their own booking site, and their clients book on it. Code and AWS names still
read `slotbase-*`.

Surfaces, in the `premiumsarl/groome-nodeJS` monorepo unless noted:

- `apps/admin`: the businesses' and Rendee's admin (Next.js);
- `apps/site`: one Next.js deployment serving every tenant's domain;
- `slotbase-mobile`: the clients' native Flutter app, one flavor per brand.

Rendee follows every rule in [COMMON.md](./COMMON.md). This file adds its own.
No app doc maps these rules yet.

## Identity

### RENDEE-ID-1 · Customers see the business's brand, never Rendee's

No customer-facing string names Rendee or SlotBase. Everything a client sees on
a tenant site or in the app comes from that tenant's config: colours, fonts,
logo, copy. Tenant themes live in `packages/tokens/themes/` (the site) and in
each business's runtime branding (the app).

### RENDEE-ID-2 · The admin is Rendee's own surface

The browser tab reads "Rendee admin" (owner decision, 2026-10-05). The admin
renders dark, in Inter, on an indigo ramp (`#5c7cfa`, `#4c6ef5`, `#4263eb`).
When a business is selected, its chrome takes on that business's brand.

### RENDEE-ID-3 · A tenant's brand colour must pass contrast

Rendee does not choose its tenants' colours, so it checks them: every tenant
theme's brand colour is held to 4.5:1 on white by the theme package's tests.
Applies `A11Y-1` to colours Rendee does not pick.

## Language

### RENDEE-LANG-1 · Each tenant site sets its own locales

A tenant declares its site locales and default (both live tenants: French by
default, with English). The app ships English, French, Chinese and Spanish,
falling back to English. Implements `COPY-5`.

## Money

### RENDEE-TRUTH-1 · Money maths lives only in the core package

Prices, deposits and totals are computed in `packages/core` and nowhere else.
Applies `TRUTH-1` inside the monorepo.

## Open questions

- The admin is English-only, with no translation layer, which `COPY-5` does
  not allow. Is that deliberate for an operator surface?
- The admin sidebar still says "SlotBase" in three places.
