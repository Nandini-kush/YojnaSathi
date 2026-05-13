from sqlalchemy import Column, Integer, String, Boolean, Text, BigInteger, DateTime, ForeignKey, Float
from .base import Base
from datetime import datetime

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    scheme_name = Column(Text)
    min_age = Column(Integer)
    max_age = Column(Integer)
    max_income = Column(BigInteger)
    gender = Column(Text)
    caste = Column(Text, nullable=True)
    state = Column(String, nullable=True)
    benefits = Column(Text)
    official_link = Column(Text)
    description = Column(Text)
    ministry = Column(Text)
    is_active = Column(Boolean)
    priority = Column(Integer, default=0)  # Higher priority schemes rank higher
    category = Column(Text, nullable=True)  # e.g., "student", "farmer", "all"



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
    # Profile fields used for eligibility checks
    age = Column(Integer, nullable=False, default=0)
    income = Column(Float, nullable=False, default=0.0)
    gender = Column(String(20), nullable=False, default="")
    caste = Column(String(50), nullable=False, default="")
    state = Column(String(100), nullable=False, default="")
    # removed is_student (no longer stored in database)


class EligibilityHistory(Base):
    __tablename__ = "eligibility_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    age = Column(Integer, nullable=False)
    income = Column(Integer, nullable=False)
    gender = Column(String(20))
    # is_student removed; historical records no longer track student status

    eligible_count = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
