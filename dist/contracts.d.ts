// Babel shared contracts — GENERATED from contracts/. Do not edit.

export declare const ERROR_CODES: {
  readonly PERMISSION_DENIED: 'error.auth.permission_denied';
  readonly INVALID_USER: 'error.auth.invalid_user';
  readonly UNAUTHORIZED: 'error.auth.unauthorized';
  readonly ACCOUNT_LOCKED: 'error.auth.account_locked';
  readonly INVALID_CREDENTIALS: 'error.auth.invalid_credentials';
  readonly INVALID_OTP: 'error.auth.invalid_otp';
  readonly OTP_EXPIRED: 'error.auth.otp_expired';
  readonly OTP_TOO_MANY_ATTEMPTS: 'error.auth.otp_too_many_attempts';
  readonly OTP_SEND_FAILED: 'error.auth.otp_send_failed';
  readonly OTP_RESEND_COOLDOWN: 'error.auth.otp_resend_cooldown';
  readonly ACCOUNT_CLAIMED: 'error.auth.account_claimed';
  readonly OTP_CONTACT_MISMATCH: 'error.auth.otp_contact_mismatch';
  readonly OTP_CONTACT_NOT_ON_ACCOUNT: 'error.auth.otp_contact_not_on_account';
  readonly EMAIL_ALREADY_REGISTERED: 'error.auth.email_already_registered';
  readonly PHONE_ALREADY_REGISTERED: 'error.auth.phone_already_registered';
  readonly INVALID_ASSOCIATION: 'error.association.invalid';
  readonly ASSOCIATION_NOT_FOUND: 'error.association.not_found';
  readonly ALREADY_MEMBER: 'error.association.already_member';
  readonly MEMBER_NOT_FOUND: 'error.association.member_not_found';
  readonly INVITE_CODE_INVALID: 'error.association.invite_code_invalid';
  readonly INVITE_ALREADY_ACCEPTED: 'error.association.invite_already_accepted';
  readonly MAX_UNITS_REACHED: 'error.association.max_units_reached';
  readonly OWNER_REQUIRED: 'error.association.owner_required';
  readonly OWNER_NOT_ALLOWED: 'error.association.owner_not_allowed';
  readonly ASSOCIATION_CONTEXT_MISMATCH: 'error.association.context_mismatch';
  readonly ADDRESS_ALREADY_IN_USE: 'error.association.address_already_in_use';
  readonly MANAGE_REQUEST_ALREADY_OPEN: 'error.association.manage_request_already_open';
  readonly MANAGE_REQUEST_NOT_FOUND: 'error.association.manage_request_not_found';
  readonly MANAGE_REQUEST_ALREADY_CONTRACTED: 'error.association.manage_request_already_contracted';
  readonly UNIT_NOT_FOUND: 'error.unit.not_found';
  readonly UNIT_ALREADY_EXISTS: 'error.unit.already_exists';
  readonly UNIT_INVALID_STATUS: 'error.unit.invalid_status';
  readonly UNIT_QUOTA_EXCEEDS_TOTAL: 'error.unit.quota_exceeds_total';
  readonly PAYMENT_FAILED: 'error.payment.failed';
  readonly PAYMENT_NOT_FOUND: 'error.payment.not_found';
  readonly PAYMENT_ALREADY_PROCESSED: 'error.payment.already_processed';
  readonly PAYMENT_IN_FLIGHT: 'error.payment.in_flight';
  readonly PAYMENT_ACCOUNT_NOT_ACCEPTING: 'error.payment.account_not_accepting';
  readonly PAYMENT_INVALID_AMOUNT: 'error.payment.invalid_amount';
  readonly PAYMENT_MISSING_ACCOUNT: 'error.payment.missing_account';
  readonly PAYMENT_METHOD_DISABLED: 'error.payment.method_disabled';
  readonly PAYMENT_LINK_EXPIRED: 'error.payment.link_expired';
  readonly PAYMENT_RELINK_REQUIRED: 'error.payment.relink_required';
  readonly PAYMENT_CONNECT_ACCOUNT_STALE: 'error.payment.connect_account_stale';
  readonly PAYMENT_UNLINK_ACTIVE_LEASES: 'error.payment.unlink_active_leases';
  readonly DUPLICATE_PAYMENT_SUSPECTED: 'error.payment.duplicate_suspected';
  readonly DUPLICATE_CHARGE_SUSPECTED: 'error.payment.duplicate_charge_suspected';
  readonly VIOLATION_NOT_FOUND: 'error.violation.not_found';
  readonly VIOLATION_PERMISSION_DENIED: 'error.violation.permission_denied';
  readonly TASK_NOT_FOUND: 'error.task.not_found';
  readonly TASK_ALREADY_COMPLETED: 'error.task.already_completed';
  readonly TASK_AI_UNAVAILABLE: 'error.task.ai_unavailable';
  readonly TASK_AI_FAILED: 'error.task.ai_failed';
  readonly TASK_AI_TIER_REQUIRED: 'error.task.ai_tier_required';
  readonly TASK_OCCURRENCE_IMMUTABLE: 'error.task.occurrence_immutable';
  readonly TASK_DOCUMENT_IMMUTABLE: 'error.task.document_immutable';
  readonly TASK_DOCUMENT_DELETE_DENIED: 'error.task.document_delete_denied';
  readonly BOOKING_CONFLICT: 'error.booking.conflict';
  readonly BOOKING_NOT_FOUND: 'error.booking.not_found';
  readonly AMENITY_NOT_FOUND: 'error.amenity.not_found';
  readonly AMENITY_INVALID: 'error.amenity.invalid';
  readonly MOVING_NOT_FOUND: 'error.moving.not_found';
  readonly MOVING_CONFLICT: 'error.moving.conflict';
  readonly MOVING_INVALID_DATE: 'error.moving.invalid_date';
  readonly MOVING_INVALID_TIME: 'error.moving.invalid_time';
  readonly DOCUMENT_NOT_FOUND: 'error.document.not_found';
  readonly BUDGET_NOT_FOUND: 'error.budget.not_found';
  readonly BUDGET_ALREADY_ACTIVE: 'error.budget.already_active';
  readonly BUDGET_CATEGORY_NOT_FOUND: 'error.budget.category_not_found';
  readonly BUDGET_CATEGORY_DUPLICATE: 'error.budget.category_duplicate';
  readonly BUDGET_VOTING_NOT_FOUND: 'error.budget.voting_not_found';
  readonly CHARGE_POOL_NOT_FOUND: 'error.charge_pool.not_found';
  readonly CHARGE_POOL_WEIGHTS_INVALID: 'error.charge_pool.weights_invalid';
  readonly LEASE_NOT_FOUND: 'error.lease.not_found';
  readonly LEASE_ALREADY_ACTIVE: 'error.lease.already_active';
  readonly LEASE_INVALID_DATES: 'error.lease.invalid_dates';
  readonly LEASE_PERMISSION_DENIED: 'error.lease.permission_denied';
  readonly ANNOUNCEMENT_NOT_FOUND: 'error.announcement.not_found';
  readonly ANNOUNCEMENT_ALREADY_APPROVED: 'error.announcement.already_approved';
  readonly ANNOUNCEMENT_INVALID_DATES: 'error.announcement.invalid_dates';
  readonly INSURANCE_NOT_FOUND: 'error.insurance.not_found';
  readonly LITIGATION_NOT_FOUND: 'error.litigation.not_found';
  readonly LITIGATION_COMPLETE_MODE_REQUIRED: 'error.litigation.complete_mode_required';
  readonly ATTESTATION_NOT_FOUND: 'error.attestation.not_found';
  readonly ATTESTATION_INVALID: 'error.attestation.invalid';
  readonly ATTESTATION_PERMISSION_DENIED: 'error.attestation.permission_denied';
  readonly ATTESTATION_SNAPSHOT_FAILED: 'error.attestation.snapshot_failed';
  readonly SALE_NOT_FOUND: 'error.sale.not_found';
  readonly SALE_NOT_OWNER: 'error.sale.not_owner';
  readonly SALE_ALREADY_LISTED: 'error.sale.already_listed';
  readonly SALE_NOT_LISTED: 'error.sale.not_listed';
  readonly OCCUPANCY_NOT_FOUND: 'error.occupancy.not_found';
  readonly OCCUPANCY_INVALID_DATES: 'error.occupancy.invalid_dates';
  readonly OCCUPANCY_OVERLAP: 'error.occupancy.overlap';
  readonly VEHICLE_NOT_FOUND: 'error.vehicle.not_found';
  readonly VEHICLE_PERMISSION_DENIED: 'error.vehicle.permission_denied';
  readonly SCHEDULE_NOT_FOUND: 'error.schedule.not_found';
  readonly SCHEDULE_INVALID_DATES: 'error.schedule.invalid_dates';
  readonly SCHEDULE_ALREADY_PROCESSED: 'error.schedule.already_processed';
  readonly SCHEDULE_PERMISSION_DENIED: 'error.schedule.permission_denied';
  readonly SCHEDULE_INVALID_STATUS: 'error.schedule.invalid_status';
  readonly CHAT_DISABLED: 'error.chat.disabled';
  readonly CHAT_PERMISSION_DENIED: 'error.chat.permission_denied';
  readonly CHAT_TARGET_NOT_MEMBER: 'error.chat.target_not_member';
  readonly CHAT_CHANNEL_NOT_FOUND: 'error.chat.channel_not_found';
  readonly CHAT_POLICY_UNAVAILABLE: 'error.chat.policy_unavailable';
  readonly SUBSCRIPTION_NOT_FOUND: 'error.subscription.not_found';
  readonly SUBSCRIPTION_ALREADY_CANCELLED: 'error.subscription.already_cancelled';
  readonly SUBSCRIPTION_TRIAL_ACTIVE: 'error.subscription.trial_active';
  readonly IMPORT_SESSION_NOT_FOUND: 'error.import.session_not_found';
  readonly IMPORT_INVALID_FILE: 'error.import.invalid_file';
  readonly IMPORT_UNAUTHORIZED: 'error.import.unauthorized';
  readonly IMPORT_VALIDATION_FAILED: 'error.import.validation_failed';
  readonly IMPORT_AI_UNAVAILABLE: 'error.import.ai_unavailable';
  readonly IMPORT_AI_EXTRACTION_FAILED: 'error.import.ai_extraction_failed';
  readonly IMPORT_SCHEMA_OUT_OF_DATE: 'error.import.schema_out_of_date';
  readonly IMPORT_STORAGE_UNAVAILABLE: 'error.import.storage_unavailable';
  readonly IMPORT_BAD_VALUE: 'error.import.bad_value';
  readonly IMPORT_UNEXPECTED: 'error.import.unexpected';
  readonly STORAGE_DOWNLOAD_DENIED: 'error.storage.download_denied';
  readonly DOWNTIME_NOT_FOUND: 'error.downtime.not_found';
  readonly DOWNTIME_INVALID_DATE: 'error.downtime.invalid_date';
  readonly GARBAGE_SCHEDULE_NOT_FOUND: 'error.garbage.schedule_not_found';
  readonly SESSION_NOT_FOUND: 'error.session.not_found';
  readonly SESSION_EXPIRED: 'error.session.expired';
  readonly SESSION_INVALID_TOKEN: 'error.session.invalid_token';
  readonly PORTAL_NOT_FOUND: 'error.portal.not_found';
  readonly PORTAL_INVALID_CONFIG: 'error.portal.invalid_config';
  readonly TRADE_ACCESS_DENIED: 'error.trade.access_denied';
  readonly TRADE_CONTRACT_NOT_FOUND: 'error.trade.contract_not_found';
  readonly COMPONENT_NOT_FOUND: 'error.component.not_found';
  readonly COMPONENT_INVALID: 'error.component.invalid';
  readonly SCENARIO_NOT_FOUND: 'error.scenario.not_found';
  readonly SCENARIO_INVALID: 'error.scenario.invalid';
  readonly RECONSTRUCTION_VALUE_REQUIRED: 'error.scenario.reconstruction_value_required';
  readonly ANNUAL_CONDO_FEES_REQUIRED: 'error.scenario.annual_condo_fees_required';
  readonly RESERVE_BALANCE_NOT_SET: 'error.scenario.reserve_balance_not_set';
  readonly LEDGER_ENTRY_UNBALANCED: 'error.ledger.entry_unbalanced';
  readonly LEDGER_ACCOUNT_NOT_FOUND: 'error.ledger.account_not_found';
  readonly LEDGER_ACCOUNT_CODE_DUPLICATE: 'error.ledger.account_code_duplicate';
  readonly LEDGER_PERIOD_LOCKED: 'error.ledger.period_locked';
  readonly LEDGER_SYSTEM_ACCOUNT_PROTECTED: 'error.ledger.system_account_protected';
  readonly LEDGER_NOT_SEEDED: 'error.ledger.not_seeded';
  readonly LEDGER_ACCOUNT_INACTIVE: 'error.ledger.account_inactive';
  readonly LEDGER_BASIS_LOCKED: 'error.ledger.basis_locked';
  readonly LEDGER_OPENING_BALANCE_LOCKED: 'error.ledger.opening_balance_locked';
  readonly LEDGER_CURRENCY_LOCKED: 'error.ledger.currency_locked';
  readonly LEDGER_ACCOUNT_HAS_ENTRIES: 'error.ledger.account_has_entries';
  readonly LEDGER_ACCOUNT_HAS_CHILDREN: 'error.ledger.account_has_children';
  readonly LEDGER_ACCOUNT_HAS_RECONCILIATIONS: 'error.ledger.account_has_reconciliations';
  readonly AP_BILL_NOT_FOUND: 'error.ap.bill_not_found';
  readonly AP_BILL_INVALID_STATE: 'error.ap.bill_invalid_state';
  readonly AP_PROVIDER_NOT_FOUND: 'error.ap.provider_not_found';
  readonly AP_OVERPAYMENT: 'error.ap.overpayment';
  readonly AP_BILL_SELF_APPROVAL_FORBIDDEN: 'error.ap.self_approval_forbidden';
  readonly AP_BILL_ALREADY_APPROVED_BY_YOU: 'error.ap.bill_already_approved_by_you';
  readonly AP_BILL_PRESIDENT_APPROVAL_REQUIRED: 'error.ap.bill_president_approval_required';
  readonly AP_VENDOR_NOT_APPROVED: 'error.ap.vendor_not_approved';
  readonly AP_VENDOR_FLAGGED_REAPPROVAL_REQUIRED: 'error.ap.vendor_flagged_reapproval_required';
  readonly AP_PO_NOT_FOUND: 'error.ap.purchase_order_not_found';
  readonly AP_PO_NOT_OPEN: 'error.ap.purchase_order_not_open';
  readonly AP_PO_PROVIDER_MISMATCH: 'error.ap.purchase_order_provider_mismatch';
  readonly AP_PO_AMOUNT_EXCEEDED: 'error.ap.purchase_order_amount_exceeded';
  readonly PROVIDER_APPROVAL_INCOMPLETE_RECORD: 'error.provider.approval_incomplete_record';
  readonly TASK_VENDOR_NOT_APPROVED: 'error.task.vendor_not_approved';
  readonly TASK_VENDOR_OVERRIDE_REASON_REQUIRED: 'error.task.vendor_override_reason_required';
  readonly AP_CLASSIFICATION_OVERRIDE_REASON_REQUIRED: 'error.ap.classification_override_reason_required';
  readonly RECORD_VERIFICATION_ROUND_NOT_FOUND: 'error.verification.round_not_found';
  readonly RECORD_VERIFICATION_SELF_APPROVAL_FORBIDDEN: 'error.verification.self_approval_forbidden';
  readonly PROVIDER_BLANKET_INVALID: 'error.provider.blanket_invalid';
  readonly DUPLICATE_VENDOR_SUSPECTED: 'error.provider.duplicate_suspected';
  readonly AR_INVOICE_NOT_FOUND: 'error.ar.invoice_not_found';
  readonly AR_INVOICE_NOT_RECEIVABLE: 'error.ar.invoice_not_receivable';
  readonly AR_INVOICE_INVALID_STATE: 'error.ar.invoice_invalid_state';
  readonly AR_INVOICE_ALREADY_PAID: 'error.ar.invoice_already_paid';
  readonly AR_INVOICE_CANCELLED: 'error.ar.invoice_cancelled';
  readonly AR_OVERPAYMENT: 'error.ar.overpayment';
  readonly AR_INVOICE_HAS_PAYMENTS: 'error.ar.invoice_has_payments';
  readonly AR_INVOICE_PARTIALLY_PAID: 'error.ar.invoice_partially_paid';
  readonly CONTRACT_NOT_FOUND: 'error.contract.not_found';
  readonly CONTRACT_INVALID: 'error.contract.invalid';
  readonly DUE_NOT_FOUND: 'error.due.not_found';
  readonly DUE_ALREADY_PAID: 'error.due.already_paid';
  readonly DUE_CANCELLED: 'error.due.cancelled';
  readonly OWNER_STATEMENT_PERIOD_FINALIZED: 'error.owner_statement.period_finalized';
  readonly SIGNUP_NOT_FOUND: 'error.signup.not_found';
  readonly SIGNUP_ALREADY_VERIFIED: 'error.signup.already_verified';
  readonly SIGNUP_ALREADY_PAID: 'error.signup.already_paid';
  readonly SIGNUP_EXPIRED: 'error.signup.expired';
  readonly SIGNUP_INVALID_CODE: 'error.signup.invalid_code';
  readonly SIGNUP_RATE_LIMITED: 'error.signup.rate_limited';
  readonly SIGNUP_SERVICE_UNAVAILABLE: 'error.signup.service_unavailable';
  readonly EMAIL_TEMPLATE_NOT_FOUND: 'error.email_template.not_found';
  readonly COMPANY_NOT_FOUND: 'error.company.not_found';
  readonly COMPANY_MEMBER_EXISTS: 'error.company.member_exists';
  readonly COMPANY_ROLE_IN_USE: 'error.company.role_in_use';
  readonly COMPANY_HAS_ACTIVE_CONTRACTS: 'error.company.has_active_contracts';
  readonly COMPANY_MANAGED_CONTRACT: 'error.company.managed_contract';
  readonly LAST_OWNER_PROTECTED: 'error.company.last_owner_protected';
  readonly CONTRACT_NOT_PENDING_ACCEPTANCE: 'error.contract.not_pending_acceptance';
  readonly CONTRACT_TERMINATION_PENDING: 'error.contract.termination_pending';
  readonly SUBSCRIPTION_TIER_REQUIRED: 'error.subscription.tier_required';
  readonly VALIDATION_ERROR: 'error.generic.validation';
  readonly NOT_FOUND: 'error.generic.not_found';
  readonly CONFLICT: 'error.generic.conflict';
  readonly INTERNAL_ERROR: 'error.generic.internal';
  readonly SERVICE_UNAVAILABLE: 'error.generic.service_unavailable';
  readonly EMAIL_SEND_FAILED: 'error.generic.email_send_failed';
  readonly INVALID_ID: 'error.generic.invalid_id';
  readonly INVALID_DATE_FORMAT: 'error.generic.invalid_date_format';
  readonly RESOURCE_NOT_BELONGS: 'error.generic.resource_not_belongs';
  readonly RATE_LIMITED: 'error.generic.rate_limited';
  readonly MISSING_REQUIRED_FIELD: 'error.generic.missing_required_field';
  readonly INVALID_FILE_FORMAT: 'error.generic.invalid_file_format';
  readonly SMART_DEVICE_NOT_CONFIGURED: 'error.smart_device.not_configured';
};
/** Every value ERROR_CODES can hold. */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
/** Every KEY of ERROR_CODES (`'PERMISSION_DENIED'`), for exhaustive maps. */
export type ErrorCodeName = keyof typeof ERROR_CODES;

