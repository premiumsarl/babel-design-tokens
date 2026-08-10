// Babel shared contracts — GENERATED from contracts/. Do not edit.
//
// The wire vocabulary shared with babel-lambda-api and babel-admin-panel. This
// is the pub half of the same release the web apps get over npm, so a mobile
// binary and a server on the same tag cannot disagree about what a value is
// called.
//
// Pure Dart — no Flutter import, unlike babel_tokens.dart. A contract is a
// string vocabulary; nothing here needs a Widget, so this file is usable from
// a plain `dart` isolate and from tests without a binding.
//
// Values are Strings rather than a Dart `enum` ON PURPOSE. A generated enum
// would make an unrecognised server value unrepresentable, and the whole point
// of `onUnknown: preserve` is that an old binary meeting a new value must keep
// working. Wrap these in your own enum where you want exhaustiveness, and keep
// a fallback member (mobile already does: NotificationType.unknown).

/// Stable `error.<domain>.<action>` codes on the `errorCode` field.
abstract final class BabelErrorCodes {
  static const String permissionDenied = 'error.auth.permission_denied';
  static const String invalidUser = 'error.auth.invalid_user';
  static const String unauthorized = 'error.auth.unauthorized';
  static const String accountLocked = 'error.auth.account_locked';
  static const String invalidCredentials = 'error.auth.invalid_credentials';
  static const String invalidOtp = 'error.auth.invalid_otp';
  static const String otpExpired = 'error.auth.otp_expired';
  static const String otpTooManyAttempts = 'error.auth.otp_too_many_attempts';
  static const String otpSendFailed = 'error.auth.otp_send_failed';
  static const String otpResendCooldown = 'error.auth.otp_resend_cooldown';
  static const String accountClaimed = 'error.auth.account_claimed';
  static const String otpContactMismatch = 'error.auth.otp_contact_mismatch';
  static const String otpContactNotOnAccount = 'error.auth.otp_contact_not_on_account';
  static const String emailAlreadyRegistered = 'error.auth.email_already_registered';
  static const String phoneAlreadyRegistered = 'error.auth.phone_already_registered';
  static const String invalidAssociation = 'error.association.invalid';
  static const String associationNotFound = 'error.association.not_found';
  static const String alreadyMember = 'error.association.already_member';
  static const String memberNotFound = 'error.association.member_not_found';
  static const String inviteCodeInvalid = 'error.association.invite_code_invalid';
  static const String inviteAlreadyAccepted = 'error.association.invite_already_accepted';
  static const String maxUnitsReached = 'error.association.max_units_reached';
  static const String ownerRequired = 'error.association.owner_required';
  static const String ownerNotAllowed = 'error.association.owner_not_allowed';
  static const String associationContextMismatch = 'error.association.context_mismatch';
  static const String addressAlreadyInUse = 'error.association.address_already_in_use';
  static const String manageRequestAlreadyOpen = 'error.association.manage_request_already_open';
  static const String manageRequestNotFound = 'error.association.manage_request_not_found';
  static const String manageRequestAlreadyContracted = 'error.association.manage_request_already_contracted';
  static const String unitNotFound = 'error.unit.not_found';
  static const String unitAlreadyExists = 'error.unit.already_exists';
  static const String unitInvalidStatus = 'error.unit.invalid_status';
  static const String unitQuotaExceedsTotal = 'error.unit.quota_exceeds_total';
  static const String paymentFailed = 'error.payment.failed';
  static const String paymentNotFound = 'error.payment.not_found';
  static const String paymentAlreadyProcessed = 'error.payment.already_processed';
  static const String paymentInFlight = 'error.payment.in_flight';
  static const String paymentAccountNotAccepting = 'error.payment.account_not_accepting';
  static const String paymentInvalidAmount = 'error.payment.invalid_amount';
  static const String paymentMissingAccount = 'error.payment.missing_account';
  static const String paymentMethodDisabled = 'error.payment.method_disabled';
  static const String paymentLinkExpired = 'error.payment.link_expired';
  static const String paymentRelinkRequired = 'error.payment.relink_required';
  static const String paymentConnectAccountStale = 'error.payment.connect_account_stale';
  static const String paymentUnlinkActiveLeases = 'error.payment.unlink_active_leases';
  static const String duplicatePaymentSuspected = 'error.payment.duplicate_suspected';
  static const String duplicateChargeSuspected = 'error.payment.duplicate_charge_suspected';
  static const String violationNotFound = 'error.violation.not_found';
  static const String violationPermissionDenied = 'error.violation.permission_denied';
  static const String taskNotFound = 'error.task.not_found';
  static const String taskAlreadyCompleted = 'error.task.already_completed';
  static const String taskAiUnavailable = 'error.task.ai_unavailable';
  static const String taskAiFailed = 'error.task.ai_failed';
  static const String taskAiTierRequired = 'error.task.ai_tier_required';
  static const String taskOccurrenceImmutable = 'error.task.occurrence_immutable';
  static const String taskDocumentImmutable = 'error.task.document_immutable';
  static const String taskDocumentDeleteDenied = 'error.task.document_delete_denied';
  static const String bookingConflict = 'error.booking.conflict';
  static const String bookingNotFound = 'error.booking.not_found';
  static const String amenityNotFound = 'error.amenity.not_found';
  static const String amenityInvalid = 'error.amenity.invalid';
  static const String movingNotFound = 'error.moving.not_found';
  static const String movingConflict = 'error.moving.conflict';
  static const String movingInvalidDate = 'error.moving.invalid_date';
  static const String movingInvalidTime = 'error.moving.invalid_time';
  static const String documentNotFound = 'error.document.not_found';
  static const String budgetNotFound = 'error.budget.not_found';
  static const String budgetAlreadyActive = 'error.budget.already_active';
  static const String budgetCategoryNotFound = 'error.budget.category_not_found';
  static const String budgetCategoryDuplicate = 'error.budget.category_duplicate';
  static const String budgetVotingNotFound = 'error.budget.voting_not_found';
  static const String chargePoolNotFound = 'error.charge_pool.not_found';
  static const String chargePoolWeightsInvalid = 'error.charge_pool.weights_invalid';
  static const String leaseNotFound = 'error.lease.not_found';
  static const String leaseAlreadyActive = 'error.lease.already_active';
  static const String leaseInvalidDates = 'error.lease.invalid_dates';
  static const String leasePermissionDenied = 'error.lease.permission_denied';
  static const String announcementNotFound = 'error.announcement.not_found';
  static const String announcementAlreadyApproved = 'error.announcement.already_approved';
  static const String announcementInvalidDates = 'error.announcement.invalid_dates';
  static const String insuranceNotFound = 'error.insurance.not_found';
  static const String litigationNotFound = 'error.litigation.not_found';
  static const String litigationCompleteModeRequired = 'error.litigation.complete_mode_required';
  static const String attestationNotFound = 'error.attestation.not_found';
  static const String attestationInvalid = 'error.attestation.invalid';
  static const String attestationPermissionDenied = 'error.attestation.permission_denied';
  static const String attestationSnapshotFailed = 'error.attestation.snapshot_failed';
  static const String saleNotFound = 'error.sale.not_found';
  static const String saleNotOwner = 'error.sale.not_owner';
  static const String saleAlreadyListed = 'error.sale.already_listed';
  static const String saleNotListed = 'error.sale.not_listed';
  static const String occupancyNotFound = 'error.occupancy.not_found';
  static const String occupancyInvalidDates = 'error.occupancy.invalid_dates';
  static const String occupancyOverlap = 'error.occupancy.overlap';
  static const String vehicleNotFound = 'error.vehicle.not_found';
  static const String vehiclePermissionDenied = 'error.vehicle.permission_denied';
  static const String scheduleNotFound = 'error.schedule.not_found';
  static const String scheduleInvalidDates = 'error.schedule.invalid_dates';
  static const String scheduleAlreadyProcessed = 'error.schedule.already_processed';
  static const String schedulePermissionDenied = 'error.schedule.permission_denied';
  static const String scheduleInvalidStatus = 'error.schedule.invalid_status';
  static const String chatDisabled = 'error.chat.disabled';
  static const String chatPermissionDenied = 'error.chat.permission_denied';
  static const String chatTargetNotMember = 'error.chat.target_not_member';
  static const String chatChannelNotFound = 'error.chat.channel_not_found';
  static const String chatPolicyUnavailable = 'error.chat.policy_unavailable';
  static const String subscriptionNotFound = 'error.subscription.not_found';
  static const String subscriptionAlreadyCancelled = 'error.subscription.already_cancelled';
  static const String subscriptionTrialActive = 'error.subscription.trial_active';
  static const String importSessionNotFound = 'error.import.session_not_found';
  static const String importInvalidFile = 'error.import.invalid_file';
  static const String importUnauthorized = 'error.import.unauthorized';
  static const String importValidationFailed = 'error.import.validation_failed';
  static const String importAiUnavailable = 'error.import.ai_unavailable';
  static const String importAiExtractionFailed = 'error.import.ai_extraction_failed';
  static const String importSchemaOutOfDate = 'error.import.schema_out_of_date';
  static const String importStorageUnavailable = 'error.import.storage_unavailable';
  static const String importBadValue = 'error.import.bad_value';
  static const String importUnexpected = 'error.import.unexpected';
  static const String storageDownloadDenied = 'error.storage.download_denied';
  static const String downtimeNotFound = 'error.downtime.not_found';
  static const String downtimeInvalidDate = 'error.downtime.invalid_date';
  static const String garbageScheduleNotFound = 'error.garbage.schedule_not_found';
  static const String sessionNotFound = 'error.session.not_found';
  static const String sessionExpired = 'error.session.expired';
  static const String sessionInvalidToken = 'error.session.invalid_token';
  static const String portalNotFound = 'error.portal.not_found';
  static const String portalInvalidConfig = 'error.portal.invalid_config';
  static const String tradeAccessDenied = 'error.trade.access_denied';
  static const String tradeContractNotFound = 'error.trade.contract_not_found';
  static const String componentNotFound = 'error.component.not_found';
  static const String componentInvalid = 'error.component.invalid';
  static const String scenarioNotFound = 'error.scenario.not_found';
  static const String scenarioInvalid = 'error.scenario.invalid';
  static const String reconstructionValueRequired = 'error.scenario.reconstruction_value_required';
  static const String annualCondoFeesRequired = 'error.scenario.annual_condo_fees_required';
  static const String reserveBalanceNotSet = 'error.scenario.reserve_balance_not_set';
  static const String ledgerEntryUnbalanced = 'error.ledger.entry_unbalanced';
  static const String ledgerAccountNotFound = 'error.ledger.account_not_found';
  static const String ledgerAccountCodeDuplicate = 'error.ledger.account_code_duplicate';
  static const String ledgerPeriodLocked = 'error.ledger.period_locked';
  static const String ledgerSystemAccountProtected = 'error.ledger.system_account_protected';
  static const String ledgerNotSeeded = 'error.ledger.not_seeded';
  static const String ledgerAccountInactive = 'error.ledger.account_inactive';
  static const String ledgerBasisLocked = 'error.ledger.basis_locked';
  static const String ledgerOpeningBalanceLocked = 'error.ledger.opening_balance_locked';
  static const String ledgerCurrencyLocked = 'error.ledger.currency_locked';
  static const String ledgerAccountHasEntries = 'error.ledger.account_has_entries';
  static const String ledgerAccountHasChildren = 'error.ledger.account_has_children';
  static const String ledgerAccountHasReconciliations = 'error.ledger.account_has_reconciliations';
  static const String apBillNotFound = 'error.ap.bill_not_found';
  static const String apBillInvalidState = 'error.ap.bill_invalid_state';
  static const String apProviderNotFound = 'error.ap.provider_not_found';
  static const String apOverpayment = 'error.ap.overpayment';
  static const String apBillSelfApprovalForbidden = 'error.ap.self_approval_forbidden';
  static const String apBillAlreadyApprovedByYou = 'error.ap.bill_already_approved_by_you';
  static const String apBillPresidentApprovalRequired = 'error.ap.bill_president_approval_required';
  static const String apVendorNotApproved = 'error.ap.vendor_not_approved';
  static const String apVendorFlaggedReapprovalRequired = 'error.ap.vendor_flagged_reapproval_required';
  static const String apPoNotFound = 'error.ap.purchase_order_not_found';
  static const String apPoNotOpen = 'error.ap.purchase_order_not_open';
  static const String apPoProviderMismatch = 'error.ap.purchase_order_provider_mismatch';
  static const String apPoAmountExceeded = 'error.ap.purchase_order_amount_exceeded';
  static const String providerApprovalIncompleteRecord = 'error.provider.approval_incomplete_record';
  static const String taskVendorNotApproved = 'error.task.vendor_not_approved';
  static const String taskVendorOverrideReasonRequired = 'error.task.vendor_override_reason_required';
  static const String apClassificationOverrideReasonRequired = 'error.ap.classification_override_reason_required';
  static const String recordVerificationRoundNotFound = 'error.verification.round_not_found';
  static const String recordVerificationSelfApprovalForbidden = 'error.verification.self_approval_forbidden';
  static const String providerBlanketInvalid = 'error.provider.blanket_invalid';
  static const String duplicateVendorSuspected = 'error.provider.duplicate_suspected';
  static const String arInvoiceNotFound = 'error.ar.invoice_not_found';
  static const String arInvoiceNotReceivable = 'error.ar.invoice_not_receivable';
  static const String arInvoiceInvalidState = 'error.ar.invoice_invalid_state';
  static const String arInvoiceAlreadyPaid = 'error.ar.invoice_already_paid';
  static const String arInvoiceCancelled = 'error.ar.invoice_cancelled';
  static const String arOverpayment = 'error.ar.overpayment';
  static const String arInvoiceHasPayments = 'error.ar.invoice_has_payments';
  static const String arInvoicePartiallyPaid = 'error.ar.invoice_partially_paid';
  static const String contractNotFound = 'error.contract.not_found';
  static const String contractInvalid = 'error.contract.invalid';
  static const String dueNotFound = 'error.due.not_found';
  static const String dueAlreadyPaid = 'error.due.already_paid';
  static const String dueCancelled = 'error.due.cancelled';
  static const String ownerStatementPeriodFinalized = 'error.owner_statement.period_finalized';
  static const String signupNotFound = 'error.signup.not_found';
  static const String signupAlreadyVerified = 'error.signup.already_verified';
  static const String signupAlreadyPaid = 'error.signup.already_paid';
  static const String signupExpired = 'error.signup.expired';
  static const String signupInvalidCode = 'error.signup.invalid_code';
  static const String signupRateLimited = 'error.signup.rate_limited';
  static const String signupServiceUnavailable = 'error.signup.service_unavailable';
  static const String emailTemplateNotFound = 'error.email_template.not_found';
  static const String companyNotFound = 'error.company.not_found';
  static const String companyMemberExists = 'error.company.member_exists';
  static const String companyRoleInUse = 'error.company.role_in_use';
  static const String companyHasActiveContracts = 'error.company.has_active_contracts';
  static const String companyManagedContract = 'error.company.managed_contract';
  static const String lastOwnerProtected = 'error.company.last_owner_protected';
  static const String contractNotPendingAcceptance = 'error.contract.not_pending_acceptance';
  static const String contractTerminationPending = 'error.contract.termination_pending';
  static const String subscriptionTierRequired = 'error.subscription.tier_required';
  static const String validationError = 'error.generic.validation';
  static const String notFound = 'error.generic.not_found';
  static const String conflict = 'error.generic.conflict';
  static const String internalError = 'error.generic.internal';
  static const String serviceUnavailable = 'error.generic.service_unavailable';
  static const String emailSendFailed = 'error.generic.email_send_failed';
  static const String invalidId = 'error.generic.invalid_id';
  static const String invalidDateFormat = 'error.generic.invalid_date_format';
  static const String resourceNotBelongs = 'error.generic.resource_not_belongs';
  static const String rateLimited = 'error.generic.rate_limited';
  static const String missingRequiredField = 'error.generic.missing_required_field';
  static const String invalidFileFormat = 'error.generic.invalid_file_format';
  static const String smartDeviceNotConfigured = 'error.smart_device.not_configured';

