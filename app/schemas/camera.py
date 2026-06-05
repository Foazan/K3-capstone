# app/schemas/camera.py
from typing import List, Optional

from pydantic import BaseModel, Field


class CameraBase(BaseModel):
    area_name: str = Field(..., min_length=2, max_length=150, examples=["Area Produksi A"])
    status_cam: bool = True
    url: Optional[str] = Field(None, description="URL stream kamera")


class CameraCreate(CameraBase):
    pass


class CameraUpdate(BaseModel):
    area_name: Optional[str] = Field(None, min_length=2, max_length=150)
    status_cam: Optional[bool] = None
    url: Optional[str] = Field(None, description="URL stream kamera")


class CameraRead(CameraBase):
    id: int

    model_config = {"from_attributes": True}


class CameraList(BaseModel):
    total: int
    items: List[CameraRead]
