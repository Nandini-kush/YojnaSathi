from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from .base import Base
from datetime import datetime


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)

    scheme_name = Column(String, nullable=False)

    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    max_income = Column(Integer, nullable=True)

    category = Column(String, nullable=True)   # student / farmer / women
    gender = Column(String, nullable=True)     # male / female / all
    caste = Column(String, nullable=True)      # sc / st / obc / general / all

    state = Column(String, nullable=True)

    benefits = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    ministry = Column(String, nullable=True)
    official_link = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class EligibilityHistory(Base):
    __tablename__ = "eligibility_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    age = Column(Integer, nullable=False)
    income = Column(Integer, nullable=False)
    gender = Column(String(20))
    is_student = Column(Boolean)

    eligible_count = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
