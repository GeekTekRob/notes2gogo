"""
Data migration script to convert array-based tags to the new Tag model.
Run this after applying the Alembic migration.

Usage:
    python migrate_tags_data.py
"""
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import Note, Tag, User


def migrate_tags():
    """Migrate tags from tags_array to Tag model with many-to-many relationship."""
    db: Session = SessionLocal()
    
    try:
        print("Starting tag migration...")
        
        # Get all notes that have tags in the array
        notes_with_tags = db.query(Note).filter(Note.tags_array.isnot(None)).all()
        
        print(f"Found {len(notes_with_tags)} notes with tags to migrate")
        
        migrated_notes = 0
        created_tags = 0
        tag_cache = {}  # Cache tags by (user_id, tag_name) to avoid duplicates
        
        for note in notes_with_tags:
            if not note.tags_array:
                continue
            
            print(f"Migrating note {note.id}: {note.title}")
            
            for tag_name in note.tags_array:
                if not tag_name or not tag_name.strip():
                    continue
                
                # Normalize tag name
                tag_name = tag_name.strip().lower()
                cache_key = (note.user_id, tag_name)
                
                # Check cache first
                if cache_key in tag_cache:
                    tag = tag_cache[cache_key]
                else:
                    # Check if tag exists in database
                    tag = db.query(Tag).filter(
                        Tag.user_id == note.user_id,
                        Tag.name == tag_name
                    ).first()
                    
                    if not tag:
                        # Create new tag
                        tag = Tag(
                            name=tag_name,
                            user_id=note.user_id
                        )
                        db.add(tag)
                        db.flush()  # Get the tag ID
                        created_tags += 1
                        print(f"  Created tag: {tag_name}")
                    
                    # Cache the tag
                    tag_cache[cache_key] = tag
                
                # Add tag to note if not already associated
                if tag not in note.tags:
                    note.tags.append(tag)
                    print(f"  Added tag '{tag_name}' to note")
            
            migrated_notes += 1
        
        # Commit all changes
        db.commit()
        
        print("\n" + "="*60)
        print("Migration completed successfully!")
        print(f"Migrated {migrated_notes} notes")
        print(f"Created {created_tags} new tags")
        print(f"Total unique tags: {len(tag_cache)}")
        print("="*60)
        
        # Verify migration
        print("\nVerifying migration...")
        total_tags = db.query(Tag).count()
        total_associations = db.execute("SELECT COUNT(*) FROM note_tags").scalar()
        
        print(f"Total tags in database: {total_tags}")
        print(f"Total note-tag associations: {total_associations}")
        
        print("\nNote: The old tags_array column is preserved for rollback.")
        print("After verifying the migration, you can manually remove it with:")
        print("  ALTER TABLE notes DROP COLUMN tags_array;")
        
    except Exception as e:
        print(f"\nError during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Tag Data Migration Script")
    print("="*60)
    response = input("This will migrate array-based tags to the new Tag model. Continue? (yes/no): ")
    
    if response.lower() in ['yes', 'y']:
        migrate_tags()
    else:
        print("Migration cancelled.")
