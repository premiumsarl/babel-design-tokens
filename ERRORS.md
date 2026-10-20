# Errors that say what happened

The vocabulary behind `ERROR-1` to `ERROR-10` ([principles/COMMON.md](./principles/COMMON.md)),
`BABEL-ERROR-1`, `BABEL-ERROR-2` ([principles/BABEL.md](./principles/BABEL.md)),
`RENDEE-ERROR-1` and `RENDEE-ERROR-2` ([principles/RENDEE.md](./principles/RENDEE.md)):
the failure kinds, how each platform detects them, the wording, and the guard.
The rules live in `principles/`; this file holds no rule of its own, the same
split as [DESIGN.md](./DESIGN.md) (values) versus the principles (rules).

Owner ruling, 2026-10-20: "Let's make sure errors are clear for the user.
Nothing this generic is acceptable in Babel and Rendee/SlotBase/GrooMe." The
rules bind every brand (owner decision, 2026-10-20).

| Part | File |
| --- | --- |
| The rules | `principles/COMMON.md` → `## Errors`; brand measurements in `principles/BABEL.md` and `principles/RENDEE.md` |
| The failure kinds | `contracts/failure-kinds.json` → `FAILURE_KINDS` / `FailureKind` (npm), `BabelFailureKind` (Dart) |
| The error body | `contracts/error-envelope.json` → `ERROR_ENVELOPE`, `GENERIC_ERROR_CODES` (npm), `BabelErrorEnvelope` (Dart) |
| The banned wording | `contracts/rules/generic-error-phrases.json` → `GENERIC_ERROR_PHRASES` (npm), `BabelGenericErrorPhrases` (Dart) |
| The guard | `scripts/check-error-copy.mjs`, vendored into each app (section 8) |

## 1 · Where it started

The Rendee admin panel (groome-nodeJS `apps/admin`): its server had stopped,
and the panel showed this.

> **Something went wrong.**
> Something went wrong. Try again in a moment.
> Still not responding.
> [Try again] [Go back] [Dashboard] [Sign in again]

- The failed request never reached the panel's server, so it carried no
  `api-<kind>-<ref>` digest. The kind was null, so the heading was
  `TITLES.default` and the body `FRIENDLY.unknown`: both said "Something went
  wrong".
- The `/auth/ping` probe failed, which added "Still not responding". At that
  point the panel knew its own server was down. It said none of it, offered
  two buttons (Dashboard, Sign in again) that could not work against a dead
  server, and showed no reference.

Section 5 rewrites it.

## 2 · Message anatomy: four slots, built from sentences

| Slot | Comes from | EN example | FR example |
| --- | --- | --- | --- |
| **Title: what failed** | The call site's action key (`<screen>_<component>_<action>_failed_title` in Babel) | The building was not saved | Le bâtiment n'a pas été enregistré |
| **Why** | The kind's sentence, with the facts filled in | Babel's server did not answer within 30 s. | Le serveur de Babel n'a pas répondu en 30 s. |
| **Data** | The saved state (`ERROR-4`) | Nothing was saved; your entries are still on screen. | Rien n'a été enregistré ; vos saisies sont toujours à l'écran. |
| **Next** | The kind's next step, plus a button that can work | Try again. | Réessayez. |
| **Reference** | `reference` (`ERROR-7`) | Reference: 7F3C91AB — help@babel.management | Référence : 7F3C91AB — help@babel.management |

Why sentences: `COPY-2` says a catalogue string cannot branch, and French
nouns carry gender. So the client glues whole sentences together and never
inserts a noun into a shared sentence.

- Each action supplies a **failed title** (a full sentence) and a **label** (a
  noun phrase that agrees with nothing: "Saving the building" / « Enregistrement
  du bâtiment »).
- The unknown and partial titles use the label with a colon: "Saving the
  building: result unknown" / « Enregistrement du bâtiment : résultat inconnu ».
- Pages and sections supply a load title: "The bookings did not load" /
  « Les réservations n'ont pas été chargées ».

## 3 · Failure kinds

`contracts/failure-kinds.json` is the source; `npm run check:contracts` fails
when this table and the contract disagree. Each kind declares `retry`,
`savedOnWrite` (what a failed write kept), `showReference` and `toast`.

