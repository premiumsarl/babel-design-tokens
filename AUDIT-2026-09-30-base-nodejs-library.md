# base_nodejs_library audit — 2026-09-30

**Scope:** `base_nodejs_library`'s relationship to the Babel repos, audited alongside `babel-admin-panel`,
`babel-mobile`, `base_mobile_library` and `babel-design-tokens`. The library is shared and
brand-neutral, so this record lives here rather than in it, next to the cross-repo record
`AUDIT-2026-09-30.md`; "this branch" below means the library's 4.3.0 branch. Companion records:
`babel-mobile/docs/COMPONENT_AUDIT_2026-09-30.md`, `babel-mobile/docs/BASE_MOBILE_LIBRARY_AUDIT_2026-09-30.md`
and `babel-admin-panel/docs/component-audit-2026-09-30.md`.

## Verdict

- **Neither Babel client uses this library.** There are 0 imports in `babel-admin-panel` and 0 in `babel-mobile`. Its Babel consumer is `babel-lambda-api`, which was not in scope.
- **Admin should not adopt it.** Admin's Next.js API routes don't re-implement the library's S3, OTP, auth or DB modules. They do hand-roll a `{status:false,message}` envelope 24 times. The library's Next adapter returns a plain `Response`, not a `NextResponse`, so there is no `.cookies` helper, although a route can still set cookies through `res.headers.append("Set-Cookie", …)` or `cookies()` from `next/headers`. The real cost is that it would pull aws-sdk, sendgrid and bcrypt into the admin server bundle. A small `src/lib/server/` helper in admin is the better fix.
- **Error vocabulary:** the library's 28-code `ErrorCode` enum collides with the design-token contracts' `ERROR_CODES`. Six names appear in both with different wire values (`INVALID_OTP` vs `error.auth.invalid_otp`), and both packages export a type named `ErrorCode`. The library must stay product-neutral because it also serves other products. Rename its enum, and have babel-lambda-api map library codes to contract codes.
- **Hygiene:** the repo has no tags and no CI. Coverage thresholds are configured but never enforced: branch coverage is 43%, against a 60% threshold, before this branch. Six modules had no tests.

## What changed on this branch (4.3.0)

This list and the ledger describe the library's branch at `a975b83`. Its review fixes (the auth middleware, Next payloads, S3 uploads and packaging) are still in flight there, and are not described here yet.

- The auth middleware no longer rejects valid tokens when `req.body` is undefined (`c46f3b3`).
- Next `successResponse` puts arrays, strings and other non-plain payloads under `data`, and a payload can no longer override `status`. This is a **wire-shape change** for non-plain payloads; plain objects are byte-identical (`586a37e`).
- S3 uploads send the file's mimetype as `ContentType`; key naming is unchanged (`df080cd`).
- Every build empties `dist/` first, so deleted modules cannot ship (`c1494d2`).
- The README is rewritten against the real package name and exports (`70604e0`).
- Tests: 124 → 160.

## To finish

1. Before GrooMe or Didactikos bump to 4.3.0, check their callers of `successResponse` that return arrays, strings or null.
2. Tag releases and add CI; `test:coverage` still fails its branch threshold (56.6%).
3. **Shorten one subject when squash-merging.** base_nodejs_library's `a975b83` has a 74-character subject, over the 72-character limit.

## Verification

Run in a Linux container with Flutter 3.47.2 and Node 22, with no simulator and no browser DOM. Every behaviour change ships with a test, and the review passes confirmed that each fix has tests that fail on the pre-change code (a new parameter's tests by not compiling there). Every *After* cell was measured on 2026-10-01 at the commit named here, so the column does not describe one run. babel-mobile's `flutter analyze` and full suite ran at `91a1b061`. Two later babel-mobile fixes are not in that full run: `b59b0af6` keys the OTP error message per attempt, and `28f39d9f` gives the OTP screen a single pin clear, so a code retried and rejected before the last clear no longer clears the pin twice. Each adds one widget test, and both pass on the v0.1.0 pin and against the library's 0.2.0 branch. At `28f39d9f`, `flutter analyze` gives the same counts as at `91a1b061`, and `test/presentation/views/auth`, `test/design` and `test/ratchets` pass (216 tests) apart from the environment failure below. base_mobile_library ran at `40c2a66`: the `30b3628` of the compatibility run below, plus `721b897` (documentation only), `b061319` (a restarted OTP shake moves its pin clear instead of adding a second), `36ac54f` (initials taken by grapheme cluster), `1e1839b` (one pending shake clear per controller, so a second pin field shaken in turn keeps its own clear) and `40c2a66` (`inkOverChild`'s layer documented as taking all pointer input, with three tests). babel-admin-panel ran at `e4d5422`, the branch tip after merging develop. babel-design-tokens ran at `cd7019e` and base_nodejs_library at `a975b83`, the tips of their branches on origin. Their review fixes are still in flight on those branches and are not in these two rows.

