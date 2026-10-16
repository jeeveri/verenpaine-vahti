from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime

from .database import Base


class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)

    measurement_time = Column(DateTime)

    person = Column(String, nullable=False)

    systolic = Column(Integer)

    diastolic = Column(Integer)

    pulse = Column(Integer)

    note = Column(String)