  /// Every value above, for membership tests.
  static const List<String> values = <String>[
    'error.auth.permission_denied',
    'error.auth.invalid_user',
    'error.auth.unauthorized',
    'error.auth.account_locked',
    'error.auth.invalid_credentials',
    'error.auth.invalid_otp',
    'error.auth.otp_expired',
    'error.auth.otp_too_many_attempts',
    'error.auth.otp_send_failed',
    'error.auth.otp_resend_cooldown',
    'error.auth.account_claimed',
    'error.auth.otp_contact_mismatch',
    'error.auth.otp_contact_not_on_account',
    'error.auth.email_already_registered',
    'error.auth.phone_already_registered',
    'error.association.invalid',
    'error.association.not_found',
    'error.association.already_member',
    'error.association.member_not_found',
    'error.association.invite_code_invalid',
    'error.association.invite_already_accepted',
    'error.association.max_units_reached',
    'error.association.owner_required',
    'error.association.owner_not_allowed',
    'error.association.context_mismatch',
    'error.association.address_already_in_use',
    'error.association.manage_request_already_open',
    'error.association.manage_request_not_found',
    'error.association.manage_request_already_contracted',
    'error.unit.not_found',
    'error.unit.already_exists',
    'error.unit.invalid_status',
    'error.unit.quota_exceeds_total',
    'error.payment.failed',
    'error.payment.not_found',
    'error.payment.already_processed',
    'error.payment.in_flight',
    'error.payment.account_not_accepting',
    'error.payment.invalid_amount',
    'error.payment.missing_account',
    'error.payment.method_disabled',
    'error.payment.link_expired',
    'error.payment.relink_required',
    'error.payment.connect_account_stale',
    'error.payment.unlink_active_leases',
    'error.payment.duplicate_suspected',
    'error.payment.duplicate_charge_suspected',
    'error.violation.not_found',
    'error.violation.permission_denied',
    'error.task.not_found',
    'error.task.already_completed',
    'error.task.ai_unavailable',
    'error.task.ai_failed',
    'error.task.ai_tier_required',
    'error.task.occurrence_immutable',
    'error.task.document_immutable',
    'error.task.document_delete_denied',
    'error.booking.conflict',
    'error.booking.not_found',
    'error.amenity.not_found',
    'error.amenity.invalid',
    'error.moving.not_found',
    'error.moving.conflict',
    'error.moving.invalid_date',
    'error.moving.invalid_time',
    'error.document.not_found',
    'error.budget.not_found',
    'error.budget.already_active',
    'error.budget.category_not_found',
    'error.budget.category_duplicate',
    'error.budget.voting_not_found',
    'error.charge_pool.not_found',
    'error.charge_pool.weights_invalid',
    'error.lease.not_found',
    'error.lease.already_active',
    'error.lease.invalid_dates',
    'error.lease.permission_denied',
    'error.announcement.not_found',
    'error.announcement.already_approved',
    'error.announcement.invalid_dates',
    'error.insurance.not_found',
    'error.litigation.not_found',
    'error.litigation.complete_mode_required',
    'error.attestation.not_found',
    'error.attestation.invalid',
    'error.attestation.permission_denied',
    'error.attestation.snapshot_failed',
    'error.sale.not_found',
    'error.sale.not_owner',
    'error.sale.already_listed',
    'error.sale.not_listed',
    'error.occupancy.not_found',
    'error.occupancy.invalid_dates',
    'error.occupancy.overlap',
    'error.vehicle.not_found',
    'error.vehicle.permission_denied',
    'error.schedule.not_found',
    'error.schedule.invalid_dates',
    'error.schedule.already_processed',
    'error.schedule.permission_denied',
    'error.schedule.invalid_status',
    'error.chat.disabled',
    'error.chat.permission_denied',
    'error.chat.target_not_member',
    'error.chat.channel_not_found',
    'error.chat.policy_unavailable',
    'error.subscription.not_found',
    'error.subscription.already_cancelled',
    'error.subscription.trial_active',
    'error.import.session_not_found',
    'error.import.invalid_file',
    'error.import.unauthorized',
    'error.import.validation_failed',
    'error.import.ai_unavailable',
    'error.import.ai_extraction_failed',
    'error.import.schema_out_of_date',
    'error.import.storage_unavailable',
    'error.import.bad_value',
    'error.import.unexpected',
    'error.storage.download_denied',
    'error.downtime.not_found',
    'error.downtime.invalid_date',
    'error.garbage.schedule_not_found',
    'error.session.not_found',
    'error.session.expired',
    'error.session.invalid_token',
    'error.portal.not_found',
    'error.portal.invalid_config',
    'error.trade.access_denied',
    'error.trade.contract_not_found',
    'error.component.not_found',
    'error.component.invalid',
    'error.scenario.not_found',
    'error.scenario.invalid',
    'error.scenario.reconstruction_value_required',
    'error.scenario.annual_condo_fees_required',
    'error.scenario.reserve_balance_not_set',
    'error.ledger.entry_unbalanced',
    'error.ledger.account_not_found',
    'error.ledger.account_code_duplicate',
    'error.ledger.period_locked',
    'error.ledger.system_account_protected',
    'error.ledger.not_seeded',
    'error.ledger.account_inactive',
    'error.ledger.basis_locked',
    'error.ledger.opening_balance_locked',
    'error.ledger.currency_locked',
    'error.ledger.account_has_entries',
    'error.ledger.account_has_children',
    'error.ledger.account_has_reconciliations',
    'error.ap.bill_not_found',
    'error.ap.bill_invalid_state',
    'error.ap.provider_not_found',
    'error.ap.overpayment',
    'error.ap.self_approval_forbidden',
    'error.ap.bill_already_approved_by_you',
    'error.ap.bill_president_approval_required',
    'error.ap.vendor_not_approved',
    'error.ap.vendor_flagged_reapproval_required',
    'error.ap.purchase_order_not_found',
    'error.ap.purchase_order_not_open',
    'error.ap.purchase_order_provider_mismatch',
    'error.ap.purchase_order_amount_exceeded',
    'error.provider.approval_incomplete_record',
    'error.task.vendor_not_approved',
    'error.task.vendor_override_reason_required',
    'error.ap.classification_override_reason_required',
    'error.verification.round_not_found',
    'error.verification.self_approval_forbidden',
    'error.provider.blanket_invalid',
    'error.provider.duplicate_suspected',
    'error.ar.invoice_not_found',
    'error.ar.invoice_not_receivable',
    'error.ar.invoice_invalid_state',
    'error.ar.invoice_already_paid',
    'error.ar.invoice_cancelled',
    'error.ar.overpayment',
    'error.ar.invoice_has_payments',
    'error.ar.invoice_partially_paid',
    'error.contract.not_found',
    'error.contract.invalid',
    'error.due.not_found',
    'error.due.already_paid',
    'error.due.cancelled',
    'error.owner_statement.period_finalized',
    'error.signup.not_found',
    'error.signup.already_verified',
    'error.signup.already_paid',
    'error.signup.expired',
    'error.signup.invalid_code',
    'error.signup.rate_limited',
    'error.signup.service_unavailable',
    'error.email_template.not_found',
    'error.company.not_found',
    'error.company.member_exists',
    'error.company.role_in_use',
    'error.company.has_active_contracts',
    'error.company.managed_contract',
    'error.company.last_owner_protected',
    'error.contract.not_pending_acceptance',
    'error.contract.termination_pending',
    'error.subscription.tier_required',
    'error.generic.validation',
    'error.generic.not_found',
    'error.generic.conflict',
    'error.generic.internal',
    'error.generic.service_unavailable',
    'error.generic.email_send_failed',
    'error.generic.invalid_id',
    'error.generic.invalid_date_format',
    'error.generic.resource_not_belongs',
    'error.generic.rate_limited',
    'error.generic.missing_required_field',
    'error.generic.invalid_file_format',
    'error.smart_device.not_configured',
  ];
}

