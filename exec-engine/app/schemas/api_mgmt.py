from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import AliasChoices, BaseModel, ConfigDict, Field

from ..models.api_mgmt import ApiStatus, HttpMethod


class ContractModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")


class ResponseModel(ContractModel):
    code: int = 200
    data: Optional[Any] = None
    msg: str = "success"


class FolderCreate(ContractModel):
    name: str
    parent_id: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("parent_id", "parentId", "parentCode"),
    )


class FolderUpdate(ContractModel):
    name: Optional[str] = None
    parent_id: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("parent_id", "parentId", "parentCode"),
    )


class FolderResponse(ResponseModel):
    data: Optional[Dict[str, Any]] = None


class FolderListResponse(ResponseModel):
    data: List[Dict[str, Any]] = Field(default_factory=list)


class InterfaceCreate(ContractModel):
    name: str
    method: HttpMethod
    path: str
    folder_id: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("folder_id", "folderId", "folderCode"),
    )
    status: Optional[ApiStatus] = ApiStatus.DEVELOPING
    owner: Optional[str] = "admin"
    query_params: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        validation_alias=AliasChoices("query_params", "queryParams"),
    )
    header_params: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        validation_alias=AliasChoices("header_params", "headerParams"),
    )
    body_definition: Optional[Dict[str, Any]] = Field(
        default=None,
        validation_alias=AliasChoices("body_definition", "bodyDefinition"),
    )
    post_operations: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        validation_alias=AliasChoices("post_operations", "postOperations"),
    )


class InterfaceUpdate(ContractModel):
    name: Optional[str] = None
    method: Optional[HttpMethod] = None
    path: Optional[str] = None
    folder_id: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("folder_id", "folderId", "folderCode"),
    )
    status: Optional[ApiStatus] = None
    owner: Optional[str] = None
    query_params: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        validation_alias=AliasChoices("query_params", "queryParams"),
    )
    header_params: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        validation_alias=AliasChoices("header_params", "headerParams"),
    )
    body_definition: Optional[Dict[str, Any]] = Field(
        default=None,
        validation_alias=AliasChoices("body_definition", "bodyDefinition"),
    )
    post_operations: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        validation_alias=AliasChoices("post_operations", "postOperations"),
    )


class InterfaceResponse(ResponseModel):
    data: Optional[Dict[str, Any]] = None


class InterfaceListResponse(ResponseModel):
    data: List[Dict[str, Any]] = Field(default_factory=list)


class EnvironmentCreate(ContractModel):
    name: str
    base_url: str = Field(
        validation_alias=AliasChoices("base_url", "baseUrl")
    )
    urls: Optional[List[Dict[str, Any]]] = None
    variables: Optional[List[Dict[str, Any]]] = None
    global_config: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        validation_alias=AliasChoices("global_config", "globalConfig"),
    )
    is_active: Optional[bool] = Field(
        default=True,
        validation_alias=AliasChoices("is_active", "isActive"),
    )


class EnvironmentUpdate(ContractModel):
    name: Optional[str] = None
    base_url: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("base_url", "baseUrl"),
    )
    urls: Optional[List[Dict[str, Any]]] = None
    variables: Optional[List[Dict[str, Any]]] = None
    global_config: Optional[Dict[str, Any]] = Field(
        default=None,
        validation_alias=AliasChoices("global_config", "globalConfig"),
    )
    is_active: Optional[bool] = Field(
        default=None,
        validation_alias=AliasChoices("is_active", "isActive"),
    )


class EnvironmentResponse(ResponseModel):
    data: Optional[Dict[str, Any]] = None


class EnvironmentListResponse(ResponseModel):
    data: List[Dict[str, Any]] = Field(default_factory=list)


class TestCaseCreate(ContractModel):
    interface_id: str = Field(
        validation_alias=AliasChoices("interface_id", "interfaceId", "interfaceCode")
    )
    name: str
    case_type: str = Field(
        default="test",
        validation_alias=AliasChoices("case_type", "caseType"),
    )
    query_params: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        validation_alias=AliasChoices("query_params", "queryParams"),
    )
    header_params: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        validation_alias=AliasChoices("header_params", "headerParams"),
    )
    body_definition: Optional[Dict[str, Any]] = Field(
        default=None,
        validation_alias=AliasChoices("body_definition", "bodyDefinition"),
    )
    assertions: Optional[List[Dict[str, Any]]] = None
    pre_operations: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        validation_alias=AliasChoices("pre_operations", "preOperations"),
    )
    post_operations: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        validation_alias=AliasChoices("post_operations", "postOperations"),
    )


class TestCaseUpdate(ContractModel):
    interface_id: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("interface_id", "interfaceId", "interfaceCode"),
    )
    requirement_group_id: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("requirement_group_id", "requirementGroupId", "requirementGroupCode"),
    )
    name: Optional[str] = None
    case_type: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("case_type", "caseType"),
    )
    query_params: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        validation_alias=AliasChoices("query_params", "queryParams"),
    )
    header_params: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        validation_alias=AliasChoices("header_params", "headerParams"),
    )
    body_definition: Optional[Dict[str, Any]] = Field(
        default=None,
        validation_alias=AliasChoices("body_definition", "bodyDefinition"),
    )
    assertions: Optional[List[Dict[str, Any]]] = None
    pre_operations: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        validation_alias=AliasChoices("pre_operations", "preOperations"),
    )
    post_operations: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        validation_alias=AliasChoices("post_operations", "postOperations"),
    )


class TestCaseResponse(ResponseModel):
    data: Optional[Dict[str, Any]] = None


class TestCaseListResponse(ResponseModel):
    data: List[Dict[str, Any]] = Field(default_factory=list)


class FunctionalTestCaseCreate(ContractModel):
    module: str = ""
    case_code: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("case_code", "caseCode"),
    )
    title: str
    priority: str = "P2"
    category: str = "functional"
    preconditions: Optional[str] = None
    steps: Optional[List[Dict[str, Any]]] = None
    expected_result: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("expected_result", "expectedResult"),
    )
    remark: Optional[str] = None
    status: str = "draft"


class FunctionalTestCaseUpdate(ContractModel):
    module: Optional[str] = None
    case_code: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("case_code", "caseCode"),
    )
    title: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    preconditions: Optional[str] = None
    steps: Optional[List[Dict[str, Any]]] = None
    expected_result: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("expected_result", "expectedResult"),
    )
    remark: Optional[str] = None
    status: Optional[str] = None


class FunctionalTestCaseListPayload(ContractModel):
    items: List[Dict[str, Any]]
    total: int


class FunctionalTestCaseResponse(ResponseModel):
    data: Optional[Dict[str, Any]] = None


class FunctionalTestCaseListResponse(ResponseModel):
    data: Optional[FunctionalTestCaseListPayload] = None


class ImportResultPayload(ContractModel):
    imported: int
    skipped: int
    errors: List[str] = Field(default_factory=list)


class TimestampedPayload(ContractModel):
    id: str
    code: Optional[str] = None
    created_at: Optional[datetime] = None
