# Babel UX principles

Babel is a condo and HOA management platform for Québec. Managers and board
members work in the admin panel (Next.js). Residents, owners and board members
use the mobile app (Flutter). The public website (babel.management) markets
it.

Babel follows every rule in [COMMON.md](./COMMON.md). This file adds Babel's
identity, its measurements and its own rulings. It sets no common rule aside.

Where each rule is built:

- Admin panel: `babel-admin-panel/docs/design-standards.md` maps every common
  and Babel rule to its component and its check.
- Mobile app: `babel-mobile/docs/DESIGN_STANDARDS.md` does the same.
- Token values (palette, type scale, spacing, motion): [DESIGN.md](../DESIGN.md)
  in this package.

## Identity

### BABEL-ID-1 · Black core, bronze accent

The core (near-black in light, near-white in dark) carries primary actions and
the active navigation. The bronze `#B08D57` (the logo, `brand-500`) carries
brand moments: links, focus, highlights. Values come only from `tokens.json`
in this package (`VISUAL-1`).

### BABEL-ID-2 · Bronze text uses the strong bronze

Text, links, buttons and focus rings use `accent-strong` (`#7C6139` in light,
`brand-300` in dark), which passes `A11Y-1`. The logo bronze `accent` is about
3:1 on white, so it is for fills and large areas only.

### BABEL-ID-3 · Two voices: the manager's console and the resident's pocket tool

The admin panel is operational, dense and quiet: a screen exists to let a
manager do something. The mobile app is short, with one action per screen.

### BABEL-ID-4 · Typefaces

Inter for product UI and running text. Space Grotesk for marketing display
only; the admin panel does not use it. A monospace face for codes and tabular
references.

### BABEL-ID-5 · Shapes

Cards use a 12px radius. Mobile call-to-action buttons are 40-radius pills, and
bottom sheets round their top corners at 20. One shadow per stack: a quiet
card under a verdict carries none.

## Layout

### BABEL-FOCUS-1 · Admin lists put the first row in view at 1280×800

At most two bands sit above a list: the page header with its verdict line, and
a headline figure only where the owner has ruled on that figure. Measures
`FOCUS-1`.

### BABEL-FOCUS-2 · Mobile screens lead with one verdict

The figure the person needs to decide (what is owed, what is due, what
changed) sits in a verdict band at the top, with one action. Measures
`FOCUS-1`.

### BABEL-DEVICE-1 · The Pixel 2 is the mobile floor

Every mobile screen is verified at 411×731 dp, in French (the longer locale)
and at a large text size. Sets the floor for `DONE-2`.

## Language

### BABEL-LANG-1 · Four locales, one key format

Every string ships in English, French, Spanish and Chinese. Keys read
`<screen>_<component>_<element>_<type>` on both clients. Implements `COPY-5`.

## Legal facts and residents' data

### BABEL-LEGAL-1 · The legal facts Babel never defaults

A resident's move-in date (it is a succession: recording it closes the sitting
occupants of the same kind that day), claim dates, the inspection date, a
meeting's start (notice periods run from it), the unit name, a share
percentage and share sections. Implements `PREVENT-6`.

### BABEL-DATA-1 · What Babel masks and what it shows

Masked: keypad PINs, intercom entry codes and garage dip-switch patterns.
Shown in clear: pairing numbers, printed remote codes, serial numbers,
intercom slots, and a car and its button (owner ruling, 2026-09-24).
Implements `DATA-1`.

## Feedback

### BABEL-HAPTIC-1 · Five vibration tiers on mobile

Each tier is fired by the shared component, never by the screen
(`CONFIRM-3`).

| Tier | Feels | For |
| --- | --- | --- |
| navigation | selection click | tabs, filters, a row that opens something, a dialog's Cancel |
| toggle | light | switches, checkboxes, reversible changes |
| action | medium | confirm, submit, pull-to-refresh, long-press menu |
| destructive | heavy | delete, remove, revoke, terminate, cancel a booking |
| notification | medium | a save succeeding, a copy to the clipboard |

### BABEL-CONFIRM-1 · What counts as destructive in Babel

Cancelling a booking, a service request, a lease or a payment schedule is
destructive. A "cancel" that only closes a dialog is not, and neither is
signing out. On mobile a destructive confirm uses the heavy vibration and the
verb in the error text colour. Applies `CONFIRM-1`.

## Errors

### BABEL-ERROR-1 · Babel's error measurements

- Locales: the admin panel and the mobile app use 4 (en, fr, es, zh,
  `BABEL-LANG-1`). The website uses 5 (adds pt). The chatbot uses its 11. A
  new error key lands in every locale in the same pull request.
- Babel may name itself: "Babel's server did not answer within 30 s."
- Time limits the copy must quote truthfully:
  - admin proxy: 30 s, or 65 s on AI paths;
  - API Lambda: 60 s;
  - production REST gateway integration: 29 s;
  - mobile Dio: 30 s connect, receive and send.
  A write that hits any of these is an unknown outcome (`ERROR-4`).
- Support contact shown with a reference: help@babel.management.
- References: the server sends 8 characters (`reference`; shipped clients
  also read `details.reference`). Client crashes mint `E-XXXXXX`.
- Automatic retries stop after 5 minutes (`ERROR-9`).
- "Our team has been notified" is not written anywhere in Babel today: no
  alert fires on a client or server bug, only an analytics event (`ERROR-7`).
- A status code mobile 0.64.0 parses (401, 403, 409, 500 on the auth and gate
  paths) changes only behind a client opt-in header until a mobile release
  that reads the new one is widely installed (`ERROR-6`).

Implements `ERROR-1`, `ERROR-6`, `ERROR-7` and `ERROR-9`.

### BABEL-ERROR-2 · Money errors always state where the money is

A failure on a payment, refund, autopay, bank link or card says one of three
things: "No money moved", "{amount} was charged", or "We can't confirm yet —
do not pay again". It names the provider when the provider is the cause
(Stripe, Plaid, the bank). A failed bank link is never called a failed
payment. Applies `ERROR-1` and `ERROR-4`.

## Verification

### BABEL-DONE-1 · Smoke on dev, as the approved seats only

Babel smoke tests run against the dev API, signed in as one of the four
approved test seats, never in production. Applies `DONE-5`.
