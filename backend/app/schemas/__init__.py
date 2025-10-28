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
    folder_id: Optional[int] = Field(None, description="Folder ID to organize this note")


class NoteCreate(NoteBase):
    """Schema for note creation."""
    pass


class NoteUpdate(BaseModel):
    """Schema for note updates."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    note_type: Optional[NoteType] = None
    content: Optional[Union[str, Dict[str, Any]]] = None
    tags: Optional[list[str]] = None
    folder_id: Optional[int] = Field(None, description="Move note to a different folder")


class NoteResponse(NoteBase):
    """Schema for note response."""
    id: int
    user_id: int
    folder_id: Optional[int] = Field(None, description="Folder ID if note is in a folder")
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
            'folder_id': db_note.folder_id if hasattr(db_note, 'folder_id') else None,
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


# Advanced Search Schemas
class SearchSortBy(str, Enum):
    """Enumeration for search result sorting options."""
    RELEVANCE = "relevance"
    CREATED_DESC = "created_desc"
    CREATED_ASC = "created_asc"
    UPDATED_DESC = "updated_desc"
    UPDATED_ASC = "updated_asc"
    TITLE_ASC = "title_asc"
    TITLE_DESC = "title_desc"


class SearchRequest(BaseModel):
    """Schema for advanced search request."""
    query: str = Field(..., min_length=1, max_length=500, description="Search query with optional operators")
    
    # Filter options
    tags: Optional[list[str]] = Field(None, description="Filter by tag names")
    tag_mode: TagFilterMode = Field(TagFilterMode.AND, description="Tag filter mode: and, or, exclude")
    exclude_tags: Optional[list[str]] = Field(None, description="Tags to exclude")
    note_type: Optional[NoteType] = Field(None, description="Filter by note type")
    
    # Date filters
    created_after: Optional[datetime] = Field(None, description="Filter notes created after this date")
    created_before: Optional[datetime] = Field(None, description="Filter notes created before this date")
    updated_after: Optional[datetime] = Field(None, description="Filter notes updated after this date")
    updated_before: Optional[datetime] = Field(None, description="Filter notes updated before this date")
    
    # Content filters
    title_only: bool = Field(False, description="Search only in note titles")
    has_attachments: Optional[bool] = Field(None, description="Filter notes with/without attachments")
    
    # Sorting and pagination
    sort_by: SearchSortBy = Field(SearchSortBy.RELEVANCE, description="Sort results by")
    page: int = Field(1, ge=1, description="Page number")
    per_page: int = Field(20, ge=1, le=100, description="Results per page")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "query": "intitle:meeting AND tag:work",
                "tags": ["work"],
                "tag_mode": "and",
                "sort_by": "relevance",
                "page": 1,
                "per_page": 20
            }
        }
    }


class SearchResultItem(BaseModel):
    """Schema for individual search result with relevance info."""
    id: int
    title: str
    note_type: NoteType
    snippet: str = Field(..., description="Content snippet with search term context")
    tags: list[str] = Field(default_factory=list)
    user_id: int
    created_at: datetime
    updated_at: datetime
    relevance_score: float = Field(..., description="Relevance ranking score")
    match_locations: list[str] = Field(default_factory=list, description="Where matches were found: title, content, tags")
    
    model_config = {"from_attributes": True}


class SearchResponse(BaseModel):
    """Schema for search results response."""
    results: list[SearchResultItem]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool
    query: str
    execution_time_ms: float = Field(..., description="Search execution time in milliseconds")


class FolderBase(BaseModel):
    """Base folder schema."""
    name: str = Field(..., min_length=1, max_length=100, example="Work Projects")
    parent_id: Optional[int] = Field(None, description="Parent folder ID for hierarchical organization")


class FolderCreate(FolderBase):
    """Schema for folder creation."""
    pass


class FolderUpdate(BaseModel):
    """Schema for folder updates."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    parent_id: Optional[int] = None


class FolderResponse(FolderBase):
    """Schema for folder response."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    note_count: Optional[int] = Field(default=0, description="Number of notes in this folder")
    
    model_config = {"from_attributes": True}


class FolderListResponse(BaseModel):
    """Schema for list of folders."""
    folders: list[FolderResponse]
    total: int


class SavedSearchCreate(BaseModel):
    """Schema for creating a saved search."""
    name: str = Field(..., min_length=1, max_length=100, description="Name for the saved search")
    search_query: SearchRequest = Field(..., description="The search parameters to save")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Work meetings this week",
                "search_query": {
                    "query": "meeting tag:work",
                    "created_after": "2025-10-20T00:00:00Z"
                }
            }
        }
    }


class SavedSearchResponse(BaseModel):
    """Schema for saved search response."""
    id: int
    name: str
    search_query: dict = Field(..., description="Saved search parameters as JSON")
    user_id: int
    created_at: datetime
    last_used_at: Optional[datetime] = None
    use_count: int = Field(default=0, description="Number of times this search was executed")
    
    model_config = {"from_attributes": True}


class SavedSearchListResponse(BaseModel):
    """Schema for list of saved searches."""
    saved_searches: list[SavedSearchResponse]
    total: int


# ========================
# Search Analytics Schemas
# ========================

class SearchAnalyticsResponse(BaseModel):
    """Schema for search analytics response."""
    id: int
    query_text: str
    search_count: int
    last_searched_at: datetime
    avg_result_count: Optional[float] = None
    last_result_count: Optional[int] = None
    created_at: datetime
    
    model_config = {"from_attributes": True}


class PopularSearchResponse(BaseModel):
    """Schema for popular search queries."""
    query_text: str
    search_count: int
    last_searched_at: datetime
    avg_result_count: Optional[float] = None


class SearchSuggestionResponse(BaseModel):
    """Schema for search suggestions (autocomplete)."""
    query_text: str
    search_count: int
    last_searched_at: datetime
    relevance_score: float = Field(description="Relevance score based on recency and frequency")


class TrendingSearchResponse(BaseModel):
    """Schema for trending searches (recently popular)."""
    query_text: str
    search_count: int
    recent_search_count: int = Field(description="Number of searches in last 7 days")
    trend_direction: str = Field(description="up, down, or stable")
    last_searched_at: datetime


class SearchAnalyticsStatsResponse(BaseModel):
    """Schema for overall search analytics statistics."""
    total_searches: int
    unique_queries: int
    avg_results_per_search: Optional[float] = None
    most_searched_query: Optional[str] = None
    searches_today: int
    searches_this_week: int

