import { useEffect } from 'react';
import { ApplicationListResponse, ApplicationItem, DocumentViewerPayload, BFSScoreResponse, ProcessingJobResponse, HybridAssessmentResponse, ProductionAccessRequestInput } from '@/types/underwriting';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/underwriting`;

// Helper to read cookies from browser
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
};

const getHeaders = () => {
  const token = getCookie('zeyro_b2b_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-ID': `req_${Date.now()}`,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Fallback for dev if token is missing
    headers['X-Tenant-ID'] = '00000000-0000-0000-0000-000000000001';
  }
  
  return headers;
};

export const underwritingApi = {
  // Application Pipeline
  async getApplications(params?: { search?: string; status?: string; archived?: 'false' | 'true' | 'all'; page?: number; limit?: number }): Promise<ApplicationListResponse> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/applications?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch applications`);
    return res.json();
  },

  async getApplicationById(id: string): Promise<ApplicationItem> {
    const res = await fetch(`${BASE_URL}/applications/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch application details`);
    return res.json();
  },

  async createApplication(data: { applicantName: string; loanAmount: number; tenureMonths: number; entityType: string; applicantSegment?: string; assignedOfficerId?: string }) {
    const res = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to create application`);
    return res.json();
  },

  async updateStage(id: string, newStage: string, reason?: string) {
    const res = await fetch(`${BASE_URL}/applications/${id}/stage`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ newStage, reason }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update stage`);
    return res.json();
  },

  async assignOfficer(id: string, officerId: string) {
    const res = await fetch(`${BASE_URL}/applications/${id}/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ officerId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to assign officer`);
    return res.json();
  },

  async archiveApplication(id: string, reason: string) {
    const res = await fetch(`${BASE_URL}/applications/${id}/archive`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to archive application`);
    return res.json();
  },

  async restoreApplication(id: string) {
    const res = await fetch(`${BASE_URL}/applications/${id}/restore`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to restore application`);
    return res.json();
  },

  async disburseApplication(id: string, data: { loanAccountId: string; disbursedAmount: number; referenceNumber: string }) {
    const res = await fetch(`${BASE_URL}/applications/${id}/disburse`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}: Disbursement failed`);
    }
    return res.json();
  },

  // Document APIs
  async getDocumentChecklist(applicationId: string) {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/documents`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch document checklist`);
    return res.json();
  },

  async getDocumentViewer(documentId: string): Promise<DocumentViewerPayload> {
    const res = await fetch(`${BASE_URL}/documents/${documentId}/viewer`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch document viewer payload`);
    return res.json();
  },

  async triggerDocumentSync(applicationId: string) {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/documents/sync`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to trigger document sync`);
    return res.json();
  },

  // BFS Score APIs
  async getBFSScore(applicationId: string): Promise<BFSScoreResponse> {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/bfs-score`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch BFS score`);
    return res.json();
  },

  async recalculateBFS(applicationId: string) {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/bfs-score/recalculate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to recalculate BFS score`);
    return res.json();
  },

  // Credit Memo & Async Export Jobs
  async getCreditMemo(applicationId: string) {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/credit-memo`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch credit memo`);
    return res.json();
  },

  async generateCreditMemo(applicationId: string) {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/credit-memo/generate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to generate credit memo`);
    return res.json();
  },

  async updateCreditMemoSection(applicationId: string, sectionKey: string, updatedContent: string) {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/credit-memo/section`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ sectionKey, updatedContent }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update credit memo section`);
    return res.json();
  },

  async exportCreditMemo(applicationId: string): Promise<{ jobId: string; status: string }> {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/credit-memo/export`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to queue credit memo export`);
    return res.json();
  },

  async getProcessingJob(jobId: string): Promise<ProcessingJobResponse> {
    const res = await fetch(`${BASE_URL}/processing-jobs/${jobId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to poll processing job`);
    return res.json();
  },

  // Decisioning & Conditions with Concurrency Control
  async submitDecision(applicationId: string, decisionData: { decision: string; conditions?: string[]; decisionNotes?: string; overrideOccurred?: boolean; overrideReason?: string }) {
    if (!applicationId) {
      console.warn('submitDecision called without valid applicationId');
      return { success: false, reason: 'missing_application_id' };
    }
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/decision`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(decisionData),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: Failed to submit decision - ${errBody}`);
    }
    return res.json();
  },

  async getConditions(applicationId: string) {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/conditions`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch application conditions`);
    return res.json();
  },

  async createCondition(applicationId: string, data: { type: string; description: string; dueDate?: string; mandatory: boolean }) {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/conditions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to create condition`);
    return res.json();
  },

  async updateCondition(conditionId: string, status: string, expectedVersion: number) {
    const res = await fetch(`${BASE_URL}/conditions/${conditionId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, expectedVersion }),
    });
    if (res.status === 409) {
      throw new Error('409 Conflict: Condition was updated by another officer in the background. Reloading latest state...');
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update condition`);
    return res.json();
  },

  async sendConditionReminder(conditionId: string, channels: string[]) {
    const res = await fetch(`${BASE_URL}/conditions/${conditionId}/reminders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ channels, messageTemplate: 'condition_due_reminder' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to send condition reminders`);
    return res.json();
  },

  async getConditionsTracker() {
    const res = await fetch(`${BASE_URL}/conditions/`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch conditions tracker`);
    return res.json();
  },

  async getDecisionLog() {
    const res = await fetch(`${BASE_URL}/decision-log`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch decision log`);
    return res.json();
  },

  // BFS Policy Versions & Atomic Activation
  async createPolicyVersion(data: { policyName: string; policyVersion: string; atpWeight: number; rpsWeight: number; bcsWeight: number; fdsWeight: number; minPassScore: number; autoApproveThreshold: number }) {
    const res = await fetch(`${BASE_URL}/settings/bfs-policy/versions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to create policy version`);
    return res.json();
  },

  async activatePolicyVersion(versionId: string) {
    const res = await fetch(`${BASE_URL}/settings/bfs-policy/versions/${versionId}/activate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to activate policy version`);
    return res.json();
  },

  // Hybrid ML Assessment
  async getAssessment(applicationId: string): Promise<HybridAssessmentResponse> {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/assessment`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch hybrid ML assessment`);
    return res.json();
  },

  async runAssessment(applicationId: string): Promise<HybridAssessmentResponse> {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/assessment`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to run hybrid ML assessment`);
    return res.json();
  },

  // Production Access Request
  async requestProductionAccess(data: ProductionAccessRequestInput) {
    const res = await fetch('http://localhost:8000/api/v1/tenant/production-access-requests', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Production access request failed`);
    return res.json();
  },

  // Integrated Chat APIs
  async getChatMessages(applicationId: string) {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/chat`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch chat messages`);
    return res.json();
  },

  async sendChatMessage(
    applicationId: string,
    messageText: string,
    channel: string = 'WhatsApp',
    aiDraftMode: string = 'draft-only'
  ) {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/chat/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ messageText, channel, aiDraftMode }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to send message`);
    return res.json();
  },

  // Portfolio Insights & Logs APIs
  async getPortfolioInsights() {
    const res = await fetch(`${BASE_URL}/insights/pipeline`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch portfolio insights`);
    return res.json();
  },

  async getTeamWorkload() {
    const res = await fetch(`${BASE_URL}/insights/team-workload`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch team workload`);
    return res.json();
  },

  async getAgentLogs() {
    const res = await fetch(`${BASE_URL}/agent-logs`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch agent logs`);
    return res.json();
  },
};

// SSE Stream Hook for Real-Time Event Updates
export function useUnderwritingStream(applicationId: string | null, onEvent: (eventType: string, data: any) => void) {
  useEffect(() => {
    if (!applicationId) return;

    const url = `${BASE_URL}/stream?applicationId=${applicationId}`;
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(url);

      eventSource.addEventListener('job.completed', (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        onEvent('job.completed', data);
      });

      eventSource.addEventListener('bfs.updated', (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        onEvent('bfs.updated', data);
      });

      eventSource.addEventListener('document.flagged', (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        onEvent('document.flagged', data);
      });

      eventSource.onerror = (err) => {
        console.warn('SSE Stream connection warning:', err);
      };
    } catch (e) {
      console.warn('Failed to initialize SSE stream:', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [applicationId, onEvent]);
}
