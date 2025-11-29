from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime, timezone
from .database import Base
from sqlalchemy import ForeignKey


class Todo(Base):
    __tablename__ = "todos"

    id =Column(Integer, primary_key=True, index=True)
    user_id= Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    priority = Column(Integer, default = 1)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
