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
  static const String passkeyInvalid = 'error.auth.passkey_invalid';
  static const String passkeyUnavailable = 'error.auth.passkey_unavailable';
  static const String passkeyNotFound = 'error.auth.passkey_not_found';
  static const String passkeyLimit = 'error.auth.passkey_limit';
  static const String stepUpRequired = 'error.auth.step_up_required';
  static const String stepUpOtpInvalid = 'error.auth.step_up_otp_invalid';
  static const String emailAlreadyRegistered = 'error.auth.email_already_registered';
  static const String phoneAlreadyRegistered = 'error.auth.phone_already_registered';
  static const String contactBelongsToDeletedAccount = 'error.auth.contact_belongs_to_deleted_account';
  static const String registerRetired = 'error.auth.register_retired';
  static const String contactAddRequiresVerification = 'error.auth.contact_add_requires_verification';
  static const String contactNotConfirmed = 'error.auth.contact_not_confirmed';
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
  static const String associationResetEnvRefused = 'error.association.reset_env_refused';
  static const String associationResetProtected = 'error.association.reset_protected';
  static const String associationResetConfirmMismatch = 'error.association.reset_confirm_mismatch';
  static const String associationResetUnclassifiedTables = 'error.association.reset_unclassified_tables';
  static const String associationResetInProgress = 'error.association.reset_in_progress';
  static const String associationResetHasChildAssociations = 'error.association.reset_has_child_associations';
  static const String associationResetBlocked = 'error.association.reset_blocked';
  static const String addressAlreadyInUse = 'error.association.address_already_in_use';
  static const String associationAddressTooSparse = 'error.association.address_too_sparse';
  static const String manageRequestAlreadyOpen = 'error.association.manage_request_already_open';
  static const String manageRequestNotFound = 'error.association.manage_request_not_found';
  static const String seatRequestNotFound = 'error.association.seat_request_not_found';
  static const String lastBoardSeat = 'error.association.last_board_seat';
  static const String noBoardPermissionsLocked = 'error.association.no_board_permissions_locked';
  static const String seatRequestSelfReview = 'error.association.seat_request_self_review';
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
  static const String onlinePaymentsDisabled = 'error.payment.online_payments_disabled';
  static const String cardCostRecoveryDisabled = 'error.payment.card_cost_recovery_disabled';
  static const String savedCardRailClosed = 'error.payment.saved_card_rail_closed';
  static const String savedCardOwnerRequired = 'error.payment.saved_card_owner_required';
  static const String savedCardSetupIncomplete = 'error.payment.saved_card_setup_incomplete';
  static const String savedCardSetupStale = 'error.payment.saved_card_setup_stale';
  static const String savedCardInUseByAutopay = 'error.payment.saved_card_in_use_by_autopay';
  static const String savedCardRequired = 'error.payment.saved_card_required';
  static const String paymentSavedChargeInFlight = 'error.payment.saved_charge_in_flight';
  static const String paymentDeclined = 'error.payment.declined';
  static const String invoiceAutopayClosed = 'error.autopay.closed';
  static const String invoiceAutopayDisabledByHoa = 'error.autopay.disabled_by_hoa';
  static const String autopayUnitOnSchedule = 'error.autopay.unit_on_schedule';
  static const String autopayAlreadyEnrolledByOther = 'error.autopay.already_enrolled_by_other';
  static const String autopayArmingStale = 'error.autopay.arming_stale';
  static const String autopayCostRecoveryStale = 'error.autopay.cost_recovery_stale';
  static const String autopayCostRecoveryConsentRequired = 'error.autopay.cost_recovery_consent_required';
  static const String autopayArmingConfirmationRequired = 'error.autopay.arming_confirmation_required';
  static const String autopayArmingInvalidResolution = 'error.autopay.arming_invalid_resolution';
  static const String autopayInvalidStatus = 'error.autopay.invalid_status';
  static const String autopayNudgeCooldown = 'error.autopay.nudge_cooldown';
  static const String autopayNudgeNothingDue = 'error.autopay.nudge_nothing_due';
  static const String paymentLinkExpired = 'error.payment.link_expired';
  static const String paymentRelinkRequired = 'error.payment.relink_required';
  static const String paymentConnectAccountStale = 'error.payment.connect_account_stale';
  static const String paymentUnlinkActiveLeases = 'error.payment.unlink_active_leases';
  static const String duplicatePaymentSuspected = 'error.payment.duplicate_suspected';
  static const String duplicateChargeSuspected = 'error.payment.duplicate_charge_suspected';
  static const String duplicateJournalEntrySuspected = 'error.ledger.duplicate_journal_entry_suspected';
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
  static const String taskDocumentBacksReceipt = 'error.task.document_backs_receipt';
  static const String taskDocumentRenameDenied = 'error.task.document_rename_denied';
  static const String taskPrivate = 'error.task.private';
  static const String taskPrivateUnsupportedAction = 'error.task.private_unsupported_action';
  static const String taskPromotionForbidden = 'error.task.promotion_forbidden';
  static const String taskPromotionRequiresPermission = 'error.task.promotion_requires_permission';
  static const String taskTerminal = 'error.task.terminal';
  static const String taskDemoteVendorEngaged = 'error.task.demote_vendor_engaged';
  static const String taskDemoteVendorBoardEngaged = 'error.task.demote_vendor_board_engaged';
  static const String taskDemoteWorkStarted = 'error.task.demote_work_started';
  static const String taskDemoteBoardApproved = 'error.task.demote_board_approved';
  static const String taskPrivateOwnersRequiresOwner = 'error.task.private_owners_requires_owner';
  static const String taskTenantPrivateOnly = 'error.task.tenant_private_only';
  static const String taskNotBillable = 'error.task.not_billable';
  static const String taskChargeUnitAmbiguous = 'error.task.charge_unit_ambiguous';
  static const String taskChargeUnitUntagged = 'error.task.charge_unit_untagged';
  static const String receiptAlreadyCharged = 'error.task.receipt_already_charged';
  static const String receiptDeleteDenied = 'error.task.receipt_delete_denied';
  static const String receiptItemLocked = 'error.task.receipt_item_locked';
  static const String taskAssigneeNotInUnit = 'error.task.assignee_not_in_unit';
  static const String taskUnitResidencyRequired = 'error.task.unit_residency_required';
  static const String taskUnitsChanged = 'error.task.units_changed';
  static const String privateTaskUnitLocked = 'error.task.private_unit_locked';
  static const String taskUnitNotYours = 'error.task.unit_not_yours';
  static const String taskAccessNotRequested = 'error.task.access_not_requested';
  static const String taskAccessRemindTooSoon = 'error.task.access_remind_too_soon';
  static const String bookingConflict = 'error.booking.conflict';
  static const String bookingNotFound = 'error.booking.not_found';
  static const String amenityNotFound = 'error.amenity.not_found';
  static const String amenityInvalid = 'error.amenity.invalid';
  static const String movingNotFound = 'error.moving.not_found';
  static const String movingConflict = 'error.moving.conflict';
  static const String movingInvalidDate = 'error.moving.invalid_date';
  static const String movingInvalidTime = 'error.moving.invalid_time';
  static const String documentNotFound = 'error.document.not_found';
  static const String associationDocumentUnitNotAllowed = 'error.association_document.unit_not_allowed';
  static const String documentAudienceNotAllowed = 'error.document.audience_not_allowed';
  static const String documentFileNotAttachable = 'error.document.file_not_attachable';
  static const String folderScopeChangeNotEmpty = 'error.folder.scope_change_not_empty';
  static const String folderParentOtherScope = 'error.folder.parent_other_scope';
  static const String unitDocumentWriteDenied = 'error.unit_document.write_denied';
  static const String folderHoldsUnreadableFiles = 'error.folder.holds_unreadable_files';
  static const String placeholderWriteDenied = 'error.placeholder.write_denied';
  static const String placeholderAudienceMismatch = 'error.placeholder.audience_mismatch';
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
  static const String leaseDatesOverlap = 'error.lease.overlap';
  static const String leaseRealtorNotAssigned = 'error.lease.unassigned';
  static const String announcementNotFound = 'error.announcement.not_found';
  static const String announcementAlreadyApproved = 'error.announcement.already_approved';
  static const String announcementInvalidDates = 'error.announcement.invalid_dates';
  static const String insuranceNotFound = 'error.insurance.not_found';
  static const String claimNotFound = 'error.claim.not_found';
  static const String declarationAmendmentNotFound = 'error.declaration_amendment.not_found';
  static const String declarationAmendmentBylawsNotRegistrable = 'error.declaration_amendment.bylaws_not_registrable';
  static const String placeholderSystemReadOnly = 'error.placeholder.system_read_only';
  static const String litigationNotFound = 'error.litigation.not_found';
  static const String litigationCompleteModeRequired = 'error.litigation.complete_mode_required';
  static const String attestationNotFound = 'error.attestation.not_found';
  static const String attestationInvalid = 'error.attestation.invalid';
  static const String attestationPermissionDenied = 'error.attestation.permission_denied';
  static const String attestationSnapshotFailed = 'error.attestation.snapshot_failed';
  static const String attestationItemNotFound = 'error.attestation.item_not_found';
  static const String attestationLimitReached = 'error.attestation.limit_reached';
  static const String informationShareNotFound = 'error.information_share.not_found';
  static const String informationShareInvalid = 'error.information_share.invalid';
  static const String informationSharePermissionDenied = 'error.information_share.permission_denied';
  static const String informationShareUnavailable = 'error.information_share.unavailable';
  static const String informationShareSectionDenied = 'error.information_share.section_denied';
  static const String informationShareLocked = 'error.information_share.locked';
  static const String sharePackageRequestNotFound = 'error.information_share.package_request_not_found';
  static const String sharePackageRequestClosed = 'error.information_share.package_request_closed';
  static const String sharePackageRequestDuplicate = 'error.information_share.package_request_duplicate';
  static const String saleNotFound = 'error.sale.not_found';
  static const String saleNotOwner = 'error.sale.not_owner';
  static const String saleMandateAlreadyRequested = 'error.sale.mandate_already_requested';
  static const String saleMandateNotVerified = 'error.sale.mandate_not_verified';
  static const String saleMandateNoMatch = 'error.sale.mandate_no_match';
  static const String contractInvalidTerm = 'error.contract.invalid_term';
  static const String saleAlreadyListed = 'error.sale.already_listed';
  static const String saleNotListed = 'error.sale.not_listed';
  static const String saleViewNotAuthorized = 'error.sale.view_not_authorized';
  static const String saleSellerNotOwner = 'error.sale.seller_not_owner';
  static const String saleSellersBoardOnly = 'error.sale.sellers_board_only';
  static const String listingNotFound = 'error.listing.not_found';
  static const String listingNotAuthorized = 'error.listing.not_authorized';
  static const String listingInvalidSubject = 'error.listing.invalid_subject';
  static const String listingAlreadyActive = 'error.listing.already_active';
  static const String listingNotActive = 'error.listing.not_active';
  static const String listingHasActiveSale = 'error.listing.has_active_sale';
  static const String listingCompleteHasActiveSale = 'error.listing.complete_has_active_sale';
  static const String parkingSpaceNotFound = 'error.parking_space.not_found';
  static const String parkingSpaceCountMode = 'error.parking_space.count_mode';
  static const String parkingSpaceIdentifierTaken = 'error.parking_space.identifier_taken';
  static const String parkingSpaceAlreadyAssigned = 'error.parking_space.already_assigned';
  static const String parkingSpaceFamilyChange = 'error.parking_space.family_change';
  static const String parkingSpaceDeededLotNeedsLotNumber = 'error.parking_space.deeded_lot_needs_lot_number';
  static const String parkingSpaceStorageFields = 'error.parking_space.storage_fields';
  static const String handoffNotFound = 'error.handoff.not_found';
  static const String handoffNotAuthorized = 'error.handoff.not_authorized';
  static const String handoffInvalid = 'error.handoff.invalid';
  static const String handoffAlreadyActive = 'error.handoff.already_active';
  static const String handoffSettlementUnresolved = 'error.handoff.settlement_unresolved';
  static const String handoffMoneyUnresolved = 'error.handoff.money_unresolved';
  static const String handoffMoneySettling = 'error.handoff.money_settling';
  static const String handoffMoneyWaiverForbidden = 'error.handoff.money_waiver_forbidden';
  static const String handoffMoneyCheckUnavailable = 'error.handoff.money_check_unavailable';
  static const String handoffItemNotFound = 'error.handoff.item_not_found';
  static const String handoffDocumentNotFound = 'error.handoff.document_not_found';
  static const String handoffPartyNotFound = 'error.handoff.party_not_found';
  static const String handoffDispositionNotFound = 'error.handoff.disposition_not_found';
  static const String handoffDispositionExecuted = 'error.handoff.disposition_executed';
  static const String handoffPartyOccupancyLocked = 'error.handoff.party_occupancy_locked';
  static const String occupancyNotFound = 'error.occupancy.not_found';
  static const String occupancyInvalidDates = 'error.occupancy.invalid_dates';
  static const String occupancyOverlap = 'error.occupancy.overlap';
  static const String vehicleNotFound = 'error.vehicle.not_found';
  static const String vehiclePermissionDenied = 'error.vehicle.permission_denied';
  static const String vehicleDuplicatePlate = 'error.vehicle.duplicate_plate';
  static const String scheduleNotFound = 'error.schedule.not_found';
  static const String scheduleInvalidDates = 'error.schedule.invalid_dates';
  static const String scheduleAlreadyProcessed = 'error.schedule.already_processed';
  static const String scheduleAlreadyExists = 'error.schedule.already_exists';
  static const String scheduleCardLockedByActiveLease = 'error.schedule.card_locked_by_active_lease';
  static const String scheduleBankLockedByActiveLease = 'error.schedule.bank_locked_by_active_lease';
  static const String scheduleCardSetupIncomplete = 'error.schedule.card_setup_incomplete';
  static const String scheduleNoDesignatedPayer = 'error.schedule.no_designated_payer';
  static const String scheduleInvoiceUnitMismatch = 'error.schedule.invoice_unit_mismatch';
  static const String leaseStatusNotSchedulable = 'error.lease.status_not_schedulable';
  static const String leaseHasNoLessee = 'error.lease.no_lessee';
  static const String scheduleNoUpcomingPayments = 'error.schedule.no_upcoming_payments';
  static const String scheduleCreatorCannotBePayer = 'error.schedule.creator_is_payer';
  static const String unitCondoFeeNotConfigured = 'error.unit.condo_fee_not_configured';
  static const String scheduleTimelineTermsRequired = 'error.schedule.timeline_terms_required';
  static const String scheduleTimelineEmpty = 'error.schedule.timeline_empty';
  static const String scheduleNoLineItems = 'error.schedule.no_line_items';
  static const String scheduleArmingConfirmationRequired = 'error.schedule.arming_confirmation_required';
  static const String scheduleArmingStale = 'error.schedule.arming_stale';
  static const String scheduleArmingInvalidResolution = 'error.schedule.arming_invalid_resolution';
  static const String scheduleCollectNowUnavailable = 'error.schedule.collect_now_unavailable';
  static const String scheduleCollectNowStoodDown = 'error.schedule.collect_now_stood_down';
  static const String scheduleCollectNowFailed = 'error.schedule.collect_now_failed';
  static const String schedulePayNotApproved = 'error.schedule.pay_not_approved';
  static const String schedulePayArmRequired = 'error.schedule.pay_arm_required';
  static const String schedulePayUnknownLineItem = 'error.schedule.pay_unknown_line_item';
  static const String schedulePayAlreadySettled = 'error.schedule.pay_already_settled';
  static const String schedulePayNothingSelected = 'error.schedule.pay_nothing_selected';
  static const String schedulePayMethodUnavailable = 'error.schedule.pay_method_unavailable';
  static const String schedulePayExtraUnavailable = 'error.schedule.pay_extra_unavailable';
  static const String scheduleDeclarationNotFound = 'error.schedule.declaration_not_found';
  static const String scheduleDeclarationAlreadyResolved = 'error.schedule.declaration_already_resolved';
  static const String scheduleCostRecoveryConsentRequired = 'error.schedule.cost_recovery_consent_required';
  static const String scheduleCostRecoveryStale = 'error.schedule.cost_recovery_stale';
  static const String paymentCostRecoveryConsentRequired = 'error.payment.cost_recovery_consent_required';
  static const String paymentCostRecoveryStale = 'error.payment.cost_recovery_stale';
  static const String associationCostRecoveryBasisRequired = 'error.association.cost_recovery_basis_required';
  static const String schedulePastDueInstalments = 'error.schedule.past_due_instalments';
  static const String scheduleApprovalRequired = 'error.schedule.approval_required';
  static const String scheduleCardAutopayClosed = 'error.schedule.card_autopay_closed';
  static const String scheduleUnitOnInvoiceAutopay = 'error.schedule.unit_on_invoice_autopay';
  static const String scheduleBankAutopayUnavailable = 'error.schedule.bank_autopay_unavailable';
  static const String paymentClientUpdateRequired = 'error.payment.client_update_required';
  static const String schedulePermissionDenied = 'error.schedule.permission_denied';
  static const String scheduleInvalidStatus = 'error.schedule.invalid_status';
  static const String scheduleSetupIntentStale = 'error.schedule.setup_intent_stale';
  static const String scheduleFreezeNotApproved = 'error.schedule.freeze_not_approved';
  static const String scheduleAlreadyFrozen = 'error.schedule.already_frozen';
  static const String scheduleNotFrozen = 'error.schedule.not_frozen';
  static const String chatDisabled = 'error.chat.disabled';
  static const String chatPermissionDenied = 'error.chat.permission_denied';
  static const String chatTargetNotMember = 'error.chat.target_not_member';
  static const String chatChannelNotFound = 'error.chat.channel_not_found';
  static const String chatPolicyUnavailable = 'error.chat.policy_unavailable';
  static const String hoaChatResidentsOnly = 'error.hoa_chat.residents_only';
  static const String residentAccessNotYet = 'error.resident.access_not_yet';
  static const String accessCodeOpenerRequired = 'error.access_code.opener_required';
  static const String accessCodePairingTaken = 'error.access_code.pairing_taken';
  static const String accessCodePrintedCodeTaken = 'error.access_code.printed_code_taken';
  static const String accessCodeButtonTaken = 'error.access_code.button_taken';
  static const String accessCodeVehicleNotOwned = 'error.access_code.vehicle_not_owned';
  static const String accessCodeVehicleKind = 'error.access_code.vehicle_kind';
  static const String accessCodeDeviceConflict = 'error.access_code.device_conflict';
  static const String accessCodeUnitRequired = 'error.access_code.unit_required';
  static const String accessCodeUnitAmbiguous = 'error.access_code.unit_ambiguous';
  static const String accessCodeHolderNotInUnit = 'error.access_code.holder_not_in_unit';
  static const String accessCodeHandheldButtonTaken = 'error.access_code.handheld_button_taken';
  static const String garageOpenerNotFound = 'error.garage_opener.not_found';
  static const String garageOpenerNameTaken = 'error.garage_opener.name_taken';
  static const String garageOpenerInUse = 'error.garage_opener.in_use';
  static const String subscriptionNotFound = 'error.subscription.not_found';
  static const String subscriptionAlreadyCancelled = 'error.subscription.already_cancelled';
  static const String subscriptionCapped = 'error.subscription.capped';
  static const String subscriptionLimit = 'error.subscription.limit';
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
  static const String sessionIdleExpired = 'error.session.idle_expired';
  static const String sessionInvalidToken = 'error.session.invalid_token';
  static const String tradeAccessDenied = 'error.trade.access_denied';
  static const String tradeContractNotFound = 'error.trade.contract_not_found';
  static const String componentNotFound = 'error.component.not_found';
  static const String componentInvalid = 'error.component.invalid';
  static const String scenarioNotFound = 'error.scenario.not_found';
  static const String scenarioInvalid = 'error.scenario.invalid';
  static const String reconstructionValueRequired = 'error.scenario.reconstruction_value_required';
  static const String annualCondoFeesRequired = 'error.scenario.annual_condo_fees_required';
  static const String reserveBalanceNotSet = 'error.scenario.reserve_balance_not_set';
  static const String reserveFundUnfundable = 'error.scenario.reserve_fund_unfundable';
  static const String groupingReserveBaseUnavailable = 'error.scenario.grouping_reserve_base_unavailable';
  static const String ledgerEntryUnbalanced = 'error.ledger.entry_unbalanced';
  static const String ledgerAccountNotFound = 'error.ledger.account_not_found';
  static const String ledgerAccountCodeDuplicate = 'error.ledger.account_code_duplicate';
  static const String ledgerPeriodLocked = 'error.ledger.period_locked';
  static const String ledgerPeriodLockedBillApproval = 'error.ledger.period_locked_bill_approval';
  static const String ledgerSystemAccountProtected = 'error.ledger.system_account_protected';
  static const String ledgerSystemAccountDeactivationBlocked = 'error.ledger.system_account_deactivation_blocked';
  static const String ledgerNotSeeded = 'error.ledger.not_seeded';
  static const String ledgerAccountInactive = 'error.ledger.account_inactive';
  static const String ledgerBasisLocked = 'error.ledger.basis_locked';
  static const String ledgerOpeningBalanceLocked = 'error.ledger.opening_balance_locked';
  static const String ledgerCurrencyLocked = 'error.ledger.currency_locked';
  static const String ledgerAccountHasEntries = 'error.ledger.account_has_entries';
  static const String ledgerAccountHasChildren = 'error.ledger.account_has_children';
  static const String ledgerAccountHasReconciliations = 'error.ledger.account_has_reconciliations';
  static const String ledgerEntryAlreadyReversal = 'error.ledger.entry_already_reversal';
  static const String ledgerReconciliationNotOpen = 'error.ledger.reconciliation_not_open';
  static const String ledgerReconciliationAlreadyOpen = 'error.ledger.reconciliation_already_open';
  static const String ledgerReconciliationNotBankAccount = 'error.ledger.reconciliation_not_bank_account';
  static const String ledgerReconciliationStatementDateInvalid = 'error.ledger.reconciliation_statement_date_invalid';
  static const String ledgerReconciliationOutOfPeriod = 'error.ledger.reconciliation_out_of_period';
  static const String apBillNotFound = 'error.ap.bill_not_found';
  static const String apBillInvalidState = 'error.ap.bill_invalid_state';
  static const String apProviderNotFound = 'error.ap.provider_not_found';
  static const String apOverpayment = 'error.ap.overpayment';
  static const String apBillSelfApprovalForbidden = 'error.ap.self_approval_forbidden';
  static const String apBillAlreadyApprovedByYou = 'error.ap.bill_already_approved_by_you';
  static const String apBillPresidentApprovalRequired = 'error.ap.bill_president_approval_required';
  static const String apBillApprovePayableSignerRequired = 'error.ap.bill_approve_payable_signer_required';
  static const String apVendorNotApproved = 'error.ap.vendor_not_approved';
  static const String apVendorFlaggedReapprovalRequired = 'error.ap.vendor_flagged_reapproval_required';
  static const String apPoNotFound = 'error.ap.purchase_order_not_found';
  static const String apPoNotOpen = 'error.ap.purchase_order_not_open';
  static const String apPoProviderMismatch = 'error.ap.purchase_order_provider_mismatch';
  static const String apPoAmountExceeded = 'error.ap.purchase_order_amount_exceeded';
  static const String providerApprovalIncompleteRecord = 'error.provider.approval_incomplete_record';
  static const String taskVendorNotApproved = 'error.task.vendor_not_approved';
  static const String taskVendorOverrideReasonRequired = 'error.task.vendor_override_reason_required';
  static const String linkRecommendLimit = 'error.link.recommend_limit';
  static const String linkSmsNumberUnsupported = 'error.link.sms_number_unsupported';
  static const String taskClosed = 'error.task.closed';
  static const String linkNotResendable = 'error.link.not_resendable';
  static const String openLinkLimit = 'error.link.open_limit';
  static const String openLinkAnswerLimit = 'error.link.open_answer_limit';
  static const String openLinkDetailsRequired = 'error.link.open_details_required';
  static const String linkNoLongerAssignable = 'error.link.no_longer_assignable';
  static const String taskVendorReplaceRequired = 'error.task.vendor_replace_required';
  static const String contactResendLimit = 'error.link.contact_resend_limit';
  static const String contactPreferenceContactInvalid = 'error.contact_preference.contact_invalid';
  static const String linkQuestionLimit = 'error.link.question_limit';
  static const String linkQuestionForbidden = 'error.link.question_forbidden';
  static const String statusLinkLimit = 'error.link.status_limit';
  static const String taskResponsibleForbidden = 'error.task.responsible_forbidden';
  static const String taskResponsibleChanged = 'error.task.responsible_changed';
  static const String taskResponsibleIneligible = 'error.task.responsible_ineligible';
  static const String taskResponsibleRequired = 'error.task.responsible_required';
  static const String taskCloseForbidden = 'error.task.close_forbidden';
  static const String taskResponsibleFirmOnly = 'error.task.responsible_firm_only';
  static const String taskNotFirmHeld = 'error.task.not_firm_held';
  static const String taskNotApprovedForWork = 'error.task.not_approved_for_work';
  static const String taskApprovalEndpointOnly = 'error.task.approval_endpoint_only';
  static const String taskTimeLogOccurrenceOnly = 'error.task.time_log_occurrence_only';
  static const String apClassificationOverrideReasonRequired = 'error.ap.classification_override_reason_required';
  static const String recordVerificationRoundNotFound = 'error.verification.round_not_found';
  static const String recordVerificationSelfApprovalForbidden = 'error.verification.self_approval_forbidden';
  static const String providerBlanketInvalid = 'error.provider.blanket_invalid';
  static const String duplicateVendorSuspected = 'error.provider.duplicate_suspected';
  static const String vendorPlaceAlreadyRegistered = 'error.provider.place_already_registered';
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
  static const String contractDeleteEnforceable = 'error.contract.delete_enforceable';
  static const String contractDeleteAgentActivated = 'error.contract.delete_agent_activated';
  static const String contractDeleteSaleUnsupported = 'error.contract.delete_sale_unsupported';
  static const String contractDeleteCompanyOwned = 'error.contract.delete_company_owned';
  static const String contractDeleteNotActive = 'error.contract.delete_not_active';
  static const String contractDeleteTerminationInProgress = 'error.contract.delete_termination_in_progress';
  static const String contractDeleteHasAttestation = 'error.contract.delete_has_attestation';
  static const String contractDeleteUnitAccessGranted = 'error.contract.delete_unit_access_granted';
  static const String contractDeleteRaced = 'error.contract.delete_raced';
  static const String contractAcceptNotParty = 'error.contract.accept_not_party';
  static const String contractAcceptSelfDealing = 'error.contract.accept_self_dealing';
  static const String contractOfferChanged = 'error.contract.offer_changed';
  static const String contractOfferWithdrawn = 'error.contract.offer_withdrawn';
  static const String contractOfferExpired = 'error.contract.offer_expired';
  static const String contractOfferAlreadyAnswered = 'error.contract.offer_already_answered';
  static const String contractOfferCompanyNotPermitted = 'error.contract.offer_company_not_permitted';
  static const String invitationLinkInvalid = 'error.invitation.link_invalid';
  static const String contractNotTwoParty = 'error.contract.not_two_party';
  static const String dueNotFound = 'error.due.not_found';
  static const String dueAlreadyPaid = 'error.due.already_paid';
  static const String dueCancelled = 'error.due.cancelled';
  static const String dueRefunded = 'error.due.refunded';
  static const String duesReminderCooldown = 'error.dues.reminder_cooldown';
  static const String duesReminderNotLate = 'error.dues.reminder_not_late';
  static const String duesReminderNoOwners = 'error.dues.reminder_no_owners';
  static const String receiptNotAvailable = 'error.dues.receipt_not_available';
  static const String specialAssessmentCustomTotalMismatch = 'error.special_assessment.custom_total_mismatch';
  static const String specialAssessmentQuotaInvalid = 'error.special_assessment.quota_invalid';
  static const String specialAssessmentPreviewStale = 'error.special_assessment.preview_stale';
  static const String specialAssessmentNoUnits = 'error.special_assessment.no_units';
  static const String specialAssessmentHasPayments = 'error.special_assessment.has_payments';
  static const String specialAssessmentPaymentInProgress = 'error.special_assessment.payment_in_progress';
  static const String specialAssessmentIdempotencyMismatch = 'error.special_assessment.idempotency_mismatch';
  static const String specialAssessmentEventNotAMeeting = 'error.special_assessment.event_not_a_meeting';
  static const String specialAssessmentCancelling = 'error.special_assessment.cancelling';
  static const String orphanPaymentNotFound = 'error.orphan_payment.not_found';
  static const String orphanPaymentNothingRemaining = 'error.orphan_payment.nothing_remaining';
  static const String orphanPaymentAmountExceedsRemaining = 'error.orphan_payment.amount_exceeds_remaining';
  static const String orphanPaymentDisputed = 'error.orphan_payment.disputed';
  static const String orphanPaymentRefundFailed = 'error.orphan_payment.refund_failed';
  static const String orphanPaymentIdempotencyMismatch = 'error.orphan_payment.idempotency_mismatch';
  static const String orphanApplyTargetInvalid = 'error.orphan_payment.apply_target_invalid';
  static const String orphanApplyOwnersChanged = 'error.orphan_payment.apply_owners_changed';
  static const String ownerStatementPeriodFinalized = 'error.owner_statement.period_finalized';
  static const String ownerStatementPeriodOverlap = 'error.owner_statement.period_overlap';
  static const String signupNotFound = 'error.signup.not_found';
  static const String signupAlreadyVerified = 'error.signup.already_verified';
  static const String signupAlreadyPaid = 'error.signup.already_paid';
  static const String signupExpired = 'error.signup.expired';
  static const String signupInvalidCode = 'error.signup.invalid_code';
  static const String signupRateLimited = 'error.signup.rate_limited';
  static const String signupServiceUnavailable = 'error.signup.service_unavailable';
  static const String signupAlreadyCompleted = 'error.signup.already_completed';
  static const String signupOfficeAlreadyPromised = 'error.signup.office_already_promised';
  static const String signupSessionRequired = 'error.signup.session_required';
  static const String signupUnfinished = 'error.signup.unfinished';
  static const String signinHandoffInvalid = 'error.signup.handoff_invalid';
  static const String signupAddressTooSparse = 'error.signup.address_too_sparse';
  static const String corsOriginNotAllowed = 'error.cors.origin_not_allowed';
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
  static const String subscriptionManagedByCompany = 'error.subscription.managed_by_company';
  static const String subscriptionAlreadyActive = 'error.subscription.already_active';
  static const String validationError = 'error.generic.validation';
  static const String notFound = 'error.generic.not_found';
  static const String conflict = 'error.generic.conflict';
  static const String internalError = 'error.generic.internal';
  static const String serviceUnavailable = 'error.generic.service_unavailable';
  static const String databaseBusy = 'error.generic.database_busy';
  static const String emailSendFailed = 'error.generic.email_send_failed';
  static const String invalidId = 'error.generic.invalid_id';
  static const String invalidDateFormat = 'error.generic.invalid_date_format';
  static const String resourceNotBelongs = 'error.generic.resource_not_belongs';
  static const String rateLimited = 'error.generic.rate_limited';
  static const String missingRequiredField = 'error.generic.missing_required_field';
  static const String invalidFileFormat = 'error.generic.invalid_file_format';
  static const String uploadCorruptedInTransit = 'error.upload.corrupted_in_transit';
  static const String documentDeleteStorageFailed = 'error.document.delete_storage_failed';
  static const String smartDeviceNotConfigured = 'error.smart_device.not_configured';
  static const String deletionBlocked = 'error.deletion.blocked';
  static const String deletionConfirmInvalid = 'error.deletion.confirm_invalid';
  static const String deletionConfirmExpired = 'error.deletion.confirm_expired';
  static const String deletionOtpInvalid = 'error.deletion.otp_invalid';
  static const String deletionEscalateInvalid = 'error.deletion.escalate_invalid';
  static const String credentialVaultNotConfigured = 'error.credentials.not_configured';
  static const String automationOverrideExists = 'error.automation.override_exists';
  static const String securityLoginNotInSnapshot = 'error.security.login_not_in_snapshot';
  static const String securityRecognisedListFull = 'error.security.recognised_list_full';
  static const String subscriptionTrialActive = 'error.subscription.trial_active';
  static const String portalNotFound = 'error.portal.not_found';
  static const String portalInvalidConfig = 'error.portal.invalid_config';

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
    'error.auth.passkey_invalid',
    'error.auth.passkey_unavailable',
    'error.auth.passkey_not_found',
    'error.auth.passkey_limit',
    'error.auth.step_up_required',
    'error.auth.step_up_otp_invalid',
    'error.auth.email_already_registered',
    'error.auth.phone_already_registered',
    'error.auth.contact_belongs_to_deleted_account',
    'error.auth.register_retired',
    'error.auth.contact_add_requires_verification',
    'error.auth.contact_not_confirmed',
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
    'error.association.reset_env_refused',
    'error.association.reset_protected',
    'error.association.reset_confirm_mismatch',
    'error.association.reset_unclassified_tables',
    'error.association.reset_in_progress',
    'error.association.reset_has_child_associations',
    'error.association.reset_blocked',
    'error.association.address_already_in_use',
    'error.association.address_too_sparse',
    'error.association.manage_request_already_open',
    'error.association.manage_request_not_found',
    'error.association.seat_request_not_found',
    'error.association.last_board_seat',
    'error.association.no_board_permissions_locked',
    'error.association.seat_request_self_review',
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
    'error.payment.online_payments_disabled',
    'error.payment.card_cost_recovery_disabled',
    'error.payment.saved_card_rail_closed',
    'error.payment.saved_card_owner_required',
    'error.payment.saved_card_setup_incomplete',
    'error.payment.saved_card_setup_stale',
    'error.payment.saved_card_in_use_by_autopay',
    'error.payment.saved_card_required',
    'error.payment.saved_charge_in_flight',
    'error.payment.declined',
    'error.autopay.closed',
    'error.autopay.disabled_by_hoa',
    'error.autopay.unit_on_schedule',
    'error.autopay.already_enrolled_by_other',
    'error.autopay.arming_stale',
    'error.autopay.cost_recovery_stale',
    'error.autopay.cost_recovery_consent_required',
    'error.autopay.arming_confirmation_required',
    'error.autopay.arming_invalid_resolution',
    'error.autopay.invalid_status',
    'error.autopay.nudge_cooldown',
    'error.autopay.nudge_nothing_due',
    'error.payment.link_expired',
    'error.payment.relink_required',
    'error.payment.connect_account_stale',
    'error.payment.unlink_active_leases',
    'error.payment.duplicate_suspected',
    'error.payment.duplicate_charge_suspected',
    'error.ledger.duplicate_journal_entry_suspected',
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
    'error.task.document_backs_receipt',
    'error.task.document_rename_denied',
    'error.task.private',
    'error.task.private_unsupported_action',
    'error.task.promotion_forbidden',
    'error.task.promotion_requires_permission',
    'error.task.terminal',
    'error.task.demote_vendor_engaged',
    'error.task.demote_vendor_board_engaged',
    'error.task.demote_work_started',
    'error.task.demote_board_approved',
    'error.task.private_owners_requires_owner',
    'error.task.tenant_private_only',
    'error.task.not_billable',
    'error.task.charge_unit_ambiguous',
    'error.task.charge_unit_untagged',
    'error.task.receipt_already_charged',
    'error.task.receipt_delete_denied',
    'error.task.receipt_item_locked',
    'error.task.assignee_not_in_unit',
    'error.task.unit_residency_required',
    'error.task.units_changed',
    'error.task.private_unit_locked',
    'error.task.unit_not_yours',
    'error.task.access_not_requested',
    'error.task.access_remind_too_soon',
    'error.booking.conflict',
    'error.booking.not_found',
    'error.amenity.not_found',
    'error.amenity.invalid',
    'error.moving.not_found',
    'error.moving.conflict',
    'error.moving.invalid_date',
    'error.moving.invalid_time',
    'error.document.not_found',
    'error.association_document.unit_not_allowed',
    'error.document.audience_not_allowed',
    'error.document.file_not_attachable',
    'error.folder.scope_change_not_empty',
    'error.folder.parent_other_scope',
    'error.unit_document.write_denied',
    'error.folder.holds_unreadable_files',
    'error.placeholder.write_denied',
    'error.placeholder.audience_mismatch',
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
    'error.lease.overlap',
    'error.lease.unassigned',
    'error.announcement.not_found',
    'error.announcement.already_approved',
    'error.announcement.invalid_dates',
    'error.insurance.not_found',
    'error.claim.not_found',
    'error.declaration_amendment.not_found',
    'error.declaration_amendment.bylaws_not_registrable',
    'error.placeholder.system_read_only',
    'error.litigation.not_found',
    'error.litigation.complete_mode_required',
    'error.attestation.not_found',
    'error.attestation.invalid',
    'error.attestation.permission_denied',
    'error.attestation.snapshot_failed',
    'error.attestation.item_not_found',
    'error.attestation.limit_reached',
    'error.information_share.not_found',
    'error.information_share.invalid',
    'error.information_share.permission_denied',
    'error.information_share.unavailable',
    'error.information_share.section_denied',
    'error.information_share.locked',
    'error.information_share.package_request_not_found',
    'error.information_share.package_request_closed',
    'error.information_share.package_request_duplicate',
    'error.sale.not_found',
    'error.sale.not_owner',
    'error.sale.mandate_already_requested',
    'error.sale.mandate_not_verified',
    'error.sale.mandate_no_match',
    'error.contract.invalid_term',
    'error.sale.already_listed',
    'error.sale.not_listed',
    'error.sale.view_not_authorized',
    'error.sale.seller_not_owner',
    'error.sale.sellers_board_only',
    'error.listing.not_found',
    'error.listing.not_authorized',
    'error.listing.invalid_subject',
    'error.listing.already_active',
    'error.listing.not_active',
    'error.listing.has_active_sale',
    'error.listing.complete_has_active_sale',
    'error.parking_space.not_found',
    'error.parking_space.count_mode',
    'error.parking_space.identifier_taken',
    'error.parking_space.already_assigned',
    'error.parking_space.family_change',
    'error.parking_space.deeded_lot_needs_lot_number',
    'error.parking_space.storage_fields',
    'error.handoff.not_found',
    'error.handoff.not_authorized',
    'error.handoff.invalid',
    'error.handoff.already_active',
    'error.handoff.settlement_unresolved',
    'error.handoff.money_unresolved',
    'error.handoff.money_settling',
    'error.handoff.money_waiver_forbidden',
    'error.handoff.money_check_unavailable',
    'error.handoff.item_not_found',
    'error.handoff.document_not_found',
    'error.handoff.party_not_found',
    'error.handoff.disposition_not_found',
    'error.handoff.disposition_executed',
    'error.handoff.party_occupancy_locked',
    'error.occupancy.not_found',
    'error.occupancy.invalid_dates',
    'error.occupancy.overlap',
    'error.vehicle.not_found',
    'error.vehicle.permission_denied',
    'error.vehicle.duplicate_plate',
    'error.schedule.not_found',
    'error.schedule.invalid_dates',
    'error.schedule.already_processed',
    'error.schedule.already_exists',
    'error.schedule.card_locked_by_active_lease',
    'error.schedule.bank_locked_by_active_lease',
    'error.schedule.card_setup_incomplete',
    'error.schedule.no_designated_payer',
    'error.schedule.invoice_unit_mismatch',
    'error.lease.status_not_schedulable',
    'error.lease.no_lessee',
    'error.schedule.no_upcoming_payments',
    'error.schedule.creator_is_payer',
    'error.unit.condo_fee_not_configured',
    'error.schedule.timeline_terms_required',
    'error.schedule.timeline_empty',
    'error.schedule.no_line_items',
    'error.schedule.arming_confirmation_required',
    'error.schedule.arming_stale',
    'error.schedule.arming_invalid_resolution',
    'error.schedule.collect_now_unavailable',
    'error.schedule.collect_now_stood_down',
    'error.schedule.collect_now_failed',
    'error.schedule.pay_not_approved',
    'error.schedule.pay_arm_required',
    'error.schedule.pay_unknown_line_item',
    'error.schedule.pay_already_settled',
    'error.schedule.pay_nothing_selected',
    'error.schedule.pay_method_unavailable',
    'error.schedule.pay_extra_unavailable',
    'error.schedule.declaration_not_found',
    'error.schedule.declaration_already_resolved',
    'error.schedule.cost_recovery_consent_required',
    'error.schedule.cost_recovery_stale',
    'error.payment.cost_recovery_consent_required',
    'error.payment.cost_recovery_stale',
    'error.association.cost_recovery_basis_required',
    'error.schedule.past_due_instalments',
    'error.schedule.approval_required',
    'error.schedule.card_autopay_closed',
    'error.schedule.unit_on_invoice_autopay',
    'error.schedule.bank_autopay_unavailable',
    'error.payment.client_update_required',
    'error.schedule.permission_denied',
    'error.schedule.invalid_status',
    'error.schedule.setup_intent_stale',
    'error.schedule.freeze_not_approved',
    'error.schedule.already_frozen',
    'error.schedule.not_frozen',
    'error.chat.disabled',
    'error.chat.permission_denied',
    'error.chat.target_not_member',
    'error.chat.channel_not_found',
    'error.chat.policy_unavailable',
    'error.hoa_chat.residents_only',
    'error.resident.access_not_yet',
    'error.access_code.opener_required',
    'error.access_code.pairing_taken',
    'error.access_code.printed_code_taken',
    'error.access_code.button_taken',
    'error.access_code.vehicle_not_owned',
    'error.access_code.vehicle_kind',
    'error.access_code.device_conflict',
    'error.access_code.unit_required',
    'error.access_code.unit_ambiguous',
    'error.access_code.holder_not_in_unit',
    'error.access_code.handheld_button_taken',
    'error.garage_opener.not_found',
    'error.garage_opener.name_taken',
    'error.garage_opener.in_use',
    'error.subscription.not_found',
    'error.subscription.already_cancelled',
    'error.subscription.capped',
    'error.subscription.limit',
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
    'error.session.idle_expired',
    'error.session.invalid_token',
    'error.trade.access_denied',
    'error.trade.contract_not_found',
    'error.component.not_found',
    'error.component.invalid',
    'error.scenario.not_found',
    'error.scenario.invalid',
    'error.scenario.reconstruction_value_required',
    'error.scenario.annual_condo_fees_required',
    'error.scenario.reserve_balance_not_set',
    'error.scenario.reserve_fund_unfundable',
    'error.scenario.grouping_reserve_base_unavailable',
    'error.ledger.entry_unbalanced',
    'error.ledger.account_not_found',
    'error.ledger.account_code_duplicate',
    'error.ledger.period_locked',
    'error.ledger.period_locked_bill_approval',
    'error.ledger.system_account_protected',
    'error.ledger.system_account_deactivation_blocked',
    'error.ledger.not_seeded',
    'error.ledger.account_inactive',
    'error.ledger.basis_locked',
    'error.ledger.opening_balance_locked',
    'error.ledger.currency_locked',
    'error.ledger.account_has_entries',
    'error.ledger.account_has_children',
    'error.ledger.account_has_reconciliations',
    'error.ledger.entry_already_reversal',
    'error.ledger.reconciliation_not_open',
    'error.ledger.reconciliation_already_open',
    'error.ledger.reconciliation_not_bank_account',
    'error.ledger.reconciliation_statement_date_invalid',
    'error.ledger.reconciliation_out_of_period',
    'error.ap.bill_not_found',
    'error.ap.bill_invalid_state',
    'error.ap.provider_not_found',
    'error.ap.overpayment',
    'error.ap.self_approval_forbidden',
    'error.ap.bill_already_approved_by_you',
    'error.ap.bill_president_approval_required',
    'error.ap.bill_approve_payable_signer_required',
    'error.ap.vendor_not_approved',
    'error.ap.vendor_flagged_reapproval_required',
    'error.ap.purchase_order_not_found',
    'error.ap.purchase_order_not_open',
    'error.ap.purchase_order_provider_mismatch',
    'error.ap.purchase_order_amount_exceeded',
    'error.provider.approval_incomplete_record',
    'error.task.vendor_not_approved',
    'error.task.vendor_override_reason_required',
    'error.link.recommend_limit',
    'error.link.sms_number_unsupported',
    'error.task.closed',
    'error.link.not_resendable',
    'error.link.open_limit',
    'error.link.open_answer_limit',
    'error.link.open_details_required',
    'error.link.no_longer_assignable',
    'error.task.vendor_replace_required',
    'error.link.contact_resend_limit',
    'error.contact_preference.contact_invalid',
    'error.link.question_limit',
    'error.link.question_forbidden',
    'error.link.status_limit',
    'error.task.responsible_forbidden',
    'error.task.responsible_changed',
    'error.task.responsible_ineligible',
    'error.task.responsible_required',
    'error.task.close_forbidden',
    'error.task.responsible_firm_only',
    'error.task.not_firm_held',
    'error.task.not_approved_for_work',
    'error.task.approval_endpoint_only',
    'error.task.time_log_occurrence_only',
    'error.ap.classification_override_reason_required',
    'error.verification.round_not_found',
    'error.verification.self_approval_forbidden',
    'error.provider.blanket_invalid',
    'error.provider.duplicate_suspected',
    'error.provider.place_already_registered',
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
    'error.contract.delete_enforceable',
    'error.contract.delete_agent_activated',
    'error.contract.delete_sale_unsupported',
    'error.contract.delete_company_owned',
    'error.contract.delete_not_active',
    'error.contract.delete_termination_in_progress',
    'error.contract.delete_has_attestation',
    'error.contract.delete_unit_access_granted',
    'error.contract.delete_raced',
    'error.contract.accept_not_party',
    'error.contract.accept_self_dealing',
    'error.contract.offer_changed',
    'error.contract.offer_withdrawn',
    'error.contract.offer_expired',
    'error.contract.offer_already_answered',
    'error.contract.offer_company_not_permitted',
    'error.invitation.link_invalid',
    'error.contract.not_two_party',
    'error.due.not_found',
    'error.due.already_paid',
    'error.due.cancelled',
    'error.due.refunded',
    'error.dues.reminder_cooldown',
    'error.dues.reminder_not_late',
    'error.dues.reminder_no_owners',
    'error.dues.receipt_not_available',
    'error.special_assessment.custom_total_mismatch',
    'error.special_assessment.quota_invalid',
    'error.special_assessment.preview_stale',
    'error.special_assessment.no_units',
    'error.special_assessment.has_payments',
    'error.special_assessment.payment_in_progress',
    'error.special_assessment.idempotency_mismatch',
    'error.special_assessment.event_not_a_meeting',
    'error.special_assessment.cancelling',
    'error.orphan_payment.not_found',
    'error.orphan_payment.nothing_remaining',
    'error.orphan_payment.amount_exceeds_remaining',
    'error.orphan_payment.disputed',
    'error.orphan_payment.refund_failed',
    'error.orphan_payment.idempotency_mismatch',
    'error.orphan_payment.apply_target_invalid',
    'error.orphan_payment.apply_owners_changed',
    'error.owner_statement.period_finalized',
    'error.owner_statement.period_overlap',
    'error.signup.not_found',
    'error.signup.already_verified',
    'error.signup.already_paid',
    'error.signup.expired',
    'error.signup.invalid_code',
    'error.signup.rate_limited',
    'error.signup.service_unavailable',
    'error.signup.already_completed',
    'error.signup.office_already_promised',
    'error.signup.session_required',
    'error.signup.unfinished',
    'error.signup.handoff_invalid',
    'error.signup.address_too_sparse',
    'error.cors.origin_not_allowed',
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
    'error.subscription.managed_by_company',
    'error.subscription.already_active',
    'error.generic.validation',
    'error.generic.not_found',
    'error.generic.conflict',
    'error.generic.internal',
    'error.generic.service_unavailable',
    'error.generic.database_busy',
    'error.generic.email_send_failed',
    'error.generic.invalid_id',
    'error.generic.invalid_date_format',
    'error.generic.resource_not_belongs',
    'error.generic.rate_limited',
    'error.generic.missing_required_field',
    'error.generic.invalid_file_format',
    'error.upload.corrupted_in_transit',
    'error.document.delete_storage_failed',
    'error.smart_device.not_configured',
    'error.deletion.blocked',
    'error.deletion.confirm_invalid',
    'error.deletion.confirm_expired',
    'error.deletion.otp_invalid',
    'error.deletion.escalate_invalid',
    'error.credentials.not_configured',
    'error.automation.override_exists',
    'error.security.login_not_in_snapshot',
    'error.security.recognised_list_full',
    'error.subscription.trial_active',
    'error.portal.not_found',
    'error.portal.invalid_config',
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