| Kind | Meaning | Retry | Saved (write) | Ref |
| --- | --- | --- | --- | --- |
| `offline` | The device has no network | when_online | no (never sent) | no |
| `unreachable` | Online, but our server refused the connection or could not be found; `where`: `app_server` (a web app's own server) or `api` | after (automatic) | unknown if it may have been sent, else no | yes (minted) |
| `intercepted` | TLS pinning failed (captive portal, inspecting proxy); native mobile only | manual | no | no |
| `timeout` | Sent, no answer within N s (client, proxy, gateway or host limit) | after | **unknown** | yes |
| `front_door` | A CDN, gateway or host answered with its own error page instead of the envelope | after | **unknown** | yes (gateway id or minted) |
| `unavailable` | Our 503: maintenance, or a dependency down; carries `Retry-After` | after | no | yes |
| `rate_limited` | 429, ours or the gateway's | after (countdown) | no | no |
| `busy` | A transient lock that was rolled back | now | no | no |
| `session_ended` | 401 after the refresh failed | manual (sign in) | no | no |
| `step_up` | The server wants the person to confirm who they are | dialog | no | no |
| `forbidden` | A permission or role gate (403 with `details.gate`) | never | no | no |
| `plan` | A plan-tier gate (402) | never | no | no |
| `not_yet` | A provisioning or setup gate (access starts later; a building not chosen) | never | no | no |
| `validation` | 400/422 with fields | never (fix the field) | no | no |
| `conflict` | 409: changed elsewhere, duplicate, in use | manual | no | no |
| `not_found` | 404 with a coded entity | never | no | no |
| `too_large` | 413 | never (shrink) | no | no |
| `outdated_client` | Unknown route (old build), ChunkLoadError, a server action gone after a deploy | reload | no | no |
| `server_bug` | 500 in our envelope | now | no (a 500 means rolled back) | **yes** |
| `client_bug` | A render crash, or a 2xx the client could not read | reload | no (nothing was sent from this page) | **yes (minted)** |
| `partial` | Some items done, some not | manual (the rest) | partial | yes |
| `cancelled` | Aborted by us: context switch, unmount, sign-out | none | unknown | silent |
| `queued` | Saved on the device; will sync | none | pending | silent (a confirmation) |

## 4 · Detecting each kind

### Web (fetch or axios; Babel admin through `/api/proxy`; Rendee loaders and server actions)

Apply the checks in this order.

1. `ERR_CANCELED`, an `AbortError` from our own controller, or a cancelled
   step-up → `cancelled`.
2. **No response.**
   - `navigator.onLine === false` → `offline`.
   - Otherwise probe our own server with a 3 s timeout (Babel admin:
     `GET /api/health`; Rendee admin: `GET /auth/ping`, which ErrorRecovery
     already uses). The probe fails → `unreachable` with `where: app_server`.
     The probe answers → `unreachable` with `where: api`, or `timeout` when
     our own `AbortSignal.timeout` fired.
   - A request that may have left the device is `savedOnWrite: unknown`.
   - Website: an API Gateway 429/5xx comes back without CORS headers and
     surfaces as `TypeError: Failed to fetch`. A TypeError while online is
     therefore `unreachable` (`api`) with an unknown outcome, never "offline".
3. **A response that is not our envelope.** Signs: the content type is not
   JSON, the body has no boolean `status`, or there is an `x-vercel-error`,
   `x-amzn-errortype` or `x-cache: Error from cloudfront` header.
   - 504/408, `FUNCTION_INVOCATION_TIMEOUT`, or the body `Endpoint request
     timed out` → `timeout`.
   - 429 → `rate_limited` (read `Retry-After` when present).
   - 413 → `too_large`.
   - 404, or 403 `Missing Authentication Token` → `outdated_client`.
   - Any other 5xx → `front_door`.
   - The body's text is **never** displayed.
4. **Our envelope.** Map `errorCode` first:
   - `error.session.*` → `session_ended`
   - `error.auth.step_up_required` → `step_up`
   - `error.auth.csrf_invalid` → a silent refetch, then `session_ended`
   - `error.auth.permission_denied`, `*.permission_denied`, `*_forbidden` → `forbidden`
   - `error.subscription.*` → `plan`
   - `*.access_not_yet`, a missing building selection → `not_yet`
   - `error.generic.validation`, or `fieldErrors` present → `validation`
   - `*_not_found` → `not_found`
   - `error.generic.database_busy` → `busy`
   - `error.generic.conflict`, `*.conflict` → `conflict`
   - `*rate_limited`, `*_cooldown` → `rate_limited`
   - `*_unavailable`, `error.proxy.upstream_unreachable` → `unavailable`
   - `error.proxy.upstream_timeout` → `timeout`
   - `error.generic.internal` → `server_bug`
   - `*.partially_saved` → `partial`

   With no code, fall back to the status: 400/422 → `validation` · 401 →
   `session_ended` · 402 → `plan` · 403 → `forbidden` · 404/410 → `not_found`
   · 409 → `conflict` · 413 → `too_large` · 429 → `rate_limited` · 503 →
   `unavailable` · 502 → `front_door` · 504 → `timeout` · any other 5xx →
   `server_bug`.

   A server `message` is shown only when it is localized for the caller and
   its code is not in `genericCodes`.
5. **A 2xx with `status: false`** → the same code table; with no code,
   `validation` using the server's localized message.
6. **Thrown in render.** `ChunkLoadError`, or a message matching
   `/Loading (CSS )?chunk/` → `outdated_client`. Anything else → `client_bug`,
   which mints a reference and sends it to `captureException` under that id.
7. **Next.js server actions (Rendee admin).** An action returns
   `{ ok: false, failure: { kind, reference, retryAfterSeconds?, gate?, fields? } }`,
   never a raw `message` built from the exception.
   - The action call rejecting (`Failed to fetch`, "An unexpected response was
     received from the server") → probe, then `unreachable` (`app_server`).
   - "Server Action … was not found" → `outdated_client`.
   - Loaders keep throwing `ApiError` with the `api-<kind>-<ref>` digest.
   - A production error with no `api-` digest is classified by the probe,
     never shown as unknown.

### Flutter (Dio)

- `cancel` → `cancelled`.
- The connectivity monitor reports offline, or a `SocketException` →
  `offline`.
- `connectionError` / `connectionTimeout` while online → `unreachable` (`api`).
- `badCertificate` → `intercepted`.
- `receiveTimeout` → `timeout`: unknown for a write, plain for a read.
- `sendTimeout` → `timeout`, saved = no (the upload did not leave the device).
- An HTML or non-envelope body (no `status` key) → step 3 above.
- An envelope → step 4.
- 502/503/413/422/405/408/410 get typed exceptions of their own, not one
  catch-all network exception; the 500 exception keeps `details` and
  `reference`.
- A TypeError or FormatException while parsing a 2xx → `client_bug`, with a
  reference logged to the crash reporter and analytics under the same id.
- `ErrorWidget.builder` and a boot failure → `client_bug`.
- Typed outcomes from an offline action queue: `busy` and 429 retry; a real
  `conflict` keeps a draft and says who changed what.

### APIs

- Envelope (`contracts/error-envelope.json`):
  `{ status: false, errorCode, message, details?, fieldErrors?, retryAfterSeconds?, reference? }`.
  Rendee keeps `requestId` and adds `reference`. Babel keeps
  `details.reference` beside the top-level one for shipped clients.
- Every 5xx carries `reference` (the logged request id, 8 characters), and
  the log line carries the same value.
- An uncoded 5xx (a TypeError, an SDK error) → `error.generic.internal` with
  a sanitized message. The raw text goes to the log only.
- Body-parser errors: `entity.parse.failed` → 400 `REQUEST_BODY_INVALID`;
  `entity.too.large` → 413 `PAYLOAD_TOO_LARGE` with `details.maxMb`.
- Database connectivity or pool timeout → 503 `DATABASE_UNAVAILABLE` with
  `Retry-After`; never a 401 and never a plain 500.
- A gate that cannot check (its database read fails) → 503
  `ACCESS_CHECK_UNAVAILABLE`.
- Unknown route → JSON 404 `ROUTE_NOT_FOUND`.
- Rate limits → `retryAfterSeconds` (and `details.scope`).
- Denials → `details.gate = { kind, required: ['<section>.<action>'], roles, grantor }`,
  `kind` from `gate.kinds`.
- Localization never lets a code in `genericCodes` overwrite the thrower's
  sentence.
- `Retry-After`, `RateLimit-*` and `x-request-id` are in the CORS exposed
  headers.
- A status code that released clients parse changes only behind a client
  opt-in header (`ERROR-6`).
- Babel's production REST gateway: Gateway Responses for `DEFAULT_5XX`,
  `INTEGRATION_TIMEOUT`, `THROTTLED` and `REQUEST_TOO_LARGE` return the
  envelope, with `errorCode: error.gateway.*` and `reference:
  $context.requestId`. The dev HTTP API cannot customise gateway responses,
  so clients still classify by the missing envelope (step 3).

## 5 · Wording, EN | FR

`{product}` is "Babel" for Babel, and "the booking service" / « le service de
réservation » for Rendee (`RENDEE-ERROR-1`: the Rendee admin also says "the
admin panel's server", and never names the brand). `{n}` is seconds; `{since}`
and `{time}` are HH:MM in the user's format (`COPY-6`). `npm run verify`
checks every sentence below against the banned phrases.

<!-- wording-table: every EN and FR cell below must pass check-error-copy.mjs -->
| Kind | EN | FR |
| --- | --- | --- |
| offline | Your device is offline. Nothing was sent. It will try again as soon as the connection is back. | Votre appareil n'est pas connecté à Internet. Rien n'a été envoyé. Nouvel essai dès le retour de la connexion. |
| unreachable · app_server | The admin panel's server is not answering (since {since}). Your connection is working; the problem is on our side. | Le serveur du panneau d'administration ne répond pas (depuis {since}). Votre connexion fonctionne ; le problème vient de chez nous. |
| unreachable · api | {product}'s server cannot be reached right now. Your connection is working. | Impossible de joindre le serveur de {product} pour le moment. Votre connexion fonctionne. |
| intercepted | This Wi-Fi is blocking secure connections (it may need you to sign in on a web page first). Nothing was sent. | Ce réseau Wi-Fi bloque les connexions sécurisées (il demande peut-être de vous connecter sur une page web). Rien n'a été envoyé. |
| timeout · read | {product}'s server did not answer within {n} s. Try again. | Le serveur de {product} n'a pas répondu en {n} s. Réessayez. |
| timeout · write | {product}'s server did not answer within {n} s. Your change may have been saved — refresh to check before trying again. | Le serveur de {product} n'a pas répondu en {n} s. Votre modification a peut-être été enregistrée : actualisez pour vérifier avant de réessayer. |
| front_door | {product}'s server failed before handling the request (a problem on our side). | Le serveur de {product} a échoué avant de traiter la demande (problème de notre côté). |
| unavailable · maintenance | {product} is under maintenance until {time}. Nothing was changed. | {product} est en maintenance jusqu'à {time}. Rien n'a été modifié. |
| unavailable · dependency | {service} is not answering, so {label} could not be done. Nothing was saved. Try again in {n} min. | {service} ne répond pas ; {label} n'a donc pas pu être fait. Rien n'a été enregistré. Réessayez dans {n} min. |
| rate_limited | Too many attempts from {scope}. You can try again in {n} s (at {time}). Nothing you entered was lost. | Trop de tentatives depuis {scope}. Vous pourrez réessayer dans {n} s (à {time}). Rien de ce que vous avez saisi n'est perdu. |
| busy | Someone else's change to the same record was being saved at the same moment, so yours was not saved. Try again now. | Une autre modification du même dossier était en cours ; la vôtre n'a donc pas été enregistrée. Réessayez maintenant. |
| session_ended | Your session ended after {n} min without activity. Sign in again — you will come back to this page. | Votre session a pris fin après {n} min d'inactivité. Reconnectez-vous : vous reviendrez sur cette page. |
| step_up | Confirm it's you to continue. Nothing was changed yet. | Confirmez votre identité pour continuer. Rien n'a encore été modifié. |
| forbidden | Only members with the “{permission}” permission can {verb}. {grantor} can grant it. | Seuls les membres ayant la permission « {permission} » peuvent {verb}. {grantor} peut vous l'accorder. |
| plan | {feature} is not included in the {plan} plan. Nothing was changed. | {feature} n'est pas inclus dans le forfait {plan}. Rien n'a été modifié. |
| not_yet | Your access to {building} starts on {date}. | Votre accès à {building} commence le {date}. |
| not_yet · no selection | Choose a building first — this page did not say which building it is for. Nothing was changed. | Choisissez d'abord un immeuble : cette page n'a pas indiqué de quel immeuble il s'agit. Rien n'a été modifié. |
| validation | {count} fields need correcting: {field} ({fix}). Nothing was saved; your entries are still here. | {count} champs à corriger : {field} ({fix}). Rien n'a été enregistré ; vos saisies sont toujours là. |
| conflict | {who} changed this {thing} at {time}, after you opened it. Reload to see their version; your changes were not saved. | {who} a modifié cet élément à {time}, après que vous l'avez ouvert. Rechargez pour voir sa version ; vos modifications n'ont pas été enregistrées. |
| not_found | This {thing} no longer exists — it may have been deleted or moved. Go back to {list}. | Cet élément n'existe plus : il a peut-être été supprimé ou déplacé. Revenez à {list}. |
| too_large | The file is {size}; the limit is {max}. It was not uploaded. | Le fichier fait {size} ; la limite est de {max}. Il n'a pas été téléversé. |
| outdated_client · web | {product} was updated since this page was opened. Reload the page — nothing is lost. | {product} a été mis à jour depuis l'ouverture de cette page. Rechargez la page : rien n'est perdu. |
| outdated_client · app | This feature needs a newer version of the app. Update it, then try again. Nothing was changed. | Cette fonction demande une version plus récente de l'application. Mettez-la à jour, puis réessayez. Rien n'a été modifié. |
| server_bug | A bug on our side stopped it, and nothing was saved. Try again; if it happens again, give support this reference: {ref}. | Un bogue de notre côté l'a interrompu et rien n'a été enregistré. Réessayez ; si cela se reproduit, donnez cette référence au soutien : {ref}. |
| client_bug | A bug in {product} stopped this page from displaying. Nothing you entered here was sent. Reload; if it happens again, give support the reference {ref}. | Un bogue dans {product} empêche l'affichage de cette page. Rien de ce que vous avez saisi ici n'a été envoyé. Rechargez ; si cela se reproduit, donnez la référence {ref} au soutien. |
| partial | {done} of {total} were {verb}; {failed} were not ({reasons}). Retry the remaining {failed}. | {done} sur {total} ont été {verb} ; {failed} ne l'ont pas été ({reasons}). Relancez les {failed} restants. |
| money · unknown | We can't confirm yet whether your payment of {amount} went through. Do not pay again; check Payments in a few minutes. | Nous ne pouvons pas encore confirmer si votre paiement de {amount} est passé. Ne payez pas une deuxième fois ; vérifiez Paiements dans quelques minutes. |

`cancelled` and `queued` show no error. A queued change confirms: "Saved on
this device; it will be sent when you're back online." / « Enregistré sur cet
appareil ; ce sera envoyé au retour de la connexion. »

Data sentences, chosen by the saved state:

- Not saved: "Nothing was saved; your entries are still on screen." /
  « Rien n'a été enregistré ; vos saisies sont toujours à l'écran. »
- Unknown: see `timeout · write`.
- Read: "Nothing you saved is affected." / « Rien de ce que vous avez
  enregistré n'est touché. »
- Pending: the queued sentence above.

**The last resort (`ERROR-8`)**, which replaces every shared "Something went
wrong" fallback (Babel's `common_error_unexpected_message`,
`common_error_generic_message`, `oops_something_went_wrong`,
`an_error_occurred_please_try_again`; Rendee's `FRIENDLY.unknown`; the Node
library's default):

- EN: "{failed title}. A problem on our side stopped it, and we have no more
  detail to show. {data sentence} Try again; if it happens again, contact
  {support} with the reference {ref}."
- FR : « {titre d'échec}. Un problème de notre côté l'a interrompu et nous
  n'avons pas plus de détails à afficher. {phrase sur les données} Réessayez ;
  si cela se reproduit, écrivez à {support} en donnant la référence {ref}. »

## 6 · The screenshot case, rewritten

Rendee admin; the panel's server is down; the probe failed; it is retrying on
its own. Rendee's admin is English only for now (`RENDEE-ERROR-2`); the French
lines are for the day it is not.

**Before**

- Title: "Something went wrong."
- Body: "Something went wrong. Try again in a moment."
- Status: "Still not responding."
- Buttons: Try again, Go back, Dashboard, Sign in again. No reference.

**After**

- Title: **This page did not load**
- Body: "The admin panel's server stopped answering at 14:02, so this page could not be fetched. Your connection is working; the problem is on our side. Nothing you saved before is affected."
- Status line: "Not answering since 14:02 · 3 attempts · next try in 12 s"
- Buttons: **Try now** only. No Dashboard link and no Sign in again: both are served by the same server that is not answering.
- Footer: "Reference: E-7F3C91 · help@rendee.ca" (the address comes from one constant, `RENDEE-ERROR-2`).
- After 5 minutes: "Still not answering after 5 minutes (since 14:02). Automatic retries have stopped. Try again from this page when you are ready, or contact help@rendee.ca with the reference E-7F3C91."

FR (when the admin gets French):

- Titre : **Cette page n'a pas été chargée**
- Corps : « Le serveur du panneau d'administration ne répond plus depuis 14 h 02 ; cette page n'a donc pas pu être récupérée. Votre connexion fonctionne ; le problème vient de chez nous. Rien de ce que vous avez enregistré auparavant n'est touché. »
- Statut : « Ne répond pas depuis 14 h 02 · 3 tentatives · prochain essai dans 12 s »
- Bouton : **Réessayer maintenant**
- Pied : « Référence : E-7F3C91 »

The same screen when the panel answers but the booking service does not:
"The booking service did not answer within 10 s, so the bookings did not load. Nothing you saved is affected. Next try in 12 s."

## 7 · Retry and offline (`ERROR-9`)

- Automatic retry is only for kinds whose `retry` is `after`, and only for
  reads, or for writes that carry an idempotency key. Backoff: 5, 10, 30, 60 s,
  then every 60 s, stopping at the brand's limit (5 min for Babel and Rendee).
- Status line: "{What} not answering since {since} · {n} attempts · next try
  in {s} s." / « {Quoi} ne répond pas depuis {since} · {n} tentatives ·
  prochain essai dans {s} s ».
- Screen readers hear changes of phase only, never the countdown (Rendee's
  `announcement` pattern).
- After the stop: "Still not answering after 5 minutes (since {since}).
  Automatic retries have stopped. Try again from this page when you are
  ready, or contact {support} with the reference {ref}." / « Toujours aucune
  réponse après 5 minutes (depuis {since}). Les essais automatiques sont
  arrêtés. Réessayez depuis cette page quand vous voulez, ou écrivez à
  {support} avec la référence {ref}. »
- Offline: the banner speaks once; per-action toasts are suppressed while
  offline; queued work is listed as pending, not failed.
- Rate limit: the button reads "Try again in {n} s" and counts down from
  `Retry-After` / `retryAfterSeconds` / `RateLimit-Reset`. A toast throttle
  never swallows the countdown.
- A write is never retried automatically after an unknown outcome: the
  person is first sent to check.

## 8 · The guard: `scripts/check-error-copy.mjs` (`ERROR-10`)

One scanner for every app, dependency-free, vendored the way
`check-tokens.mjs` is. It reports three kinds of finding:

- **generic**: a catalogue value, or a source literal that reads as prose,
  matching a banned phrase (`contracts/rules/generic-error-phrases.json`). A
  catalogue is checked against its own locale (from the file or folder name);
  a source literal against every locale. Adjacent literals are joined first
  (`'Something went ' + 'wrong'`, Dart's `'Oops! ' 'Something went wrong'`).
  JSX text is read too. Comments, test files, wire values (`'failed'`) and
  arguments of `console.*` / `logger.*` / `print` calls are not.
- **title-repeats**: a title whose body is equal to it or opens with it
  (`ERROR-1`): sibling catalogue keys (`x_title` beside `x_message`,
  `x_description_message`, `x.body`, …) or `title` beside
  `body`/`message`/`description` in one object literal or JSX tag.
- **counter:<name>**: an app's own patterns, counted per file (raw
  `err.message` rendered, a fallback to a shared generic key).

How a phrase matches (`$meta.matching` in the JSON): the message is
normalized (lower case, straight apostrophes, single spaces, leading emoji
and punctuation removed); **whole** = the message is the phrase; **opening**
= it starts with the phrase at a word boundary; **anywhere** = it contains the
phrase at word boundaries. Han, Kana and Hangul need no boundary.

The baseline is exact and per key (owner decision, 2026-10-20):

- a finding the baseline does not hold fails at once, however small the
  totals: a new generic string never passes;
- a count above its baseline fails;
- a count below its baseline fails too, until `--update-baseline` lowers it,
  so the recorded debt is the real debt (`DONE-6`). `--update-baseline` only
  lowers and removes; it never adds or raises an entry.
- An exception (a one-word status badge, a sentence an alert really backs)
  goes in the config's `allow`, with its reason. An `allow` entry that
  matches nothing any more fails.

```bash
node scripts/check-error-copy.mjs --config error-copy.config.json                    # the check
node scripts/check-error-copy.mjs --config error-copy.config.json --init-baseline    # once, on adoption
node scripts/check-error-copy.mjs --config error-copy.config.json --update-baseline  # after fixing debt
```

```jsonc
// error-copy.config.json (paths relative to this file)
{
  "phrases": "node_modules/@premiumsarl/babel-design-tokens/contracts/rules/generic-error-phrases.json",
  "catalogues": ["src/i18n"],
  "sources": ["src"],
  "extensions": [".ts", ".tsx"],
  "counters": { "rendered-err-message": "\\b(?:err|e|error)\\.message\\b" },
  "allow": { "src/i18n/en.json#payments_status_failed_label generic": "status badge (ERROR-2)" },
  "baseline": ".error-copy-baseline.json"
}
```

A repo without the npm dependency vendors the phrase list next to the script
and points `phrases` at its copy (Rendee, owner decision 2026-10-20). A Dart
app reads `BabelGenericErrorPhrases` from `babel_contracts.dart` and applies
the same matching in its own test.

### Per platform

| Platform | Builds the rules with | Guard |
| --- | --- | --- |
| babel-design-tokens | This file; the three contracts; `FailureKind` / `BabelFailureKind` | `npm run verify`: the principles parse; `check-contracts.mjs` (every kind declares retry/savedOnWrite/showReference/toast, this file's kind table equals the contract, genericCodes ⊂ error codes, every locale's phrases normalized and caught); the scanner's self-test (`scripts/__tests__/error-copy.test.mjs`) |
| babel-admin-panel | `src/lib/errors/classify.ts`, `describe.ts`, `<FailureNotice>`; the proxy answers coded `error.proxy.*` | `npm run check:errors` (vendored scanner over `src/i18n/*.json` and `src/`), the classifier's fixture matrix, `principles-map.test.ts` rows |
| babel-mobile, base_mobile_library | `Failure.from`, `describeFailure`, `ErrorStateView(failure:)`; the library's exceptions carry a kind and no English default | `test/design/error_copy_ratchet_test.dart` over `assets/i18n/*.json` with `BabelGenericErrorPhrases`; a Dio fixture matrix; `principles_map_test` rows |
| babel-lambda-api, premium-nodejs-library | The error middleware (uncoded 5xx, body parser, database connectivity, JSON 404), top-level `reference`, generic codes never overwrite a sentence | A catalogue guard test (every code in 4 locales, no banned phrase beyond a per-code baseline); middleware tests asserting envelope + reference + no raw text |
| babel-website | One fetch wrapper that classifies; never shows an uncoded server sentence | The vendored scanner in `npm test` over `public/locales/*.json` (5 locales) and `src/` |
| babel-chatbot | Classified upstream failures, the API's reference passed through | The scanner (or a vitest twin) over `src/locales/*.json` (11 locales) |
| groome-nodeJS (Rendee) | `apps/admin` error copy in one English module; ErrorRecovery shows what, since when, attempts, reference and only working actions; server actions return a `failure`; `apps/api` adds `errorCode` + `reference` | `tools/check-error-copy.mjs` (vendored, with a vendored phrase list) over `apps/admin/src`, `apps/site/src`, `packages/site-ui/src`, `apps/api/src` |
| GrooMe-mobile (Rendee app) | The library's kinds; the 9 generic keys rewritten in 4 locales | `test/error_copy_ratchet_test.dart` over `assets/i18n/*.json` |

## 9 · Do / don't

| Do | Don't |
| --- | --- |
| "The invoice was not saved: Babel's server did not answer within 30 s. It may have been saved — refresh to check." | "Something went wrong. Please try again." |
| A title that says what failed, a body that says why | A title the body repeats word for word |
| "Only members with the Accounting permission can approve bills. Your President can grant it." | "You don't have permission to perform this action." |
| "You can request a new code at 14:32 (in 4 min)." | "Maximum OTP attempts reached. Please try again later." |
| "Babel's server cannot be reached; your connection is working." (device online) | "Please check your internet connection." (device online) |
| Show the reference on a 5xx and on crashes | Show raw `exception.toString()` behind "Show details" |
| "Saving the building: result unknown" on a 504 for a write | "The building was not saved" on a 504 for a write |
| Drop "Our team has been notified" unless an alert fires | Promise a notification that is only an analytics event |
| Offer only Try now while the server is down | Offer Dashboard and Sign in again, both served by the dead server |
