package domain

type AuditEvent struct {
	EventType    string         `json:"event_type"`
	PartnerID    string         `json:"partner_id,omitempty"`
	ActorType    string         `json:"actor_type"`
	ActorRef     string         `json:"actor_ref"`
	ResourceType string         `json:"resource_type"`
	ResourceRef  string         `json:"resource_ref"`
	Status       string         `json:"status"`
	Payload      map[string]any `json:"payload"`
}
