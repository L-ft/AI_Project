from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.api_mgmt import Folder
from ..schemas.api_mgmt import FolderCreate, FolderUpdate, FolderResponse, FolderListResponse, ResponseModel

router = APIRouter(prefix="/folders", tags=["Folders"])

@router.post("", response_model=FolderResponse)
def create_folder(folder: FolderCreate, db: Session = Depends(get_db)):
    # 修正：处理 parent_id 为 0 的情况（通常代表根目录），将其设为 None
    parent_id = folder.parent_id if folder.parent_id != 0 else None
    
    # 检查父目录是否存在
    if parent_id is not None:
        parent = db.query(Folder).filter(Folder.id == parent_id).first()
        if not parent:
            raise HTTPException(status_code=400, detail=f"Parent folder with id {parent_id} not found")

    db_folder = Folder(name=folder.name, parent_id=parent_id)
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    return FolderResponse(data=db_folder)

@router.get("", response_model=FolderListResponse)
def list_folders(db: Session = Depends(get_db)):
    folders = db.query(Folder).all()
    return FolderListResponse(data=folders)

@router.get("/{folder_id}", response_model=FolderResponse)
def get_folder(folder_id: int, db: Session = Depends(get_db)):
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return FolderResponse(data=folder)

@router.patch("/{folder_id}", response_model=FolderResponse)
def update_folder(folder_id: int, folder: FolderUpdate, db: Session = Depends(get_db)):
    db_folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if not db_folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    if folder.name is not None:
        db_folder.name = folder.name
    if folder.parent_id is not None:
        # 修正：处理 parent_id 为 0 的情况
        db_folder.parent_id = folder.parent_id if folder.parent_id != 0 else None
        
    db.commit()
    db.refresh(db_folder)
    return FolderResponse(data=db_folder)

@router.delete("/{folder_id}", response_model=ResponseModel)
def delete_folder(folder_id: int, db: Session = Depends(get_db)):
    db_folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if not db_folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    db.delete(db_folder)
    db.commit()
    return ResponseModel(msg="Folder deleted")