export declare const FIELD_ERROR_CODES: {
  readonly REQUIRED: 'error.field.required';
  readonly INVALID_TYPE: 'error.field.invalid_type';
  readonly TOO_SMALL: 'error.field.too_small';
  readonly TOO_BIG: 'error.field.too_big';
  readonly INVALID_EMAIL: 'error.field.invalid_email';
  readonly INVALID_URL: 'error.field.invalid_url';
  readonly INVALID_STRING: 'error.field.invalid_string';
  readonly INVALID_ENUM_VALUE: 'error.field.invalid_enum_value';
  readonly INVALID_DATE: 'error.field.invalid_date';
  readonly NOT_MULTIPLE_OF: 'error.field.not_multiple_of';
  readonly CUSTOM: 'error.field.custom';
  readonly UNKNOWN_KEY: 'error.field.unknown_key';
  readonly INVALID_LITERAL: 'error.field.invalid_literal';
  readonly INVALID_UNION: 'error.field.invalid_union';
  readonly NOT_FINITE: 'error.field.not_finite';
  readonly INVALID: 'error.field.invalid';
};
export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[keyof typeof FIELD_ERROR_CODES];
export type FieldErrorCodeName = keyof typeof FIELD_ERROR_CODES;

export declare const FIELD_ERROR_PARAMS: {
  readonly REQUIRED: readonly [];
  readonly INVALID_TYPE: readonly ['expected'];
  readonly TOO_SMALL: readonly ['min'];
  readonly TOO_BIG: readonly ['max'];
  readonly INVALID_EMAIL: readonly [];
  readonly INVALID_URL: readonly [];
  readonly INVALID_STRING: readonly [];
  readonly INVALID_ENUM_VALUE: readonly ['options'];
  readonly INVALID_DATE: readonly [];
  readonly NOT_MULTIPLE_OF: readonly ['multipleOf'];
  readonly CUSTOM: readonly [];
  readonly UNKNOWN_KEY: readonly ['keys'];
  readonly INVALID_LITERAL: readonly ['expected'];
  readonly INVALID_UNION: readonly [];
  readonly NOT_FINITE: readonly [];
  readonly INVALID: readonly [];
};

