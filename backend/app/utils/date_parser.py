"""
Natural language date parser for search queries.

Supports expressions like:
- today, yesterday, tomorrow
- last-week, last-month, last-year
- this-week, this-month, this-year
- N days ago, N weeks ago, N months ago
"""

import re
from datetime import datetime, timedelta
from typing import Optional, Tuple


class NaturalDateParser:
    """Parse natural language date expressions into datetime objects."""

    # Regex patterns for natural language dates
    RELATIVE_DATE_PATTERN = r"(today|yesterday|tomorrow)"
    LAST_PERIOD_PATTERN = r"last-(week|month|year)"
    THIS_PERIOD_PATTERN = r"this-(week|month|year)"
    AGO_PATTERN = r"(\d+)\s+(day|week|month|year)s?\s+ago"

    @staticmethod
    def parse(date_string: str) -> Optional[datetime]:
        """
        Parse a natural language date string into a datetime object.

        Args:
            date_string: Natural language date string (e.g., 'yesterday', 'last-week')

        Returns:
            datetime object or None if parsing fails
        """
        if not date_string:
            return None

        date_string = date_string.lower().strip()
        now = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

        # Handle relative dates (today, yesterday, tomorrow)
        if date_string == "today":
            return now
        elif date_string == "yesterday":
            return now - timedelta(days=1)
        elif date_string == "tomorrow":
            return now + timedelta(days=1)

        # Handle "last-period" (last-week, last-month, last-year)
        last_match = re.match(NaturalDateParser.LAST_PERIOD_PATTERN, date_string)
        if last_match:
            period = last_match.group(1)
            if period == "week":
                return now - timedelta(weeks=1)
            elif period == "month":
                # Approximate: 30 days
                return now - timedelta(days=30)
            elif period == "year":
                return now - timedelta(days=365)

        # Handle "this-period" (this-week, this-month, this-year)
        this_match = re.match(NaturalDateParser.THIS_PERIOD_PATTERN, date_string)
        if this_match:
            period = this_match.group(1)
            if period == "week":
                # Start of current week (Monday)
                days_since_monday = now.weekday()
                return now - timedelta(days=days_since_monday)
            elif period == "month":
                # Start of current month
                return now.replace(day=1)
            elif period == "year":
                # Start of current year
                return now.replace(month=1, day=1)

        # Handle "N period(s) ago" (5 days ago, 2 weeks ago)
        ago_match = re.match(NaturalDateParser.AGO_PATTERN, date_string)
        if ago_match:
            count = int(ago_match.group(1))
            unit = ago_match.group(2)

            if unit == "day":
                return now - timedelta(days=count)
            elif unit == "week":
                return now - timedelta(weeks=count)
            elif unit == "month":
                # Approximate: 30 days per month
                return now - timedelta(days=count * 30)
            elif unit == "year":
                return now - timedelta(days=count * 365)

        return None

    @staticmethod
    def is_natural_date(date_string: str) -> bool:
        """
        Check if a string looks like a natural language date expression.

        Args:
            date_string: String to check

        Returns:
            True if it looks like a natural language date
        """
        if not date_string:
            return False

        date_string = date_string.lower().strip()

        # Check all patterns
        patterns = [
            NaturalDateParser.RELATIVE_DATE_PATTERN,
            NaturalDateParser.LAST_PERIOD_PATTERN,
            NaturalDateParser.THIS_PERIOD_PATTERN,
            NaturalDateParser.AGO_PATTERN,
        ]

        for pattern in patterns:
            if re.match(pattern, date_string):
                return True

        return False

    @staticmethod
    def parse_date_with_operator(date_expr: str) -> Optional[Tuple[str, datetime]]:
        """
        Parse a date expression that may include an operator (>, <, >=, <=).

        Args:
            date_expr: Date expression like ">=yesterday" or "last-week"

        Returns:
            Tuple of (operator, datetime) or None if parsing fails
            operator is one of: '>', '<', '>=', '<=', '='
        """
        # Extract operator if present
        operator_pattern = r"^([><]=?)?(.+)$"
        match = re.match(operator_pattern, date_expr.strip())

        if not match:
            return None

        operator = match.group(1) or "="
        date_part = match.group(2).strip()

        # Try to parse as natural language date first
        if NaturalDateParser.is_natural_date(date_part):
            parsed_date = NaturalDateParser.parse(date_part)
            if parsed_date:
                return (operator, parsed_date)

        # Try to parse as ISO date format (YYYY-MM-DD)
        try:
            parsed_date = datetime.strptime(date_part, "%Y-%m-%d")
            return (operator, parsed_date)
        except ValueError:
            pass

        return None
