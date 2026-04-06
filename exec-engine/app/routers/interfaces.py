from typing import Optional

from fastapi import APIRouter, Depends, Query

from ..core.auth import require_auth
from ..dependencies import get_interface_service
from ..schemas.api_mgmt import (
    InterfaceCreate,
    InterfaceListResponse,
    InterfaceResponse,
    InterfaceUpdate,
    ResponseModel,
)
from ..services.api_mgmt import InterfaceService


router = APIRouter(
    prefix="/interfaces",
    tags=["Interfaces"],
    dependencies=[Depends(require_auth)],
)


@router.post("", response_model=InterfaceResponse)
def create_interface(
    interface: InterfaceCreate,
    service: InterfaceService = Depends(get_interface_service),
):
    return InterfaceResponse(data=service.create_interface(interface))


@router.get("", response_model=InterfaceListResponse)
def list_interfaces(
    folder_id: Optional[str] = None,
    folder_code: Optional[str] = Query(None, alias="folderCode"),
    service: InterfaceService = Depends(get_interface_service),
):
    return InterfaceListResponse(data=service.list_interfaces(folder_code or folder_id))


@router.get("/{interface_code}", response_model=InterfaceResponse)
def get_interface(
    interface_code: str,
    service: InterfaceService = Depends(get_interface_service),
):
    return InterfaceResponse(data=service.get_interface(interface_code))


@router.patch("/{interface_code}", response_model=InterfaceResponse)
def update_interface(
    interface_code: str,
    interface: InterfaceUpdate,
    service: InterfaceService = Depends(get_interface_service),
):
    return InterfaceResponse(data=service.update_interface(interface_code, interface))


@router.delete("/{interface_code}", response_model=ResponseModel)
def delete_interface(
    interface_code: str,
    service: InterfaceService = Depends(get_interface_service),
):
    service.delete_interface(interface_code)
    return ResponseModel(msg="Interface deleted")