| Repo | Gate | Before this branch | After |
|---|---|---|---|
| babel-mobile | `flutter analyze` | 0 errors · 500 warnings · 1370 infos | 0 errors · 500 warnings · 1368 infos |
| babel-mobile | full `flutter test` | 8129 pass, 2 fail | 8275 pass, 1 fail |
| babel-mobile | `test/design` ratchets | 92 pass | all pass, plus new `haptic_ratchet_test`, `icon_button_tooltip_test` and `pull_to_refresh_ratchet_test` |
| base_mobile_library | `flutter analyze` / `flutter test` | 0 errors · 6 warnings / 76 pass | unchanged / 161 pass |
| babel-admin-panel | `npm run verify` (tsc, token/spacing/motion ratchets, guardrails, states, full vitest) | 704 files · 12450 pass, 18 skipped, green | 732 files · 12827 pass, 18 skipped, green |
| babel-design-tokens | `npm run verify` (with Dart analyze), `node build.mjs --check` | green | green, now analysing both generated Dart files |
| base_nodejs_library | `jest` / `tsc --noEmit` | 124 pass / clean | 160 pass / clean |

Two failures need explaining:
- **Mobile, before:** the one real failure was `entry_request_card_test`'s "Always allow" case. That was the AccentCard ink bug, fixed in `a43e8a4d`.
- **Mobile, both columns:** `git_hooks_installed_ratchet_test` fails because this container leaves `core.hooksPath` unset. It is an environment failure, not a code one.

**Compatibility with base_mobile_library 0.2.0.** babel-mobile's final branch was checked against the library branch by path override in a throwaway worktree, and the check was re-run after the review fixes, with babel-mobile at `91a1b061` and the library at `30b3628`. `lib/` analyses with 0 errors, the same 1714 issues line for line as on the v0.1.0 pin, and the full suite gives the same result as on the pin: 8275 pass, 44 skipped, with only the environment failure. Test by test, all 8320 outcomes match. The later fixes were checked against the library at `40c2a66`: babel-mobile's `test/presentation/views/auth` at `28f39d9f` passes there (79 tests, both later OTP tests among them), and those files analyse with the same 14 issues as on the pin. The one test that broke during the work was the combine-accounts sheet, which overflowed once a button label wrapped; `72455e83` makes it scroll. The pin can be bumped as soon as v0.2.0 is tagged. After the bump, babel-mobile's seven `() {}` disabled callbacks should pass `null`: on 0.2.0 a no-op `onPressed` stays live and buzzes on every tap.

## Findings ledger

Generated from the verified audit data. *Fixed* cites the commit; *partly fixed* says what is done and what is left; everything else is open. Low-severity entries list the title only.

15 findings: 3 fixed on this branch, 4 partly fixed, 8 open.

### Fixed on this branch

- README uses the wrong package name, documents a removed default export and 2 removed functions, omits 51 of 82 exports · `base-node-lib-readme-drift` — base_nodejs_library 70604e0
- Next successResponse spreads payload: arrays and strings become index maps, a payload's `status` overrides the envelope's · `base-node-lib-next-success-spread` — base_nodejs_library 586a37e
- Publish and install build never cleans dist/, so deleted modules can ship · `base-node-lib-stale-dist-publish` — base_nodejs_library c1494d2

### Decisions needed

These are real, but the fix is a visual or product call. Each entry says what to decide.

- **Error classes never thrown; codes defined but literals hard-coded; 6 different result shapes** · `base-node-lib-error-signalling` · medium · needs a decision
  - *Scope:* 0 LibraryError/AppError constructions in non-test src; 3 `throw new Error`; 13 of 28 ErrorCode members never referenced outside src/errors; ~16 hard-coded default-message literals; 6 result shapes across modules.
  - *Next:* Mechanical now: make LibraryError's constructor call resolveErrorMessage, and replace the default-message literals with resolveErrorMessage(ErrorCode.X). This is byte-identical output. For 5.0, the owner picks one failure convention: throw LibraryError(code, params), or return `{ok:false, code, message, params?}`.