/// Stable `error.field.*` codes on the `fieldErrors` array of a 400.
abstract final class BabelFieldErrorCodes {
  static const String required_ = 'error.field.required';
  static const String invalidType = 'error.field.invalid_type';
  static const String tooSmall = 'error.field.too_small';
  static const String tooBig = 'error.field.too_big';
  static const String invalidEmail = 'error.field.invalid_email';
  static const String invalidUrl = 'error.field.invalid_url';
  static const String invalidString = 'error.field.invalid_string';
  static const String invalidEnumValue = 'error.field.invalid_enum_value';
  static const String invalidDate = 'error.field.invalid_date';
  static const String notMultipleOf = 'error.field.not_multiple_of';
  static const String custom = 'error.field.custom';
  static const String unknownKey = 'error.field.unknown_key';
  static const String invalidLiteral = 'error.field.invalid_literal';
  static const String invalidUnion = 'error.field.invalid_union';
  static const String notFinite = 'error.field.not_finite';
  static const String invalid = 'error.field.invalid';

  /// Every value above, for membership tests.
  static const List<String> values = <String>[
    'error.field.required',
    'error.field.invalid_type',
    'error.field.too_small',
    'error.field.too_big',
    'error.field.invalid_email',
    'error.field.invalid_url',
    'error.field.invalid_string',
    'error.field.invalid_enum_value',
    'error.field.invalid_date',
    'error.field.not_multiple_of',
    'error.field.custom',
    'error.field.unknown_key',
    'error.field.invalid_literal',
    'error.field.invalid_union',
    'error.field.not_finite',
    'error.field.invalid',
  ];
}

