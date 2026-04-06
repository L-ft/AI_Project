from fastapi import APIRouter, Depends

from ..core.auth import require_auth
from ..dependencies import get_environment_service
from ..schemas.api_mgmt import (
    EnvironmentCreate,
    EnvironmentListResponse,
    EnvironmentResponse,
    EnvironmentUpdate,
    ResponseModel,
)
from ..services.api_mgmt import EnvironmentService


router = APIRouter(
    prefix="/environments",
    tags=["Environments"],
    dependencies=[Depends(require_auth)],
)


@router.post("", response_model=EnvironmentResponse)
def create_environment(
    env: EnvironmentCreate,
    service: EnvironmentService = Depends(get_environment_service),
):
    return EnvironmentResponse(data=service.create_environment(env))


@router.get("", response_model=EnvironmentListResponse)
def list_environments(service: EnvironmentService = Depends(get_environment_service)):
    return EnvironmentListResponse(data=service.list_environments())


@router.get("/{env_code}", response_model=EnvironmentResponse)
def get_environment(
    env_code: str,
    service: EnvironmentService = Depends(get_environment_service),
):
    return EnvironmentResponse(data=service.get_environment(env_code))


@router.patch("/{env_code}", response_model=EnvironmentResponse)
def update_environment(
    env_code: str,
    env: EnvironmentUpdate,
    service: EnvironmentService = Depends(get_environment_service),
):
    return EnvironmentResponse(data=service.update_environment(env_code, env))


@router.delete("/{env_code}", response_model=ResponseModel)
def delete_environment(
    env_code: str,
    service: EnvironmentService = Depends(get_environment_service),
):
    service.delete_environment(env_code)
    return ResponseModel(msg="Environment deleted")