/// Every kind of failure a client tells apart before choosing the words of
/// an error (ERROR-3). See contracts/failure-kinds.json for each kind's
/// meaning; the maps below give how to retry, a write's saved state, and
/// which kinds show a reference or nothing at all.
abstract final class BabelFailureKind {
  static const String offline = 'offline';
  static const String unreachable = 'unreachable';
  static const String intercepted = 'intercepted';
  static const String timeout = 'timeout';
  static const String frontDoor = 'front_door';
  static const String unavailable = 'unavailable';
  static const String rateLimited = 'rate_limited';
  static const String busy = 'busy';
  static const String sessionEnded = 'session_ended';
  static const String stepUp = 'step_up';
  static const String forbidden = 'forbidden';
  static const String plan = 'plan';
  static const String notYet = 'not_yet';
  static const String validation = 'validation';
  static const String conflict = 'conflict';
  static const String notFound = 'not_found';
  static const String tooLarge = 'too_large';
  static const String outdatedClient = 'outdated_client';
  static const String serverBug = 'server_bug';
  static const String clientBug = 'client_bug';
  static const String unreadableSuccess = 'unreadable_success';
  static const String partial = 'partial';
  static const String cancelled = 'cancelled';
  static const String queued = 'queued';

  /// Every kind, in contract order.
  static const List<String> values = <String>[
    'offline',
    'unreachable',
    'intercepted',
    'timeout',
    'front_door',
    'unavailable',
    'rate_limited',
    'busy',
    'session_ended',
    'step_up',
    'forbidden',
    'plan',
    'not_yet',
    'validation',
    'conflict',
    'not_found',
    'too_large',
    'outdated_client',
    'server_bug',
    'client_bug',
    'unreadable_success',
    'partial',
    'cancelled',
    'queued',
  ];

