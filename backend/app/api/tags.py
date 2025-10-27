"""
API endpoints for tag management.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, delete
from app.core.database import get_db
from app.models import Tag, Note, User, note_tags
from app.schemas import (
    TagCreate, 
    TagUpdate, 
    TagResponse, 
    TagListResponse, 
    TagMerge
)
from app.api.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=TagListResponse)
async def get_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all tags for the current user with note counts.
    """
    # Query tags with note counts
    tags_with_counts = db.query(
        Tag,
        func.count(note_tags.c.note_id).label('note_count')
    ).outerjoin(
        note_tags, Tag.id == note_tags.c.tag_id
    ).filter(
        Tag.user_id == current_user.id
    ).group_by(
        Tag.id
    ).order_by(
        Tag.name
    ).all()
    
    # Build response with note counts
    tag_responses = []
    for tag, count in tags_with_counts:
        tag_data = TagResponse(
            id=tag.id,
            name=tag.name,
            user_id=tag.user_id,
            created_at=tag.created_at,
            note_count=count
        )
        tag_responses.append(tag_data)
    
    return TagListResponse(
        tags=tag_responses,
        total=len(tag_responses)
    )


@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_data: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new tag.
    """
    # Normalize tag name (lowercase, trim whitespace)
    tag_name = tag_data.name.strip().lower()
    
    if not tag_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag name cannot be empty"
        )
    
    # Check if tag already exists for this user
    existing_tag = db.query(Tag).filter(
        Tag.user_id == current_user.id,
        Tag.name == tag_name
    ).first()
    
    if existing_tag:
        # Return existing tag instead of creating duplicate
        return TagResponse(
            id=existing_tag.id,
            name=existing_tag.name,
            user_id=existing_tag.user_id,
            created_at=existing_tag.created_at,
            note_count=len(existing_tag.notes) if existing_tag.notes else 0
        )
    
    # Create new tag
    db_tag = Tag(
        name=tag_name,
        user_id=current_user.id
    )
    
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    
    return TagResponse(
        id=db_tag.id,
        name=db_tag.name,
        user_id=db_tag.user_id,
        created_at=db_tag.created_at,
        note_count=0
    )


@router.put("/{tag_id}", response_model=TagResponse)
async def update_tag(
    tag_id: int,
    tag_update: TagUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Rename an existing tag. This will update the tag name on all associated notes.
    """
    # Get the tag
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    # Normalize new tag name
    new_name = tag_update.name.strip().lower()
    
    if not new_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag name cannot be empty"
        )
    
    # Check if another tag with this name already exists
    existing_tag = db.query(Tag).filter(
        Tag.user_id == current_user.id,
        Tag.name == new_name,
        Tag.id != tag_id
    ).first()
    
    if existing_tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tag with name '{new_name}' already exists"
        )
    
    # Update tag name
    tag.name = new_name
    db.commit()
    db.refresh(tag)
    
    return TagResponse(
        id=tag.id,
        name=tag.name,
        user_id=tag.user_id,
        created_at=tag.created_at,
        note_count=len(tag.notes) if tag.notes else 0
    )


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a tag. This will remove the tag from all associated notes.
    The notes themselves will remain intact.
    """
    # Get the tag
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    # Delete the tag (cascade will handle note_tags association)
    db.delete(tag)
    db.commit()
    
    return None


@router.post("/merge", response_model=TagResponse)
async def merge_tags(
    merge_data: TagMerge,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Merge a source tag into a target tag.
    All notes with the source tag will be updated to have the target tag instead.
    The source tag will be deleted.
    """
    # Validate both tags exist and belong to user
    source_tag = db.query(Tag).filter(
        Tag.id == merge_data.source_tag_id,
        Tag.user_id == current_user.id
    ).first()
    
    target_tag = db.query(Tag).filter(
        Tag.id == merge_data.target_tag_id,
        Tag.user_id == current_user.id
    ).first()
    
    if not source_tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source tag not found"
        )
    
    if not target_tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target tag not found"
        )
    
    if source_tag.id == target_tag.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot merge a tag with itself"
        )
    
    # Get all notes with source tag
    notes_with_source = source_tag.notes
    
    # Add target tag to all notes that have source tag (if not already present)
    for note in notes_with_source:
        if target_tag not in note.tags:
            note.tags.append(target_tag)
    
    # Delete source tag (this will also remove associations)
    db.delete(source_tag)
    db.commit()
    db.refresh(target_tag)
    
    return TagResponse(
        id=target_tag.id,
        name=target_tag.name,
        user_id=target_tag.user_id,
        created_at=target_tag.created_at,
        note_count=len(target_tag.notes) if target_tag.notes else 0
    )


@router.get("/autocomplete", response_model=List[str])
async def autocomplete_tags(
    q: str = "",
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get tag suggestions for autocomplete based on query string.
    Returns a list of tag names.
    """
    query = db.query(Tag.name).filter(
        Tag.user_id == current_user.id
    )
    
    if q:
        query = query.filter(Tag.name.ilike(f"%{q}%"))
    
    tags = query.order_by(Tag.name).limit(limit).all()
    
    return [tag[0] for tag in tags]