/** One entry of the `fieldErrors` array on a 400 response. */
export interface FieldError {
  /** Body-relative dotted path a client maps to an input; empty for form-level issues. */
  field: string;
  /** Full transport path including the scope segment (`body.email`). */
  path: string;
  /** A FieldErrorCode — but typed `string`: an older client meets newer codes. */
  code: string;
  /** Localized per the request's Accept-Language. The fallback when `code` is unknown. */
  message: string;
  /** Constraint values for rendering — see FIELD_ERROR_PARAMS. */
  params: Record<string, unknown>;
}

/** Physical condition of a building component. */
export declare const COMPONENT_CONDITION: {
  readonly values: readonly ['good', 'fair', 'poor', 'critical'];
  readonly deprecated: readonly [];
  readonly aliases: Readonly<Record<never, never>>;
  readonly onUnknown: 'reject';
  readonly aliasMatch: 'exact';
};
export type ComponentCondition = (typeof COMPONENT_CONDITION)['values'][number];

/** Every notification kind the server can emit. Drives the notification inbox, the push payload `type`, and the per-type preference matrix. */
export declare const NOTIFICATION_TYPE: {
  readonly values: readonly ['payment_due', 'payment_overdue', 'payment_succeeded', 'payment_received', 'payment_failed', 'late_fee_assessed', 'billing_run_summary', 'arrears_run_summary', 'invoice_paid', 'invoice_payment_recorded', 'invoice_partially_paid', 'invoice_payment_voided', 'payment_on_cancelled_invoice', 'invoice_payment_failed', 'invoice_refunded', 'invoice_partially_refunded', 'bill_pending_approval', 'bill_approved', 'bill_rejected', 'bill_paid', 'bill_payment_voided', 'purchase_order_pending_approval', 'purchase_order_auto_approved_digest', 'purchase_order_approved', 'purchase_order_rejected', 'purchase_order_cancelled', 'bill_auto_approved_digest', 'vendor_pending_approval', 'vendor_block_overridden', 'vendor_approved', 'vendor_rejected', 'vendor_blanket_flagged', 'vendor_blanket_cleared', 'vendor_blanket_rejected', 'accounting_period_reopened', 'year_end_closed', 'opening_balance_restated', 'violation_issued', 'violation_updated', 'violation_resolved', 'violation_status_changed', 'violation_reminder', 'violation_overdue', 'violation_final_notice', 'violation_fine', 'violation_fine_reversed', 'violation_comment_added', 'litigation_created', 'litigation_status_changed', 'insurance_expiring', 'budget_acknowledgement_requested', 'budget_acknowledgement_completed', 'budget_vote_cast', 'owner_statement_delivered', 'community_event_created', 'community_event_reminder', 'amenity_booking_confirmed', 'amenity_booking_cancelled', 'general_announcement', 'emergency_alert', 'task_assigned', 'service_task_assigned', 'task_status_changed', 'task_started', 'task_completed', 'task_paused', 'task_recurrence_generated', 'task_time_logged', 'task_approved', 'task_rejected', 'task_verified', 'vendor_claimed', 'vendor_email_change_requested', 'vendor_email_change_decided', 'vendor_profile_updated', 'task_comment_added', 'new_device_login', 'otp_method_changed', 'chat_message', 'sms_reply_received', 'moving_request_created', 'moving_status_changed', 'membership_request_submitted', 'membership_request_accepted', 'membership_request_rejected', 'membership_invited', 'membership_revoked', 'quote_part_issued', 'quote_part_settlement_undone', 'schedule_pending_approval', 'schedule_approved', 'schedule_rejected', 'schedule_pre_debit_reminder', 'schedule_payment_succeeded', 'schedule_payment_failed', 'schedule_first_late_notice', 'schedule_second_late_notice', 'schedule_bank_connected', 'schedule_cancelled', 'schedule_funds_check_reminder', 'plaid_low_balance_alert', 'lease_chat_message', 'lease_expired', 'lease_esign_sent', 'lease_esign_viewed', 'lease_esign_signed', 'lease_esign_completed', 'lease_esign_declined', 'lease_esign_expired', 'lease_esign_revoked', 'lease_esign_send_failed', 'lease_esign_before_expiry', 'lease_accepted', 'lease_signed', 'lease_activated', 'lease_cancelled', 'lease_terminated', 'lease_termination_requested', 'task_access_requested', 'task_access_responded', 'access_code_set', 'email_moved', 'contact_claim_attempt', 'survey_invite'];
  readonly deprecated: readonly ['maintenance_scheduled', 'maintenance_completed', 'maintenance_delayed'];
  readonly aliases: Readonly<Record<never, never>>;
  readonly onUnknown: 'preserve';
  readonly aliasMatch: 'exact';
};
export type NotificationType = (typeof NOTIFICATION_TYPE)['values'][number];
/** NotificationType plus the values still readable off the wire. Use this for a PARSER, `NotificationType` for a WRITER. */
export type NotificationTypeOrDeprecated = NotificationType | (typeof NOTIFICATION_TYPE)['deprecated'][number];

