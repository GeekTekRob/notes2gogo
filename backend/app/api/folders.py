from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from app.core.database import get_db
from app.models import Folder, Note, User
from app.schemas import (
    FolderCreate, FolderUpdate, FolderResponse, FolderListResponse
)
from app.api.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=FolderListResponse)
async def get_folders(
    parent_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all folders for the current user.
    Optionally filter by parent_id to get subfolders.
    """
    query = db.query(Folder).filter(Folder.user_id == current_user.id)
    
    if parent_id is not None:
        query = query.filter(Folder.parent_id == parent_id)
    else:
        # If no parent_id specified, get only root folders (parent_id is None)
        query = query.filter(Folder.parent_id.is_(None))
    
    folders = query.order_by(Folder.name).all()
    
    # Count notes in each folder
    folder_responses = []
    for folder in folders:
        note_count = db.query(func.count(Note.id)).filter(
            Note.folder_id == folder.id,
            Note.user_id == current_user.id
        ).scalar()
        
        folder_dict = {
            'id': folder.id,
            'name': folder.name,
            'parent_id': folder.parent_id,
            'user_id': folder.user_id,
            'created_at': folder.created_at,
            'updated_at': folder.updated_at,
            'note_count': note_count or 0
        }
        folder_responses.append(FolderResponse(**folder_dict))
    
    return FolderListResponse(
        folders=folder_responses,
        total=len(folder_responses)
    )


@router.post("/", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder_data: FolderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new folder."""
    
    # Validate parent folder exists and belongs to user if parent_id is provided
    if folder_data.parent_id is not None:
        parent_folder = db.query(Folder).filter(
            Folder.id == folder_data.parent_id,
            Folder.user_id == current_user.id
        ).first()
        
        if not parent_folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent folder not found"
            )
    
    # Check for duplicate folder name at the same level
    existing = db.query(Folder).filter(
        Folder.user_id == current_user.id,
        Folder.name == folder_data.name,
        Folder.parent_id == folder_data.parent_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A folder with this name already exists at this level"
        )
    
    # Create folder
    db_folder = Folder(
        name=folder_data.name,
        parent_id=folder_data.parent_id,
        user_id=current_user.id
    )
    
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    
    # Get note count (should be 0 for new folder)
    folder_dict = {
        'id': db_folder.id,
        'name': db_folder.name,
        'parent_id': db_folder.parent_id,
        'user_id': db_folder.user_id,
        'created_at': db_folder.created_at,
        'updated_at': db_folder.updated_at,
        'note_count': 0
    }
    
    return FolderResponse(**folder_dict)


@router.get("/{folder_id}", response_model=FolderResponse)
async def get_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific folder by ID."""
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.user_id == current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found"
        )
    
    # Count notes in folder
    note_count = db.query(func.count(Note.id)).filter(
        Note.folder_id == folder.id,
        Note.user_id == current_user.id
    ).scalar()
    
    folder_dict = {
        'id': folder.id,
        'name': folder.name,
        'parent_id': folder.parent_id,
        'user_id': folder.user_id,
        'created_at': folder.created_at,
        'updated_at': folder.updated_at,
        'note_count': note_count or 0
    }
    
    return FolderResponse(**folder_dict)


@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: int,
    folder_update: FolderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a folder."""
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.user_id == current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found"
        )
    
    # Validate parent folder if being changed
    if folder_update.parent_id is not None and folder_update.parent_id != folder.parent_id:
        # Prevent folder from being its own parent or creating cycles
        if folder_update.parent_id == folder.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A folder cannot be its own parent"
            )
        
        # Check if parent exists
        parent_folder = db.query(Folder).filter(
            Folder.id == folder_update.parent_id,
            Folder.user_id == current_user.id
        ).first()
        
        if not parent_folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent folder not found"
            )
        
        # Check for circular reference (simplified check)
        current_parent = parent_folder
        while current_parent.parent_id is not None:
            if current_parent.parent_id == folder.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot create circular folder reference"
                )
            current_parent = db.query(Folder).filter(
                Folder.id == current_parent.parent_id
            ).first()
            if not current_parent:
                break
    
    # Update fields
    if folder_update.name is not None:
        folder.name = folder_update.name
    
    if folder_update.parent_id is not None:
        folder.parent_id = folder_update.parent_id
    
    db.commit()
    db.refresh(folder)
    
    # Get note count
    note_count = db.query(func.count(Note.id)).filter(
        Note.folder_id == folder.id,
        Note.user_id == current_user.id
    ).scalar()
    
    folder_dict = {
        'id': folder.id,
        'name': folder.name,
        'parent_id': folder.parent_id,
        'user_id': folder.user_id,
        'created_at': folder.created_at,
        'updated_at': folder.updated_at,
        'note_count': note_count or 0
    }
    
    return FolderResponse(**folder_dict)


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a folder.
    Notes in the folder will have their folder_id set to NULL (moved to root).
    """
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.user_id == current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found"
        )
    
    # Move notes to root (folder_id = NULL)
    db.query(Note).filter(
        Note.folder_id == folder_id,
        Note.user_id == current_user.id
    ).update({"folder_id": None})
    
    # Move subfolders to parent folder
    db.query(Folder).filter(
        Folder.parent_id == folder_id,
        Folder.user_id == current_user.id
    ).update({"parent_id": folder.parent_id})
    
    db.delete(folder)
    db.commit()
    
    return None