  /// Kind -> now | after | when_online | manual | dialog | reload | never | none.
  static const Map<String, String> retry = <String, String>{
    'offline': 'when_online',
    'unreachable': 'after',
    'intercepted': 'manual',
    'timeout': 'after',
    'front_door': 'after',
    'unavailable': 'after',
    'rate_limited': 'after',
    'busy': 'now',
    'session_ended': 'manual',
    'step_up': 'dialog',
    'forbidden': 'never',
    'plan': 'never',
    'not_yet': 'never',
    'validation': 'never',
    'conflict': 'manual',
    'not_found': 'never',
    'too_large': 'never',
    'outdated_client': 'reload',
    'server_bug': 'now',
    'client_bug': 'reload',
    'unreadable_success': 'reload',
    'partial': 'manual',
    'cancelled': 'none',
    'queued': 'none',
  };

  /// Kind -> no | unknown | saved | partial | pending: what a failed WRITE kept.
  static const Map<String, String> savedOnWrite = <String, String>{
    'offline': 'no',
    'unreachable': 'unknown',
    'intercepted': 'no',
    'timeout': 'unknown',
    'front_door': 'unknown',
    'unavailable': 'no',
    'rate_limited': 'no',
    'busy': 'unknown',
    'session_ended': 'no',
    'step_up': 'no',
    'forbidden': 'no',
    'plan': 'no',
    'not_yet': 'no',
    'validation': 'no',
    'conflict': 'no',
    'not_found': 'no',
    'too_large': 'no',
    'outdated_client': 'no',
    'server_bug': 'unknown',
    'client_bug': 'no',
    'unreadable_success': 'saved',
    'partial': 'partial',
    'cancelled': 'unknown',
    'queued': 'pending',
  };

