from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ScoreRequest(_message.Message):
    __slots__ = ("partner_id", "user_ref_hash", "products", "score_version")
    PARTNER_ID_FIELD_NUMBER: _ClassVar[int]
    USER_REF_HASH_FIELD_NUMBER: _ClassVar[int]
    PRODUCTS_FIELD_NUMBER: _ClassVar[int]
    SCORE_VERSION_FIELD_NUMBER: _ClassVar[int]
    partner_id: str
    user_ref_hash: str
    products: _containers.RepeatedScalarFieldContainer[str]
    score_version: str
    def __init__(self, partner_id: _Optional[str] = ..., user_ref_hash: _Optional[str] = ..., products: _Optional[_Iterable[str]] = ..., score_version: _Optional[str] = ...) -> None: ...

class ScoreFactor(_message.Message):
    __slots__ = ("code", "description", "impact")
    CODE_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    IMPACT_FIELD_NUMBER: _ClassVar[int]
    code: str
    description: str
    impact: float
    def __init__(self, code: _Optional[str] = ..., description: _Optional[str] = ..., impact: _Optional[float] = ...) -> None: ...

class ScoreResult(_message.Message):
    __slots__ = ("product", "label", "value", "factors")
    PRODUCT_FIELD_NUMBER: _ClassVar[int]
    LABEL_FIELD_NUMBER: _ClassVar[int]
    VALUE_FIELD_NUMBER: _ClassVar[int]
    FACTORS_FIELD_NUMBER: _ClassVar[int]
    product: str
    label: str
    value: float
    factors: _containers.RepeatedCompositeFieldContainer[ScoreFactor]
    def __init__(self, product: _Optional[str] = ..., label: _Optional[str] = ..., value: _Optional[float] = ..., factors: _Optional[_Iterable[_Union[ScoreFactor, _Mapping]]] = ...) -> None: ...

class ScoreResponse(_message.Message):
    __slots__ = ("user_ref_hash", "score_version", "results")
    USER_REF_HASH_FIELD_NUMBER: _ClassVar[int]
    SCORE_VERSION_FIELD_NUMBER: _ClassVar[int]
    RESULTS_FIELD_NUMBER: _ClassVar[int]
    user_ref_hash: str
    score_version: str
    results: _containers.RepeatedCompositeFieldContainer[ScoreResult]
    def __init__(self, user_ref_hash: _Optional[str] = ..., score_version: _Optional[str] = ..., results: _Optional[_Iterable[_Union[ScoreResult, _Mapping]]] = ...) -> None: ...
