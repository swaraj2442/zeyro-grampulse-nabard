-- Seed script for Underwriting Agent Workspace
-- Tenant ID: 00000000-0000-0000-0000-000000000001
-- Targets all underwriting tables to prepare the system for full pipeline testing.

-- 1. Clean up old records
TRUNCATE TABLE agent_logs CASCADE;
TRUNCATE TABLE condition_reminder_deliveries CASCADE;
TRUNCATE TABLE condition_reminders CASCADE;
TRUNCATE TABLE conditions CASCADE;
TRUNCATE TABLE decision_logs CASCADE;
TRUNCATE TABLE credit_memo_citations CASCADE;
TRUNCATE TABLE credit_memo_sections CASCADE;
TRUNCATE TABLE credit_memo_versions CASCADE;
TRUNCATE TABLE credit_memos CASCADE;
TRUNCATE TABLE bfs_signals CASCADE;
TRUNCATE TABLE bfs_score_components CASCADE;
TRUNCATE TABLE bfs_scores CASCADE;
TRUNCATE TABLE bfs_policy_versions CASCADE;
TRUNCATE TABLE flags CASCADE;
TRUNCATE TABLE extracted_fields CASCADE;
TRUNCATE TABLE document_extractions CASCADE;
TRUNCATE TABLE document_versions CASCADE;
TRUNCATE TABLE documents CASCADE;
TRUNCATE TABLE application_timeline CASCADE;
TRUNCATE TABLE application_financials CASCADE;
TRUNCATE TABLE application_parties CASCADE;
TRUNCATE TABLE chat_messages CASCADE;
TRUNCATE TABLE chat_threads CASCADE;
TRUNCATE TABLE export_artifacts CASCADE;
TRUNCATE TABLE production_access_requests CASCADE;

DELETE FROM applications WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- 2. Seed BFS Policy Versions
-- Seed active, draft, and retired policy versions
INSERT INTO bfs_policy_versions (id, tenant_id, policy_name, policy_version, is_active, atp_weight, rps_weight, bcs_weight, fds_weight, min_pass_score, auto_approve_threshold, product_code, segment_code, status, effective_from)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'MSME Standard Unsecured Policy', 'msme-policy-v2.0', TRUE, 0.35, 0.30, 0.20, 0.15, 650, 750, 'MSME_UNSECURED', '', 'active', NOW() - INTERVAL '30 days'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'MSME High-Risk Policy (Draft)', 'msme-policy-v2.1', FALSE, 0.40, 0.20, 0.20, 0.20, 700, 800, 'MSME_UNSECURED', '', 'draft', NULL),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Legacy Policy (Retired)', 'msme-policy-v1.0', FALSE, 0.50, 0.20, 0.20, 0.10, 600, 700, 'MSME_UNSECURED', '', 'retired', NOW() - INTERVAL '90 days');

