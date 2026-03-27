from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.api_mgmt import Environment
from ..schemas.api_mgmt import EnvironmentCreate, EnvironmentUpdate, EnvironmentResponse, EnvironmentListResponse, ResponseModel

router = APIRouter(prefix="/environments", tags=["Environments"])

@router.post("", response_model=EnvironmentResponse)
def create_environment(env: EnvironmentCreate, db: Session = Depends(get_db)):
    db_env = Environment(**env.model_dump())
    db.add(db_env)
    db.commit()
    db.refresh(db_env)
    return EnvironmentResponse(data=db_env)

@router.get("", response_model=EnvironmentListResponse)
def list_environments(db: Session = Depends(get_db)):
    environments = db.query(Environment).order_by(Environment.id.asc()).all()
    return EnvironmentListResponse(data=environments)

@router.get("/{env_id}", response_model=EnvironmentResponse)
def get_environment(env_id: int, db: Session = Depends(get_db)):
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    return EnvironmentResponse(data=env)

@router.patch("/{env_id}", response_model=EnvironmentResponse)
def update_environment(env_id: int, env: EnvironmentUpdate, db: Session = Depends(get_db)):
    db_env = db.query(Environment).filter(Environment.id == env_id).first()
    if not db_env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    update_data = env.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_env, key, value)
        
    db.commit()
    db.refresh(db_env)
    return EnvironmentResponse(data=db_env)

@router.delete("/{env_id}", response_model=ResponseModel)
def delete_environment(env_id: int, db: Session = Depends(get_db)):
    db_env = db.query(Environment).filter(Environment.id == env_id).first()
    if not db_env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    db.delete(db_env)
    db.commit()
    return ResponseModel(msg="Environment deleted")