/// Constraint params each field-error code carries, for placeholder rendering.
abstract final class BabelFieldErrorParams {
  static const Map<String, List<String>> byCode = <String, List<String>>{
    'error.field.required': <String>[],
    'error.field.invalid_type': <String>[
      'expected',
    ],
    'error.field.too_small': <String>[
      'min',
    ],
    'error.field.too_big': <String>[
      'max',
    ],
    'error.field.invalid_email': <String>[],
    'error.field.invalid_url': <String>[],
    'error.field.invalid_string': <String>[],
    'error.field.invalid_enum_value': <String>[
      'options',
    ],
    'error.field.invalid_date': <String>[],
    'error.field.not_multiple_of': <String>[
      'multipleOf',
    ],
    'error.field.custom': <String>[],
    'error.field.unknown_key': <String>[
      'keys',
    ],
    'error.field.invalid_literal': <String>[
      'expected',
    ],
    'error.field.invalid_union': <String>[],
    'error.field.not_finite': <String>[],
    'error.field.invalid': <String>[],
  };
}

/// Physical condition of a building component.
abstract final class BabelComponentCondition {
  static const List<String> values = <String>[
    'good',
    'fair',
    'poor',
    'critical',
  ];

  /// Still readable off the wire; never emit these.
  static const List<String> deprecated = <String>[];

