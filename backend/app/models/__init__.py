from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, Integer, String, Table, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, TSVECTOR
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.schemas import NoteType

# Association table for many-to-many relationship between notes and tags
note_tags = Table(
    "note_tags",
    Base.metadata,
    Column(
        "note_id", Integer, ForeignKey("notes.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "created_at", DateTime(timezone=True), server_default=func.now(), nullable=False
    ),
)


class User(Base):
    """User model for authentication and note ownership."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    notes = relationship("Note", back_populates="owner", cascade="all, delete-orphan")
    tags = relationship("Tag", back_populates="owner", cascade="all, delete-orphan")
    saved_searches = relationship(
        "SavedSearch", back_populates="owner", cascade="all, delete-orphan"
    )
    folders = relationship(
        "Folder", back_populates="owner", cascade="all, delete-orphan"
    )
    search_analytics = relationship("SearchAnalytics", cascade="all, delete-orphan")


class Tag(Base):
    """Tag model for organizing notes."""

    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    owner = relationship("User", back_populates="tags")
    notes = relationship("Note", secondary=note_tags, back_populates="tags")

    # Unique constraint: user can't have duplicate tag names
    __table_args__ = ({"schema": None},)

    def __repr__(self):
        return f"<Tag(id={self.id}, name='{self.name}', user_id={self.user_id})>"


class Folder(Base):
    """Folder/Notebook model for organizing notes hierarchically."""

    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    parent_id = Column(
        Integer, ForeignKey("folders.id", ondelete="CASCADE"), nullable=True
    )
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    owner = relationship("User", back_populates="folders")
    parent = relationship("Folder", remote_side=[id], backref="children")
    notes = relationship("Note", back_populates="folder")

    def __repr__(self):
        return f"<Folder(id={self.id}, name='{self.name}', user_id={self.user_id})>"


class Note(Base):
    """Note model supporting both text and structured content."""

    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    note_type = Column(SQLEnum(NoteType), nullable=False, default=NoteType.TEXT)

    # Content field - stores either TEXT or JSONB based on note_type
    content_text = Column(Text, nullable=True)  # For TEXT type notes
    content_structured = Column(JSONB, nullable=True)  # For STRUCTURED type notes

    # Legacy tags array - keeping for backwards compatibility during migration
    tags_array = Column(ARRAY(String), nullable=True)

    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    folder_id = Column(
        Integer, ForeignKey("folders.id", ondelete="SET NULL"), nullable=True
    )

    # Full-text search tsvector columns (populated by DB trigger)
    title_tsv = Column(TSVECTOR, nullable=True)
    content_tsv = Column(TSVECTOR, nullable=True)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    owner = relationship("User", back_populates="notes")
    folder = relationship("Folder", back_populates="notes")
    tags = relationship("Tag", secondary=note_tags, back_populates="notes")

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


class SavedSearch(Base):
    """Saved search model for storing user's favorite search queries."""

    __tablename__ = "saved_searches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    search_query = Column(JSONB, nullable=False)  # Stores SearchRequest as JSON
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    use_count = Column(Integer, default=0, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="saved_searches")

    def __repr__(self):
        return (
            f"<SavedSearch(id={self.id}, name='{self.name}', user_id={self.user_id})>"
        )


class SearchAnalytics(Base):
    """Search analytics model for tracking search queries and usage patterns."""

    __tablename__ = "search_analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    query_text = Column(String(500), nullable=False, index=True)
    search_count = Column(Integer, nullable=False, default=1)
    last_searched_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    avg_result_count = Column(Integer, nullable=True)
    last_result_count = Column(Integer, nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    owner = relationship("User")

    def __repr__(self):
        return f"<SearchAnalytics(id={self.id}, query='{self.query_text}', count={self.search_count})>"
