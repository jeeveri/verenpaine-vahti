from fastapi import FastAPI

from .database import Base
from .database import engine

from fastapi import Depends
from fastapi import HTTPException

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from .schemas import MeasurementCreate
from .schemas import MeasurementResponse

from .dependencies import get_db
from .models import Measurement

from .import_service import inspect_excel
from .import_service import read_excel_rows
from .import_service import import_measurements

from sqlalchemy import func

import app.models

Base.metadata.create_all(bind=engine)

def classify_blood_pressure(
    systolic: int,
    diastolic: int
):

    if systolic >= 180 or diastolic >= 110:
        return "Aste 3"

    if systolic >= 160 or diastolic >= 100:
        return "Aste 2"

    if systolic >= 140 or diastolic >= 90:
        return "Aste 1"

    if systolic >= 130 or diastolic >= 85:
        return "Kohonnut"

    return "Normaali"

# Initialize FastAPI application
app = FastAPI(
    title="Verenpaine-vahti"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/api/health")
def health():
    return {"status": "ok"}

# Create measurement endpoint
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

    measurements = (
        db.query(Measurement)
        .order_by(
            Measurement.measurement_time.desc()
        )
        .all()
    )

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

@app.delete(
    "/api/measurements/{measurement_id}"
)
def delete_measurement(
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

    db.delete(measurement)
    db.commit()

    return {
        "status": "deleted"
    }

@app.get("/api/import/test")
def test_import():

    headers = inspect_excel(
        "import_data/Verenpaineen mittaus (vastaukset).xlsx"
    )

    return {
        "headers": headers
    }

# Preview import endpoint
@app.get("/api/import/preview")
def preview_import():

    rows = read_excel_rows(
        "import_data/Verenpaineen mittaus (vastaukset).xlsx"
    )

    return {
        "count": len(rows),
        "first_rows": rows[:5]
    }

@app.post("/api/import/excel")
def import_excel(
    db: Session = Depends(get_db)
):

    result = import_measurements(
        "import_data/Verenpaineen mittaus (vastaukset).xlsx",
        db
    )

    return result

@app.get("/api/statistics")
def get_statistics(
    db: Session = Depends(get_db)
):

    total_measurements = (
        db.query(Measurement)
        .count()
    )

    person_counts = (
        db.query(
            Measurement.person,
            func.count(Measurement.id)
        )
        .group_by(Measurement.person)
        .all()
    )

    measurements_by_person = {
        person: count
        for person, count in person_counts
    }

    return {
        "total_measurements": total_measurements,
        "persons": list(measurements_by_person.keys()),
        "measurements_by_person": measurements_by_person
    }

@app.get("/api/statistics/summary")
def get_measurement_summary(
    db: Session = Depends(get_db)
):

    summary_data = (
        db.query(
            Measurement.person,
            func.count(Measurement.id),
            func.avg(Measurement.systolic),
            func.avg(Measurement.diastolic),
            func.avg(Measurement.pulse)
        )
        .group_by(Measurement.person)
        .all()
    )

    result = {}

    for row in summary_data:

        result[row[0]] = {
            "measurement_count": row[1],
            "avg_systolic": round(row[2], 1),
            "avg_diastolic": round(row[3], 1),
            "avg_pulse": round(row[4], 1)
        }

    return result

@app.get("/api/statistics/latest")
def get_latest_measurements(
    db: Session = Depends(get_db)
):

    persons = (
        db.query(Measurement.person)
        .distinct()
        .all()
    )

    result = {}

    for person_tuple in persons:

        person = person_tuple[0]

        latest = (
            db.query(Measurement)
            .filter(
                Measurement.person == person
            )
            .order_by(
                Measurement.measurement_time.desc()
            )
            .first()
        )

        if latest:

            result[person] = {
                "measurement_time": latest.measurement_time,
                "systolic": latest.systolic,
                "diastolic": latest.diastolic,
                "pulse": latest.pulse,
                "classification": classify_blood_pressure(
                    latest.systolic,
                    latest.diastolic
                )
            }

    return result