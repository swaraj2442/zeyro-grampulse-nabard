-- name: CreateApplication :one
INSERT INTO applications (
    tenant_id,
    app_number,
    applicant_name,
    entity_type,
    applicant_segment,
    loan_amount,
    tenure_months,
    assigned_officer_id,
    stage,
    status,
    progress_percentage,
    created_by
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
) RETURNING *;

-- name: GetApplicationByID :one
SELECT * FROM applications
WHERE id = $1 AND tenant_id = $2;

-- name: GetApplicationByAppNumber :one
SELECT * FROM applications
WHERE app_number = $1 AND tenant_id = $2;

-- name: ListApplications :many
SELECT * FROM applications
WHERE tenant_id = @tenant_id
  AND (@search::text = '' OR app_number ILIKE '%' || @search || '%' OR applicant_name ILIKE '%' || @search || '%')
  AND (NULLIF(@stage::text, '')::application_stage IS NULL OR stage = NULLIF(@stage::text, '')::application_stage)
  AND (NULLIF(@status::text, '')::application_status IS NULL OR status = NULLIF(@status::text, '')::application_status)
  AND (NULLIF(@entity_type::text, '')::entity_type IS NULL OR entity_type = NULLIF(@entity_type::text, '')::entity_type)
  AND (NULLIF(@assigned_officer_id::text, '')::uuid IS NULL OR assigned_officer_id = NULLIF(@assigned_officer_id::text, '')::uuid)
  AND (
    @archived_filter::text = 'all' OR
    (@archived_filter::text = 'true' AND is_archived = TRUE) OR
    ((@archived_filter::text = 'false' OR @archived_filter::text = '') AND is_archived = FALSE)
  )
ORDER BY created_at DESC
LIMIT @limit_val OFFSET @offset_val;

-- name: CountApplications :one
SELECT COUNT(*) FROM applications
WHERE tenant_id = @tenant_id
  AND (@search::text = '' OR app_number ILIKE '%' || @search || '%' OR applicant_name ILIKE '%' || @search || '%')
  AND (NULLIF(@stage::text, '')::application_stage IS NULL OR stage = NULLIF(@stage::text, '')::application_stage)
  AND (NULLIF(@status::text, '')::application_status IS NULL OR status = NULLIF(@status::text, '')::application_status)
  AND (NULLIF(@entity_type::text, '')::entity_type IS NULL OR entity_type = NULLIF(@entity_type::text, '')::entity_type)
  AND (NULLIF(@assigned_officer_id::text, '')::uuid IS NULL OR assigned_officer_id = NULLIF(@assigned_officer_id::text, '')::uuid)
  AND (
    @archived_filter::text = 'all' OR
    (@archived_filter::text = 'true' AND is_archived = TRUE) OR
    ((@archived_filter::text = 'false' OR @archived_filter::text = '') AND is_archived = FALSE)
  );

-- name: UpdateApplicationStage :one
UPDATE applications
SET stage = $3,
    status = $4,
    progress_percentage = $5,
    updated_at = NOW()
WHERE id = $1 AND tenant_id = $2
RETURNING *;

-- name: UpdateApplicationAssignment :one
UPDATE applications
SET assigned_officer_id = $3,
    updated_at = NOW()
WHERE id = $1 AND tenant_id = $2
RETURNING *;

-- name: ArchiveApplication :one
UPDATE applications
SET is_archived = TRUE,
    archived_at = NOW(),
    archived_by = $3,
    archive_reason = $4,
    updated_at = NOW()
WHERE id = $1 AND tenant_id = $2
RETURNING *;

-- name: RestoreApplication :one
UPDATE applications
SET is_archived = FALSE,
    archived_at = NULL,
    archived_by = NULL,
    archive_reason = NULL,
    updated_at = NOW()
WHERE id = $1 AND tenant_id = $2
RETURNING *;

