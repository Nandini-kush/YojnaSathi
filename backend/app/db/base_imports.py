# app/db/base_imports.py
# Import all SQLAlchemy models here so they are registered with Base
# This file MUST only import models (no other definitions)
from .models import Scheme, Admin, User, EligibilityHistory
