from sqlalchemy.orm import declarative_base

# app/db/base.py
# SINGLE source of truth for SQLAlchemy Base
# This file MUST only define Base and nothing else (no model imports)
Base = declarative_base()
