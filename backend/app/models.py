from sqlalchemy import Column, String, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.sql import func
from .database import Base
from .schemas import Direction, Method, Decision, Reason

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(String, primary_key=True, index=True)
    name = Column(String)
    role = Column(String, default="Resident")

class Event(Base):
    __tablename__ = "events"
    
    trace_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    name = Column(String)
    direction = Column(SQLEnum(Direction))
    method = Column(SQLEnum(Method))
    decision = Column(SQLEnum(Decision))
    reason = Column(SQLEnum(Reason))
    device_id = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class Setting(Base):
    __tablename__ = "settings"
    
    key = Column(String, primary_key=True, index=True)
    value = Column(String) # We'll store as JSON string or individual keys
