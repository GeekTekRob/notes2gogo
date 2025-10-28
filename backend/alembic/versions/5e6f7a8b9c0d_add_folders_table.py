"""Add folders table

Revision ID: 5e6f7a8b9c0d
Revises: 4d5e6f7a8b9c
Create Date: 2025-10-27 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '5e6f7a8b9c0d'
down_revision = '4d5e6f7a8b9c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add folders table for hierarchical note organization."""
    
    # Create folders table
    op.create_table(
        'folders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['parent_id'], ['folders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_folders_id'), 'folders', ['id'], unique=False)
    op.create_index(op.f('ix_folders_name'), 'folders', ['name'], unique=False)
    op.create_index(op.f('ix_folders_user_id'), 'folders', ['user_id'], unique=False)
    
    # Add folder_id column to notes table
    op.add_column('notes', sa.Column('folder_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_notes_folder_id',
        'notes', 'folders',
        ['folder_id'], ['id'],
        ondelete='SET NULL'
    )
    op.create_index(op.f('ix_notes_folder_id'), 'notes', ['folder_id'], unique=False)


def downgrade() -> None:
    """Remove folders table and folder_id from notes."""
    
    # Remove folder_id from notes
    op.drop_index(op.f('ix_notes_folder_id'), table_name='notes')
    op.drop_constraint('fk_notes_folder_id', 'notes', type_='foreignkey')
    op.drop_column('notes', 'folder_id')
    
    # Drop folders table indexes and table
    op.drop_index(op.f('ix_folders_user_id'), table_name='folders')
    op.drop_index(op.f('ix_folders_name'), table_name='folders')
    op.drop_index(op.f('ix_folders_id'), table_name='folders')
    op.drop_table('folders')
