"""
Search service for advanced full-text search with filters and ranking.

This module provides comprehensive search functionality including:
- Full-text search using PostgreSQL's tsvector/tsquery
- Search syntax parsing (operators, quoted phrases, etc.)
- Advanced filtering (tags, dates, note types)
- Natural language date parsing (yesterday, last-week, etc.)
- Result ranking and relevance scoring
- Snippet generation with context
"""

import re
from datetime import datetime
from typing import List, Tuple, Optional, Dict, Any
from sqlalchemy import func, or_, and_, not_, desc, case, literal_column, text
from sqlalchemy.orm import Session, joinedload
from app.models import Note, Tag, SearchAnalytics
from app.schemas import (
    SearchRequest, SearchResultItem, SearchSortBy, 
    TagFilterMode, NoteType
)
from app.utils.date_parser import NaturalDateParser


class SearchQueryParser:
    """Parse search queries with advanced operators."""
    
    # Regex patterns for search operators
    INTITLE_PATTERN = r'intitle:(\w+|"[^"]+")'
    TAG_PATTERN = r'(?:^|\s)(tag:(\w+))'
    EXCLUDE_TAG_PATTERN = r'(?:^|\s)(-tag:(\w+))'
    CREATED_PATTERN = r'created:([<>]=?)?([a-zA-Z0-9\-]+)'
    UPDATED_PATTERN = r'updated:([<>]=?)?([a-zA-Z0-9\-]+)'
    HAS_PATTERN = r'has:(\w+)'
    TODO_PATTERN = r'todo:(complete|incomplete)'
    QUOTED_PHRASE_PATTERN = r'"([^"]+)"'
    NEAR_PATTERN = r'(\w+)\s+NEAR(?:/(\d+))?\s+(\w+)'
    
    def __init__(self, query: str):
        self.original_query = query
        self.title_terms: List[str] = []
        self.content_terms: List[str] = []
        self.tags: List[str] = []
        self.exclude_tags: List[str] = []
        self.created_filters: Dict[str, datetime] = {}
        self.updated_filters: Dict[str, datetime] = {}
        self.has_filters: List[str] = []
        self.todo_status: Optional[str] = None
        self.quoted_phrases: List[str] = []
        self.near_queries: List[Tuple[str, int, str]] = []
        self.remaining_query = query
        
    def parse(self) -> Dict[str, Any]:
        """Parse the search query and extract all operators."""
        
        # Extract intitle: terms
        for match in re.finditer(self.INTITLE_PATTERN, self.remaining_query, re.IGNORECASE):
            term = match.group(1).strip('"')
            self.title_terms.append(term)
            self.remaining_query = self.remaining_query.replace(match.group(0), ' ', 1)
        
        # Extract tag: filters
        for match in re.finditer(self.TAG_PATTERN, self.remaining_query, re.IGNORECASE):
            self.tags.append(match.group(2).lower())
            self.remaining_query = self.remaining_query.replace(match.group(0), ' ', 1)
        
        # Extract -tag: (exclude) filters
        for match in re.finditer(self.EXCLUDE_TAG_PATTERN, self.remaining_query, re.IGNORECASE):
            self.exclude_tags.append(match.group(2).lower())
            self.remaining_query = self.remaining_query.replace(match.group(0), ' ', 1)
        
        # Extract created: date filters
        for match in re.finditer(self.CREATED_PATTERN, self.remaining_query, re.IGNORECASE):
            operator = match.group(1) or '='
            date_str = match.group(2)
            
            # Try parsing as ISO date first, then natural language
            date = None
            try:
                date = datetime.strptime(date_str, '%Y-%m-%d')
            except ValueError:
                # Try natural language parsing
                date = NaturalDateParser.parse(date_str)
            
            if date:
                if operator in ['>', '>=']:
                    self.created_filters['after'] = date
                elif operator in ['<', '<=']:
                    self.created_filters['before'] = date
                else:
                    self.created_filters['exact'] = date
            
            self.remaining_query = self.remaining_query.replace(match.group(0), ' ', 1)
        
        # Extract updated: date filters
        for match in re.finditer(self.UPDATED_PATTERN, self.remaining_query, re.IGNORECASE):
            operator = match.group(1) or '='
            date_str = match.group(2)
            
            # Try parsing as ISO date first, then natural language
            date = None
            try:
                date = datetime.strptime(date_str, '%Y-%m-%d')
            except ValueError:
                # Try natural language parsing
                date = NaturalDateParser.parse(date_str)
            
            if date:
                if operator in ['>', '>=']:
                    self.updated_filters['after'] = date
                elif operator in ['<', '<=']:
                    self.updated_filters['before'] = date
                else:
                    self.updated_filters['exact'] = date
            
            self.remaining_query = self.remaining_query.replace(match.group(0), ' ', 1)
        
        # Extract has: filters
        for match in re.finditer(self.HAS_PATTERN, self.remaining_query, re.IGNORECASE):
            self.has_filters.append(match.group(1).lower())
            self.remaining_query = self.remaining_query.replace(match.group(0), ' ', 1)
        
        # Extract todo: status
        match = re.search(self.TODO_PATTERN, self.remaining_query, re.IGNORECASE)
        if match:
            self.todo_status = match.group(1).lower()
            self.remaining_query = self.remaining_query.replace(match.group(0), ' ', 1)
        
        # Extract quoted phrases
        for match in re.finditer(self.QUOTED_PHRASE_PATTERN, self.remaining_query):
            self.quoted_phrases.append(match.group(1))
            self.remaining_query = self.remaining_query.replace(match.group(0), ' ', 1)
        
        # Extract NEAR queries
        for match in re.finditer(self.NEAR_PATTERN, self.remaining_query, re.IGNORECASE):
            word1 = match.group(1)
            distance = int(match.group(2)) if match.group(2) else 10
            word2 = match.group(3)
            self.near_queries.append((word1, distance, word2))
            self.remaining_query = self.remaining_query.replace(match.group(0), ' ', 1)
        
        # Clean up remaining query (remove AND, OR, NOT operators for tsquery)
        self.remaining_query = re.sub(r'\b(AND|OR|NOT)\b', ' ', self.remaining_query, flags=re.IGNORECASE)
        
        # What's left is general content search terms
        self.content_terms = [term.strip() for term in self.remaining_query.split() if term.strip()]
        
        return {
            'title_terms': self.title_terms,
            'content_terms': self.content_terms,
            'tags': self.tags,
            'exclude_tags': self.exclude_tags,
            'created_filters': self.created_filters,
            'updated_filters': self.updated_filters,
            'has_filters': self.has_filters,
            'todo_status': self.todo_status,
            'quoted_phrases': self.quoted_phrases,
            'near_queries': self.near_queries
        }