  /// The kinds whose message shows a reference support can find (ERROR-7).
  static const List<String> showReference = <String>[
    'unreachable',
    'timeout',
    'front_door',
    'unavailable',
    'server_bug',
    'client_bug',
    'unreadable_success',
    'partial',
  ];

  /// The kinds that show nothing (cancelled by us, or queued on the device).
  static const List<String> silent = <String>[
    'cancelled',
    'queued',
  ];

  /// Where an [unreachable] failure happened.
  static const List<String> unreachableWhere = <String>[
    'app_server',
    'api',
  ];

  /// Kind -> whose server it happened on, for the kinds that say
  /// (app_server: a web app's own server; api).
  static const Map<String, List<String>> where = <String, List<String>>{
    'unreachable': <String>[
      'app_server',
      'api',
    ],
    'timeout': <String>[
      'app_server',
      'api',
    ],
    'front_door': <String>[
      'app_server',
      'api',
    ],
  };
}

/// The error body every API returns (ERROR-6).
abstract final class BabelErrorEnvelope {
  /// Field names, top level and `details.*`.
  static const List<String> fields = <String>[
    'status',
    'errorCode',
    'message',
    'details',
    'details.gate',
    'details.committed',
    'fieldErrors',
    'retryAfterSeconds',
    'reference',
  ];