-- 3. Seed Applications
INSERT INTO applications (id, tenant_id, app_number, applicant_name, entity_type, applicant_segment, loan_amount, tenure_months, assigned_officer_id, stage, status, progress_percentage, bfs_score, risk_tier, recommendation, is_archived, created_at)
VALUES
  -- Under Review (Baseline Case)
  ('a1b2c3d4-e5f6-7890-abcd-1234567890ab', '00000000-0000-0000-0000-000000000001', 'APP-2831', 'Acme Software Solutions Pvt Ltd', 'corporate', 'msme', 2500000.00, 24, '00000000-0000-0000-0000-000000000001', 'under_review', 'pending', 85, 87, 'low', 'approve', FALSE, NOW() - INTERVAL '2 hours'),
  
  -- Submitted (Fresh Case, needs scoring/analysis)
  ('b2c3d4e5-f6a7-8901-bcde-2345678901bc', '00000000-0000-0000-0000-000000000001', 'APP-2832', 'Rajesh Kumar', 'individual', 'self_employed', 750000.00, 36, '00000000-0000-0000-0000-000000000001', 'submitted', 'pending', 35, 64, 'medium', 'approve_with_conditions', FALSE, NOW() - INTERVAL '1 day'),
  
  -- Review Ready (Underwriter action needed)
  ('c3d4e5f6-a7b8-9012-cdef-3456789012cd', '00000000-0000-0000-0000-000000000001', 'APP-2833', 'TechCraft Logistics', 'corporate', 'msme', 4500000.00, 48, NULL, 'review_ready', 'pending', 75, 82, 'low', 'approve', FALSE, NOW() - INTERVAL '12 hours'),
  
  -- Conditionally Approved (To test condition tracking and checklists)
  ('d4e5f6a7-b8c9-0123-def0-4567890123de', '00000000-0000-0000-0000-000000000001', 'APP-2834', 'Vardhaman Textiles', 'corporate', 'msme', 1500000.00, 18, NULL, 'conditionally_approved', 'approved_with_conditions', 90, 72, 'medium', 'approve_with_conditions', FALSE, NOW() - INTERVAL '3 days'),
  
  -- Ready for Disbursement (Test disbursement flow - conditions met)
  ('e5f6a7b8-c9d0-1234-ef01-5678901234ef', '00000000-0000-0000-0000-000000000001', 'APP-2835', 'Greenwood Agro', 'corporate', 'msme', 3000000.00, 12, NULL, 'ready_for_disbursement', 'approved', 95, 78, 'low', 'approve', FALSE, NOW() - INTERVAL '4 days'),
  
  -- Disbursed (Completed flow)
  ('f6a7b8c9-d0e1-2345-f012-6789012345f0', '00000000-0000-0000-0000-000000000001', 'APP-2836', 'Hindustan Gears', 'corporate', 'msme', 5000000.00, 60, NULL, 'disbursed', 'approved', 100, 92, 'low', 'approve', FALSE, NOW() - INTERVAL '10 days'),
  
  -- Archived Application (To test restore and archived=true filter)
  ('07a7b8c9-d0e1-2345-f012-6789012345f1', '00000000-0000-0000-0000-000000000001', 'APP-2837', 'Manoj Auto Services', 'individual', 'self_employed', 400000.00, 12, NULL, 'draft', 'withdrawn', 10, 45, 'high', 'reject', TRUE, NOW() - INTERVAL '15 days');

-- Update the archived metadata for the archived case
UPDATE applications 
SET archived_at = NOW() - INTERVAL '5 days', 
    archived_by = '00000000-0000-0000-0000-000000000001', 
    archive_reason = 'Withdrawn by applicant - opted for another bank'
WHERE id = '07a7b8c9-d0e1-2345-f012-6789012345f1';

-- 4. Seed Parties
INSERT INTO application_parties (id, tenant_id, application_id, party_type, full_name, email, phone, pan_masked, aadhaar_masked)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'borrower', 'Acme Software Solutions', 'finance@acmesoftware.co', '+91 98765 43210', 'AABCXXXXX1F', 'XXXX-XXXX-8910'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'guarantor', 'Vikram Aditya (Director)', 'vikram@acmesoftware.co', '+91 98765 43211', 'ABCPXXXXX7G', 'XXXX-XXXX-1234'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'b2c3d4e5-f6a7-8901-bcde-2345678901bc', 'borrower', 'Rajesh Kumar', 'rajesh.kumar@gmail.com', '+91 99887 76655', 'ASDPXXXXX2K', 'XXXX-XXXX-5678');

-- 5. Seed Financial Profiles
INSERT INTO application_financials (id, tenant_id, application_id, gross_monthly_income, net_monthly_income, existing_monthly_emi, declared_itr_income, aa_derived_monthly_inflow, bank_nsf_count)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 850000.00, 620000.00, 45000.00, 7200000.00, 890000.00, 0),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'b2c3d4e5-f6a7-8901-bcde-2345678901bc', 120000.00, 85000.00, 20000.00, 950000.00, 90000.00, 2),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'c3d4e5f6-a7b8-9012-cdef-3456789012cd', 1500000.00, 1100000.00, 120000.00, 14000000.00, 1600000.00, 1);

