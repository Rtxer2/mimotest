from sqlalchemy.orm import Session

from app.models.dict import DictType, DictEntry
from app.schemas.dict import DictTypeCreate, DictTypeUpdate, DictEntryCreate, DictEntryUpdate


class DictService:
    def __init__(self, db: Session):
        self.db = db

    def list_dict_types(self, skip: int = 0, limit: int = 100):
        return self.db.query(DictType).offset(skip).limit(limit).all()

    def get_dict_type(self, type_id: int):
        return self.db.query(DictType).filter(DictType.id == type_id).first()

    def get_dict_type_by_code(self, code: str):
        return self.db.query(DictType).filter(DictType.code == code).first()

    def create_dict_type(self, data: DictTypeCreate):
        existing = self.db.query(DictType).filter(DictType.code == data.code).first()
        if existing:
            raise ValueError(f"Dict type code '{data.code}' already exists")
        dict_type = DictType(**data.model_dump())
        self.db.add(dict_type)
        self.db.commit()
        self.db.refresh(dict_type)
        return dict_type

    def update_dict_type(self, type_id: int, data: DictTypeUpdate):
        dict_type = self.get_dict_type(type_id)
        if not dict_type:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(dict_type, key, value)
        self.db.commit()
        self.db.refresh(dict_type)
        return dict_type

    def delete_dict_type(self, type_id: int):
        dict_type = self.get_dict_type(type_id)
        if not dict_type:
            return False
        self.db.query(DictEntry).filter(DictEntry.dict_type_code == dict_type.code).delete()
        self.db.delete(dict_type)
        self.db.commit()
        return True

    def list_entries(self, dict_type_code: str | None = None, skip: int = 0, limit: int = 500):
        query = self.db.query(DictEntry)
        if dict_type_code:
            query = query.filter(DictEntry.dict_type_code == dict_type_code)
        return query.order_by(DictEntry.sort_order, DictEntry.id).offset(skip).limit(limit).all()

    def get_entry(self, entry_id: int):
        return self.db.query(DictEntry).filter(DictEntry.id == entry_id).first()

    def create_entry(self, data: DictEntryCreate):
        entry = DictEntry(**data.model_dump())
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def update_entry(self, entry_id: int, data: DictEntryUpdate):
        entry = self.get_entry(entry_id)
        if not entry:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(entry, key, value)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def delete_entry(self, entry_id: int):
        entry = self.get_entry(entry_id)
        if not entry:
            return False
        self.db.delete(entry)
        self.db.commit()
        return True