  /// `details.gate.kind` values on a 403/402 (ERROR-5).
  static const List<String> gateKinds = <String>[
    'permission',
    'role',
    'plan',
    'device',
    'occupancy',
    'company',
    'setup',
  ];

  /// Error codes too generic to replace a more specific sentence. Wire values.
  static const List<String> genericCodes = <String>[
    'error.generic.validation',
    'error.auth.permission_denied',
    'error.generic.invalid_id',
    'error.generic.not_found',
    'error.generic.internal',
    'error.generic.conflict',
    'error.generic.service_unavailable',
    'error.generic.rate_limited',
    'error.auth.unauthorized',
    'error.auth.invalid_user',
    'error.payment.failed',
    'error.generic.database_busy',
  ];

  /// Characters of the logged request id a server `reference` carries.
  static const int referenceServerLength = 8;

  /// A client-minted reference: this prefix plus [referenceClientLength] upper-case hex characters.
  static const String referenceClientPrefix = 'E-';
  static const int referenceClientLength = 6;
}

/// The wording ERROR-2 bans, per locale, normalized as
/// contracts/rules/generic-error-phrases.json `$meta.matching` describes
/// (lower case, straight apostrophes, single spaces). A Dart guard matches a
/// normalized message: [whole] = the message is the phrase, [opening] = it
/// starts with it at a word boundary, [anywhere] = it contains it,
/// [causeless] = it starts with it and every later clause is a [filler]
/// (no [causeWords] in the first clause).
abstract final class BabelGenericErrorPhrases {
  static const List<String> locales = <String>[
    'en',
    'fr',
    'es',
    'zh',
    'pt',
    'ar',
    'de',
    'it',
    'ja',
    'ko',
    'ru',
  ];

