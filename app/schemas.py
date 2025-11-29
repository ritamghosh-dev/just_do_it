from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class TodoCreate(BaseModel):
    title : str
    description : Optional[str] = None
    priority : int = 1
    completed : bool = False


class TodoUpdate(BaseModel):
    title : Optional[str] = None
    description : Optional[str] = None
    priority : Optional[int] = None
    completed : Optional[bool] = None

class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    priority : Optional[int]
    completed: bool
    user_id : int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id : int
    email: EmailStr
    created_at : datetime

    class Config:
        from_attributes = True
