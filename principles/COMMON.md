# Common UX principles

Every Premium SARL brand follows these rules, on every surface: web, mobile
web and native mobile. Each brand's own file in this folder (`BABEL.md`,
`DIDACTIKOS.md`, …) adds its identity, its measurements and its own rulings.
A brand file may set a rule here aside only by naming it and saying why.

Each rule has a stable ID. App docs cite the ID instead of restating the rule,
and `npm run build` fails on an ID this folder does not define. See
[README.md](./README.md) for how IDs, brand files and releases work.

## Focus: what the user came for comes first

### FOCUS-1 · The object the user came for is in the first viewport

On a list screen, the first data row shows without scrolling. On a detail
screen, the figure or action the person came for does. Each brand names the
viewport it measures at.

### FOCUS-2 · Analysis sits below the object, never above it

Charts, breakdowns and explanations come after the list or record they
explain.

### FOCUS-3 · Nothing on screen only says something

A card that only reads "not set up" is chrome, not information. A section that
does not apply to this user renders nothing, not a card saying it does not
apply.

### FOCUS-4 · Fold prose, not verdicts

Keep the total, the count and the warning visible. Fold the intro, the
provenance and the legal note.

## Prevent: remove the need for an error message

The UI should make an error message unnecessary, not report one after the
click (owner ruling, 2026-10-03).

### PREVENT-1 · An incomplete submit stays pressable and says what is missing

The button is dimmed but focusable: `aria-disabled` on the web, never
`disabled`. A "Still needed: …" line sits beside it. A press moves focus to
the first missing field. No toast, and never a dead button.

### PREVENT-2 · Required fields are marked before any click

The required marker shows from the first render, not after a failed submit.

### PREVENT-3 · Input limits are checked live, from the shared contract

Every length, range and format the server enforces is checked as the user
types. The limit comes from the brand's contract package where it exists,
never a re-typed number. HTML `min`/`max` attributes are presentation only.
Uniqueness is checked live against data already on screen, but never for a
secret such as a door PIN.

### PREVENT-4 · An action the server will refuse is hidden or disabled, with its reason

Never let someone confirm an action and then refuse it.

### PREVENT-5 · Default only what the domain can stand behind

A default is a claim. "Today" for a maintenance start is safe; most dates are
not.

### PREVENT-6 · Never default a legal fact

A date, amount or name with legal effect is entered by a person, every time.
Mark the field as having no default and say why. Each brand lists its legal
facts.

## Forms

### FORM-1 · A placeholder is not a label

The label stays visible while the user types. A placeholder only shows an
example, such as "H2X 1Y4".

### FORM-2 · Scold late, praise early

A field's error appears when the user leaves it or submits. It clears on the
keystroke that fixes it.

### FORM-3 · The submit button never moves

An error never pushes the submit button down. Reserve one line under each
field for its error. On long forms and in dialogs, pin the submit in a footer
next to the "Still needed" line from `PREVENT-1`.

### FORM-4 · Autofill is a state, and is styled

Autofilled fields keep the brand's surface and text colours in every theme.
Each field declares the autofill hint for its kind (email, name, postal code,
one-time code).

### FORM-5 · A code is not a number

Postal codes, account numbers, registration numbers and one-time codes open
the numeric keypad but keep a string value, so leading zeros survive. Number
inputs are for quantities only.

## States

### STATE-1 · Every data screen has four states

Loading, error, empty and content. A screen that fetches data and lacks one of
them is not finished.

### STATE-2 · A failed load is never shown as empty

"No results" when the truth is "we could not load this" sends people the wrong
way. A permission refusal once told a resident to ask an administrator about a
record that existed. Check for an error before checking for empty.

### STATE-3 · Pages shimmer, buttons spin

A page or section loads with a skeleton that keeps its shape. A spinner
belongs only on the control that is working. A blocking full-screen loader is
the exception, chosen per screen.

### STATE-4 · An empty state says what to do next

An icon, one sentence and one action. "Drop your first document here" beats
"No documents".

## Copy: honest wording

### COPY-1 · A refusal names its real gate

Permission, plan tier and setup each get their own message. "You don't have
access" on a plan-tier gate sends people to ask an administrator for something
no administrator can grant.

### COPY-2 · An error code is as specific as the sentence it replaces

Clients prefer the translated catalogue entry over the server's message, so a
vague code loses the remedy the server sent.

### COPY-3 · Missing and zero are different facts

A display rule that hides or dashes a value states why: "no amount set" and a
negotiated $0 must not look the same.

### COPY-4 · One fact, one voice