  static const Map<String, List<String>> whole = <String, List<String>>{
    'en': <String>[
      'error',
      'failed',
      'failure',
      'oops',
      'please try again',
      'still not responding',
      'not responding',
      'whoops',
      'request timed out',
      'service unavailable',
      'load failed',
      'an error occured',
    ],
    'fr': <String>[
      'erreur',
      'échec',
      'échoué',
      'oups',
      'veuillez réessayer',
      'ne répond toujours pas',
      'ne répond pas',
    ],
    'es': <String>[
      'error',
      'falló',
      'fallido',
      'ups',
      'no responde',
      'por favor, inténtalo de nuevo',
      'por favor, inténtelo de nuevo',
      'por favor, vuelve a intentarlo',
    ],
    'zh': <String>[
      '错误',
      '失败',
      '出错了',
      '哎呀',
      '请重试',
      '未响应',
    ],
    'pt': <String>[
      'erro',
      'falhou',
      'falha',
      'ops',
      'não está respondendo',
      'por favor, tente novamente',
    ],
    'ar': <String>[
      'خطأ',
      'فشل',
      'عفوا',
    ],
    'de': <String>[
      'fehler',
      'fehlgeschlagen',
      'hoppla',
      'ups',
    ],
    'it': <String>[
      'errore',
      'non riuscito',
      'fallito',
      'ops',
    ],
    'ja': <String>[
      'エラー',
      '失敗',
      '失敗しました',
      'おっと',
    ],
    'ko': <String>[
      '오류',
      '실패',
      '앗',
    ],
    'ru': <String>[
      'ошибка',
      'сбой',
      'упс',
      'не отвечает',
    ],
  };