-- 6. Seed Application Timeline Entries
INSERT INTO application_timeline (tenant_id, application_id, event_type, previous_stage, new_stage, actor_type, reason, metadata)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'STAGE_TRANSITION', 'draft', 'submitted', 'system', 'Completed application submission form', '{}'),
  ('00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'DOCUMENT_VERIFIED', 'submitted', 'under_review', 'officer', 'All primary KYC & Bank Statements verified', '{}'),
  ('00000000-0000-0000-0000-000000000001', 'd4e5f6a7-b8c9-0123-def0-4567890123de', 'DECISION_SUBMITTED', 'under_review', 'conditionally_approved', 'officer', 'Approved subject to audited balance sheet verification', '{"overrideOccurred": false}');

-- 7. Seed Documents, Versions, Extractions & Fields
-- APP-2831 (Acme Software Solutions) Documents
INSERT INTO documents (id, tenant_id, application_id, doc_type, source, status, confidence_score, file_name, created_at)
VALUES
  ('d1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'bank_statement', 'aa_feed', 'verified', 99.50, 'hdfc_current_12m.pdf', NOW() - INTERVAL '1 day'),
  ('d2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'cibil_report', 'cibil_api', 'verified', 100.00, 'cibil_commercial_score.pdf', NOW() - INTERVAL '1 day'),
  ('d3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'gst_return', 'findoc_upload', 'verified', 95.20, 'gst3b_fy25.pdf', NOW() - INTERVAL '1 day');

-- Document Versions (using 'c1111111-...' instead of 'v1111111-...' to use valid UUID hex characters)
INSERT INTO document_versions (id, tenant_id, document_id, version_number, storage_key, file_size_bytes, mime_type, file_hash)
VALUES
  ('c1111111-1111-1111-2222-111111111111', '00000000-0000-0000-0000-000000000001', 'd1111111-1111-1111-1111-111111111111', 1, 'statements/hdfc_current_12m.pdf', 1048576, 'application/pdf', 'sha_hash_stmt_1'),
  ('c2222222-2222-2222-3333-222222222222', '00000000-0000-0000-0000-000000000001', 'd2222222-2222-2222-2222-222222222222', 1, 'reports/cibil_commercial_score.pdf', 524288, 'application/pdf', 'sha_hash_cibil'),
  ('c3333333-3333-3333-4444-333333333333', '00000000-0000-0000-0000-000000000001', 'd3333333-3333-3333-3333-333333333333', 1, 'gst/gst3b_fy25.pdf', 2097152, 'application/pdf', 'sha_hash_gst');

-- Document Extractions
INSERT INTO document_extractions (id, tenant_id, document_version_id, extractor_name, extractor_version, status, raw_payload)
VALUES
  ('e1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'c1111111-1111-1111-2222-111111111111', 'aa-parser', 'v3.1', 'completed', '{"average_inflow": 890000, "bounces": 0}'),
  ('e2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'c2222222-2222-2222-3333-222222222222', 'cibil-extractor', 'v1.0', 'completed', '{"score": 790, "active_loans": 2}');

-- Extracted Fields for tracing
INSERT INTO extracted_fields (tenant_id, extraction_id, document_id, field_key, field_label, field_value, numeric_value, confidence)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'avg_monthly_inflow', 'Average Monthly Inflow', '890000.00', 890000.00, 0.9980),
  ('00000000-0000-0000-0000-000000000001', 'e2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'cibil_score', 'CIBIL Bureau Score', '790', 790.00, 1.0000);

-- 8. Seed Flags (Warnings & Risk alerts)
INSERT INTO flags (tenant_id, application_id, document_id, flag_type, severity, title, consequence_description, downstream_impact, is_resolved)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'd3333333-3333-3333-3333-333333333333', 'income_mismatch', 'warning', 'GST turnover versus declared income variance (>10%)', 'Reported GST sales sum to ₹64 Lakhs but declared ITR income is ₹72 Lakhs. This may affect credit limits.', '{"recalculateBFS": true}', FALSE),
  ('00000000-0000-0000-0000-000000000001', 'b2c3d4e5-f6a7-8901-bcde-2345678901bc', NULL, 'dpd_history', 'critical', 'Recent DPD (Days Past Due) spike in 90 days', 'Experian report shows 30-day DPD on personal loan. Risk parameters increased.', '{}', FALSE);

-- 9. Seed BFS Score Details
-- Acme score
INSERT INTO bfs_scores (id, tenant_id, application_id, policy_version_id, composite_score, risk_tier, confidence_level, input_snapshot, calculation_reason)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', '11111111-1111-1111-1111-111111111111', 87, 'low', 95.00, '{"monthlyInflow": 890000, "bureauScore": 790, "existingEmi": 45000}', 'Automated batch analysis');

-- components
INSERT INTO bfs_score_components (bfs_score_id, component_name, raw_score, weight, weighted_contribution, metrics)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'atp', 92, 0.35, 32.20, '{"netSurplus": 575000, "dscr": 2.1}'),
  ('a1111111-1111-1111-1111-111111111111', 'rps', 88, 0.30, 26.40, '{"dpdCount": 0}'),
  ('a1111111-1111-1111-1111-111111111111', 'bcs', 82, 0.20, 16.40, '{"cibil": 790}'),
  ('a1111111-1111-1111-1111-111111111111', 'fds', 80, 0.15, 12.00, '{"nsf": 0}');

-- signals
INSERT INTO bfs_signals (bfs_score_id, signal_type, signal_text, citation_metadata)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'positive', 'Strong Debt Service Coverage Ratio (DSCR: 2.1x) based on HDFC statements', '{"source": "bank_statement"}'),
  ('a1111111-1111-1111-1111-111111111111', 'positive', 'Excellent Credit History (CIBIL: 790) with no defaults in last 24 months', '{"source": "cibil_commercial_score"}'),
  ('a1111111-1111-1111-1111-111111111111', 'risk', 'Minor variance detected in GST turnover reports', '{"source": "gst3b_fy25"}');

-- 10. Seed Conditions (Trackers & Checklists)
INSERT INTO conditions (id, tenant_id, application_id, condition_code, description, status, condition_type, due_date, is_mandatory, version)
VALUES
  -- Conditions for Vardhaman Textiles (Stage: Conditionally Approved)
  ('c1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'd4e5f6a7-b8c9-0123-def0-4567890123de', 'COND-001', 'Submit audited Balance Sheet for FY25 verified by CA', 'pending', 'financial', '2026-08-15', TRUE, 1),
  ('c2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'd4e5f6a7-b8c9-0123-def0-4567890123de', 'COND-002', 'Provide proof of ownership for mortgage collateral property', 'pending', 'collateral', '2026-08-20', TRUE, 1),
  ('c3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'd4e5f6a7-b8c9-0123-def0-4567890123de', 'COND-003', 'Sign Board Resolution permitting new borrowing limits', 'met', 'legal', '2026-07-30', FALSE, 2),
  
  -- Conditions for Greenwood Agro (Stage: Ready for Disbursement - All Mandatory Conditions Met/Waived)
  ('c4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'e5f6a7b8-c9d0-1234-ef01-5678901234ef', 'COND-101', 'NOC from existing lender HDFC Bank', 'met', 'verification', '2026-07-20', TRUE, 2),
  ('c5555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'e5f6a7b8-c9d0-1234-ef01-5678901234ef', 'COND-102', 'Physical verification of warehousing facility', 'met', 'verification', '2026-07-25', TRUE, 2);

-- 11. Seed Condition Reminders & Deliveries (using valid UUID hex characters)
INSERT INTO condition_reminders (id, tenant_id, condition_id, message_template, requested_by)
VALUES
  ('01111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111', 'condition_due_reminder', '00000000-0000-0000-0000-000000000001');

INSERT INTO condition_reminder_deliveries (id, tenant_id, reminder_id, channel, status, attempt_count, provider_message_id)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '01111111-1111-1111-1111-111111111111', 'chat', 'delivered', 1, 'msg_chat_10284618274'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '01111111-1111-1111-1111-111111111111', 'email', 'sent', 1, 'msg_email_378461937402');

-- 12. Seed Credit Memos, Versions, Sections & Citations (using valid UUID hex characters)
-- Acme credit memo
INSERT INTO credit_memos (id, tenant_id, application_id, active_version_id)
VALUES
  ('00000000-2222-3333-4444-555555555555', '00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'cc111111-1111-1111-1111-111111111111');

-- version 1
INSERT INTO credit_memo_versions (id, tenant_id, credit_memo_id, version_number, llm_provider, llm_model, prompt_version, temperature, input_hash)
VALUES
  ('cc111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '00000000-2222-3333-4444-555555555555', 1, 'zeyro-agent', 'zbu-underwriter-v1', 'v2.0', 0.2, 'sha_hash_input_acme');

-- sections
INSERT INTO credit_memo_sections (memo_version_id, section_key, content)
VALUES
  ('cc111111-1111-1111-1111-111111111111', 'executive_summary', '## Executive Summary

Application submitted by **Acme Software Solutions Pvt Ltd** for a credit facility of ₹25.00 Lakhs. The BFS automatic underwriting agent scored the applicant at **87/100** indicating a low risk profile. Recommend approval subject to directors personal guarantee.'),

  ('cc111111-1111-1111-1111-111111111111', 'financial_analysis', '## Financial Analysis

- Average monthly cash flow is ₹8.9 Lakhs over HDFC statement audit.
- Total annual turnover extrapolated from GST return is ₹64 Lakhs.
- Existing debt service obligations of ₹45,000 monthly, leading to a strong DSCR exceeding 2.1x.'),

  ('cc111111-1111-1111-1111-111111111111', 'risk_assessment', '## Risk Assessment

Risk is primarily mitigated by high cash reserves. The only flagged warning is a minor GST turnover mismatch vs declared tax filings (<12% variance), which is typical for seasonal SaaS software billings. Risk classification is LOW.'),

  ('cc111111-1111-1111-1111-111111111111', 'mitigants', '## Mitigants

- Secondary security: Joint personal guarantee from directors.
- Account aggregator feed confirms zero bank bouncing occurrences.'),

  ('cc111111-1111-1111-1111-111111111111', 'recommendation', '## Recommendation

Recommending final credit team approval of ₹25.00 Lakhs with 24 months tenure at 11.5% fixed interest.');

-- citations
INSERT INTO credit_memo_citations (id, memo_version_id, chip_id, claim_text, document_id, source_line)
VALUES
  (gen_random_uuid(), 'cc111111-1111-1111-1111-111111111111', 'cit-1', 'Average monthly cash flow is ₹8.9 Lakhs', 'd1111111-1111-1111-1111-111111111111', 'HDFC Bank Statement Page 3, row 14'),
  (gen_random_uuid(), 'cc111111-1111-1111-1111-111111111111', 'cit-2', 'CIBIL bureau score is 790', 'd2222222-2222-2222-2222-222222222222', 'CIBIL Commercial Score summary');

-- 13. Seed Decision Logs (To populate override history / log panels)
INSERT INTO decision_logs (tenant_id, application_id, officer_id, officer_role, original_system_recommendation, final_decision, override_occurred, override_reason_code, override_justification, conditions_summary, outcome_90d, event_hash)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'd4e5f6a7-b8c9-0123-def0-4567890123de', '00000000-0000-0000-0000-000000000001', 'loan_officer', 'approve_with_conditions', 'conditionally_approved', FALSE, NULL, NULL, '["COND-001", "COND-002"]', 'pending', 'hash_dec_1'),
  ('00000000-0000-0000-0000-000000000001', 'e5f6a7b8-c9d0-1234-ef01-5678901234ef', '00000000-0000-0000-0000-000000000001', 'credit_head', 'reject', 'approved', TRUE, 'CREDIT_MITIGANT', 'Officer override: approved since applicant furnished post-dated cheques matching 1.5x EMI requirements.', '[]', 'on_time', 'hash_dec_2');

-- 14. Seed Copilot Chat Threads & Multi-Turn Chats
INSERT INTO chat_threads (id, tenant_id, application_id)
VALUES
  ('f1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab');

INSERT INTO chat_messages (tenant_id, thread_id, application_id, sender_type, sender_id, sender_name, message_text, content, is_auto_outreach)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'f1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'agent', 'bfs-copilot', 'Zeyro BFS Underwriter Agent', 'Welcome. I have completed analysis of Acme Software Solutions. Composite score is 87. You can check the credit memo sections or ask me questions about bank statements.', 'Welcome. I have completed analysis of Acme Software Solutions. Composite score is 87. You can check the credit memo sections or ask me questions about bank statements.', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'f1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'officer', '00000000-0000-0000-0000-000000000001', 'Swaraj Chouriwar (Officer)', 'Are there any recurring salary patterns or other high-value outflows in the HDFC statement?', 'Are there any recurring salary patterns or other high-value outflows in the HDFC statement?', FALSE),
  ('00000000-0000-0000-0000-000000000001', 'f1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'agent', 'bfs-copilot', 'Zeyro BFS Underwriter Agent', 'Yes, I extracted 14 recurrent monthly payroll debits averaging ₹4.2 Lakhs on the 1st of every month. I did not detect any high-value cash withdrawals or structural leverage signs.', 'Yes, I extracted 14 recurrent monthly payroll debits averaging ₹4.2 Lakhs on the 1st of every month. I did not detect any high-value cash withdrawals or structural leverage signs.', FALSE);

-- 15. Seed Agent Logs (Copilot real-time logs panel)
INSERT INTO agent_logs (tenant_id, application_id, trace_id, severity, message, metadata)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'tr-101', 'INFO', 'Initializing risk assessment ruleset engine for MSME segment', '{"segment": "msme"}'),
  ('00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'tr-102', 'INFO', 'Analyzing CIBIL commercial records: Credit Score 790 extracted', '{"score": 790}'),
  ('00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'tr-103', 'WARNING', 'GST filings indicate discrepancy in reported annual turnover vs ITR declarations', '{"variancePercentage": 11.20}'),
  ('00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'tr-104', 'INFO', 'Recalculating weighted BFS score using standard active MSME weight configurations', '{"scoreComponents": {"atp": 92, "rps": 88, "bcs": 82, "fds": 80}}'),
  ('00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'tr-105', 'INFO', 'Score calculation complete: Composite BFS Score 87 (Risk Tier: LOW)', '{"compositeScore": 87}'),
  ('00000000-0000-0000-0000-000000000001', 'b2c3d4e5-f6a7-8901-bcde-2345678901bc', 'tr-201', 'INFO', 'Triggered automated bank statement parser for Rajesh Kumar', '{"documentType": "bank_statement"}'),
  ('00000000-0000-0000-0000-000000000001', 'b2c3d4e5-f6a7-8901-bcde-2345678901bc', 'tr-202', 'WARNING', 'NSF (Non-Sufficient Funds) occurrences detected in statement. Count: 2', '{"nsfCount": 2}');

-- 16. Seed export_artifacts
INSERT INTO export_artifacts (id, tenant_id, application_id, artifact_type, file_name, storage_key, sha256, mime_type, size_bytes, template_version, generated_by, expires_at)
VALUES
  ('e1a7b8c9-d0e1-2345-f012-6789012345f1', '00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'credit_memo_pdf', 'credit-memo-acme.pdf', 'memos/credit-memo-acme.pdf', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'application/pdf', 284192, 'v2.0', '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '1 day');
