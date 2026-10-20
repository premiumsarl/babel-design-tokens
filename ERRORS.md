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
| **Why** | The kind's sentence, with the facts filled in | Babel is under maintenance until 14:30. | Babel est en maintenance jusqu'à 14 h 30. |
| **Data** | The saved state (`ERROR-4`) | Nothing was saved; your entries are still on screen. | Rien n'a été enregistré ; vos saisies sont toujours à l'écran. |
| **Next** | The kind's next step, plus a button that can work | Try again after 14:30. | Réessayez après 14 h 30. |
| **Reference** | `reference` (`ERROR-7`) | Reference: 7F3C91AB — help@babel.management | Référence : 7F3C91AB — help@babel.management |

The example is a 503 (`unavailable`): the server did nothing, so "was not
saved" is certain. The same save on a timeout, a lost connection, a gateway
page or a plain 500 is an unknown outcome, and every slot changes: the title
is the label with "result unknown" ("Saving the building: result unknown"),
the data sentence is "Your change may have been saved — refresh to check
before trying again.", and the next step is to check, not to try again.

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

`contracts/failure-kinds.json` is the source. `npm run check:contracts` fails
when this table and the contract disagree: on the kind names, and on the
first word of the Retry, Saved and Ref cells (`retry`, `savedOnWrite`,
`showReference`). Each kind also declares `toast`.