/** Priority tier of a maintenance task or service request. */
export declare const TASK_PRIORITY: {
  readonly values: readonly ['taskPriorityLow', 'taskPriorityMedium', 'taskPriorityHigh', 'taskPriorityCritical'];
  readonly deprecated: readonly [];
  readonly aliases: {
    readonly 'low': 'taskPriorityLow';
    readonly 'medium': 'taskPriorityMedium';
    readonly 'high': 'taskPriorityHigh';
    readonly 'urgent': 'taskPriorityCritical';
    readonly 'emergency': 'taskPriorityCritical';
    readonly 'critical': 'taskPriorityCritical';
    readonly 'taskPriorityUrgent': 'taskPriorityCritical';
  };
  readonly onUnknown: 'reject';
  readonly aliasMatch: 'case-insensitive';
};
export type TaskPriority = (typeof TASK_PRIORITY)['values'][number];

/** Lifecycle status of a task. Since the 2026-07-27 vocabulary split, maintenance tasks and service requests DO NOT share one status list — use the `subsets` below rather than `values` when rendering a picker. */
export declare const TASK_STATUS: {
  readonly values: readonly ['taskStatusActive', 'taskStatusBlocked', 'taskStatusRetired', 'taskStatusCompleted', 'taskStatusSkipped', 'taskStatusMissed', 'taskStatusSubmitted', 'taskStatusApproved', 'taskStatusInProgress', 'taskStatusCancelled', 'taskStatusRejected'];
  readonly deprecated: readonly ['taskStatusToDo', 'taskStatusOnHold'];
  readonly aliases: {
    readonly 'taskStatusNotStarted': 'taskStatusToDo';
    readonly 'taskStatusStarted': 'taskStatusInProgress';
  };
  readonly subsets: {
    readonly maintenance: readonly ['taskStatusActive', 'taskStatusBlocked', 'taskStatusRetired', 'taskStatusCompleted', 'taskStatusSkipped', 'taskStatusMissed'];
    readonly service: readonly ['taskStatusSubmitted', 'taskStatusApproved', 'taskStatusInProgress', 'taskStatusBlocked', 'taskStatusCompleted', 'taskStatusCancelled', 'taskStatusRejected'];
    readonly writableMaintenance: readonly ['taskStatusActive', 'taskStatusBlocked', 'taskStatusRetired', 'taskStatusCompleted'];
    readonly writableService: readonly ['taskStatusApproved', 'taskStatusInProgress', 'taskStatusBlocked', 'taskStatusCompleted', 'taskStatusCancelled'];
  };
  readonly onUnknown: 'reject';
  readonly aliasMatch: 'exact';
};
export type TaskStatus = (typeof TASK_STATUS)['values'][number];
/** TaskStatus plus the values still readable off the wire. Use this for a PARSER, `TaskStatus` for a WRITER. */
export type TaskStatusOrDeprecated = TaskStatus | (typeof TASK_STATUS)['deprecated'][number];

