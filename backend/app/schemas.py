from datetime import datetime
from pydantic import BaseModel


class MeasurementCreate(BaseModel):
    person: str
    measurement_time: datetime
    systolic: int
    diastolic: int
    pulse: int
    note: str | None = None


class MeasurementResponse(MeasurementCreate):
    id: int

    class Config:
        from_attributes = True