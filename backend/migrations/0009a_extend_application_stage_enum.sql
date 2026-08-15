-- Migration: 0009a_extend_application_stage_enum.sql
-- Description: Extend application_stage enum for post-approval underwriting workflow

ALTER TYPE application_stage ADD VALUE IF NOT EXISTS 'conditions_pending';
ALTER TYPE application_stage ADD VALUE IF NOT EXISTS 'ready_for_disbursement';
ALTER TYPE application_stage ADD VALUE IF NOT EXISTS 'disbursed';
ALTER TYPE application_stage ADD VALUE IF NOT EXISTS 'closed';
