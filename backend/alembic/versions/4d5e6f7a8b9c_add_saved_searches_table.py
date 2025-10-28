"""Add saved searches table

Revision ID: 4d5e6f7a8b9c
Revises: 3c4d5e6f7a8b
Create Date: 2025-10-27 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '4d5e6f7a8b9c'
down_revision = '3c4d5e6f7a8b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add saved_searches table for storing user's favorite search queries."""
    
    op.create_table(
        'saved_searches',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('search_query', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('use_count', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index(op.f('ix_saved_searches_id'), 'saved_searches', ['id'], unique=False)
    op.create_index(op.f('ix_saved_searches_user_id'), 'saved_searches', ['user_id'], unique=False)


def downgrade() -> None:
    """Remove saved_searches table."""
    
    op.drop_index(op.f('ix_saved_searches_user_id'), table_name='saved_searches')
    op.drop_index(op.f('ix_saved_searches_id'), table_name='saved_searches')
    op.drop_table('saved_searches')
