from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: int = 0
    income: float = 0.0
    gender: str = ""
    caste: str = ""
    state: str = ""

    class Config:
        from_attributes = True


class UpdateUserProfileRequest(BaseModel):
    name: str
    age: int
    income: float
    gender: str
    caste: str
    state: str