  /// Legacy spelling -> canonical value.
  static const Map<String, String> aliases = <String, String>{};

  static const String onUnknown = 'reject';
  static const String aliasMatch = 'exact';

  /// See [resolveContractValue] — the Dart twin of the npm helper.
  static String? resolve(String? value) => resolveContractValue(
        value,
        values: values,
        aliases: aliases,
        deprecated: deprecated,
        onUnknown: onUnknown,
        aliasMatch: aliasMatch,
      );
}

/// Every notification kind the server can emit. Drives the notification inbox, the push payload `type`, and the per-type preference matrix.
abstract final class BabelNotificationType {
  static const List<String> values = <String>[
    'payment_due',
    'payment_overdue',
    'payment_succeeded',
    'payment_received',
    'payment_failed',
    'late_fee_assessed',
    'billing_run_summary',
    'arrears_run_summary',
    'invoice_paid',
    'invoice_payment_recorded',
    'invoice_partially_paid',
    'invoice_payment_voided',
    'payment_on_cancelled_invoice',
    'invoice_payment_failed',
    'invoice_refunded',
    'invoice_partially_refunded',
    'bill_pending_approval',
    'bill_approved',
    'bill_rejected',
    'bill_paid',
    'bill_payment_voided',
    'purchase_order_pending_approval',
    'purchase_order_auto_approved_digest',
    'purchase_order_approved',
    'purchase_order_rejected',
    'purchase_order_cancelled',
    'bill_auto_approved_digest',
    'vendor_pending_approval',
    'vendor_block_overridden',
    'vendor_approved',
    'vendor_rejected',
    'vendor_blanket_flagged',
    'vendor_blanket_cleared',
    'vendor_blanket_rejected',
    'accounting_period_reopened',
    'year_end_closed',
    'opening_balance_restated',
    'violation_issued',
    'violation_updated',
    'violation_resolved',
    'violation_status_changed',
    'violation_reminder',
    'violation_overdue',
    'violation_final_notice',
    'violation_fine',
    'violation_fine_reversed',
    'violation_comment_added',
    'litigation_created',
    'litigation_status_changed',
    'insurance_expiring',
    'budget_acknowledgement_requested',
    'budget_acknowledgement_completed',
    'budget_vote_cast',
    'owner_statement_delivered',
    'community_event_created',
    'community_event_reminder',
    'amenity_booking_confirmed',
    'amenity_booking_cancelled',
    'general_announcement',
    'emergency_alert',
    'task_assigned',
    'service_task_assigned',
    'task_status_changed',
    'task_started',
    'task_completed',
    'task_paused',
    'task_recurrence_generated',
    'task_time_logged',
    'task_approved',
    'task_rejected',
    'task_verified',
    'vendor_claimed',
    'vendor_email_change_requested',
    'vendor_email_change_decided',
    'vendor_profile_updated',
    'task_comment_added',
    'new_device_login',
    'otp_method_changed',
    'chat_message',
    'sms_reply_received',
    'moving_request_created',
    'moving_status_changed',
    'membership_request_submitted',
    'membership_request_accepted',
    'membership_request_rejected',
    'membership_invited',
    'membership_revoked',
    'quote_part_issued',
    'quote_part_settlement_undone',
    'schedule_pending_approval',
    'schedule_approved',
    'schedule_rejected',
    'schedule_pre_debit_reminder',
    'schedule_payment_succeeded',
    'schedule_payment_failed',
    'schedule_first_late_notice',
    'schedule_second_late_notice',
    'schedule_bank_connected',
    'schedule_cancelled',
    'schedule_funds_check_reminder',
    'plaid_low_balance_alert',
    'lease_chat_message',
    'lease_expired',
    'lease_esign_sent',
    'lease_esign_viewed',
    'lease_esign_signed',
    'lease_esign_completed',
    'lease_esign_declined',
    'lease_esign_expired',
    'lease_esign_revoked',
    'lease_esign_send_failed',
    'lease_esign_before_expiry',
    'lease_accepted',
    'lease_signed',
    'lease_activated',
    'lease_cancelled',
    'lease_terminated',
    'lease_termination_requested',
    'task_access_requested',
    'task_access_responded',
    'access_code_set',
    'email_moved',
    'contact_claim_attempt',
    'survey_invite',
  ];

