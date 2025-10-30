"""
Search Analytics API endpoints.

Provides endpoints for:
- Popular searches
- Search suggestions (autocomplete)
- Trending searches
- Overall search statistics
"""

from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, desc, func
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.database import get_db
from app.models import SearchAnalytics, User
from app.schemas import (
    PopularSearchResponse,
    SearchAnalyticsStatsResponse,
    SearchSuggestionResponse,
    TrendingSearchResponse,
)

router = APIRouter()


@router.get("/popular", response_model=List[PopularSearchResponse])
async def get_popular_searches(
    limit: int = Query(
        10, ge=1, le=50, description="Number of popular searches to return"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get the most popular search queries for the current user.

    Sorted by search count, then by recency.
    """
    popular = (
        db.query(SearchAnalytics)
        .filter(SearchAnalytics.user_id == current_user.id)
        .order_by(
            desc(SearchAnalytics.search_count), desc(SearchAnalytics.last_searched_at)
        )
        .limit(limit)
        .all()
    )

    return [
        PopularSearchResponse(
            query_text=item.query_text,
            search_count=item.search_count,
            last_searched_at=item.last_searched_at,
            avg_result_count=item.avg_result_count,
        )
        for item in popular
    ]


@router.get("/suggestions", response_model=List[SearchSuggestionResponse])
async def get_search_suggestions(
    prefix: str = Query(
        ..., min_length=1, max_length=100, description="Search query prefix"
    ),
    limit: int = Query(5, ge=1, le=20, description="Number of suggestions to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get search suggestions based on a query prefix.

    Returns suggestions that start with the given prefix, ranked by a combination
    of search frequency and recency.
    """
    # Get matching queries
    suggestions = (
        db.query(SearchAnalytics)
        .filter(
            SearchAnalytics.user_id == current_user.id,
            SearchAnalytics.query_text.ilike(f"{prefix}%"),
        )
        .all()
    )

    # Calculate relevance scores
    now = datetime.utcnow()
    results = []

    for item in suggestions:
        # Recency score (exponential decay - queries from last 7 days score highest)
        days_ago = (now - item.last_searched_at.replace(tzinfo=None)).days
        recency_score = max(0, 1.0 - (days_ago / 30.0))  # Decays over 30 days

        # Frequency score (normalized)
        frequency_score = min(1.0, item.search_count / 10.0)

        # Combined relevance (weighted: 60% recency, 40% frequency)
        relevance_score = (recency_score * 0.6) + (frequency_score * 0.4)

        results.append(
            SearchSuggestionResponse(
                query_text=item.query_text,
                search_count=item.search_count,
                last_searched_at=item.last_searched_at,
                relevance_score=relevance_score,
            )
        )

    # Sort by relevance and limit
    results.sort(key=lambda x: x.relevance_score, reverse=True)
    return results[:limit]


@router.get("/trending", response_model=List[TrendingSearchResponse])
async def get_trending_searches(
    limit: int = Query(
        10, ge=1, le=50, description="Number of trending searches to return"
    ),
    days: int = Query(
        7, ge=1, le=30, description="Number of days to analyze for trends"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get trending search queries.

    Shows queries that have increased in popularity recently.
    Compares search frequency in the recent period vs. overall.
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)

    # Get all analytics for the user
    all_analytics = (
        db.query(SearchAnalytics)
        .filter(
            SearchAnalytics.user_id == current_user.id,
            SearchAnalytics.search_count >= 2,  # Minimum 2 searches to be considered
        )
        .all()
    )

    trending = []

    for item in all_analytics:
        # Calculate recent searches (this is a simplified approach)
        # In production, you'd want a more sophisticated approach with time-bucketed data

        # Estimate recent search count based on last search date
        if item.last_searched_at.replace(tzinfo=None) >= cutoff_date:
            # Query was searched recently
            recent_ratio = min(
                1.0,
                (datetime.utcnow() - item.last_searched_at.replace(tzinfo=None)).days
                / days,
            )
            recent_search_count = max(1, int(item.search_count * (1 - recent_ratio)))
        else:
            recent_search_count = 0

        # Calculate trend
        if recent_search_count > item.search_count * 0.5:
            trend_direction = "up"
        elif recent_search_count < item.search_count * 0.2:
            trend_direction = "down"
        else:
            trend_direction = "stable"

        # Only include trending up or stable with recent activity
        if trend_direction in ["up", "stable"] and recent_search_count > 0:
            trending.append(
                TrendingSearchResponse(
                    query_text=item.query_text,
                    search_count=item.search_count,
                    recent_search_count=recent_search_count,
                    trend_direction=trend_direction,
                    last_searched_at=item.last_searched_at,
                )
            )

    # Sort by recent search count
    trending.sort(key=lambda x: x.recent_search_count, reverse=True)
    return trending[:limit]


@router.get("/stats", response_model=SearchAnalyticsStatsResponse)
async def get_search_stats(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """
    Get overall search analytics statistics for the current user.
    """
    # Total searches
    total_searches = (
        db.query(func.sum(SearchAnalytics.search_count))
        .filter(SearchAnalytics.user_id == current_user.id)
        .scalar()
        or 0
    )

    # Unique queries
    unique_queries = (
        db.query(func.count(SearchAnalytics.id))
        .filter(SearchAnalytics.user_id == current_user.id)
        .scalar()
        or 0
    )

    # Average results per search
    avg_results = (
        db.query(func.avg(SearchAnalytics.avg_result_count))
        .filter(
            SearchAnalytics.user_id == current_user.id,
            SearchAnalytics.avg_result_count.isnot(None),
        )
        .scalar()
    )

    # Most searched query
    most_searched = (
        db.query(SearchAnalytics)
        .filter(SearchAnalytics.user_id == current_user.id)
        .order_by(desc(SearchAnalytics.search_count))
        .first()
    )

    # Searches today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    searches_today = (
        db.query(func.sum(SearchAnalytics.search_count))
        .filter(
            SearchAnalytics.user_id == current_user.id,
            SearchAnalytics.last_searched_at >= today_start,
        )
        .scalar()
        or 0
    )

    # Searches this week
    week_start = datetime.utcnow() - timedelta(days=7)
    searches_this_week = (
        db.query(func.sum(SearchAnalytics.search_count))
        .filter(
            SearchAnalytics.user_id == current_user.id,
            SearchAnalytics.last_searched_at >= week_start,
        )
        .scalar()
        or 0
    )

    return SearchAnalyticsStatsResponse(
        total_searches=int(total_searches),
        unique_queries=unique_queries,
        avg_results_per_search=float(avg_results) if avg_results else None,
        most_searched_query=most_searched.query_text if most_searched else None,
        searches_today=int(searches_today),
        searches_this_week=int(searches_this_week),
    )