| Kind | Meaning | Retry | Saved (write) | Ref |
| --- | --- | --- | --- | --- |
| `offline` | The request never left the device: offline before sending, or the connection could not be opened | when_online | no (never sent) | no |
| `unreachable` | The device reports a connection, but our server could not be reached or the connection dropped before it answered; `where`: `app_server` (a web app's own server) or `api` | after (automatic) | unknown (no only for a connect-phase failure) | yes (minted, once stored) |
| `intercepted` | TLS pinning failed (captive portal, inspecting proxy); native mobile only | manual | no | no |
| `timeout` | Sent, no answer within N s (client, proxy, gateway or host limit); `where` | after | **unknown** | yes |
| `front_door` | A CDN, gateway or host answered with its own error page instead of the envelope, or a server action failed while the app's server still answers; `where` | after | **unknown** | yes (gateway id, or minted once stored) |
| `unavailable` | Our 503: maintenance, or a dependency down; carries `Retry-After` | after | no | yes |
| `rate_limited` | 429, ours or the gateway's | after (countdown) | no | no |
| `busy` | A database lock the server could not get past (any other change, not only one to this record) | now | unknown (no when `details.committed: false`) | no |
| `session_ended` | 401 after the refresh failed; the code says why | manual (sign in) | no | no |
| `step_up` | The server wants the person to confirm who they are | dialog | no | no |
| `forbidden` | A permission or role gate (403 with `details.gate`) | never | no | no |
| `plan` | A plan-tier gate (402) | never | no | no |
| `not_yet` | A provisioning or setup gate (access starts later; a building not chosen) | never | no | no |
| `validation` | 400/422 with fields | never (fix the field) | no | no |
| `conflict` | 409: changed elsewhere, duplicate, in use | manual | no | no |
| `not_found` | 404 with a coded entity | never | no | no |
| `too_large` | 413 | never (shrink) | no | no |
| `outdated_client` | Unknown route (old build), ChunkLoadError, a server action gone after a deploy | reload | no (but reloading loses what is typed) | no |
| `server_bug` | 500 in our envelope; the server cannot always know whether it committed | now (a write: after checking) | **unknown** (no when `details.committed: false`) | **yes** |
| `client_bug` | A render or boot crash; not a write's outcome | reload | no (unsent changes on the page were not sent; saved work is kept) | **yes (minted)** |
| `unreadable_success` | A 2xx the client could not read or show | reload | **saved** | **yes (minted)** |
| `partial` | Some items done, some not | manual (the rest) | partial | yes |
| `cancelled` | Aborted by us: context switch, unmount, sign-out; shows nothing | none | unknown | no |
| `queued` | Saved on the device; will sync; a confirmation | none | pending | no |

## 4 · Detecting each kind

### Web (fetch or axios; Babel admin through `/api/proxy`; Rendee loaders and server actions)

Apply the checks in this order.

1. `ERR_CANCELED`, an `AbortError` from our own controller, or a cancelled
   step-up → `cancelled`.
2. **No response.** What decides is whether the request may have left the
   device, never `navigator.onLine` at the time of the error.
   - The client checked `navigator.onLine === false` *before* sending and did
     not send (or queued it) → `offline`, saved = no. This is the only path
     to `offline` on the web: `fetch` does not say whether a rejection came
     before or after the body went out.
   - Any rejection once sending began → probe our own server with a 3 s
     timeout (Babel admin: `GET /api/health`; Rendee admin: `GET
     /auth/ping`, which ErrorRecovery already uses). The probe fails →
     `unreachable` with `where: app_server`. The probe answers →
     `unreachable` with `where: api`, or `timeout` when our own
     `AbortSignal.timeout` fired. Saved = **unknown** for a write, even if
     the device is offline by now: the radio may have dropped after the API
     received the body.
   - `navigator.onLine` (and a mobile connectivity monitor) only says a
     network interface is up: it is also true on a LAN without internet,
     behind a captive portal, a firewall or a VPN, and with DNS down. The
     copy says "your connection is working" only after a probe to a host
     outside our infrastructure answered; otherwise it says "if other sites
     work on this device, the problem is on our side".
   - Website: an API Gateway 429/5xx comes back without CORS headers and
     surfaces as `TypeError: Failed to fetch`, so a TypeError while online
     may mean the server *was* reached and refused. It is `unreachable`
     (`api`) with an unknown outcome, worded "did not get a usable answer",
     and it backs off (section 7) instead of offering an immediate retry,
     which would make a 429 worse. Never "offline".
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
4. **Our envelope.** The rules are `classify` in
   `contracts/failure-kinds.json`; `npm run check:contracts` checks this list
   against it and runs every code in `error-codes.json` through it. Map
   `errorCode` first, in this order (the first match wins; `*` is any run of
   letters, digits, `_` and `.`):
   - `error.session.*` → `session_ended`
   - `error.auth.step_up_required` → `step_up`
   - `error.auth.csrf_invalid` → a silent refetch, then `session_ended`
   - `error.auth.permission_denied`, `*.permission_denied`, `*_forbidden` → `forbidden`
   - `error.subscription.*` → `plan`
   - `*.access_not_yet`, a missing building selection → `not_yet`
   - `error.generic.validation`, or `fieldErrors` present → `validation`
   - `*.route_not_found` → `outdated_client`
   - `*.not_found`, `*_not_found` → `not_found`
   - `error.generic.database_busy` → `busy`
   - `error.generic.conflict`, `*.conflict` → `conflict`
   - `*rate_limited`, `*_cooldown` → `rate_limited`
   - `error.generic.service_unavailable`, `*.ai_unavailable` → `unavailable`
   - `error.proxy.upstream_unreachable` → `unreachable` (`api`; unknown for any method but GET)
   - `error.proxy.upstream_timeout` → `timeout`
   - `error.generic.internal` → `server_bug`
   - `*.partially_saved` → `partial`

   No kind is ever inferred from a suffix such as `_unavailable`:
   `error.auth.passkey_unavailable` is a 409 and
   `error.schedule.bank_autopay_unavailable` a 400, refusals that no retry can
   fix. A code that matches no rule, and an envelope with no code, fall back
   to the status: 400/422 → `validation` · 401 → `session_ended` · 402 →
   `plan` · 403 → `forbidden` · 404/410 → `not_found` · 409 → `conflict` ·
   413 → `too_large` · 429 → `rate_limited` · 502 → `front_door` · 503 →
   `unavailable` · 504 → `timeout` · any other 4xx → `validation` · any other
   5xx → `server_bug`. An unmatched 4xx shows the server's localized
   sentence, never the fields wording. The API's 503 codes
   (`DATABASE_UNAVAILABLE`, `ACCESS_CHECK_UNAVAILABLE`) reach `unavailable`
   by status until they are in `error-codes.json`.

   A server `message` is shown only when it is localized for the caller and
   its code is not in `genericCodes`. A write's saved state follows the
   kind, except that `details.committed: false` makes it **no** for
   `server_bug` and `busy`.
5. **A 2xx with `status: false`** → the same code table; with no code,
   `validation` using the server's localized message.
6. **A 2xx the client cannot read** (a TypeError or a schema error while
   decoding a successful answer) → `unreadable_success`: the server did the
   work, so a write is **saved**; the copy sends the person to refresh, never
   to do it again. It mints a reference and sends it to `captureException`
   under that id.
7. **Thrown in render.** `ChunkLoadError`, or a message matching
   `/Loading (CSS )?chunk/` → `outdated_client`. Anything else → `client_bug`,
   which mints a reference and sends it to `captureException` under that id.
8. **Next.js server actions (Rendee admin).** An action returns
   `{ ok: false, failure: { kind, reference, retryAfterSeconds?, gate?, fields? } }`,
   never a raw `message` built from the exception.
   - The action call rejecting (`Failed to fetch`, "An unexpected response was
     received from the server") → probe the panel's server. The probe fails
     → `unreachable` (`app_server`). The probe answers → `front_door` with
     `where: app_server`: the panel is up, but its function crashed or hit
     the host's time limit (a Vercel `FUNCTION_INVOCATION_TIMEOUT` 504 or a
     500 page is not RSC). Never `unreachable` then. Either way a write's
     outcome is **unknown**: the function may have written first.
   - "Server Action … was not found" → `outdated_client`.
   - Loaders keep throwing `ApiError` with the `api-<kind>-<ref>` digest.
   - A production error with no `api-` digest is classified by the probe,
     never shown as unknown.

### Flutter (Dio)

The phase of the failure decides, not the exception's type.

- `cancel` → `cancelled`.
- The connectivity monitor reported offline before sending, and the request
  was not sent (or was queued) → `offline`.
- The connection could not be opened (`connectionTimeout`; a
  `connectionError` or `SocketException` before the request was written:
  `Failed host lookup`, `Connection refused`, `Network is unreachable`) →
  `offline` when the monitor reports offline, else `unreachable` (`api`);
  saved = no in both cases, because nothing was written.
- A `SocketException` once the request was written (`Connection reset by
  peer`, `Software caused connection abort`, `Connection closed before full
  header was received`), or a transport failure whose phase is unknown →
  `unreachable` (`api`), saved = **unknown**, whatever the monitor says now.
  Never "Your device is offline" while the monitor reports a connection.
- `badCertificate` → `intercepted`.
- `receiveTimeout` → `timeout`: unknown for a write, plain for a read.
- `sendTimeout` → `timeout`, saved = **unknown**: part of the body left, and
  the server may act on a body it received in full before the timer fired.
- An HTML or non-envelope body (no `status` key) → step 3 above.
- An envelope → step 4.
- 502/503/413/422/405/408/410 get typed exceptions of their own, not one
  catch-all network exception; the 500 exception keeps `details` and
  `reference`.
- A TypeError or FormatException while parsing a 2xx → `unreadable_success`
  (saved, for a write), with a reference logged to the crash reporter and
  analytics under the same id. Never "nothing was sent".
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
- Database connectivity or pool timeout *before* any statement ran (connect,
  pool acquire) → 503 `DATABASE_UNAVAILABLE` with `Retry-After`; never a 401
  and never a plain 500. A connection lost mid-transaction or after `COMMIT`
  is a 500 without `committed`: the server cannot know what was kept.
- `details.committed: false` on a 5xx (or `DATABASE_BUSY`) for a write only
  when the whole path ran in one transaction that rolled back. Without it the
  client says the outcome is unknown. A handler that saved a step before
  failing (a placeholder saved, then a 500) answers `partial`, or leaves
  `committed` out; it never claims a rollback it did not do. A batch or cron
  that answers 5xx with `data.summary.failed` is a `partial`.
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

Placeholders name each layer the way the person sees it (`RENDEE-ERROR-1`):

- `{app}` is what the person is using, for the kinds that happen in it
  (`client_bug`, `unreadable_success`, `outdated_client`): "Babel" / « Babel »
  in Babel's apps; "the admin panel" / « le panneau d'administration » in
  Rendee's admin. A render crash or a deploy of the panel is the panel's,
  never the booking service's.
- `{service}` is the server behind it, for the kinds that happen there:
  "Babel's server" / « le serveur de Babel » in Babel; "the booking service"
  / « le service de réservation » in Rendee. Rendee's copy never names the
  brand. The Rendee admin's own server is "the admin panel's server".
- `{dependency}` is a third party ("the payment provider").
- `{n}` is seconds; `{since}` and `{time}` are HH:MM in the user's format
  (`COPY-6`). A placeholder at the start of a sentence takes a capital.

`npm run verify` checks every EN and FR cell below against the banned
phrases. A row marked *write* or *read* replaces the general one for that
case.

<!-- wording-table: every EN and FR cell below must pass check-error-copy.mjs -->
| Kind | EN | FR |
| --- | --- | --- |
| offline | Your device is offline, so this was not sent. It will try again as soon as the connection is back. | Votre appareil n'est pas connecté à Internet ; rien n'a donc été envoyé. Nouvel essai dès le retour de la connexion. |
| unreachable · app_server | The admin panel's server is not answering (since {since}). If other sites work on this device, the problem is on our side. | Le serveur du panneau d'administration ne répond pas (depuis {since}). Si d'autres sites fonctionnent sur cet appareil, le problème vient de chez nous. |
| unreachable · api | {service} cannot be reached right now. If other sites work on this device, the problem is on our side. | {service} est injoignable pour le moment. Si d'autres sites fonctionnent sur cet appareil, le problème vient de chez nous. |
| unreachable · connection confirmed | {service} is not answering (since {since}). Your connection is working, so the problem is on our side. | {service} ne répond pas (depuis {since}). Votre connexion fonctionne : le problème vient donc de chez nous. |
| unreachable · write | The connection to {service} was lost before it answered. Your change may have been saved — refresh to check before trying again. | La connexion avec {service} a été perdue avant sa réponse. Votre modification a peut-être été enregistrée : actualisez pour vérifier avant de réessayer. |
| unreachable · no usable answer | {app} did not get a usable answer from {service}. It will try again in {n} s. | {app} n'a pas obtenu de réponse exploitable de {service}. Nouvel essai dans {n} s. |
| intercepted | This Wi-Fi is blocking secure connections (it may need you to sign in on a web page first). Nothing was sent. | Ce réseau Wi-Fi bloque les connexions sécurisées (il demande peut-être de vous connecter sur une page web). Rien n'a été envoyé. |
| timeout · read | {service} did not answer within {n} s. Try again. | {service} n'a pas répondu en {n} s. Réessayez. |
| timeout · write | {service} did not answer within {n} s. Your change may have been saved — refresh to check before trying again. | {service} n'a pas répondu en {n} s. Votre modification a peut-être été enregistrée : actualisez pour vérifier avant de réessayer. |
| front_door | {service} answered with an error page instead of a result (a problem on our side). | {service} a répondu par une page d'erreur au lieu d'un résultat (problème de notre côté). |
| front_door · app_server · write | The admin panel's server broke off while handling this (a problem on our side). Your change may have been saved — refresh to check before trying again. | Le serveur du panneau d'administration s'est interrompu pendant le traitement (problème de notre côté). Votre modification a peut-être été enregistrée : actualisez pour vérifier avant de réessayer. |
| unavailable · maintenance | {service} is under maintenance until {time}. Nothing was changed. | {service} est en maintenance jusqu'à {time}. Rien n'a été modifié. |
| unavailable · dependency | {dependency} is not answering, so {label} could not be done. Nothing was saved. Try again in {n} min. | {dependency} ne répond pas ; {label} n'a donc pas pu être fait. Rien n'a été enregistré. Réessayez dans {n} min. |
| rate_limited | Too many attempts from {scope}. You can try again in {n} s (at {time}). Nothing you entered was lost. | Trop de tentatives depuis {scope}. Vous pourrez réessayer dans {n} s (à {time}). Rien de ce que vous avez saisi n'est perdu. |
| busy · rolled back | The database was busy with another change at the same moment, so this was not completed. Try again now. | La base de données traitait une autre modification au même moment ; cette action n'a donc pas été effectuée. Réessayez maintenant. |
| busy · write | The database was busy with another change at the same moment. Your change may have been saved in part — refresh to check before trying again. | La base de données traitait une autre modification au même moment. Votre modification a peut-être été enregistrée en partie : actualisez pour vérifier avant de réessayer. |
| session_ended · idle | You were signed out after {n} min without activity. Sign in again. | Vous avez été déconnecté après {n} min d'inactivité. Reconnectez-vous. |
| session_ended · expired | Your session reached its time limit. Sign in again. | Votre session a atteint sa durée maximale. Reconnectez-vous. |
| session_ended · closed | This session was closed (a sign-out on another device, or by an administrator). Sign in again. | Cette session a été fermée (déconnexion sur un autre appareil, ou par un administrateur). Reconnectez-vous. |
| session_ended · not verified | Your sign-in could not be verified. Sign in again. | Votre connexion n'a pas pu être vérifiée. Reconnectez-vous. |
| session_ended | Your session is no longer valid. Sign in again. | Votre session n'est plus valide. Reconnectez-vous. |
| step_up | Confirm it's you to continue. Nothing was changed yet. | Confirmez votre identité pour continuer. Rien n'a encore été modifié. |
| forbidden | Only members with the “{permission}” permission can {verb}. {grantor} can grant it. | Seuls les membres ayant la permission « {permission} » peuvent {verb}. {grantor} peut vous l'accorder. |
| plan | {feature} is not included in the {plan} plan. Nothing was changed. | {feature} n'est pas inclus dans le forfait {plan}. Rien n'a été modifié. |
| not_yet | Your access to {building} starts on {date}. | Votre accès à {building} commence le {date}. |
| not_yet · no selection | Choose a building first — this page did not say which building it is for. Nothing was changed. | Choisissez d'abord un immeuble : cette page n'a pas indiqué de quel immeuble il s'agit. Rien n'a été modifié. |
| validation | {count} fields need correcting: {field} ({fix}). Nothing was saved; your entries are still here. | {count} champs à corriger : {field} ({fix}). Rien n'a été enregistré ; vos saisies sont toujours là. |
| conflict | {who} changed this {thing} at {time}, after you opened it. Reload to see their version; your changes were not saved. | {who} a modifié cet élément à {time}, après que vous l'avez ouvert. Rechargez pour voir sa version ; vos modifications n'ont pas été enregistrées. |
| not_found | This {thing} no longer exists — it may have been deleted or moved. Go back to {list}. | Cet élément n'existe plus : il a peut-être été supprimé ou déplacé. Revenez à {list}. |
| too_large | The file is {size}; the limit is {max}. It was not uploaded. | Le fichier fait {size} ; la limite est de {max}. Il n'a pas été téléversé. |
| outdated_client · web · read | {app} was updated since this page was opened. Reload the page; nothing you saved is affected. | {app} a été mis à jour depuis l'ouverture de cette page. Rechargez la page ; rien de ce que vous avez enregistré n'est touché. |
| outdated_client · web · write | {app} was updated since this page was opened, and your change was not saved. Copy anything you typed, then reload the page. | {app} a été mis à jour depuis l'ouverture de cette page, et votre modification n'a pas été enregistrée. Copiez ce que vous avez saisi, puis rechargez la page. |
| outdated_client · app | This feature needs a newer version of the app. Update it, then try again. Nothing was changed. | Cette fonction demande une version plus récente de l'application. Mettez-la à jour, puis réessayez. Rien n'a été modifié. |
| server_bug | A problem on our side stopped it. It may not have been saved — check before trying again. If it happens again, give support this reference: {ref}. | Un problème de notre côté l'a interrompu. Il n'a peut-être pas été enregistré : vérifiez avant de réessayer. Si cela se reproduit, donnez cette référence au soutien : {ref}. |
| server_bug · rolled back | A problem on our side stopped it, and nothing was saved. Try again; if it happens again, give support this reference: {ref}. | Un problème de notre côté l'a interrompu et rien n'a été enregistré. Réessayez ; si cela se reproduit, donnez cette référence au soutien : {ref}. |
| client_bug | A bug in {app} stopped this page from displaying. What you had already saved is kept; changes not yet saved on this page were not sent. Reload; if it happens again, give support the reference {ref}. | Un bogue dans {app} empêche l'affichage de cette page. Ce que vous aviez déjà enregistré est conservé ; les modifications non enregistrées de cette page n'ont pas été envoyées. Rechargez ; si cela se reproduit, donnez la référence {ref} au soutien. |
| unreadable_success · write | It was saved, but a bug in {app} stopped this screen from showing the result. Refresh to see it; do not do it again. If this repeats, give support the reference {ref}. | C'est enregistré, mais un bogue dans {app} empêche cet écran d'afficher le résultat. Actualisez pour le voir ; ne recommencez pas. Si cela se reproduit, donnez la référence {ref} au soutien. |
| unreadable_success · read | {service} answered, but a bug in {app} stopped this screen from showing it. Nothing you saved is affected. Reload; if it happens again, give support the reference {ref}. | {service} a répondu, mais un bogue dans {app} empêche cet écran de l'afficher. Rien de ce que vous avez enregistré n'est touché. Rechargez ; si cela se reproduit, donnez la référence {ref} au soutien. |
| partial | {done} of {total} were {verb}; {failed} were not ({reasons}). Retry the remaining {failed}. | {done} sur {total} ont été {verb} ; {failed} ne l'ont pas été ({reasons}). Relancez les {failed} restants. |
| money · unknown | We can't confirm yet whether your payment of {amount} went through. Do not pay again; check Payments in a few minutes. | Nous ne pouvons pas encore confirmer si votre paiement de {amount} est passé. Ne payez pas une deuxième fois ; vérifiez Paiements dans quelques minutes. |

Which row:

- `unreachable · connection confirmed` only after a probe to a host outside
  our infrastructure answered; otherwise the plain `unreachable` rows.
- `unreachable · no usable answer` for the website's `TypeError` while
  online (section 4, step 2), which backs off instead of retrying at once.
- `busy · rolled back` and `server_bug · rolled back` only when the envelope
  carries `details.committed: false`; otherwise the plain or *write* row.
- `session_ended`: `· idle` for `error.session.idle_expired`, `· expired`
  for `error.session.expired`, `· closed` for `error.session.not_found`,
  `· not verified` for `error.session.invalid_token`, and the plain row for
  any other code and an uncoded 401. Add "— you will come back to this page"
  only where the client keeps the URL through sign-in.
- `outdated_client · web · write` after a failed write: reloading discards
  what is typed, so it never says "nothing is lost".

`cancelled` and `queued` show no error. A queued change confirms: "Saved on
this device; it will be sent when you're back online." / « Enregistré sur cet
appareil ; ce sera envoyé au retour de la connexion. »

Data sentences, chosen by the saved state:

- Not saved: "Nothing was saved; your entries are still on screen." /
  « Rien n'a été enregistré ; vos saisies sont toujours à l'écran. »
- Unknown: "Your change may have been saved — refresh to check before trying
  again." / « Votre modification a peut-être été enregistrée : actualisez pour
  vérifier avant de réessayer. »
- Saved (`unreadable_success`): see that row.
- Read: "Nothing you saved is affected." / « Rien de ce que vous avez
  enregistré n'est touché. »
- Pending: the queued sentence above.

**The last resort (`ERROR-8`)**, which replaces every shared "Something went
wrong" fallback (Babel's `common_error_unexpected_message`,
`common_error_generic_message`, `oops_something_went_wrong`,
`an_error_occurred_please_try_again`; Rendee's `FRIENDLY.unknown`; the Node
library's default):

- EN: "{failed title}. A problem on our side stopped it, and we have no more
  detail to show. {data sentence} If it happens again, contact {support}
  with the reference {ref}."
- FR : « {titre d'échec}. Un problème de notre côté l'a interrompu et nous
  n'avons pas plus de détails à afficher. {phrase sur les données} Si cela se
  reproduit, écrivez à {support} en donnant la référence {ref}. »
- With nothing more specific known, a write's data sentence is the unknown
  one. Only when it is certain that nothing was saved does "Try again." /
  « Réessayez. » come before the last sentence.

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
- Body: "The admin panel's server stopped answering at 14:02, so this page could not be fetched. If other sites work on this device, the problem is on our side. Nothing you saved before is affected."
- Status line: "Not answering since 14:02 · 3 attempts · next try in 12 s"
- Buttons: **Try now** only. No Dashboard link and no Sign in again: both are served by the same server that is not answering.
- Footer: "Not answering since 14:02 · help@rendee.ca" (the address comes from one constant, `RENDEE-ERROR-2`).
- After 5 minutes: "Still not answering after 5 minutes (since 14:02). Automatic retries have stopped. Try again from this page when you are ready, or contact help@rendee.ca and say the admin panel has not answered since 14:02."

Why the time and not a reference: the panel's server is the one that is down,
so a reference minted now would sit in this browser only, and support could
not look it up (`ERROR-7`). The admin's analytics are consent-gated and not
yet rendered, so they are no store either. The footer gains "Reference:
E-7F3C91" on the day the panel queues each minted reference with its kind,
URL and times, and flushes the queue to its own log endpoint once the probe
answers again (or sends it to an error sink that is not consent-gated).

Why not "your connection is working": the browser only knows a network
interface is up. That sentence comes back only after a probe to a host
outside our infrastructure answers (the `unreachable · connection confirmed`
row).

FR (when the admin gets French):

- Titre : **Cette page n'a pas été chargée**
- Corps : « Le serveur du panneau d'administration ne répond plus depuis 14 h 02 ; cette page n'a donc pas pu être récupérée. Si d'autres sites fonctionnent sur cet appareil, le problème vient de chez nous. Rien de ce que vous avez enregistré auparavant n'est touché. »
- Statut : « Ne répond pas depuis 14 h 02 · 3 tentatives · prochain essai dans 12 s »
- Bouton : **Réessayer maintenant**
- Pied : « Ne répond pas depuis 14 h 02 · help@rendee.ca »

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
  {support} avec la référence {ref}. » While the reference is not yet in a
  store support can query (`ERROR-7`), the last clause names the time
  instead: "…or contact {support} and say {what} has not answered since
  {since}."
- The website's `TypeError` while online (section 4, step 2) backs off on
  this schedule from the first failure: it may be a 429 or a 5xx the browser
  hid, and an immediate retry makes a 429 worse.
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
  catalogue is checked against its own locale (from the file or folder name)
  and against English, because an untranslated value is left in English (a
  `de.json` holding "Failed to retrieve balance. Please try again."); a
  source literal against every locale. Adjacent literals are joined first
  (`'Something went ' + 'wrong'`, Dart's `'Oops! ' 'Something went wrong'`),
  and a tagged template (html`…`) is a literal. JSX text is read too, one
  message per element: the pieces around `{expressions}` (read as `{}`) and
  inline tags (`<b>`, `<time>`, …) are joined, and quotes in it are plain
  characters, so `<p>Something went wrong. {reference}</p>` is caught.
  Comments, test files, wire values (`'failed'`) and arguments of
  `console.*` / `logger.*` / `print` calls are not.
- **title-repeats**: a title whose body is equal to it or opens with it
  (`ERROR-1`): sibling catalogue keys (`x_title` beside `x_message`,
  `x_description_message`, `x.body`, …) or `title` beside
  `body`/`message`/`description` in one object literal or JSX tag.
- **counter:<name>**: an app's own patterns, counted per file (raw
  `err.message` rendered, a fallback to a shared generic key). A counter
  matches the source with comments removed and string literals **kept**, so
  `t('common_error_generic_message')` is countable; `"scope": "code"`
  matches with literals emptied instead.

How a phrase matches (`$meta.matching` in the JSON): the message is
normalized (lower case, straight apostrophes, single spaces, leading emoji
and punctuation removed); **whole** = the message is the phrase; **opening**
= it starts with the phrase at a word boundary; **anywhere** = it contains the
phrase at word boundaries; **causeless** = it opens with a phrase that could
carry a cause ("Could not …", « Impossible de … », « Не удалось … ») and no
cause follows: every later clause is a filler such as "Please try again". So
"Unable to load transactions. Please try again." fails and "Could not save:
the server did not answer within 30 s." passes. Han, Kana and Hangul need no
boundary. A plain "Try again" / « Réessayez » is a button label in every
locale; its polite message form ("Please try again", « Veuillez réessayer »)
is banned as a whole message.

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
- In CI, `--base <merge base>` enforces "only goes down" instead of leaving
  it to review: it fails when the baseline holds an entry above, or beyond,
  the one at that ref (a hand-added entry), and when `allow` gained an entry
  that is not `{ "reason": "…", "approved": "<who>, <date>" }`. The first
  baseline (none at the ref) passes.

```bash
node scripts/check-error-copy.mjs --config error-copy.config.json                    # the check
node scripts/check-error-copy.mjs --config error-copy.config.json --base origin/main # the check in CI
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
  "counters": {
    "rendered-err-message": "\\b(?:err|e|error)\\.message\\b",
    "generic-key-fallback": "\\bt\\(\\s*['\"]common_error_(?:generic|unexpected)_message['\"]"
  },
  "allow": {
    "src/i18n/en.json#payments_status_failed_label generic": "status badge (ERROR-2)",
    "src/i18n/en.json#payments_status_error_label generic": { "reason": "status badge (ERROR-2)", "approved": "owner, 2026-10-21" }
  },
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
| babel-design-tokens | This file; the three contracts; `FailureKind` / `BabelFailureKind` | `npm run verify`: the principles parse; `check-contracts.mjs` (every kind declares retry/savedOnWrite/showReference/toast, this file's kind table equals the contract name by name and on retry/saved/reference, the `classify` rules equal section 4's list and every error code runs through them, genericCodes ⊂ error codes, every locale's phrases normalized and caught); the scanner's self-test (`scripts/__tests__/error-copy.test.mjs`, which also fails on a generic EN or FR cell in section 5) |
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
| "Saving the invoice: result unknown. Babel's server did not answer within 30 s. It may have been saved — refresh to check." | "Something went wrong. Please try again." |
| A title that says what failed, a body that says why | A title the body repeats word for word |
| "Only members with the Accounting permission can approve bills. Your President can grant it." | "You don't have permission to perform this action." |
| "You can request a new code at 14:32 (in 4 min)." | "Maximum OTP attempts reached. Please try again later." |
| "Babel's server cannot be reached right now. If other sites work on this device, the problem is on our side." (device reports a connection) | "Please check your internet connection." (device reports a connection) |
| "Your connection is working" only after a probe to another host answered | "Your connection is working" because `navigator.onLine` is true |
| "It was saved, but this screen could not show the result. Refresh." on a 2xx the client could not read | "Nothing was sent" on a 2xx the client could not read |
| Show the reference on a 5xx and on crashes, once support can look it up | Show raw `exception.toString()` behind "Show details", or a reference that lives only in this browser |
| "Saving the building: result unknown" on a 504 for a write | "The building was not saved" on a 504 for a write |
| Drop "Our team has been notified" unless an alert fires | Promise a notification that is only an analytics event |
| Offer only Try now while the server is down | Offer Dashboard and Sign in again, both served by the dead server |