- **OtpService.verify treats any 2xx from the Twilio proxy as verified; the contract is undocumented** · `base-node-lib-otp-verify-contract` · medium · needs a decision
  - *Scope:* 1 verify path. The tests cover only 'the promise resolved' (otp.test.ts:406-423) and 'the promise rejected' (467-483).
  - *Next:* Document the proxy response contract in otp/index.ts. In verify(), assert on the body (e.g. `res.data?.status === 'approved'` or the proxy's equivalent) and throw `LibraryError(ErrorCode.INVALID_OTP)` otherwise. Add a test in which the proxy resolves 200 with a non-approved body.

### Next work, highest severity first

- **Security fix and breaking removals shipped without version bumps; no tags, no CI** · `base-node-lib-release-identity` · high
  - *Done so far:* bumped to 4.3.0 (c38e7bf); no CHANGELOG, tag or CI yet
  - *Scope:* git log -- package.json: 63fabcd set 4.2.5 with the vulnerable OtpService (isDevMode = !this.config.accountSid); 0885371 'fix(security): gate the OTP dev bypass on the environment' did not touch the version.
  - *Next:* Add a CHANGELOG entry calling out the OTP gate fix and the 123456 to 222222 dev-code change, and record retroactively that 4.1.0 removed the default export. Tag vX.Y.Z. Add CI running `npm ci && npx tsc --noEmit && npm test`, and move it to test:coverage only after the missing test files land.
- **createAuthMiddleware rejects valid tokens when req.body is undefined; 403 'failed'; query-string tokens** · `base-node-lib-auth-middleware` · medium
  - *Done so far:* req.body-undefined crash fixed, with middleware tests for an undefined body, the body/query/header token order and a missing token (c46f3b3); 403/401 and message shape unchanged
  - *Scope:* Simulated against the dist. A valid Bearer token with req.body undefined returned 401 {"status":false,"message":"Cannot set properties of undefined (setting 'user')"} and next() was not called. With no token the result was 403 {"status":"failed"}.
  - *Next:* Return a fixed message ("Invalid or expired token") instead of err.message. Use verifyJWT from ../auth instead of require. Add a middleware test for an expired token.
- **Coverage thresholds fail and are never enforced; 6 of 18 modules have no tests** · `base-node-lib-coverage-gate` · medium
  - *Done so far:* 124 → 160 tests, including new test files for responses/nextjs (586a37e) and middleware/express (c46f3b3); branch coverage 56.6% still under the 60% threshold
  - *Scope:* In the scratch copy, `npx jest`: 12 suites and 124 tests pass. `npx tsc --noEmit`: exit 0. `npx jest --coverage`: exit 1, with branches 43.04%, lines 67.31% and functions 67.3%.
  - *Next:* Add test files for the 4 modules still without one: email (mock @sendgrid/mail and axios), storage/supabase, payments/paytech (mock fetch) and payments/stripe. Point the CI test step at `npm run test:coverage` so the thresholds are enforced.
- **Response helpers cannot carry errorCode or fieldErrors, which Babel's contracts require** · `base-node-lib-envelope-no-errorcode` · medium
  - *Scope:* All 23 response builders take only (message) or (res, message). 0 of them accept errorCode, fieldErrors or details. AppError (errors/index.ts:190-213) has message, httpStatusCode and detail, but no code slot.
  - *Next:* Add a brand-neutral optional argument, `extra?: { errorCode?: string; fieldErrors?: unknown[]; details?: unknown }`, to makeError and the matching Express and Next adapters, and spread it into the body. Give AppError an optional `code?: string`. Keep the values as plain strings so each product supplies its own contract codes.
- **uploadFilesToS3 keys are timestamp-only at bucket root and uploaded without ContentType** · `base-node-lib-s3-keys` · medium
  - *Done so far:* ContentType sent (df080cd); key naming unchanged
  - *Scope:* 1 function (uploadFilesToS3, s3.ts:70-130). Mechanical-safe part: key generation plus ContentType. Return-shape and client-injection parts are breaking or refactor.
  - *Next:* Now: `const filename = `${config.prefix ?? ''}${crypto.randomUUID()}${ext}`` (prefix optional on S3Config). Hoist the S3Client out of the per-call path or accept an injected one.
- **checkRequiredValidation is keyed on English labels (silent passes); Babel user-model logic in a neutral lib** · `base-node-lib-validation-footguns` · medium
  - *Scope:* Ran against the dist. {field:'Confirm Password'} with mismatched passwords returned {status:true}. {type:'empty', value:''} returned {status:true}. isValidNumber returned true for '', ' ', null, [] and true.
  - *Next:* Additive only in 4.x: add `validateFields(rules: Array<{key; label; value; rule: 'required'|'length'|'maxLength'|{matches: string}}>)` returning `{ok, code, params:{key}}`. Mark checkRequiredValidation @deprecated, and make its unknown `type` values throw in dev instead of passing silently.

### Low-severity backlog

- **Heavy SDKs are hard deps while others are optional peers; unused mysql2 peer; two HTTP and two SendGrid clients** · `base-node-lib-deps-strategy` · low
- **Twilio auth token is sent in every OTP request body to the TWILIO_BASE_URL proxy** · `base-node-lib-twilio-secret-in-body` · low · needs a decision
- **Small internal duplications and off-by-one ranges in the string, date, OTP and random utils** · `base-node-lib-util-internal-dup` · low
- **getYearAndWeekNumber is documented as ISO but is Sunday-based and wrong at year boundaries** · `base-node-lib-week-number` · low · needs a decision