class SearchService:
    """Service for performing advanced searches on notes."""
    
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
    
    def search(self, request: SearchRequest) -> Tuple[List[SearchResultItem], int]:
        """
        Perform advanced search with filters and ranking.
        
        Returns: (results, total_count)
        """
        # Parse the search query
        parser = SearchQueryParser(request.query)
        parsed = parser.parse()
        
        # Start with base query
        query = self.db.query(Note).options(joinedload(Note.tags)).filter(
            Note.user_id == self.user_id
        )
        
        # Apply full-text search
        query, rank_score = self._apply_fulltext_search(
            query, parsed, request.title_only
        )
        
        # Apply filters from parsed query
        query = self._apply_parsed_filters(query, parsed)
        
        # Apply filters from request object
        query = self._apply_request_filters(query, request)
        
        # Get total count before pagination
        total = query.count()
        
        # Apply sorting
        query = self._apply_sorting(query, request.sort_by, rank_score)
        
        # Apply pagination
        offset = (request.page - 1) * request.per_page
        notes = query.offset(offset).limit(request.per_page).all()
        
        # Convert to search result items with snippets
        results = []
        for note in notes:
            result = self._create_search_result(
                note, parsed, rank_score, request.query
            )
            results.append(result)
        
        # Track search analytics (async-style, don't block on errors)
        try:
            self._track_search_analytics(request.query, total)
        except Exception as e:
            # Log error but don't fail the search
            print(f"Error tracking search analytics: {e}")
        
        return results, total
    
    def _apply_fulltext_search(
        self, query, parsed: Dict, title_only: bool
    ) -> Tuple[Any, Any]:
        """Apply PostgreSQL full-text search with ranking."""
        
        search_conditions = []
        rank_components = []
        
        # Build tsquery for title search
        if parsed['title_terms'] or (not title_only and parsed['content_terms']):
            title_query_str = ' & '.join(parsed['title_terms']) if parsed['title_terms'] else ''
            
            if title_query_str:
                # Search in title
                tsquery_title = func.plainto_tsquery('english', title_query_str)
                search_conditions.append(Note.title_tsv.op('@@')(tsquery_title))
                
                # Rank title matches higher (weight A = 1.0, multiplied by 2.0)
                rank_components.append(
                    func.ts_rank(Note.title_tsv, tsquery_title) * 2.0
                )
        
        # Build tsquery for content search (if not title_only)
        if not title_only:
            content_query_parts = []
            
            # Add regular content terms
            if parsed['content_terms']:
                content_query_parts.extend(parsed['content_terms'])
            
            # Add quoted phrases
            if parsed['quoted_phrases']:
                content_query_parts.extend(parsed['quoted_phrases'])
            
            if content_query_parts:
                content_query_str = ' & '.join(content_query_parts)
                tsquery_content = func.plainto_tsquery('english', content_query_str)
                search_conditions.append(Note.content_tsv.op('@@')(tsquery_content))
                
                # Rank content matches (weight B = 0.4)
                rank_components.append(
                    func.ts_rank(Note.content_tsv, tsquery_content)
                )
        
        # Apply search conditions
        if search_conditions:
            query = query.filter(or_(*search_conditions))
        
        # Create combined rank score
        if rank_components:
            rank_score = sum(rank_components)
        else:
            rank_score = literal_column('1.0')
        
        return query, rank_score
    
    def _apply_parsed_filters(self, query, parsed: Dict):
        """Apply filters extracted from the search query parser."""
        
        # Tag filters
        if parsed['tags']:
            for tag_name in parsed['tags']:
                query = query.join(Note.tags).filter(Tag.name == tag_name)
        
        # Exclude tags
        if parsed['exclude_tags']:
            excluded_note_ids = self.db.query(Note.id).join(Note.tags).filter(
                Note.user_id == self.user_id,
                Tag.name.in_(parsed['exclude_tags'])
            ).distinct().subquery()
            query = query.filter(not_(Note.id.in_(excluded_note_ids)))
        
        # Created date filters
        if 'after' in parsed['created_filters']:
            query = query.filter(Note.created_at >= parsed['created_filters']['after'])
        if 'before' in parsed['created_filters']:
            query = query.filter(Note.created_at <= parsed['created_filters']['before'])
        
        # Updated date filters
        if 'after' in parsed['updated_filters']:
            query = query.filter(Note.updated_at >= parsed['updated_filters']['after'])
        if 'before' in parsed['updated_filters']:
            query = query.filter(Note.updated_at <= parsed['updated_filters']['before'])
        
        # Has filters
        if 'attachments' in parsed['has_filters']:
            # For future implementation when attachments are added
            pass
        
        return query
    
    def _apply_request_filters(self, query, request: SearchRequest):
        """Apply filters from the SearchRequest object."""
        
        # Note type filter
        if request.note_type:
            query = query.filter(Note.note_type == request.note_type)
        
        # Tag filters from request
        if request.tags:
            if request.tag_mode == TagFilterMode.AND:
                for tag_name in request.tags:
                    query = query.join(Note.tags).filter(Tag.name == tag_name.lower())
            elif request.tag_mode == TagFilterMode.OR:
                query = query.join(Note.tags).filter(
                    Tag.name.in_([t.lower() for t in request.tags])
                ).distinct()
        
        # Exclude tags from request
        if request.exclude_tags:
            excluded_note_ids = self.db.query(Note.id).join(Note.tags).filter(
                Note.user_id == self.user_id,
                Tag.name.in_([t.lower() for t in request.exclude_tags])
            ).distinct().subquery()
            query = query.filter(not_(Note.id.in_(excluded_note_ids)))
        
        # Date filters from request
        if request.created_after:
            query = query.filter(Note.created_at >= request.created_after)
        if request.created_before:
            query = query.filter(Note.created_at <= request.created_before)
        if request.updated_after:
            query = query.filter(Note.updated_at >= request.updated_after)
        if request.updated_before:
            query = query.filter(Note.updated_at <= request.updated_before)
        
        return query
    
    def _apply_sorting(self, query, sort_by: SearchSortBy, rank_score):
        """Apply sorting to the query."""
        
        if sort_by == SearchSortBy.RELEVANCE:
            # Sort by relevance score (highest first)
            query = query.order_by(desc(rank_score))
        elif sort_by == SearchSortBy.CREATED_DESC:
            query = query.order_by(desc(Note.created_at))
        elif sort_by == SearchSortBy.CREATED_ASC:
            query = query.order_by(Note.created_at)
        elif sort_by == SearchSortBy.UPDATED_DESC:
            query = query.order_by(desc(Note.updated_at))
        elif sort_by == SearchSortBy.UPDATED_ASC:
            query = query.order_by(Note.updated_at)
        elif sort_by == SearchSortBy.TITLE_ASC:
            query = query.order_by(Note.title)
        elif sort_by == SearchSortBy.TITLE_DESC:
            query = query.order_by(desc(Note.title))
        
        return query
    
    def _create_search_result(
        self, note: Note, parsed: Dict, rank_score, original_query: str
    ) -> SearchResultItem:
        """Create a SearchResultItem with snippet and metadata."""
        
        # Generate snippet with context
        snippet = self._generate_snippet(note, parsed, original_query)
        
        # Determine where matches were found
        match_locations = []
        
        # Check title
        search_terms = parsed['title_terms'] + parsed['content_terms']
        for term in search_terms:
            if term.lower() in note.title.lower():
                match_locations.append('title')
                break
        
        # Check content
        content_str = note.content_text or str(note.content_structured or '')
        for term in search_terms:
            if term.lower() in content_str.lower():
                match_locations.append('content')
                break
        
        # Check tags
        tag_names = [tag.name for tag in note.tags]
        for tag in parsed['tags']:
            if tag in tag_names:
                match_locations.append('tags')
                break
        
        # Calculate relevance score
        # In production, this would use the actual rank_score from the query
        relevance = self._calculate_relevance_score(note, parsed, match_locations)
        
        return SearchResultItem(
            id=note.id,
            title=note.title,
            note_type=note.note_type,
            snippet=snippet,
            tags=[tag.name for tag in note.tags],
            user_id=note.user_id,
            created_at=note.created_at,
            updated_at=note.updated_at,
            relevance_score=relevance,
            match_locations=match_locations
        )
    
    def _generate_snippet(self, note: Note, parsed: Dict, original_query: str, max_length: int = 200) -> str:
        """Generate a snippet showing context around search terms."""
        
        content = note.content_text or str(note.content_structured or '')
        search_terms = parsed['title_terms'] + parsed['content_terms'] + parsed['quoted_phrases']
        
        if not search_terms or not content:
            # Return beginning of content
            return content[:max_length] + ('...' if len(content) > max_length else '')
        
        # Find first occurrence of any search term
        content_lower = content.lower()
        earliest_pos = len(content)
        found_term = None
        
        for term in search_terms:
            pos = content_lower.find(term.lower())
            if pos != -1 and pos < earliest_pos:
                earliest_pos = pos
                found_term = term
        
        if found_term is None:
            # No term found, return beginning
            return content[:max_length] + ('...' if len(content) > max_length else '')
        
        # Extract context around the term
        context_chars = max_length // 2
        start = max(0, earliest_pos - context_chars)
        end = min(len(content), earliest_pos + len(found_term) + context_chars)
        
        snippet = content[start:end]
        
        # Add ellipsis if truncated
        if start > 0:
            snippet = '...' + snippet
        if end < len(content):
            snippet = snippet + '...'
        
        return snippet.strip()
    
    def _calculate_relevance_score(self, note: Note, parsed: Dict, match_locations: List[str]) -> float:
        """Calculate a relevance score for ranking."""
        
        score = 0.0
        
        # Title matches get highest boost
        if 'title' in match_locations:
            score += 2.0
        
        # Content matches
        if 'content' in match_locations:
            score += 1.0
        
        # Tag matches
        if 'tags' in match_locations:
            score += 0.5
        
        # Recency boost (newer notes rank higher)
        days_since_update = (datetime.utcnow() - note.updated_at.replace(tzinfo=None)).days
        if days_since_update < 7:
            score += 0.5
        elif days_since_update < 30:
            score += 0.3
        elif days_since_update < 90:
            score += 0.1
        
        return score
    
    def _track_search_analytics(self, query_text: str, result_count: int) -> None:
        """
        Track search analytics for this query.
        
        Creates or updates a SearchAnalytics record for this user's query.
        Only increments count if last search was more than 5 seconds ago to prevent double-counting.
        """
        # Normalize query text
        query_text = query_text.strip()
        if not query_text:
            return
        
        # Find existing analytics record
        analytics = self.db.query(SearchAnalytics).filter(
            SearchAnalytics.user_id == self.user_id,
            SearchAnalytics.query_text == query_text
        ).first()
        
        now = datetime.utcnow()
        
        if analytics:
            # Check if this is a duplicate search within 5 seconds (debounce protection)
            time_since_last = (now - analytics.last_searched_at.replace(tzinfo=None)).total_seconds()
            
            if time_since_last < 5:
                # Too soon - this is likely a duplicate from live search + manual submit
                # Just update the timestamp and result count without incrementing
                analytics.last_searched_at = now
                analytics.last_result_count = result_count
            else:
                # Legitimate new search - increment count
                analytics.search_count += 1
                analytics.last_searched_at = now
                analytics.last_result_count = result_count
                
                # Update rolling average of result counts
                if analytics.avg_result_count is None:
                    analytics.avg_result_count = result_count
                else:
                    # Weighted average (give more weight to recent searches)
                    analytics.avg_result_count = (
                        (analytics.avg_result_count * 0.8) + (result_count * 0.2)
                    )
        else:
            # Create new record
            analytics = SearchAnalytics(
                user_id=self.user_id,
                query_text=query_text,
                search_count=1,
                last_searched_at=now,
                last_result_count=result_count,
                avg_result_count=result_count
            )
            self.db.add(analytics)
        
        self.db.commit()
