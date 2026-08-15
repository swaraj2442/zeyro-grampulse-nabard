from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class AuditEventRequest(_message.Message):
    __slots__ = ("event_type", "partner_id", "actor_type", "actor_ref", "resource_type", "resource_ref", "status", "payload_json")
    EVENT_TYPE_FIELD_NUMBER: _ClassVar[int]
    PARTNER_ID_FIELD_NUMBER: _ClassVar[int]
    ACTOR_TYPE_FIELD_NUMBER: _ClassVar[int]
    ACTOR_REF_FIELD_NUMBER: _ClassVar[int]
    RESOURCE_TYPE_FIELD_NUMBER: _ClassVar[int]
    RESOURCE_REF_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    PAYLOAD_JSON_FIELD_NUMBER: _ClassVar[int]
    event_type: str
    partner_id: str
    actor_type: str
    actor_ref: str
    resource_type: str
    resource_ref: str
    status: str
    payload_json: str
    def __init__(self, event_type: _Optional[str] = ..., partner_id: _Optional[str] = ..., actor_type: _Optional[str] = ..., actor_ref: _Optional[str] = ..., resource_type: _Optional[str] = ..., resource_ref: _Optional[str] = ..., status: _Optional[str] = ..., payload_json: _Optional[str] = ...) -> None: ...

class AuditEventResponse(_message.Message):
    __slots__ = ("event_id", "occurred_at")
    EVENT_ID_FIELD_NUMBER: _ClassVar[int]
    OCCURRED_AT_FIELD_NUMBER: _ClassVar[int]
    event_id: str
    occurred_at: str
    def __init__(self, event_id: _Optional[str] = ..., occurred_at: _Optional[str] = ...) -> None: ...
