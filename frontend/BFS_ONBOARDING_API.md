# BFS Onboarding - Data Schema & API Requirements

This document outlines the data structures and API endpoints required to support the BFS (Business Financial Scoring) onboarding and intelligence generation flow.

## 1. Data Collection Flow (Client-Side)

The onboarding flow progressively collects information across several steps:
1. **User Name**: `bfs_user_name` (string)
2. **Role**: `bfs_role` (string) - Options: Founder, Engineer, Product Manager, Data Scientist, AI Engineer, Other.
3. **Stage**: `bfs_stage` (string) - Options: Pre-idea, Idea, Pre-MVP, MVP, Customers, Revenue, Public.
4. **Company Name**: `bfs_company_name` (string)
5. **Initial Description**: `bfs_company_description` (string) - Collected in the chat UI.
6. **Follow-up Questions**: Dynamic multiple-choice questions asked by the agent to refine the business model.

## 2. API Endpoints

### `POST /api/bfs/init-session`
Called when the user submits their initial company description in the chat interface.

**Request Schema:**
```json
{
  "userName": "string",
  "role": "string",
  "stage": "string",
  "companyName": "string",
  "companyDescription": "string"
}
```

**Response Schema:**
```json
{
  "sessionId": "string",
  "agentResponse": "string",
  "toolExecution": {
    "toolName": "AskUserQuestion",
    "questionData": {
      "id": "string",
      "step": 1,
      "totalSteps": 5,
      "question": "string",
      "options": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "recommended": "boolean"
        }
      ]
    }
  }
}
```

### `POST /api/bfs/answer-question`
Called when the user answers a clarifying question from the agent.

**Request Schema:**
```json
{
  "sessionId": "string",
  "questionId": "string",
  "selectedOptionIds": ["string"],
  "customAnswer": "string"
}
```

**Response Schema:**
```json
{
  "status": "in_progress | completed",
  "nextQuestion": { 
    // Same schema as questionData above
  }, 
  "dashboardRedirectUrl": "string" // Returned when status is 'completed'
}
```

## 3. Database Schema Requirements

**Users / Sessions Table:**
- `id` (UUID)
- `user_name` (String)
- `role` (String)
- `stage` (String)
- `company_name` (String)
- `company_description` (Text)
- `created_at` (Timestamp)
- `status` (Enum: onboarding, generating, completed)

**Questions_Log Table:**
- `session_id` (UUID)
- `question_id` (String)
- `question_text` (String)
- `selected_options` (JSON Array)
- `answered_at` (Timestamp)

## 4. State Management Integration
Currently, data is stored in `sessionStorage`. Upon hitting the final chat submission, a single payload is constructed and sent to `/api/bfs/init-session` to instantiate the backend agent workflow, which replies with the first clarifying question.