  static const Map<String, List<String>> opening = <String, List<String>>{
    'en': <String>[
      'something went wrong',
      'something has gone wrong',
      'something unexpected happened',
      'an error occurred',
      'an error has occurred',
      'an error was encountered',
      'an unexpected error',
      'unexpected error',
      'an unknown error',
      'unknown error',
      'an internal error',
      'there was an error',
      'there was a problem',
      'a problem occurred',
      'oops',
      'error',
      'failed:',
      'request failed',
      'internal server error',
      'server error',
      'network error',
      'that didn\'t work',
      'that did not work',
      'sorry, something',
      'sorry, an error',
      'unable to complete your request',
      'whoops',
      'an error occured',
    ],
    'fr': <String>[
      'une erreur est survenue',
      'une erreur s\'est produite',
      'une erreur inattendue',
      'erreur inattendue',
      'une erreur inconnue',
      'erreur inconnue',
      'une erreur interne',
      'quelque chose s\'est mal passé',
      'un problème est survenu',
      'un problème s\'est produit',
      'oups',
      'erreur',
      'la requête a échoué',
      'la demande a échoué',
      'erreur réseau',
      'erreur interne du serveur',
      'erreur serveur',
      'erreur du serveur',
      'cela n\'a pas fonctionné',
      'ça n\'a pas fonctionné',
      'désolé, une erreur',
    ],
    'es': <String>[
      'algo salió mal',
      'algo ha salido mal',
      'ha ocurrido un error',
      'ocurrió un error',
      'se produjo un error',
      'se ha producido un error',
      'un error inesperado',
      'error inesperado',
      'error desconocido',
      'error de red',
      'error interno del servidor',
      'error del servidor',
      'error',
      'la solicitud falló',
      'ups',
    ],
    'zh': <String>[
      '出现错误',
      '发生错误',
      '出现了错误',
      '发生了错误',
      '出错了',
      '出了点问题',
      '未知错误',
      '意外错误',
      '发生意外错误',
      '网络错误',
      '服务器错误',
      '服务器内部错误',
      '请求失败',
      '操作失败',
      '哎呀',
    ],
    'pt': <String>[
      'algo deu errado',
      'ocorreu um erro',
      'um erro inesperado',
      'erro inesperado',
      'erro desconhecido',
      'erro de rede',
      'erro interno do servidor',
      'erro do servidor',
      'erro',
      'a solicitação falhou',
      'ops',
    ],
    'ar': <String>[
      'حدث خطأ',
      'حدث خطأ ما',
      'حدث خطأ غير متوقع',
      'خطأ غير متوقع',
      'خطأ غير معروف',
      'خطأ في الشبكة',
      'خطأ في الخادم',
      'خطأ داخلي في الخادم',
      'فشل الطلب',
      'هناك خطأ ما',
    ],
    'de': <String>[
      'etwas ist schiefgelaufen',
      'etwas ist schief gelaufen',
      'ein fehler ist aufgetreten',
      'es ist ein fehler aufgetreten',
      'ein unerwarteter fehler',
      'unerwarteter fehler',
      'unbekannter fehler',
      'netzwerkfehler',
      'interner serverfehler',
      'serverfehler',
      'fehler',
      'anfrage fehlgeschlagen',
      'hoppla',
    ],
    'it': <String>[
      'qualcosa è andato storto',
      'si è verificato un errore',
      'un errore imprevisto',
      'errore imprevisto',
      'errore sconosciuto',
      'errore di rete',
      'errore interno del server',
      'errore del server',
      'errore',
      'richiesta non riuscita',
      'ops',
    ],
    'ja': <String>[
      'エラーが発生しました',
      '問題が発生しました',
      '何か問題が発生しました',
      '予期しないエラー',
      '不明なエラー',
      'ネットワークエラー',
      'サーバーエラー',
      '内部サーバーエラー',
      'リクエストに失敗しました',
    ],
    'ko': <String>[
      '문제가 발생했습니다',
      '오류가 발생했습니다',
      '예기치 않은 오류',
      '알 수 없는 오류',
      '네트워크 오류',
      '서버 오류',
      '내부 서버 오류',
      '요청 실패',
      '요청에 실패했습니다',
      '뭔가 잘못되었습니다',
    ],
    'ru': <String>[
      'что-то пошло не так',
      'произошла ошибка',
      'произошла непредвиденная ошибка',
      'непредвиденная ошибка',
      'неизвестная ошибка',
      'ошибка сети',
      'сетевая ошибка',
      'внутренняя ошибка сервера',
      'ошибка сервера',
      'ошибка',
      'запрос не выполнен',
      'упс',
    ],
  };