-- name: DisburseApplication :one
UPDATE applications
SET stage = 'disbursed'::application_stage,
    status = 'approved'::application_status,
    progress_percentage = 100,
    updated_at = NOW()
WHERE id = $1 AND tenant_id = $2 AND stage = 'ready_for_disbursement'::application_stage
RETURNING *;

-- name: UpdateApplicationBFS :one
UPDATE applications
SET bfs_score = $3,
    risk_tier = $4,
    recommendation = $5,
    updated_at = NOW()
WHERE id = $1 AND tenant_id = $2
RETURNING *;

-- name: CreateApplicationParty :one
INSERT INTO application_parties (
    tenant_id, application_id, party_type, full_name, email, phone, pan_masked, aadhaar_masked
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING *;

-- name: ListApplicationParties :many
SELECT * FROM application_parties
WHERE application_id = $1 AND tenant_id = $2;

-- name: UpsertApplicationFinancials :one
INSERT INTO application_financials (
    tenant_id, application_id, gross_monthly_income, net_monthly_income,
    existing_monthly_emi, declared_itr_income, aa_derived_monthly_inflow, bank_nsf_count
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) ON CONFLICT (id) DO UPDATE SET
    gross_monthly_income = EXCLUDED.gross_monthly_income,
    net_monthly_income = EXCLUDED.net_monthly_income,
    existing_monthly_emi = EXCLUDED.existing_monthly_emi,
    declared_itr_income = EXCLUDED.declared_itr_income,
    aa_derived_monthly_inflow = EXCLUDED.aa_derived_monthly_inflow,
    bank_nsf_count = EXCLUDED.bank_nsf_count,
    updated_at = NOW()
RETURNING *;

-- name: GetApplicationFinancials :one
SELECT * FROM application_financials
WHERE application_id = $1 AND tenant_id = $2;

-- name: CreateTimelineEvent :one
INSERT INTO application_timeline (
    tenant_id, application_id, event_type, previous_stage, new_stage, actor_id, actor_type, reason, metadata, request_id
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING *;

-- name: ListTimelineEvents :many
SELECT * FROM application_timeline
WHERE application_id = $1 AND tenant_id = $2
ORDER BY created_at DESC;

-- name: CreateDocument :one
INSERT INTO documents (
    tenant_id, application_id, doc_type, source, status, confidence_score, file_name
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING *;

-- name: GetDocumentByID :one
SELECT * FROM documents
WHERE id = $1 AND tenant_id = $2;

-- name: ListDocumentsByApplication :many
SELECT * FROM documents
WHERE application_id = $1 AND tenant_id = $2
ORDER BY created_at ASC;

-- name: UpdateDocumentStatus :one
UPDATE documents
SET status = $3,
    confidence_score = $4,
    updated_at = NOW()
WHERE id = $1 AND tenant_id = $2
RETURNING *;

-- name: CreateDocumentVersion :one
INSERT INTO document_versions (
    tenant_id, document_id, version_number, storage_key, file_size_bytes, mime_type, file_hash, uploaded_by
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING *;

-- name: GetLatestDocumentVersion :one
SELECT * FROM document_versions
WHERE document_id = $1 AND tenant_id = $2
ORDER BY version_number DESC
LIMIT 1;

-- name: CreateDocumentExtraction :one
INSERT INTO document_extractions (
    tenant_id, document_version_id, extractor_name, extractor_version, status, raw_payload
) VALUES (
    $1, $2, $3, $4, $5, $6
) RETURNING *;

-- name: CreateExtractedField :one
INSERT INTO extracted_fields (
    tenant_id, extraction_id, document_id, field_key, field_label, field_value, numeric_value, confidence, page_number, bounding_box
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING *;

-- name: ListExtractedFieldsByDocument :many
SELECT * FROM extracted_fields
WHERE document_id = $1 AND tenant_id = $2;

-- name: CreateFlag :one
INSERT INTO flags (
    tenant_id, application_id, document_id, flag_type, severity, title, consequence_description, downstream_impact
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING *;

-- name: ListFlagsByApplication :many
SELECT * FROM flags
WHERE application_id = $1 AND tenant_id = $2
ORDER BY created_at DESC;

-- name: ResolveFlag :one
UPDATE flags
SET is_resolved = TRUE,
    resolved_by = $3,
    resolved_at = NOW()
WHERE id = $1 AND tenant_id = $2
RETURNING *;

-- name: GetActiveBFSPolicy :one
SELECT * FROM bfs_policy_versions
WHERE tenant_id = $1 AND product_code = $2 AND is_active = TRUE
LIMIT 1;

-- name: ListBFSPolicyVersions :many
SELECT * FROM bfs_policy_versions
WHERE tenant_id = $1 AND product_code = $2
ORDER BY created_at DESC;

-- name: CreateBFSPolicyVersion :one
INSERT INTO bfs_policy_versions (
    tenant_id, policy_name, policy_version, product_code, segment_code, is_active, status, atp_weight, rps_weight, bcs_weight, fds_weight, min_pass_score, auto_approve_threshold, created_by
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
) RETURNING *;

-- name: LockPoliciesForUpdate :many
SELECT id FROM bfs_policy_versions
WHERE tenant_id = $1 AND product_code = $2
FOR UPDATE;

-- name: DeactivateActivePolicyForProduct :exec
UPDATE bfs_policy_versions
SET is_active = FALSE,
    updated_at = NOW()
WHERE tenant_id = $1 AND product_code = $2 AND is_active = TRUE;

-- name: ActivatePolicyVersionAtomic :one
UPDATE bfs_policy_versions
SET is_active = TRUE,
    status = 'active',
    approved_by = $3,
    approved_at = NOW(),
    effective_from = NOW()
WHERE id = $1 AND tenant_id = $2
RETURNING *;

-- name: CreateBFSScore :one
INSERT INTO bfs_scores (
    tenant_id, application_id, policy_version_id, engine_version, composite_score, risk_tier, confidence_level, input_snapshot, calculation_reason, previous_score_id
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING *;

-- name: GetLatestBFSScoreByApplication :one
SELECT * FROM bfs_scores
WHERE application_id = $1 AND tenant_id = $2
ORDER BY calculated_at DESC
LIMIT 1;

-- name: ListBFSScoreHistory :many
SELECT * FROM bfs_scores
WHERE application_id = $1 AND tenant_id = $2
ORDER BY calculated_at DESC;

-- name: CreateBFSScoreComponent :one
INSERT INTO bfs_score_components (
    bfs_score_id, component_name, raw_score, weight, weighted_contribution, metrics
) VALUES (
    $1, $2, $3, $4, $5, $6
) RETURNING *;

-- name: ListBFSScoreComponents :many
SELECT * FROM bfs_score_components
WHERE bfs_score_id = $1;

-- name: CreateBFSSignal :one
INSERT INTO bfs_signals (
    bfs_score_id, signal_type, signal_text, extracted_field_id, citation_metadata
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: ListBFSSignals :many
SELECT * FROM bfs_signals
WHERE bfs_score_id = $1;

-- name: CreateStructuredCondition :one
INSERT INTO conditions (
    tenant_id, application_id, condition_code, description, condition_type, due_date, is_mandatory, status, assigned_officer_id, version
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, 1
) RETURNING *;

-- name: GetConditionByID :one
SELECT * FROM conditions
WHERE id = $1 AND tenant_id = $2;

-- name: ListConditionsByApplication :many
SELECT * FROM conditions
WHERE application_id = $1 AND tenant_id = $2 AND cancelled_at IS NULL
ORDER BY created_at ASC;

-- name: UpdateConditionOptimistic :one
UPDATE conditions
SET status = $3,
    version = version + 1,
    met_at = CASE WHEN $3 = 'met'::condition_status THEN NOW() ELSE met_at END,
    waived_at = CASE WHEN $3 = 'waived'::condition_status THEN NOW() ELSE waived_at END,
    updated_at = NOW()
WHERE id = $1 AND tenant_id = $2 AND version = $4
RETURNING *;

-- name: SoftCancelCondition :one
UPDATE conditions
SET cancelled_at = NOW(),
    cancelled_by = $3,
    cancellation_reason = $4,
    updated_at = NOW()
WHERE id = $1 AND tenant_id = $2
RETURNING *;

-- name: CountPendingMandatoryConditions :one
SELECT COUNT(*) FROM conditions
WHERE application_id = $1 AND tenant_id = $2 AND is_mandatory = TRUE AND status = 'pending' AND cancelled_at IS NULL;

-- name: CreateConditionReminder :one
INSERT INTO condition_reminders (
    tenant_id, condition_id, message_template, requested_by
) VALUES (
    $1, $2, $3, $4
) RETURNING *;

-- name: CreateReminderDelivery :one
INSERT INTO condition_reminder_deliveries (
    tenant_id, reminder_id, channel, status, provider_message_id
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: ListReminderDeliveriesByCondition :many
SELECT d.* FROM condition_reminder_deliveries d
JOIN condition_reminders r ON d.reminder_id = r.id
WHERE r.condition_id = $1 AND d.tenant_id = $2
ORDER BY d.created_at DESC;

-- name: CreateProcessingJob :one
INSERT INTO processing_jobs (
    tenant_id, application_id, job_type, status, payload, max_attempts, idempotency_key
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING *;

-- name: ClaimProcessingJob :one
UPDATE processing_jobs
SET status = 'processing',
    locked_at = NOW(),
    locked_by = $1,
    heartbeat_at = NOW(),
    started_at = NOW(),
    attempt_count = attempt_count + 1,
    updated_at = NOW()
WHERE id = (
    SELECT id FROM processing_jobs
    WHERE status IN ('queued', 'retry_scheduled')
      AND available_at <= NOW()
    ORDER BY available_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
)
RETURNING *;

-- name: UpdateProcessingJobStatus :one
UPDATE processing_jobs
SET status = $2,
    result = $3,
    last_error = $4,
    completed_at = CASE WHEN $2 IN ('completed'::job_status, 'failed'::job_status, 'cancelled'::job_status) THEN NOW() ELSE completed_at END,
    locked_at = NULL,
    locked_by = NULL,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: GetProcessingJobByID :one
SELECT * FROM processing_jobs
WHERE id = $1 AND tenant_id = $2;

-- name: ListProcessingJobsByApp :many
SELECT * FROM processing_jobs
WHERE application_id = $1 AND tenant_id = $2
ORDER BY created_at DESC;

-- name: CreateExportArtifact :one
INSERT INTO export_artifacts (
    tenant_id, application_id, job_id, artifact_type, file_name, storage_key, sha256, mime_type, size_bytes, template_version, source_version_id, generated_by, expires_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
) RETURNING *;

-- name: GetExportArtifactByJob :one
SELECT * FROM export_artifacts
WHERE job_id = $1 AND tenant_id = $2;

-- name: CreateProductionAccessRequest :one
INSERT INTO production_access_requests (
    tenant_id, organization_name, organization_type, expected_monthly_applications, requested_capabilities, contact_name, contact_email
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING *;

-- name: CreateOutboxEvent :one
INSERT INTO outbox_events (
    tenant_id, application_id, aggregate_type, aggregate_id, event_type, payload
) VALUES (
    $1, $2, $3, $4, $5, $6
) RETURNING *;

-- name: ListUnpublishedOutboxEvents :many
SELECT * FROM outbox_events
WHERE published_at IS NULL AND tenant_id = $1 AND sequence_number > $2
ORDER BY sequence_number ASC
LIMIT $3;

-- name: MarkOutboxEventPublished :exec
UPDATE outbox_events
SET published_at = NOW()
WHERE id = $1;
