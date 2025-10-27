from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, or_, cast, String, and_, not_
from app.core.database import get_db
from app.models import Note, User, Tag
from app.schemas import (
    NoteCreate, NoteUpdate, NoteResponse, NoteListResponse, NoteType,
    BulkTagOperation, TagFilterMode
)
from app.api.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new note with tags."""
    # Create note instance
    db_note = Note(
        title=note_data.title,
        note_type=note_data.note_type,
        user_id=current_user.id
    )
    
    # Set content based on note type
    if note_data.note_type == NoteType.TEXT:
        if not isinstance(note_data.content, str):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Content must be a string for TEXT notes"
            )
        db_note.content_text = note_data.content
    else:  # STRUCTURED
        if not isinstance(note_data.content, dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Content must be a dictionary for STRUCTURED notes"
            )
        db_note.content_structured = note_data.content
    
    # Handle tags
    if note_data.tags:
        for tag_name in note_data.tags:
            tag_name = tag_name.strip().lower()
            if not tag_name:
                continue
                
            # Get or create tag
            tag = db.query(Tag).filter(
                Tag.user_id == current_user.id,
                Tag.name == tag_name
            ).first()
            
            if not tag:
                tag = Tag(name=tag_name, user_id=current_user.id)
                db.add(tag)
            
            db_note.tags.append(tag)
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    return NoteResponse.from_orm_with_tags(db_note)


@router.get("/", response_model=NoteListResponse)
async def get_notes(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in title and content"),
    note_type: Optional[NoteType] = Query(None, description="Filter by note type"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    tag_filter_mode: TagFilterMode = Query(TagFilterMode.AND, description="Tag filter mode: 'and', 'or', or 'exclude'"),
    exclude_tags: Optional[str] = Query(None, description="Exclude notes with these tags (comma-separated)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get paginated list of user's notes with advanced filtering."""
    # Base query with eager loading of tags
    query = db.query(Note).options(joinedload(Note.tags)).filter(Note.user_id == current_user.id)
    
    # Apply note type filter
    if note_type:
        query = query.filter(Note.note_type == note_type)
    
    # Apply text search
    if search:
        search_filter = f"%{search}%"
        search_conditions = [
            Note.title.ilike(search_filter),
            Note.content_text.ilike(search_filter),
            cast(Note.content_structured, String).ilike(search_filter)
        ]
        
        # Also search in tag names
        query = query.outerjoin(Note.tags).filter(
            or_(
                *search_conditions,
                Tag.name.ilike(search_filter)
            )
        ).distinct()
    
    # Apply tag filters
    if tags:
        tag_list = [tag.strip().lower() for tag in tags.split(",") if tag.strip()]
        
        if tag_list:
            if tag_filter_mode == TagFilterMode.AND:
                # Notes must have ALL specified tags
                for tag_name in tag_list:
                    query = query.join(Note.tags).filter(Tag.name == tag_name)
            elif tag_filter_mode == TagFilterMode.OR:
                # Notes must have AT LEAST ONE of the specified tags
                query = query.join(Note.tags).filter(Tag.name.in_(tag_list)).distinct()
    
    # Apply exclude tags filter
    if exclude_tags:
        exclude_tag_list = [tag.strip().lower() for tag in exclude_tags.split(",") if tag.strip()]
        
        if exclude_tag_list:
            # Subquery to find notes with excluded tags
            excluded_note_ids = db.query(Note.id).join(Note.tags).filter(
                Note.user_id == current_user.id,
                Tag.name.in_(exclude_tag_list)
            ).distinct().subquery()
            
            query = query.filter(not_(Note.id.in_(excluded_note_ids)))
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    notes = query.order_by(desc(Note.updated_at)).offset((page - 1) * per_page).limit(per_page).all()
    
    # Convert to response format with tags
    note_responses = [NoteResponse.from_orm_with_tags(note) for note in notes]
    
    # Calculate pagination info
    has_next = (page * per_page) < total
    has_prev = page > 1
    
    return NoteListResponse(
        notes=note_responses,
        total=total,
        page=page,
        per_page=per_page,
        has_next=has_next,
        has_prev=has_prev
    )


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific note by ID."""
    note = db.query(Note).options(joinedload(Note.tags)).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    return NoteResponse.from_orm_with_tags(note)


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_update: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a specific note."""
    note = db.query(Note).options(joinedload(Note.tags)).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Update fields if provided
    update_data = note_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "content":
            # Handle content update based on note type
            if note.note_type == NoteType.TEXT:
                if not isinstance(value, str):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Content must be a string for TEXT notes"
                    )
                note.content_text = value
                note.content_structured = None
            else:  # STRUCTURED
                if not isinstance(value, dict):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Content must be a dictionary for STRUCTURED notes"
                    )
                note.content_structured = value
                note.content_text = None
        elif field == "note_type":
            # If note type is changing, we need to handle content conversion
            if value != note.note_type:
                note.note_type = value
                # Reset content fields - user will need to update content separately
                note.content_text = None
                note.content_structured = None
        elif field == "tags":
            # Update tags
            note.tags.clear()
            if value:
                for tag_name in value:
                    tag_name = tag_name.strip().lower()
                    if not tag_name:
                        continue
                    
                    # Get or create tag
                    tag = db.query(Tag).filter(
                        Tag.user_id == current_user.id,
                        Tag.name == tag_name
                    ).first()
                    
                    if not tag:
                        tag = Tag(name=tag_name, user_id=current_user.id)
                        db.add(tag)
                    
                    note.tags.append(tag)
        else:
            setattr(note, field, value)
    
    db.commit()
    db.refresh(note)
    
    return NoteResponse.from_orm_with_tags(note)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific note."""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    db.delete(note)
    db.commit()
    
    return None


@router.post("/bulk-tag", response_model=dict)
async def bulk_tag_operation(
    operation_data: BulkTagOperation,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Perform bulk tag operations on multiple notes.
    Operations: 'add', 'remove', or 'replace'
    """
    # Validate operation
    if operation_data.operation not in ['add', 'remove', 'replace']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Operation must be 'add', 'remove', or 'replace'"
        )
    
    # Get all notes
    notes = db.query(Note).filter(
        Note.id.in_(operation_data.note_ids),
        Note.user_id == current_user.id
    ).all()
    
    if len(notes) != len(operation_data.note_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Some notes were not found"
        )
    
    # Normalize tag names
    tag_names = [tag.strip().lower() for tag in operation_data.tag_names if tag.strip()]
    
    if not tag_names:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one valid tag name is required"
        )
    
    # Get or create tags
    tags = []
    for tag_name in tag_names:
        tag = db.query(Tag).filter(
            Tag.user_id == current_user.id,
            Tag.name == tag_name
        ).first()
        
        if not tag:
            tag = Tag(name=tag_name, user_id=current_user.id)
            db.add(tag)
        
        tags.append(tag)
    
    # Perform operation on each note
    updated_count = 0
    for note in notes:
        if operation_data.operation == 'add':
            # Add tags that aren't already on the note
            for tag in tags:
                if tag not in note.tags:
                    note.tags.append(tag)
                    updated_count += 1
        
        elif operation_data.operation == 'remove':
            # Remove specified tags from the note
            for tag in tags:
                if tag in note.tags:
                    note.tags.remove(tag)
                    updated_count += 1
        
        elif operation_data.operation == 'replace':
            # Replace all tags with the specified ones
            note.tags.clear()
            note.tags.extend(tags)
            updated_count += 1
    
    db.commit()
    
    return {
        "message": f"Bulk tag operation completed",
        "operation": operation_data.operation,
        "notes_affected": len(notes),
        "changes_made": updated_count
    }