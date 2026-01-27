from pydantic import BaseModel
from typing import Optional


class SchemeCreate(BaseModel):
    scheme_name: str
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    max_income: Optional[int] = None
    category: str
    state: str


class SchemeUpdate(BaseModel):
    scheme_name: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    max_income: Optional[int] = None
    category: Optional[str] = None
    state: Optional[str] = None
