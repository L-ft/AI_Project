from fastapi import APIRouter, Depends

from ..core.auth import require_auth
from ..dependencies import get_folder_service
from ..schemas.api_mgmt import (
    FolderCreate,
    FolderListResponse,
    FolderResponse,
    FolderUpdate,
    ResponseModel,
)
from ..services.api_mgmt import FolderService


router = APIRouter(
    prefix="/folders",
    tags=["Folders"],
    dependencies=[Depends(require_auth)],
)


@router.post("", response_model=FolderResponse)
def create_folder(
    folder: FolderCreate,
    service: FolderService = Depends(get_folder_service),
):
    return FolderResponse(data=service.create_folder(folder))


@router.get("", response_model=FolderListResponse)
def list_folders(service: FolderService = Depends(get_folder_service)):
    return FolderListResponse(data=service.list_folders())


@router.get("/{folder_code}", response_model=FolderResponse)
def get_folder(folder_code: str, service: FolderService = Depends(get_folder_service)):
    return FolderResponse(data=service.get_folder(folder_code))


@router.patch("/{folder_code}", response_model=FolderResponse)
def update_folder(
    folder_code: str,
    folder: FolderUpdate,
    service: FolderService = Depends(get_folder_service),
):
    return FolderResponse(data=service.update_folder(folder_code, folder))


@router.delete("/{folder_code}", response_model=ResponseModel)
def delete_folder(folder_code: str, service: FolderService = Depends(get_folder_service)):
    service.delete_folder(folder_code)
    return ResponseModel(msg="Folder deleted")
