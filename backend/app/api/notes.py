from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, cast, String
from app.core.database import get_db
from app.models import Note, User
from app.schemas import NoteCreate, NoteUpdate, NoteResponse, NoteListResponse, NoteType
from app.api.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new note."""
    # Create note instance
    db_note = Note(
        title=note_data.title,
        note_type=note_data.note_type,
        tags=note_data.tags,
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
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    return db_note


@router.get("/", response_model=NoteListResponse)
async def get_notes(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in title and content"),
    note_type: Optional[NoteType] = Query(None, description="Filter by note type"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # Will uncomment after fixing imports
):
    """Get paginated list of user's notes with optional filtering."""
    # For now, we'll use a placeholder user_id
    # TODO: Replace with actual current_user.id
    user_id = 1
    
    # Base query
    query = db.query(Note).filter(Note.user_id == user_id)
    
    # Apply filters
    if note_type:
        query = query.filter(Note.note_type == note_type)
    
    if search:
        search_filter = f"%{search}%"
        # Create OR conditions for search across multiple fields
        search_conditions = [
            Note.title.ilike(search_filter),  # Search in title
            Note.content_text.ilike(search_filter),  # Search in text content
        ]
        
        # Search in tags array (convert array to text for searching)
        search_conditions.append(
            cast(Note.tags, String).ilike(search_filter)
        )
        
        # Search in structured content (JSONB) - convert to text and search
        # This will search in both keys and values of the JSONB structure
        search_conditions.append(
            cast(Note.content_structured, String).ilike(search_filter)
        )
        
        query = query.filter(or_(*search_conditions))
    
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        for tag in tag_list:
            query = query.filter(Note.tags.contains([tag]))
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    notes = query.order_by(desc(Note.updated_at)).offset((page - 1) * per_page).limit(per_page).all()
    
    # Calculate pagination info
    has_next = (page * per_page) < total
    has_prev = page > 1
    
    return NoteListResponse(
        notes=notes,
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
    # current_user: User = Depends(get_current_user)  # Will uncomment after fixing imports
):
    """Get a specific note by ID."""
    # For now, we'll use a placeholder user_id
    # TODO: Replace with actual current_user.id
    user_id = 1
    
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == user_id
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    return note


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_update: NoteUpdate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # Will uncomment after fixing imports
):
    """Update a specific note."""
    # For now, we'll use a placeholder user_id
    # TODO: Replace with actual current_user.id
    user_id = 1
    
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == user_id
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
        else:
            setattr(note, field, value)
    
    db.commit()
    db.refresh(note)
    
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # Will uncomment after fixing imports
):
    """Delete a specific note."""
    # For now, we'll use a placeholder user_id
    # TODO: Replace with actual current_user.id
    user_id = 1
    
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == user_id
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    db.delete(note)
    db.commit()
    
    return None