  static const Map<String, List<String>> anywhere = <String, List<String>>{
    'en': <String>[
      'something went wrong',
      'an error occurred',
      'an error has occurred',
      'an unexpected error occurred',
      'try again later',
      'please try again later',
      'try again in a moment',
      'try again shortly',
      'try again in a few moments',
      'our team has been notified',
      'we have been notified',
      'we\'ve been notified',
      'an error occured',
    ],
    'fr': <String>[
      'une erreur est survenue',
      'une erreur s\'est produite',
      'quelque chose s\'est mal passé',
      'réessayez plus tard',
      'veuillez réessayer plus tard',
      'réessayez ultérieurement',
      'veuillez réessayer ultérieurement',
      'réessayez dans un instant',
      'réessayez dans un moment',
      'réessayez sous peu',
      'notre équipe a été informée',
      'notre équipe a été avertie',
      'notre équipe a été prévenue',
      'notre équipe a été notifiée',
    ],
    'es': <String>[
      'algo salió mal',
      'ha ocurrido un error',
      'ocurrió un error',
      'se produjo un error',
      'se ha producido un error',
      'inténtalo más tarde',
      'inténtelo más tarde',
      'inténtalo de nuevo más tarde',
      'inténtelo de nuevo más tarde',
      'vuelve a intentarlo más tarde',
      'vuelva a intentarlo más tarde',
      'nuestro equipo ha sido notificado',
    ],
    'zh': <String>[
      '出现错误',
      '发生错误',
      '出了点问题',
      '稍后重试',
      '稍后再试',
      '我们的团队已收到通知',
    ],
    'pt': <String>[
      'algo deu errado',
      'ocorreu um erro',
      'tente novamente mais tarde',
      'tente mais tarde',
      'nossa equipe foi notificada',
    ],
    'ar': <String>[
      'حدث خطأ',
      'حدث خطأ ما',
      'يرجى المحاولة مرة أخرى لاحقا',
      'يرجى المحاولة لاحقا',
      'حاول مرة أخرى لاحقا',
      'حاول لاحقا',
    ],
    'de': <String>[
      'etwas ist schiefgelaufen',
      'ein fehler ist aufgetreten',
      'es ist ein fehler aufgetreten',
      'versuchen sie es später erneut',
      'versuchen sie es später noch einmal',
      'versuche es später erneut',
      'später erneut versuchen',
    ],
    'it': <String>[
      'qualcosa è andato storto',
      'si è verificato un errore',
      'riprova più tardi',
      'riprovare più tardi',
      'riprova tra poco',
    ],
    'ja': <String>[
      'エラーが発生しました',
      '問題が発生しました',
      '後でもう一度お試しください',
      'しばらくしてからもう一度お試しください',
      '後でやり直してください',
    ],
    'ko': <String>[
      '오류가 발생했습니다',
      '문제가 발생했습니다',
      '나중에 다시 시도해 주세요',
      '나중에 다시 시도하세요',
      '잠시 후 다시 시도해 주세요',
    ],
    'ru': <String>[
      'что-то пошло не так',
      'произошла ошибка',
      'попробуйте позже',
      'повторите попытку позже',
      'попробуйте еще раз позже',
      'попробуйте ещё раз позже',
    ],
  };

  static const Map<String, List<String>> causeless = <String, List<String>>{
    'en': <String>[
      'could not',
      'couldn\'t',
      'unable to',
      'cannot',
      'can\'t',
      'failed to',
    ],
    'fr': <String>[
      'impossible de',
      'impossible d\'',
      'échec',
      'nous n\'avons pas pu',
      'nous ne pouvons pas',
    ],
    'es': <String>[
      'no se pudo',
      'no se ha podido',
      'no fue posible',
      'no es posible',
    ],
    'zh': <String>[
      '无法',
      '未能',
    ],
    'pt': <String>[
      'não foi possível',
      'não é possível',
      'falha',
    ],
    'ar': <String>[
      'تعذر',
      'لا يمكن',
    ],
    'de': <String>[
      'konnte nicht',
      'kann nicht',
    ],
    'it': <String>[
      'impossibile',
      'non è stato possibile',
    ],
    'ja': <String>[],
    'ko': <String>[],
    'ru': <String>[
      'не удалось',
      'невозможно',
    ],
  };

  static const Map<String, List<String>> filler = <String, List<String>>{
    'en': <String>[
      'please try again',
      'try again',
      'please retry',
      'retry',
      'try again later',
      'please try again later',
      'sorry',
      'please',
    ],
    'fr': <String>[
      'veuillez réessayer',
      'réessayez',
      'merci de réessayer',
      'veuillez réessayer plus tard',
      'réessayez plus tard',
      'désolé',
      'désolée',
    ],
    'es': <String>[
      'inténtalo de nuevo',
      'inténtelo de nuevo',
      'vuelve a intentarlo',
      'vuelva a intentarlo',
      'por favor',
      'lo sentimos',
    ],
    'zh': <String>[
      '请重试',
      '请再试一次',
      '请稍后重试',
      '请稍后再试',
    ],
    'pt': <String>[
      'tente novamente',
      'tente de novo',
      'por favor',
      'desculpe',
    ],
    'ar': <String>[
      'يرجى المحاولة مرة أخرى',
      'حاول مرة أخرى',
      'عذرا',
    ],
    'de': <String>[
      'bitte versuchen sie es erneut',
      'versuchen sie es erneut',
      'bitte erneut versuchen',
      'erneut versuchen',
      'bitte',
      'entschuldigung',
    ],
    'it': <String>[
      'riprova',
      'riprovare',
      'per favore riprova',
      'per favore',
      'ci dispiace',
    ],
    'ja': <String>[],
    'ko': <String>[],
    'ru': <String>[
      'попробуйте еще раз',
      'попробуйте ещё раз',
      'повторите попытку',
      'пожалуйста',
      'извините',
    ],
  };

  static const Map<String, List<String>> causeWords = <String, List<String>>{
    'en': <String>[
      'because',
      'since',
    ],
    'fr': <String>[
      'car',
      'parce que',
      'puisque',
    ],
    'es': <String>[
      'porque',
      'ya que',
      'debido a que',
    ],
    'zh': <String>[
      '因为',
      '由于',
    ],
    'pt': <String>[
      'porque',
      'pois',
    ],
    'ar': <String>[
      'لأن',
      'بسبب',
    ],
    'de': <String>[
      'weil',
    ],
    'it': <String>[
      'perché',
      'poiché',
    ],
    'ja': <String>[],
    'ko': <String>[],
    'ru': <String>[
      'потому что',
      'так как',
    ],
  };
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
