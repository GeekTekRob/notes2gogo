"""add_tags_table_and_many_to_many_relationship

Revision ID: 2b3c4d5e6f7a
Revises: 191a68a0d119
Create Date: 2025-10-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '2b3c4d5e6f7a'
down_revision = '191a68a0d119'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create tags table
    op.create_table('tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tags_id'), 'tags', ['id'], unique=False)
    op.create_index(op.f('ix_tags_name'), 'tags', ['name'], unique=False)
    
    # Create unique constraint for user_id + name combination
    op.create_index('ix_tags_user_id_name', 'tags', ['user_id', 'name'], unique=True)
    
    # Create note_tags association table
    op.create_table('note_tags',
        sa.Column('note_id', sa.Integer(), nullable=False),
        sa.Column('tag_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['note_id'], ['notes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('note_id', 'tag_id')
    )
    
    # Rename old tags column to tags_array for backwards compatibility
    op.alter_column('notes', 'tags', new_column_name='tags_array')
    
    # Migration script to convert existing tags to the new system
    # This will be done in Python code after the migration
    # Users can run a data migration script separately


def downgrade() -> None:
    # Rename tags_array back to tags
    op.alter_column('notes', 'tags_array', new_column_name='tags')
    
    # Drop note_tags association table
    op.drop_table('note_tags')
    
    # Drop tags table
    op.drop_index('ix_tags_user_id_name', table_name='tags')
    op.drop_index(op.f('ix_tags_name'), table_name='tags')
    op.drop_index(op.f('ix_tags_id'), table_name='tags')
    op.drop_table('tags')