  /// Still readable off the wire; never emit these.
  static const List<String> deprecated = <String>[
    'maintenance_scheduled',
    'maintenance_completed',
    'maintenance_delayed',
  ];

  /// Legacy spelling -> canonical value.
  static const Map<String, String> aliases = <String, String>{};

  static const String onUnknown = 'preserve';
  static const String aliasMatch = 'exact';

  /// See [resolveContractValue] — the Dart twin of the npm helper.
  static String? resolve(String? value) => resolveContractValue(
        value,
        values: values,
        aliases: aliases,
        deprecated: deprecated,
        onUnknown: onUnknown,
        aliasMatch: aliasMatch,
      );
}

/// Priority tier of a maintenance task or service request.
abstract final class BabelTaskPriority {
  static const List<String> values = <String>[
    'taskPriorityLow',
    'taskPriorityMedium',
    'taskPriorityHigh',
    'taskPriorityCritical',
  ];

  /// Still readable off the wire; never emit these.
  static const List<String> deprecated = <String>[];

  /// Legacy spelling -> canonical value.
  static const Map<String, String> aliases = <String, String>{
    'low': 'taskPriorityLow',
    'medium': 'taskPriorityMedium',
    'high': 'taskPriorityHigh',
    'urgent': 'taskPriorityCritical',
    'emergency': 'taskPriorityCritical',
    'critical': 'taskPriorityCritical',
    'taskPriorityUrgent': 'taskPriorityCritical',
  };

