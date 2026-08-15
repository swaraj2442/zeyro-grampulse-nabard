export type EntityType = 'individual' | 'corporate';
export type ApplicantSegment = 'salaried' | 'self_employed' | 'msme' | 'gig';

// Standardized Application Stage Taxonomy
export type ApplicationStage =
  | 'draft'
  | 'submitted'
  | 'documents_pending'
  | 'documents_processing'
  | 'review_ready'
  | 'under_review'
  | 'additional_information_required'
  | 'conditionally_approved'
  | 'approved'
  | 'conditions_pending'
  | 'ready_for_disbursement'
  | 'disbursed'
  | 'closed'
  | 'rejected'
  | 'withdrawn'
  | 'cancelled';

export type ApplicationStatus = 'pending' | 'approved' | 'approved_with_conditions' | 'rejected' | 'escalated' | 'withdrawn';
export type RiskTier = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationType = 'approve' | 'approve_with_conditions' | 'reject' | 'escalate';

export interface ApplicationItem {
  id: string;
  appNumber: string;
  applicantName: string;
  entityType: EntityType;
  loanAmount: number;
  tenureMonths: number;
  stage: ApplicationStage;
  progressPercentage: number;
  status: ApplicationStatus;
  bfsScore?: number;
  riskTier?: RiskTier;
  recommendation?: RecommendationType;
  assignedOfficerId?: string;
  isArchived?: boolean;
  archivedAt?: string;
  archivedBy?: string;
  archiveReason?: string;
  createdAt: string;
}

export interface ApplicationListResponse {
  total: number;
  page: number;
  limit: number;
  applications: ApplicationItem[];
}

export type ConditionType = 'document' | 'collateral' | 'verification' | 'financial' | 'legal' | 'custom';
export type ConditionStatus = 'pending' | 'met' | 'waived' | 'failed';

export interface ApprovalCondition {
  id: string;
  tenant_id: string;
  application_id: string;
  condition_code: string;
  condition_type: ConditionType;
  description: string;
  due_date?: string;
  is_mandatory: boolean;
  status: ConditionStatus;
  version: number;
  assigned_officer_id?: string;
  met_at?: string;
  waived_at?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  created_at: string;
}

export interface ReminderDelivery {
  id: string;
  reminder_id: string;
  channel: 'chat' | 'email' | 'sms';
  status: 'queued' | 'processing' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled';
  provider_message_id?: string;
  attempt_count: number;
  created_at: string;
}

export interface JobArtifact {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl: string;
  expiresAt: string;
}

export interface ProcessingJobResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  artifact?: JobArtifact;
}

export interface HybridAssessmentResponse {
  applicationId: string;
  policyAssessment: {
    score: number;
    status: string;
    policyVersion: string;
    components: Record<string, any>;
  };
  riskAssessment: {
    probabilityOfDefault: number;
    riskScore: number;
    riskTier: RiskTier;
    modelVersion: string;
  };
  decision: {
    recommendation: 'approve' | 'conditionally_approved' | 'reject' | 'escalate';
    reasonCodes: string[];
  };
}

export interface ProductionAccessRequestInput {
  organizationName: string;
  organizationType: 'nbfc' | 'bank' | 'fintech';
  expectedMonthlyApplications: number;
  requestedCapabilities: Array<'account_aggregator' | 'predictive_risk_model' | 'credit_memo' | 'rbi_audit'>;
  contactName: string;
  contactEmail: string;
}

export interface DocumentItem {
  id: string;
  docType: string;
  source: string;
  status: 'verified' | 'analysing' | 'missing' | 'flagged' | 'not_required';
  confidenceScore: number;
  fileName: string;
  flag?: {
    id: string;
    severity: 'info' | 'warning' | 'critical';
    title: string;
    consequenceDescription: string;
    downstreamImpact: Record<string, any>;
  };
}

export interface DocumentViewerPayload {
  documentId: string;
  docType: string;
  source: string;
  signedFileUrl: string;
  confidenceScore: number;
  extractedFields: Array<{
    key: string;
    label: string;
    value: string;
    confidence: number;
    pageNumber: number;
    boundingBox?: { x: number; y: number; width: number; height: number };
  }>;
  crossValidation: {
    hasMismatch: boolean;
    sourceA: { label: string; value: string };
    sourceB: { label: string; value: string };
    gapAmount: number;
    gapPercentage: number;
    thresholdPercentage: number;
    warningText: string;
  };
}

export interface BFSScoreResponse {
  applicationId: string;
  compositeScore: number;
  riskTier: RiskTier;
  confidenceLevel: number;
  engineVersion: string;
  scoredAt: string;
  components: Record<string, {
    score: number;
    weight: number;
    contribution: number;
    metrics: Record<string, any>;
  }>;
  positiveSignals: Array<{ text: string; citation: Record<string, any> }>;
  riskSignals: Array<{ text: string; citation: Record<string, any> }>;
}

export interface BFSPolicy {
  id: string;
  policyName: string;
  policyVersion: string;
  isActive: boolean;
  atpWeight: number;
  rpsWeight: number;
  bcsWeight: number;
  fdsWeight: number;
  minPassScore: number;
  autoApproveThreshold: number;
}
