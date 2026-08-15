from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class AssessmentRequest(_message.Message):
    __slots__ = ("assessment_id", "partner_id", "user_ref_hash", "products", "consent_id", "partner_ref_id")
    ASSESSMENT_ID_FIELD_NUMBER: _ClassVar[int]
    PARTNER_ID_FIELD_NUMBER: _ClassVar[int]
    USER_REF_HASH_FIELD_NUMBER: _ClassVar[int]
    PRODUCTS_FIELD_NUMBER: _ClassVar[int]
    CONSENT_ID_FIELD_NUMBER: _ClassVar[int]
    PARTNER_REF_ID_FIELD_NUMBER: _ClassVar[int]
    assessment_id: str
    partner_id: str
    user_ref_hash: str
    products: _containers.RepeatedScalarFieldContainer[str]
    consent_id: str
    partner_ref_id: str
    def __init__(self, assessment_id: _Optional[str] = ..., partner_id: _Optional[str] = ..., user_ref_hash: _Optional[str] = ..., products: _Optional[_Iterable[str]] = ..., consent_id: _Optional[str] = ..., partner_ref_id: _Optional[str] = ...) -> None: ...

class AssessmentStatusRequest(_message.Message):
    __slots__ = ("assessment_id",)
    ASSESSMENT_ID_FIELD_NUMBER: _ClassVar[int]
    assessment_id: str
    def __init__(self, assessment_id: _Optional[str] = ...) -> None: ...

class AssessmentStatusResponse(_message.Message):
    __slots__ = ("assessment_id", "status", "overall_signal", "score_version")
    ASSESSMENT_ID_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    OVERALL_SIGNAL_FIELD_NUMBER: _ClassVar[int]
    SCORE_VERSION_FIELD_NUMBER: _ClassVar[int]
    assessment_id: str
    status: str
    overall_signal: str
    score_version: str
    def __init__(self, assessment_id: _Optional[str] = ..., status: _Optional[str] = ..., overall_signal: _Optional[str] = ..., score_version: _Optional[str] = ...) -> None: ...
