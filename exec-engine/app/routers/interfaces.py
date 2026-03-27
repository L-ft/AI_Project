from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.api_mgmt import Interface, Folder
from ..schemas.api_mgmt import InterfaceCreate, InterfaceUpdate, InterfaceResponse, InterfaceListResponse, ResponseModel

router = APIRouter(prefix="/interfaces", tags=["Interfaces"])

@router.post("", response_model=InterfaceResponse)
def create_interface(interface: InterfaceCreate, db: Session = Depends(get_db)):
    # 处理 folder_id 为 0 的情况
    folder_id = interface.folder_id if interface.folder_id != 0 else None
    
    # 检查 folder_id 是否有效（如果提供了且非 0）
    if folder_id:
        folder = db.query(Folder).filter(Folder.id == folder_id).first()
        if not folder:
            # 如果目录不存在，为了防止外键报错，回退到根目录
            folder_id = None
    
    db_interface = Interface(
        name=interface.name,
        method=interface.method,
        path=interface.path,
        folder_id=folder_id,
        status=interface.status,
        owner=interface.owner,
        query_params=interface.query_params,
        header_params=interface.header_params,
        body_definition=interface.body_definition,
        post_operations=interface.post_operations
    )
    db.add(db_interface)
    db.commit()
    db.refresh(db_interface)
    return InterfaceResponse(data=db_interface)

@router.get("", response_model=InterfaceListResponse)
def list_interfaces(folder_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Interface)
    if folder_id:
        query = query.filter(Interface.folder_id == folder_id)
    return InterfaceListResponse(data=query.all())

@router.get("/{interface_id}", response_model=InterfaceResponse)
def get_interface(interface_id: int, db: Session = Depends(get_db)):
    interface = db.query(Interface).filter(Interface.id == interface_id).first()
    if not interface:
        raise HTTPException(status_code=404, detail="Interface not found")
    return InterfaceResponse(data=interface)

@router.patch("/{interface_id}", response_model=InterfaceResponse)
def update_interface(interface_id: int, interface: InterfaceUpdate, db: Session = Depends(get_db)):
    db_interface = db.query(Interface).filter(Interface.id == interface_id).first()
    if not db_interface:
        raise HTTPException(status_code=404, detail="Interface not found")
    
    update_data = interface.model_dump(exclude_unset=True)
    if "folder_id" in update_data:
        folder_id = update_data["folder_id"]
        # 处理 folder_id 为 0 的情况
        folder_id = folder_id if folder_id != 0 else None
        # 检查 folder_id 是否有效（如果提供了且非 0）
        if folder_id:
            folder = db.query(Folder).filter(Folder.id == folder_id).first()
            if not folder:
                # 如果目录不存在，为了防止外键报错，回退到根目录
                folder_id = None
        update_data["folder_id"] = folder_id
    for key, value in update_data.items():
        setattr(db_interface, key, value)
        
    db.commit()
    db.refresh(db_interface)
    return InterfaceResponse(data=db_interface)

@router.delete("/{interface_id}", response_model=ResponseModel)
def delete_interface(interface_id: int, db: Session = Depends(get_db)):
    db_interface = db.query(Interface).filter(Interface.id == interface_id).first()
    if not db_interface:
        raise HTTPException(status_code=404, detail="Interface not found")
    
    db.delete(db_interface)
    db.commit()
    return ResponseModel(msg="Interface deleted")
