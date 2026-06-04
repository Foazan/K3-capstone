# app/schemas/violation_log.py
from datetime import datetime
from typing import List, Optional

import os
from pydantic import BaseModel, Field, field_validator

from app.models.violation_log import ViolationStatus


# --- Sub-schemas untuk JOIN response ---
class CameraInfo(BaseModel):
    id: int
    area_name: str

    model_config = {"from_attributes": True}


class ViolationTypeInfo(BaseModel):
    id: int
    yolo_class_id: int
    label_name: str
    penalty_score: int

    model_config = {"from_attributes": True}


# --- Payload dari script YOLO / ESP32-CAM ---
class ViolationLogCreate(BaseModel):
    """Payload JSON dari POST /api/violations/detect (tanpa file)."""
    camera_id: int = Field(..., description="ID kamera yang mendeteksi", examples=[1])
    yolo_class_id: int = Field(..., description="ID kelas dari YOLO (0, 1, 2, dst)", examples=[0])
    image_path: Optional[str] = Field(
        None,
        max_length=500,
        description="Path foto (diisi otomatis oleh endpoint setelah upload)"
    )
    created_at: Optional[datetime] = Field(
        default=None,
        description="Timestamp deteksi (opsional, default: sekarang)"
    )


# --- Update Status ---
class ViolationStatusUpdate(BaseModel):
    """Schema untuk PUT /api/violations/{id}/status"""
    status: ViolationStatus = Field(
        ...,
        description="Status penanganan baru",
        examples=["Sudah Ditindak"]
    )
    # whatsapp_target: Optional[str] = Field(
    #     None,
    #     description="Nomor WA tujuan notifikasi (format: 628xxx). Kosong = pakai default.",
    #     examples=["6281234567890"]
    # )


class ViolationStatusBulkUpdate(BaseModel):
    """Schema untuk PUT /api/violations/bulk/status"""
    log_ids: List[int] = Field(
        ...,
        description="List ID log pelanggaran yang akan diupdate statusnya",
        examples=[[1, 2, 3]]
    )
    status: ViolationStatus = Field(
        ...,
        description="Status penanganan baru",
        examples=["Sudah Ditindak"]
    )


class ViolationValidate(BaseModel):
    """Schema untuk PATCH /api/violations/{id}/validate"""
    violator_name: str = Field(..., description="Nama pekerja yang melanggar", examples=["Budi Santoso"])
    violator_nip: str = Field(..., description="NIP / ID Karyawan", examples=["EMP12345"])


# --- Read (Response) ---
class ViolationLogRead(BaseModel):
    """Respons log pelanggaran dengan data JOIN kamera dan jenis pelanggaran."""
    id: int
    camera_id: Optional[int]
    violation_type_id: Optional[int]
    image_path: Optional[str]
    created_at: datetime
    status: ViolationStatus
    violator_name: Optional[str] = None
    violator_nip: Optional[str] = None

    # JOIN data
    camera: Optional[CameraInfo] = None
    violation_type: Optional[ViolationTypeInfo] = None

    @field_validator("image_path")
    @classmethod
    def format_image_url(cls, v: Optional[str]) -> Optional[str]:
        if v and not v.startswith("http"):
            filename = os.path.basename(v)
            return f"http://localhost:8090/snapshots/{filename}"
        return v

    model_config = {"from_attributes": True}


# --- Paginated List ---
class ViolationLogList(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[ViolationLogRead]
