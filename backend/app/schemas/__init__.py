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
    tags: list[str] = Field(default_factory=list, description="List of tag names associated with this note")
    
    # Pydantic v2: enable model creation from ORM objects (from_attributes)
    model_config = {"from_attributes": True}
    
    @classmethod
    def from_orm_with_tags(cls, db_note):
        """Create response with tag names from Tag objects."""
        tag_names = [tag.name for tag in db_note.tags] if hasattr(db_note, 'tags') and db_note.tags else []
        note_dict = {
            'id': db_note.id,
            'title': db_note.title,
            'note_type': db_note.note_type,
            'content': db_note.content,
            'tags': tag_names,
            'user_id': db_note.user_id,
            'created_at': db_note.created_at,
            'updated_at': db_note.updated_at
        }
        return cls(**note_dict)


class NoteListResponse(BaseModel):
    """Schema for paginated note list response."""
    notes: list[NoteResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool


# Tag Schemas
class TagBase(BaseModel):
    """Base tag schema."""
    name: str = Field(..., min_length=1, max_length=100, example="work")


class TagCreate(TagBase):
    """Schema for tag creation."""
    pass


class TagUpdate(BaseModel):
    """Schema for tag update."""
    name: str = Field(..., min_length=1, max_length=100, example="personal")


class TagResponse(TagBase):
    """Schema for tag response."""
    id: int
    user_id: int
    created_at: datetime
    note_count: int = Field(default=0, description="Number of notes with this tag")
    
    # Pydantic v2: enable model creation from ORM objects (from_attributes)
    model_config = {"from_attributes": True}


class TagMerge(BaseModel):
    """Schema for merging tags."""
    source_tag_id: int = Field(..., description="ID of the tag to merge from")
    target_tag_id: int = Field(..., description="ID of the tag to merge into")


class TagListResponse(BaseModel):
    """Schema for tag list response."""
    tags: list[TagResponse]
    total: int


class BulkTagOperation(BaseModel):
    """Schema for bulk tag operations on multiple notes."""
    note_ids: list[int] = Field(..., min_items=1, description="List of note IDs")
    tag_names: list[str] = Field(..., min_items=1, description="List of tag names")
    operation: str = Field(..., description="Operation: 'add', 'remove', or 'replace'")
    
    class Config:
        schema_extra = {
            "example": {
                "note_ids": [1, 2, 3],
                "tag_names": ["work", "urgent"],
                "operation": "add"
            }
        }


class TagFilterMode(str, Enum):
    """Enumeration for tag filter modes."""
    AND = "and"
    OR = "or"
    EXCLUDE = "exclude"