  static const String onUnknown = 'reject';
  static const String aliasMatch = 'case-insensitive';

  /// See [resolveContractValue] — the Dart twin of the npm helper.
  static String? resolve(String? value) => resolveContractValue(
        value,
        values: values,
        aliases: aliases,
        deprecated: deprecated,
        onUnknown: onUnknown,
        aliasMatch: aliasMatch,
      );
}

/// Lifecycle status of a task. Since the 2026-07-27 vocabulary split, maintenance tasks and service requests DO NOT share one status list — use the `subsets` below rather than `values` when rendering a picker.
abstract final class BabelTaskStatus {
  static const List<String> values = <String>[
    'taskStatusActive',
    'taskStatusBlocked',
    'taskStatusRetired',
    'taskStatusCompleted',
    'taskStatusSkipped',
    'taskStatusMissed',
    'taskStatusSubmitted',
    'taskStatusApproved',
    'taskStatusInProgress',
    'taskStatusCancelled',
    'taskStatusRejected',
  ];

  /// Still readable off the wire; never emit these.
  static const List<String> deprecated = <String>[
    'taskStatusToDo',
    'taskStatusOnHold',
  ];

  /// Legacy spelling -> canonical value.
  static const Map<String, String> aliases = <String, String>{
    'taskStatusNotStarted': 'taskStatusToDo',
    'taskStatusStarted': 'taskStatusInProgress',
  };

  static const List<String> maintenance = <String>[
    'taskStatusActive',
    'taskStatusBlocked',
    'taskStatusRetired',
    'taskStatusCompleted',
    'taskStatusSkipped',
    'taskStatusMissed',
  ];

  static const List<String> service = <String>[
    'taskStatusSubmitted',
    'taskStatusApproved',
    'taskStatusInProgress',
    'taskStatusBlocked',
    'taskStatusCompleted',
    'taskStatusCancelled',
    'taskStatusRejected',
  ];

  static const List<String> writableMaintenance = <String>[
    'taskStatusActive',
    'taskStatusBlocked',
    'taskStatusRetired',
    'taskStatusCompleted',
  ];

  static const List<String> writableService = <String>[
    'taskStatusApproved',
    'taskStatusInProgress',
    'taskStatusBlocked',
    'taskStatusCompleted',
    'taskStatusCancelled',
  ];

  static const String onUnknown = 'reject';
  static const String aliasMatch = 'exact';

  /// See [resolveContractValue] — the Dart twin of the npm helper.
  static String? resolve(String? value) => resolveContractValue(
        value,
        values: values,
        aliases: aliases,
        deprecated: deprecated,
        onUnknown: onUnknown,
        aliasMatch: aliasMatch,
      );
}

