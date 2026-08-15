package underwriting

import (
	"testing"

	"github.com/arthazeyro/zeyro-b2b/internal/repository/postgres/gen"
)

func TestWorkflowStageTransitions(t *testing.T) {
	we := NewWorkflowEngine(nil)

	tests := []struct {
		current  gen.ApplicationStage
		target   gen.ApplicationStage
		expected bool
	}{
		{gen.ApplicationStageDraft, gen.ApplicationStageSubmitted, true},
		{gen.ApplicationStageDraft, gen.ApplicationStageApproved, false},
		{gen.ApplicationStageSubmitted, gen.ApplicationStageDocumentsPending, true},
		{gen.ApplicationStageDocumentsPending, gen.ApplicationStageDocumentsProcessing, true},
		{gen.ApplicationStageDocumentsProcessing, gen.ApplicationStageReviewReady, true},
		{gen.ApplicationStageReviewReady, gen.ApplicationStageUnderReview, true},
		{gen.ApplicationStageUnderReview, gen.ApplicationStageConditionallyApproved, true},
		{gen.ApplicationStageUnderReview, gen.ApplicationStageApproved, true},
		{gen.ApplicationStageUnderReview, gen.ApplicationStageRejected, true},
		{gen.ApplicationStageConditionallyApproved, gen.ApplicationStageApproved, true},
		{gen.ApplicationStageConditionallyApproved, gen.ApplicationStageRejected, true},
	}

	for _, tt := range tests {
		result := we.CanTransition(tt.current, tt.target)
		if result != tt.expected {
			t.Errorf("CanTransition(%s -> %s) = %v; expected %v", tt.current, tt.target, result, tt.expected)
		}
	}
}