/** The trade a vendor practises. Stored as free text in `providers.type` and `tasks.category`, and read by the CAPEX/OPEX classification engine. */
export declare const VENDOR_TRADE_TYPE: {
  readonly values: readonly ['serviceProviderPlumbing', 'serviceProviderElectrical', 'serviceProviderHvac', 'serviceProviderElevator', 'serviceProviderRoofing', 'serviceProviderFireProtection', 'serviceProviderGeneralContractor', 'serviceProviderProfessionalServices', 'serviceProviderCleaningSanitation', 'serviceProviderOutdoorGroundsMaintenance', 'serviceProviderSafetySecurity', 'serviceProviderPestControl', 'serviceProviderWasteManagement', 'serviceProviderEngineering', 'serviceProviderArchitecture', 'serviceProviderLegal', 'serviceProviderAccounting', 'serviceProviderInsurance', 'serviceProviderGeneralMaintenanceRepair', 'serviceProviderSpecialtyServices', 'serviceProviderNotary', 'serviceProviderRealtor', 'serviceProviderOther'];
  readonly deprecated: readonly [];
  readonly aliases: {
    readonly 'plumbing': 'serviceProviderPlumbing';
    readonly 'electrical': 'serviceProviderElectrical';
    readonly 'hvac': 'serviceProviderHvac';
    readonly 'elevator': 'serviceProviderElevator';
    readonly 'roofing': 'serviceProviderRoofing';
    readonly 'fireProtection': 'serviceProviderFireProtection';
    readonly 'generalContractor': 'serviceProviderGeneralContractor';
    readonly 'professionalServices': 'serviceProviderProfessionalServices';
    readonly 'cleaningSanitation': 'serviceProviderCleaningSanitation';
    readonly 'outdoorGroundsMaintenance': 'serviceProviderOutdoorGroundsMaintenance';
    readonly 'safetySecurity': 'serviceProviderSafetySecurity';
    readonly 'pestControl': 'serviceProviderPestControl';
    readonly 'wasteManagement': 'serviceProviderWasteManagement';
    readonly 'engineering': 'serviceProviderEngineering';
    readonly 'architecture': 'serviceProviderArchitecture';
    readonly 'legal': 'serviceProviderLegal';
    readonly 'accounting': 'serviceProviderAccounting';
    readonly 'insurance': 'serviceProviderInsurance';
    readonly 'generalMaintenanceRepair': 'serviceProviderGeneralMaintenanceRepair';
    readonly 'specialtyServices': 'serviceProviderSpecialtyServices';
    readonly 'notary': 'serviceProviderNotary';
    readonly 'realtor': 'serviceProviderRealtor';
    readonly 'other': 'serviceProviderOther';
  };
  readonly onUnknown: 'preserve';
  readonly aliasMatch: 'case-insensitive';
};
export type VendorTradeType = (typeof VENDOR_TRADE_TYPE)['values'][number];

