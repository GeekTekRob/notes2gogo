"""Add full-text search support

Revision ID: 3c4d5e6f7a8b
Revises: 2b3c4d5e6f7a
Create Date: 2025-10-27 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '3c4d5e6f7a8b'
down_revision = '2b3c4d5e6f7a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add full-text search capabilities to the notes table.
    
    This migration:
    1. Adds tsvector columns for full-text search on title and content
    2. Creates GIN indexes for efficient full-text search
    3. Creates triggers to automatically update tsvector columns
    4. Populates tsvector columns with existing data
    """
    
    # Add tsvector columns for full-text search
    op.add_column('notes', sa.Column('title_tsv', postgresql.TSVECTOR(), nullable=True))
    op.add_column('notes', sa.Column('content_tsv', postgresql.TSVECTOR(), nullable=True))
    
    # Create GIN indexes for fast full-text search
    op.create_index(
        'ix_notes_title_tsv',
        'notes',
        ['title_tsv'],
        unique=False,
        postgresql_using='gin'
    )
    
    op.create_index(
        'ix_notes_content_tsv',
        'notes',
        ['content_tsv'],
        unique=False,
        postgresql_using='gin'
    )
    
    # Create a function to update tsvector columns
    op.execute("""
        CREATE OR REPLACE FUNCTION notes_tsvector_update_trigger()
        RETURNS trigger AS $$
        BEGIN
            -- Update title tsvector with weight 'A' (highest)
            NEW.title_tsv := setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A');
            
            -- Update content tsvector with weight 'B'
            -- Handle both text and JSONB content
            IF NEW.content_text IS NOT NULL THEN
                NEW.content_tsv := setweight(to_tsvector('english', coalesce(NEW.content_text, '')), 'B');
            ELSIF NEW.content_structured IS NOT NULL THEN
                -- Extract text from JSONB and index it
                NEW.content_tsv := setweight(to_tsvector('english', coalesce(NEW.content_structured::text, '')), 'B');
            ELSE
                NEW.content_tsv := to_tsvector('english', '');
            END IF;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    # Create trigger to automatically update tsvector columns on INSERT or UPDATE
    op.execute("""
        CREATE TRIGGER notes_tsvector_update
        BEFORE INSERT OR UPDATE ON notes
        FOR EACH ROW
        EXECUTE FUNCTION notes_tsvector_update_trigger();
    """)
    
    # Populate tsvector columns with existing data
    op.execute("""
        UPDATE notes
        SET title_tsv = setweight(to_tsvector('english', coalesce(title, '')), 'A'),
            content_tsv = CASE
                WHEN content_text IS NOT NULL THEN
                    setweight(to_tsvector('english', coalesce(content_text, '')), 'B')
                WHEN content_structured IS NOT NULL THEN
                    setweight(to_tsvector('english', coalesce(content_structured::text, '')), 'B')
                ELSE
                    to_tsvector('english', '')
            END;
    """)
    
    # Make tsvector columns NOT NULL after populating
    op.alter_column('notes', 'title_tsv', nullable=False)
    op.alter_column('notes', 'content_tsv', nullable=False)


def downgrade() -> None:
    """Remove full-text search capabilities."""
    
    # Drop trigger
    op.execute("DROP TRIGGER IF EXISTS notes_tsvector_update ON notes;")
    
    # Drop function
    op.execute("DROP FUNCTION IF EXISTS notes_tsvector_update_trigger();")
    
    # Drop indexes
    op.drop_index('ix_notes_content_tsv', table_name='notes', postgresql_using='gin')
    op.drop_index('ix_notes_title_tsv', table_name='notes', postgresql_using='gin')
    
    # Drop columns
    op.drop_column('notes', 'content_tsv')
    op.drop_column('notes', 'title_tsv')
