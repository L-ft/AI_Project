from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..models.api_mgmt import HttpMethod, ApiStatus

class ResponseModel(BaseModel):
    code: int = 200
    data: Optional[Any] = None
    msg: str = "success"

class FolderSchema(BaseModel):
    id: int
    name: str
    parent_id: Optional[int]
    model_config = ConfigDict(from_attributes=True)

class FolderCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None

class FolderResponse(ResponseModel):
    data: Optional[FolderSchema] = None

class FolderListResponse(ResponseModel):
    data: List[FolderSchema] = []

class InterfaceSchema(BaseModel):
    id: int
    name: str
    method: HttpMethod
    path: str
    status: ApiStatus
    owner: str
    folder_id: Optional[int] = None
    query_params: Optional[List[Dict]] = None
    header_params: Optional[List[Dict]] = None
    body_definition: Optional[Dict] = None
    post_operations: Optional[List[Dict]] = None
    model_config = ConfigDict(from_attributes=True)

class EnvironmentSchema(BaseModel):
    id: int
    name: str
    base_url: str
    urls: Optional[List[Dict]] = None
    variables: Optional[List[Dict]] = None
    global_config: Dict[str, Any]
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class EnvironmentCreate(BaseModel):
    name: str
    base_url: str
    urls: Optional[List[Dict]] = None
    variables: Optional[List[Dict]] = None
    global_config: Optional[Dict[str, Any]] = {}
    is_active: Optional[bool] = True

class EnvironmentUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None
    urls: Optional[List[Dict]] = None
    variables: Optional[List[Dict]] = None
    global_config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class EnvironmentResponse(ResponseModel):
    data: Optional[EnvironmentSchema] = None

class EnvironmentListResponse(ResponseModel):
    data: List[EnvironmentSchema] = []

# --- CRUD Schemas ---

# Folders
class FolderUpdate(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None

# Interfaces
class InterfaceCreate(BaseModel):
    name: str
    method: HttpMethod
    path: str
    folder_id: Optional[int] = None
    status: Optional[ApiStatus] = ApiStatus.DEVELOPING
    owner: Optional[str] = "admin"
    query_params: Optional[List[Dict]] = None
    header_params: Optional[List[Dict]] = None
    body_definition: Optional[Dict] = None
    post_operations: Optional[List[Dict]] = None

class InterfaceUpdate(BaseModel):
    name: Optional[str] = None
    method: Optional[HttpMethod] = None
    path: Optional[str] = None
    folder_id: Optional[int] = None
    status: Optional[ApiStatus] = None
    owner: Optional[str] = None
    query_params: Optional[List[Dict]] = None
    header_params: Optional[List[Dict]] = None
    body_definition: Optional[Dict] = None
    post_operations: Optional[List[Dict]] = None

class InterfaceResponse(ResponseModel):
    data: Optional[InterfaceSchema] = None

class InterfaceListResponse(ResponseModel):
    data: List[InterfaceSchema] = []

# Test Cases
class TestCaseSchema(BaseModel):
    id: int
    interface_id: Optional[int] = None
    requirement_group_id: Optional[int] = None
    name: str
    case_type: str = "test"
    query_params: Optional[List[Dict]] = None
    header_params: Optional[List[Dict]] = None
    body_definition: Optional[Dict] = None
    assertions: Optional[List[Dict]] = None
    post_operations: Optional[List[Dict]] = None
    model_config = ConfigDict(from_attributes=True)

class TestCaseCreate(BaseModel):
    interface_id: int
    name: str
    case_type: str = "test"
    query_params: Optional[List[Dict]] = None
    header_params: Optional[List[Dict]] = None
    body_definition: Optional[Dict] = None
    assertions: Optional[List[Dict]] = None
    post_operations: Optional[List[Dict]] = None

class TestCaseUpdate(BaseModel):
    name: Optional[str] = None
    case_type: Optional[str] = None
    query_params: Optional[List[Dict]] = None
    header_params: Optional[List[Dict]] = None
    body_definition: Optional[Dict] = None
    assertions: Optional[List[Dict]] = None
    post_operations: Optional[List[Dict]] = None

class TestCaseResponse(ResponseModel):
    data: Optional[TestCaseSchema] = None

class TestCaseListResponse(ResponseModel):
    data: List[TestCaseSchema] = []

# --- 功能测试用例（需求菜单下独立库） ---
class FunctionalTestCaseStep(BaseModel):
    order: int = 1
    action: str = ""
    expected: str = ""


class FunctionalTestCaseSchema(BaseModel):
    id: int
    module: str = ""
    case_code: Optional[str] = None
    title: str
    priority: str = "P2"
    category: str = "functional"
    preconditions: Optional[str] = None
    steps: Optional[List[Dict[str, Any]]] = None
    expected_result: Optional[str] = None
    remark: Optional[str] = None
    status: str = "draft"
    model_config = ConfigDict(from_attributes=True)


class FunctionalTestCaseCreate(BaseModel):
    module: str = ""
    case_code: Optional[str] = None
    title: str
    priority: str = "P2"
    category: str = "functional"
    preconditions: Optional[str] = None
    steps: Optional[List[Dict[str, Any]]] = None
    expected_result: Optional[str] = None
    remark: Optional[str] = None
    status: str = "draft"


class FunctionalTestCaseUpdate(BaseModel):
    module: Optional[str] = None
    case_code: Optional[str] = None
    title: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    preconditions: Optional[str] = None
    steps: Optional[List[Dict[str, Any]]] = None
    expected_result: Optional[str] = None
    remark: Optional[str] = None
    status: Optional[str] = None


class FunctionalTestCaseListPayload(BaseModel):
    items: List[FunctionalTestCaseSchema]
    total: int


class FunctionalTestCaseResponse(ResponseModel):
    data: Optional[FunctionalTestCaseSchema] = None


class FunctionalTestCaseListResponse(ResponseModel):
    data: Optional[FunctionalTestCaseListPayload] = None


class ImportResultPayload(BaseModel):
    imported: int
    skipped: int
    errors: List[str] = Field(default_factory=list)
