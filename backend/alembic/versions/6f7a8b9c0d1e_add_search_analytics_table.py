"""Add search analytics table

Revision ID: 6f7a8b9c0d1e
Revises: 5e6f7a8b9c0d
Create Date: 2025-10-28 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '6f7a8b9c0d1e'
down_revision = '5e6f7a8b9c0d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add search analytics table to track search queries and usage patterns.
    
    This migration:
    1. Creates search_analytics table for tracking search queries
    2. Stores query text, frequency, result counts, and timestamps
    3. Adds indexes for efficient querying
    """
    
    # Create search_analytics table
    op.create_table(
        'search_analytics',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('query_text', sa.String(500), nullable=False, index=True),
        sa.Column('search_count', sa.Integer(), nullable=False, default=1),
        sa.Column('last_searched_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('avg_result_count', sa.Float(), nullable=True),
        sa.Column('last_result_count', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    
    # Create indexes for efficient lookups
    op.create_index(
        'ix_search_analytics_user_query',
        'search_analytics',
        ['user_id', 'query_text'],
        unique=True
    )
    
    op.create_index(
        'ix_search_analytics_user_last_searched',
        'search_analytics',
        ['user_id', 'last_searched_at']
    )
    
    op.create_index(
        'ix_search_analytics_user_count',
        'search_analytics',
        ['user_id', 'search_count']
    )


def downgrade() -> None:
    """Drop search analytics table and indexes."""
    op.drop_index('ix_search_analytics_user_count')
    op.drop_index('ix_search_analytics_user_last_searched')
    op.drop_index('ix_search_analytics_user_query')
    op.drop_table('search_analytics')
