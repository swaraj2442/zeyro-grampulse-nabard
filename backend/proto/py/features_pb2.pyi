from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class FeatureRecomputeRequest(_message.Message):
    __slots__ = ("user_ref_hash", "window", "feature_groups")
    USER_REF_HASH_FIELD_NUMBER: _ClassVar[int]
    WINDOW_FIELD_NUMBER: _ClassVar[int]
    FEATURE_GROUPS_FIELD_NUMBER: _ClassVar[int]
    user_ref_hash: str
    window: str
    feature_groups: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, user_ref_hash: _Optional[str] = ..., window: _Optional[str] = ..., feature_groups: _Optional[_Iterable[str]] = ...) -> None: ...

class FeatureRecord(_message.Message):
    __slots__ = ("feature_group", "feature_name", "feature_value_json", "computed_at")
    FEATURE_GROUP_FIELD_NUMBER: _ClassVar[int]
    FEATURE_NAME_FIELD_NUMBER: _ClassVar[int]
    FEATURE_VALUE_JSON_FIELD_NUMBER: _ClassVar[int]
    COMPUTED_AT_FIELD_NUMBER: _ClassVar[int]
    feature_group: str
    feature_name: str
    feature_value_json: str
    computed_at: str
    def __init__(self, feature_group: _Optional[str] = ..., feature_name: _Optional[str] = ..., feature_value_json: _Optional[str] = ..., computed_at: _Optional[str] = ...) -> None: ...

class FeatureResponse(_message.Message):
    __slots__ = ("user_ref_hash", "window", "records")
    USER_REF_HASH_FIELD_NUMBER: _ClassVar[int]
    WINDOW_FIELD_NUMBER: _ClassVar[int]
    RECORDS_FIELD_NUMBER: _ClassVar[int]
    user_ref_hash: str
    window: str
    records: _containers.RepeatedCompositeFieldContainer[FeatureRecord]
    def __init__(self, user_ref_hash: _Optional[str] = ..., window: _Optional[str] = ..., records: _Optional[_Iterable[_Union[FeatureRecord, _Mapping]]] = ...) -> None: ...