export declare const ENUMS: {
  readonly componentCondition: typeof COMPONENT_CONDITION;
  readonly notificationType: typeof NOTIFICATION_TYPE;
  readonly taskPriority: typeof TASK_PRIORITY;
  readonly taskStatus: typeof TASK_STATUS;
  readonly vendorTradeType: typeof VENDOR_TRADE_TYPE;
};

export declare const LIMITS: {
  readonly otpCodeLength: 6;
  readonly otpExpiryMinutes: 10;
  readonly quotaPercentMin: 0;
  readonly quotaPercentMax: 100;
  readonly accountingDescriptionMaxLength: 500;
  readonly notificationInboxPageSize: 20;
  readonly notificationInboxPageSizeMax: 50;
  readonly paymentScheduleCountMin: 1;
  readonly paymentScheduleCountMax: 24;
  readonly taskRejectionReasonMinLength: 3;
  readonly taskRejectionReasonMaxLength: 1000;
  readonly buildingComponentUniformatCodeMaxLength: 20;
  readonly buildingComponentNameMaxLength: 255;
  readonly buildingComponentNotesMaxLength: 2000;
  readonly unitNameMaxLength: 255;
  readonly unitAddressMaxLength: 500;
  readonly unitFloorNameMaxLength: 255;
  readonly unitDescriptionMaxLength: 2000;
  readonly unitLotNumberMaxLength: 50;
  readonly unitFlooringTypeMaxLength: 100;
  readonly unitHeatingTypeMaxLength: 100;
  readonly unitCoolingTypeMaxLength: 100;
  readonly vendorNameMaxLength: 255;
  readonly vendorLicenseNumberMaxLength: 50;
  readonly vendorGstNumberMaxLength: 30;
  readonly vendorQstNumberMaxLength: 30;
  readonly vendorNeqNumberMaxLength: 20;
  readonly vendorInsurancePolicyNumberMaxLength: 100;
  readonly vendorInsuranceCoverageTypeMaxLength: 100;
  readonly groupChatNameMaxLength: 80;
};

/** Shape shared by every enum contract above. */
export interface EnumContract {
  readonly values: readonly string[];
  readonly deprecated: readonly string[];
  readonly aliases: Readonly<Record<string, string>>;
  readonly subsets?: Readonly<Record<string, readonly string[]>>;
  readonly onUnknown: 'preserve' | 'reject';
  readonly aliasMatch: 'exact' | 'case-insensitive';
}

/**
 * Resolve a wire value against a contract. Returns the canonical value, or the
 * input verbatim when the contract preserves unknowns, or null when it rejects.
 */
export declare function resolveContractValue(
  contract: EnumContract,
  value: unknown,
): string | null;
