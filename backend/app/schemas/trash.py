from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel

from app.models.trash import TrashEntityType


class TrashItem(BaseModel):
    id: int
    entity_type: TrashEntityType
    original_id: int
    label: str
    snapshot: dict[str, Any]
    deleted_by: Optional[int] = None
    deleted_at: datetime
    can_restore: bool = False
    can_permanent_delete: bool = False

    class Config:
        from_attributes = True


class TrashActionResponse(BaseModel):
    status: str
    id: int
    entity_type: Optional[TrashEntityType] = None
    message: Optional[str] = None
