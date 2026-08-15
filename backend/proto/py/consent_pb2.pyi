from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class ConsentInitiateRequest(_message.Message):
    __slots__ = ("partner_id", "user_ref_hash", "purpose_code", "data_from", "data_to")
    PARTNER_ID_FIELD_NUMBER: _ClassVar[int]
    USER_REF_HASH_FIELD_NUMBER: _ClassVar[int]
    PURPOSE_CODE_FIELD_NUMBER: _ClassVar[int]
    DATA_FROM_FIELD_NUMBER: _ClassVar[int]
    DATA_TO_FIELD_NUMBER: _ClassVar[int]
    partner_id: str
    user_ref_hash: str
    purpose_code: str
    data_from: str
    data_to: str
    def __init__(self, partner_id: _Optional[str] = ..., user_ref_hash: _Optional[str] = ..., purpose_code: _Optional[str] = ..., data_from: _Optional[str] = ..., data_to: _Optional[str] = ...) -> None: ...

class ConsentResponse(_message.Message):
    __slots__ = ("consent_id", "status", "expires_at")
    CONSENT_ID_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    EXPIRES_AT_FIELD_NUMBER: _ClassVar[int]
    consent_id: str
    status: str
    expires_at: str
    def __init__(self, consent_id: _Optional[str] = ..., status: _Optional[str] = ..., expires_at: _Optional[str] = ...) -> None: ...

class ConsentStatusRequest(_message.Message):
    __slots__ = ("consent_id",)
    CONSENT_ID_FIELD_NUMBER: _ClassVar[int]
    consent_id: str
    def __init__(self, consent_id: _Optional[str] = ...) -> None: ...
