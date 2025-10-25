from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.schemas import NoteType


class User(Base):
    """User model for authentication and note ownership."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationship with notes
    notes = relationship("Note", back_populates="owner", cascade="all, delete-orphan")


class Note(Base):
    """Note model supporting both text and structured content."""
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    note_type = Column(SQLEnum(NoteType), nullable=False, default=NoteType.TEXT)
    
    # Content field - stores either TEXT or JSONB based on note_type
    content_text = Column(Text, nullable=True)  # For TEXT type notes
    content_structured = Column(JSONB, nullable=True)  # For STRUCTURED type notes
    
    tags = Column(ARRAY(String), nullable=True)
    
    # Foreign key to user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationship with user
    owner = relationship("User", back_populates="notes")
    
    @property
    def content(self):
        """Property to get content based on note type."""
        if self.note_type == NoteType.TEXT:
            return self.content_text
        else:
            return self.content_structured
    
    @content.setter
    def content(self, value):
        """Property setter to set content based on note type."""
        if self.note_type == NoteType.TEXT:
            self.content_text = value
            self.content_structured = None
        else:
            self.content_structured = value
            self.content_text = None