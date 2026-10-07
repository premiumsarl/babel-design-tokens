# Didactikos UX principles

Didactikos is an AI-powered digital textbook platform for education in
Africa, used by publishers, teachers and students. It has one client,
`didactikos-web` (Next.js), used on desktop and as mobile web; there is no
native app.

Didactikos follows every rule in [COMMON.md](./COMMON.md). This file adds its
own. `didactikos-web/docs/UI_DESIGN_GUIDELINES.md` holds the web's mechanics;
it does not yet map these rules by ID.

## Identity

### DIDACTIKOS-ID-1 · A brown brand, split into fill and ink

The brand brown is `#743e1f` in light mode and `#a65b30` in dark. As in
Babel, it is split into a fill token for surfaces and an ink token for text,
so text uses the one that passes `A11Y-1`.

### DIDACTIKOS-ID-2 · Typefaces

Poppins is the primary face, with Roboto and Instrument Sans.

## Layout

### DIDACTIKOS-DEVICE-1 · Phone width is a real surface

With no native app, students and teachers on phones use the web app. Every
screen is verified at phone width as well as desktop. Sets the floor for
`DONE-2`.

## Language

### DIDACTIKOS-LANG-1 · English and French

Every string ships in English and French; the default is English. Implements
`COPY-5`.

## Money

### DIDACTIKOS-LEGAL-1 · Never default a currency

Euro orders once became payable in XOF through a default in the web app.
Payment is now XOF-only, and a currency is always chosen by a person.
Implements `PREVENT-6`.

### DIDACTIKOS-MONEY-1 · A publisher's currency change is refused while orders would break

Changing a publisher's currency is refused while open orders lack the new
currency, and the publisher's books come off sale automatically (owner
ruling, 2026-09-17). Applies `PREVENT-4`.

## Open questions

- Dark mode: the design guidelines say only Super Admins get it, but the
  stored default is "system", so any visitor whose device is dark gets it.
  Which is intended?
- White-on-amber pills and the light brown are awaiting a design call.