A screen states its name once. Tabs and breadcrumbs are navigation, not a
second or third title.

### COPY-5 · No user-visible string is hard-coded

Every string goes through the translation layer, in every locale the brand
supports.

### COPY-6 · Money and dates go through the shared formatters

Never format money or dates inline.

### COPY-7 · Server messages never quote a UI control

The client names its own buttons in the user's language.

## Truth: one source for every rule and vocabulary

### TRUTH-1 · Show the server's decision; never re-derive it

Permission gates, "can remove" flags and balances come from the server. A
client copy of a server rule drifts, and it drifts toward allowing too much.

### TRUTH-2 · Shared vocabularies are imported, never re-typed

Statuses, error codes and limits come from the brand's contract package. A
picker offers only the subset the server accepts.

## Lists

### LIST-1 · Every visible status or category can be filtered

The filter's options come from the vocabulary's source, not from the values
that happen to be on screen.

### LIST-2 · A filter matches the raw value, never the translated label

A translated value silently empties the list after a language switch, and
nothing on screen says why.

### LIST-3 · Never hide what signals money, time or identity

Money owed, an overdue or expiry signal, a deadline, an operational counter and
the row's own name stay visible.

### LIST-4 · A saved view stores only what the user changed

Store the user's changes, not a snapshot of the defaults, under a versioned
key, with a reset.

## Confirmations and feedback

### CONFIRM-1 · Every confirmation says whether it destroys something

Mark a dialog destructive only when the action deletes, revokes or cancels
something the user cannot simply take back. Signing out is not destructive.

### CONFIRM-2 · A destructive dialog opens on Cancel

The destructive verb is coloured as an error and is never the default
button.

### CONFIRM-3 · Feedback comes from the shared components

Toasts, snackbars and vibration come from the brand's shared components, one
per action. A screen that adds its own on top plays two at once.

## Accessibility floor

### A11Y-1 · Text meets WCAG AA in every theme

4.5:1 for text and 3:1 for UI parts, measured in light and dark.

### A11Y-2 · Colour is never the only signal

Each status has a fill colour, a background and a text colour that passes
`A11Y-1`. Badges announce their meaning to screen readers, not their colour.

### A11Y-3 · Focus is always visible

Never remove a focus outline without a replacement.

### A11Y-4 · Every control has a name

An icon-only button carries an accessible label and a tooltip.

### A11Y-5 · Touch targets are large enough

44px for touch pointers on the web; 48dp on native mobile.

### A11Y-6 · Disabled stays readable, and working is not disabled

A disabled button still reads clearly and says what is left to do. A button
that is loading keeps its enabled colours and its name.

## Visual system

### VISUAL-1 · Tokens only

No raw colour, spacing, radius, shadow, duration or easing value in a
component. Each brand's tokens come from one package, pinned to a release, and
an app never redeclares a token the package owns.

### VISUAL-2 · Spend the role, not the number

Padding on a card uses the card-padding role, even when a plain step has the
same value, so the next reader sees the job.

### VISUAL-3 · Every colour exists in light and dark

Even an app that is light-only today places colours that have a dark value.

### VISUAL-4 · Compose the shared components; never rebuild one

Buttons, tables, empty states, badges, dialogs and form fields come from the
brand's component set.

### VISUAL-5 · Pinned headers are opaque

A translucent sticky header shows whatever scrolls beneath it.

## Users' data

### DATA-1 · Mask only what opens a door

Hide a value that lets someone in: a PIN, an entry code, a password. Show
identifiers in clear: serial numbers, pairing numbers, slot numbers.

### DATA-2 · Inform about anomalies in users' data; never act on them

A duplicate upload may be deliberate. Show a badge or a count; never delete,
merge or move a user's own content, and do not offer to (owner ruling,
2026-08-17).

## Definition of done

### DONE-1 · Done means seen working, not checks passing

Open the change on the development environment in light and dark mode, and
drive every state it added: force the error, force empty, watch a cold load.

### DONE-2 · Verify at the hardest layout

The smallest supported device, the longest supported language and a large
text size. Each brand names its floor.

### DONE-3 · Read the rendered screen, not the source

Copy is checked where it renders, and a screenshot of the changed section,
where it lives, goes in the pull request.

### DONE-4 · A screen that can correctly show nothing needs a positive control

If a section renders nothing when its data cannot be trusted, find a case where
it must render and prove that it does.

### DONE-5 · Never test in production

Smoke tests run on development, as the brand's approved test accounts.

### DONE-6 · A guard's limit only goes down

A check that counts a known debt fails on any increase. Its baseline is
lowered by measuring real code, never raised to make a change pass.
