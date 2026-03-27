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
    interface_id: int
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