/// The trade a vendor practises. Stored as free text in `providers.type` and `tasks.category`, and read by the CAPEX/OPEX classification engine.
abstract final class BabelVendorTradeType {
  static const List<String> values = <String>[
    'serviceProviderPlumbing',
    'serviceProviderElectrical',
    'serviceProviderHvac',
    'serviceProviderElevator',
    'serviceProviderRoofing',
    'serviceProviderFireProtection',
    'serviceProviderGeneralContractor',
    'serviceProviderProfessionalServices',
    'serviceProviderCleaningSanitation',
    'serviceProviderOutdoorGroundsMaintenance',
    'serviceProviderSafetySecurity',
    'serviceProviderPestControl',
    'serviceProviderWasteManagement',
    'serviceProviderEngineering',
    'serviceProviderArchitecture',
    'serviceProviderLegal',
    'serviceProviderAccounting',
    'serviceProviderInsurance',
    'serviceProviderGeneralMaintenanceRepair',
    'serviceProviderSpecialtyServices',
    'serviceProviderNotary',
    'serviceProviderRealtor',
    'serviceProviderOther',
  ];

  /// Still readable off the wire; never emit these.
  static const List<String> deprecated = <String>[];

  /// Legacy spelling -> canonical value.
  static const Map<String, String> aliases = <String, String>{
    'plumbing': 'serviceProviderPlumbing',
    'electrical': 'serviceProviderElectrical',
    'hvac': 'serviceProviderHvac',
    'elevator': 'serviceProviderElevator',
    'roofing': 'serviceProviderRoofing',
    'fireProtection': 'serviceProviderFireProtection',
    'generalContractor': 'serviceProviderGeneralContractor',
    'professionalServices': 'serviceProviderProfessionalServices',
    'cleaningSanitation': 'serviceProviderCleaningSanitation',
    'outdoorGroundsMaintenance': 'serviceProviderOutdoorGroundsMaintenance',
    'safetySecurity': 'serviceProviderSafetySecurity',
    'pestControl': 'serviceProviderPestControl',
    'wasteManagement': 'serviceProviderWasteManagement',
    'engineering': 'serviceProviderEngineering',
    'architecture': 'serviceProviderArchitecture',
    'legal': 'serviceProviderLegal',
    'accounting': 'serviceProviderAccounting',
    'insurance': 'serviceProviderInsurance',
    'generalMaintenanceRepair': 'serviceProviderGeneralMaintenanceRepair',
    'specialtyServices': 'serviceProviderSpecialtyServices',
    'notary': 'serviceProviderNotary',
    'realtor': 'serviceProviderRealtor',
    'other': 'serviceProviderOther',
  };

  static const String onUnknown = 'preserve';
  static const String aliasMatch = 'case-insensitive';

  /// See [resolveContractValue] — the Dart twin of the npm helper.
  static String? resolve(String? value) => resolveContractValue(
        value,
        values: values,
        aliases: aliases,
        deprecated: deprecated,
        onUnknown: onUnknown,
        aliasMatch: aliasMatch,
      );
}

/// Numeric and string bounds more than one repo enforces independently.
abstract final class BabelLimits {
  static const int otpCodeLength = 6;
  static const int otpExpiryMinutes = 10;
  static const int quotaPercentMin = 0;
  static const int quotaPercentMax = 100;
  static const int accountingDescriptionMaxLength = 500;
  static const int notificationInboxPageSize = 20;
  static const int notificationInboxPageSizeMax = 50;
  static const int paymentScheduleCountMin = 1;
  static const int paymentScheduleCountMax = 24;
  static const int taskRejectionReasonMinLength = 3;
  static const int taskRejectionReasonMaxLength = 1000;
  static const int buildingComponentUniformatCodeMaxLength = 20;
  static const int buildingComponentNameMaxLength = 255;
  static const int buildingComponentNotesMaxLength = 2000;
  static const int unitNameMaxLength = 255;
  static const int unitAddressMaxLength = 500;
  static const int unitFloorNameMaxLength = 255;
  static const int unitDescriptionMaxLength = 2000;
  static const int unitLotNumberMaxLength = 50;
  static const int unitFlooringTypeMaxLength = 100;
  static const int unitHeatingTypeMaxLength = 100;
  static const int unitCoolingTypeMaxLength = 100;
  static const int vendorNameMaxLength = 255;
  static const int vendorLicenseNumberMaxLength = 50;
  static const int vendorGstNumberMaxLength = 30;
  static const int vendorQstNumberMaxLength = 30;
  static const int vendorNeqNumberMaxLength = 20;
  static const int vendorInsurancePolicyNumberMaxLength = 100;
  static const int vendorInsuranceCoverageTypeMaxLength = 100;
  static const int groupChatNameMaxLength = 80;
}

/// Resolve one wire value against a contract: an alias maps to its canonical
/// value, a canonical or deprecated value passes through, and anything else
/// obeys [onUnknown] — `preserve` returns it verbatim, `reject` returns null.
///
/// Kept as a free function so the generated classes stay pure data.
String? resolveContractValue(
  String? value, {
  required List<String> values,
  required Map<String, String> aliases,
  required List<String> deprecated,
  required String onUnknown,
  required String aliasMatch,
}) {
  if (value == null) return null;
  String fold(String s) =>
      aliasMatch == 'case-insensitive' ? s.trim().toLowerCase() : s;
  final needle = fold(value);
  for (final v in values) {
    if (fold(v) == needle) return v;
  }
  for (final entry in aliases.entries) {
    if (fold(entry.key) == needle) return entry.value;
  }
  for (final v in deprecated) {
    if (fold(v) == needle) return v;
  }
  return onUnknown == 'preserve' ? value : null;
}
