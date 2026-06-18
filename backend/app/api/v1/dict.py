from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_any_role, require_operator_or_above, require_manager_or_above
from app.models.user import User
from app.schemas.dict import (
    DictTypeCreate, DictTypeUpdate, DictTypeResponse,
    DictEntryCreate, DictEntryUpdate, DictEntryResponse
)
from app.services.dict_service import DictService

router = APIRouter()


@router.get("/types", response_model=list[DictTypeResponse])
def list_dict_types(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = DictService(db)
    return service.list_dict_types(skip=skip, limit=limit)


@router.get("/types/{type_id}", response_model=DictTypeResponse)
def get_dict_type(type_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = DictService(db)
    dict_type = service.get_dict_type(type_id)
    if not dict_type:
        raise HTTPException(status_code=404, detail="Dict type not found")
    return dict_type


@router.post("/types", response_model=DictTypeResponse)
def create_dict_type(data: DictTypeCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = DictService(db)
    try:
        return service.create_dict_type(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/types/{type_id}", response_model=DictTypeResponse)
def update_dict_type(type_id: int, data: DictTypeUpdate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = DictService(db)
    dict_type = service.update_dict_type(type_id, data)
    if not dict_type:
        raise HTTPException(status_code=404, detail="Dict type not found")
    return dict_type


@router.delete("/types/{type_id}")
def delete_dict_type(type_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_manager_or_above)):
    service = DictService(db)
    if not service.delete_dict_type(type_id):
        raise HTTPException(status_code=404, detail="Dict type not found")
    return {"message": "Dict type deleted"}


@router.get("/entries", response_model=list[DictEntryResponse])
def list_entries(
    dict_type_code: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=500),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_any_role)
):
    service = DictService(db)
    return service.list_entries(dict_type_code=dict_type_code, skip=skip, limit=limit)


@router.get("/entries/{entry_id}", response_model=DictEntryResponse)
def get_entry(entry_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = DictService(db)
    entry = service.get_entry(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Dict entry not found")
    return entry


@router.post("/entries", response_model=DictEntryResponse)
def create_entry(data: DictEntryCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = DictService(db)
    return service.create_entry(data)


@router.put("/entries/{entry_id}", response_model=DictEntryResponse)
def update_entry(entry_id: int, data: DictEntryUpdate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = DictService(db)
    entry = service.update_entry(entry_id, data)
    if not entry:
        raise HTTPException(status_code=404, detail="Dict entry not found")
    return entry


@router.delete("/entries/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_manager_or_above)):
    service = DictService(db)
    if not service.delete_entry(entry_id):
        raise HTTPException(status_code=404, detail="Dict entry not found")
    return {"message": "Dict entry deleted"}
