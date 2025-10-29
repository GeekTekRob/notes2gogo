# 🔍 Search Analytics & Insights Guide

Comprehensive guide to search analytics, smart suggestions, and search insights in Notes2GoGo.

---

## Overview

Search Analytics automatically tracks your search behavior to provide intelligent suggestions, identify popular searches, and show trending queries. All analytics are **per-user only** with no cross-user tracking.

---

## Smart Search Suggestions

### How It Works
As you type in the search bar, Notes2GoGo shows autocomplete suggestions based on your search history.

### Using Suggestions
1. **Start Typing**: Enter at least 2 characters in the search bar
2. **View Suggestions**: Dropdown appears with matching queries from your history
3. **Navigate**: Use **↑↓** arrow keys to move through suggestions
4. **Select**: Press **Enter** to execute the selected suggestion
5. **Dismiss**: Press **Escape** to close the dropdown

### Visual Indicators
- 🔥 **Fire Icon**: Marks frequently searched terms (5+ searches)
- **Search Count**: Shows how many times you've searched this term
- **Highlights**: Matching text is highlighted in suggestions

### Keyboard Shortcuts
| Action | Key | Description |
|--------|-----|-------------|
| Navigate Down | `↓` | Move to next suggestion |
| Navigate Up | `↑` | Move to previous suggestion |
| Select | `Enter` | Execute highlighted suggestion |
| Dismiss | `Esc` | Close suggestion dropdown |
| Focus Search | `Ctrl/Cmd+K` | Jump to search bar |

---

## Search Insights Dashboard

Located in the dashboard sidebar, providing an overview of your search behavior.

### Quick Statistics
- **Total Searches**: Total number of searches performed
- **Unique Queries**: Number of distinct search terms
- **Average Results**: Average number of results per search
- **Most Searched**: Your most frequently searched query

### Popular Searches
Shows your top 10 most frequently searched terms with:
- Search query text
- Number of times searched
- Click to execute the search instantly

### Trending Searches
Identifies queries gaining popularity in the last 7 days:
- Queries with increasing search frequency
- Trend indicators (↗️ trending up)
- Recent search activity

### Click to Search
All queries in the insights dashboard are **clickable**:
1. Click any query in Popular or Trending lists
2. Search is executed automatically
3. Results appear in the main content area

---

## API Reference

### Get Search Suggestions
```bash
GET /api/analytics/suggestions?prefix=pro&limit=5
```

**Parameters:**
- `prefix` (required): Search prefix (minimum 2 characters)
- `limit` (optional): Maximum suggestions to return (default: 5, max: 20)

**Response:**
```json
[
  {
    "query": "project planning",
    "search_count": 12,
    "last_searched": "2025-10-29T10:30:00"
  },
  {
    "query": "productivity tips",
    "search_count": 8,
    "last_searched": "2025-10-28T15:45:00"
  }
]
```

### Get Popular Searches
```bash
GET /api/analytics/popular?limit=10
```

**Parameters:**
- `limit` (optional): Number of results (default: 10, max: 50)

**Response:**
```json
[
  {
    "query": "meeting notes",
    "search_count": 45,
    "last_searched": "2025-10-29T09:15:00",
    "avg_results": 12.5
  }
]
```

### Get Trending Searches
```bash
GET /api/analytics/trending?limit=10&days=7
```

**Parameters:**
- `limit` (optional): Number of results (default: 10, max: 50)
- `days` (optional): Time window in days (default: 7, max: 30)

**Response:**
```json
[
  {
    "query": "api documentation",
    "recent_searches": 15,
    "total_searches": 20,
    "trend_score": 2.5
  }
]
```

### Get Search Statistics
```bash
GET /api/analytics/stats
```

**Response:**
```json
{
  "total_searches": 234,
  "unique_queries": 87,
  "avg_results_per_search": 8.3,
  "most_searched_query": "meeting notes",
  "most_searched_count": 45,
  "searches_today": 12,
  "searches_this_week": 58
}
```

---

## Privacy & Data Management

### What's Tracked
- Search queries you execute
- Number of results returned
- Timestamp of each search
- Frequency of repeated searches

### What's NOT Tracked
- Which specific results you clicked
- How long you viewed results
- Other users' search behavior
- Cross-user analytics or trends

### Data Ownership
- All analytics are **per-user only**
- You can only see your own search history
- Data is automatically deleted when your account is deleted
- No data is shared with other users or third parties

### Disabling Analytics
Currently, search analytics are built-in. Future versions may include an opt-out option.

---

## Best Practices

### Effective Searching
1. **Use specific terms**: "react hooks tutorial" vs "tutorial"
2. **Leverage suggestions**: Save time by reusing previous searches
3. **Check trending**: See what topics you're recently interested in
4. **Use operators**: `intitle:`, `tag:`, quotes for exact phrases

### Organizing Your Searches
1. **Consistent terminology**: Use the same search terms for related queries
2. **Save common searches**: Use saved searches feature for complex queries
3. **Review popular searches**: Identify common patterns in your workflow
4. **Clean up old searches**: Delete or refine outdated search terms (future feature)

---

## Understanding Metrics

### Search Count
- Number of times a specific query has been executed
- Higher counts indicate frequently needed information
- Useful for identifying important topics

### Average Results
- Average number of notes returned for a query
- Low averages may indicate specific searches
- High averages may indicate broad searches

### Trend Score
- Measures increasing search frequency
- Calculated based on recent vs historical searches
- Higher scores indicate emerging topics of interest

---

## Troubleshooting

### Suggestions Not Appearing
- **Minimum characters**: Type at least 2 characters
- **Search history**: Suggestions require previous searches
- **Clear cache**: Refresh the page if suggestions seem outdated

### Inaccurate Statistics
- **Recent changes**: Statistics update in real-time but may have slight delays
- **Deleted notes**: Search results count reflects current note availability
- **Browser refresh**: Hard refresh to ensure latest data

### Missing Searches in History
- **Private browsing**: Analytics may not persist in incognito mode
- **Account sync**: Ensure you're logged in to the correct account
- **API errors**: Check browser console for errors

---

## Advanced Features

### Search Operators (Future)
Enhanced search syntax for power users:
- `intitle:keyword` - Search in titles only
- `tag:name` - Filter by tag
- `created:>=2025-01-01` - Date filters
- `"exact phrase"` - Exact match
- `word1 NEAR/5 word2` - Proximity search

### Saved Searches (Coming Soon)
- Save complex search queries with names
- Quick access to frequently used searches
- Share saved searches with team (future)

---

## Examples

### Finding Project Notes
```
Search: "project alpha"
Suggestions: Shows previous "project alpha" searches
Result: All notes mentioning "project alpha"
```

### Reviewing Meeting Notes
```
Search: meeting
Popular Searches: Shows "meeting notes" as top result
Click: Executes search automatically
```

### Discovering Trends
```
Trending: "api design" (recent spike)
Insight: You've been focusing on API design lately
Action: Review related notes or create summary
```

---

**Related Documentation:**
- [Tag System Guide](./TAGS.md)
- [API Reference](./API.md)
- [Accessibility Guide](./ACCESSIBILITY.md)
