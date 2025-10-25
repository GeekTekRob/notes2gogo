from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class NoteType(str, Enum):
    """Enumeration for note types."""
    TEXT = "text"
    STRUCTURED = "structured"


class UserBase(BaseModel):
    """Base user schema."""
    email: str = Field(..., example="user@example.com")
    username: str = Field(..., min_length=3, max_length=50, example="johndoe")


class UserCreate(UserBase):
    """Schema for user creation."""
    password: str = Field(..., min_length=6, example="secure_password")


class UserResponse(UserBase):
    """Schema for user response."""
    id: int
    is_active: bool = True
    created_at: datetime
    
    # Pydantic v2: enable model creation from ORM objects (from_attributes)
    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    """Schema for user login."""
    username: str
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for token data."""
    username: Optional[str] = None


class NoteBase(BaseModel):
    """Base note schema."""
    title: str = Field(..., min_length=1, max_length=200, example="My Note Title")
    note_type: NoteType = Field(default=NoteType.TEXT, example="text")
    content: Union[str, Dict[str, Any]] = Field(
        ..., 
        example="This is a simple markdown note."
    )
    tags: Optional[list[str]] = Field(default=None, example=["work", "important"])


class NoteCreate(NoteBase):
    """Schema for note creation."""
    pass


class NoteUpdate(BaseModel):
    """Schema for note updates."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    note_type: Optional[NoteType] = None
    content: Optional[Union[str, Dict[str, Any]]] = None
    tags: Optional[list[str]] = None


class NoteResponse(NoteBase):
    """Schema for note response."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    # Pydantic v2: enable model creation from ORM objects (from_attributes)
    model_config = {"from_attributes": True}


class NoteListResponse(BaseModel):
    """Schema for paginated note list response."""
    notes: list[NoteResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool