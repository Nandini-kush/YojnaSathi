from pydantic import BaseModel
from typing import Optional

class SchemeResponse(BaseModel):
    id: int
    scheme_name: str   # ✅ MATCHES RESPONSE
    min_age: Optional[int]
    max_age: Optional[int]
    max_income: Optional[int]
    category: str
    state: Optional[str]

    class Config:
        from_attributes = True
