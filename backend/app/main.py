from fastapi import FastAPI

from .database import Base
from .database import engine

from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from .schemas import MeasurementCreate
from .schemas import MeasurementResponse

from .dependencies import get_db
from .models import Measurement

import app.models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Verenpaine-vahti"
)


@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post(
    "/api/measurements",
    response_model=MeasurementResponse
)
def create_measurement(
    measurement: MeasurementCreate,
    db: Session = Depends(get_db)
):

    item = Measurement(
        person=measurement.person,
        measurement_time=measurement.measurement_time,
        systolic=measurement.systolic,
        diastolic=measurement.diastolic,
        pulse=measurement.pulse,
        note=measurement.note
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item

@app.get(
    "/api/measurements",
    response_model=list[MeasurementResponse]
)
def get_measurements(
    db: Session = Depends(get_db)
):

    measurements = db.query(Measurement).all()

    return measurements

@app.get(
    "/api/measurements/{measurement_id}",
    response_model=MeasurementResponse
)
def get_measurement(
    measurement_id: int,
    db: Session = Depends(get_db)
):

    measurement = (
        db.query(Measurement)
        .filter(Measurement.id == measurement_id)
        .first()
    )

    if measurement is None:
        raise HTTPException(
            status_code=404,
            detail="Measurement not found"
        )

    return measurement