# 📚 API Reference

Complete API documentation for Notes2GoGo backend endpoints.

---

## Base URL

**Development:** `http://localhost:8000`  
**Production:** Your deployed backend URL

All API endpoints require authentication (except registration and login) via JWT token in the `Authorization` header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Authentication Endpoints

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2025-10-29T10:00:00"
}
```

### Login (Form Data)
```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securepassword123
```

### Login (JSON)
```http
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123"
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "is_active": true,
  "created_at": "2025-10-29T10:00:00"
}
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
username=johndoe&password=securepassword123

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

  "username": "johndoe",
  "password": "securepassword123"
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2025-10-29T10:00:00"
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
GET /api/notes/?page=1&per_page=10&search=keyword&tags=work,urgent&tag_filter_mode=and
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `per_page` (int): Items per page (default: 10, max: 100)
- `search` (string): Search in title, tags, and content
- `note_type` (string): Filter by type (`text` or `structured`)
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "is_active": true,
  "created_at": "2025-10-29T10:00:00"
}
{
  "notes": [
    {
      "id": 1,
      "title": "Meeting Notes",
      "note_type": "text",
      "content": "# Meeting Summary\n\n...",
      "tags": ["work", "meeting"],
      "created_at": "2025-10-29T10:00:00",
```json
["work", "workout", "workspace"]
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "New Note",
  "note_type": "text",
  "content": "Note content here...",
  "tags": ["personal", "ideas"]
}
```

**Response (201 Created):**
```json
{
```json
{
  "id": 3,
  "name": "target-tag",
  "user_id": 1,
  "created_at": "2025-10-20T12:00:00",
  "note_count": 22
}
```
  "created_at": "2025-10-29T12:00:00",
  "updated_at": "2025-10-29T12:00:00"
}
```

### Get Specific Note
```http
GET /api/notes/{note_id}
```json
[
  {
    "query_text": "project planning",
    "search_count": 12,
    "last_searched_at": "2025-10-29T10:30:00",
    "relevance_score": 0.87
  }
]
```
  "note_type": "text",
  "content": "# Meeting Summary...",
  "tags": ["work", "meeting"],
  "created_at": "2025-10-29T10:00:00",
  "updated_at": "2025-10-29T11:00:00"
}
```

```json
[
  {
    "query_text": "meeting notes",
    "search_count": 45,
    "last_searched_at": "2025-10-29T09:15:00",
    "avg_result_count": 12.5
  }
]
```
  "tags": ["work", "meeting", "action-items"]
}
```

**Response (200 OK):**
```json
{
  "id": 1,
```json
[
  {
    "query_text": "api documentation",
    "search_count": 20,
    "recent_search_count": 15,
    "trend_direction": "up",
    "last_searched_at": "2025-10-29T10:00:00"
  }
]
```
```http
DELETE /api/notes/{note_id}
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (204 No Content)**

### Bulk Tag Operations
```json
{
  "total_searches": 234,
  "unique_queries": 87,
  "avg_results_per_search": 8.3,
  "most_searched_query": "meeting notes",
  "searches_today": 12,
  "searches_this_week": 68
}
```
  "operation": "add"
}
```

**Operations:** `add`, `remove`, `replace`

**Response (200 OK):**
```json
{
  "updated_count": 3,
  "note_ids": [1, 2, 3]
}
```

---

## Tags Endpoints

### List All Tags
```http
GET /api/tags/
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "work",
      "snippet": "...discussed project plan...",
      "relevance_score": 0.95,
      "match_locations": ["title", "content"],
      "tags": ["work", "meeting"],
      "user_id": 1,
      "created_at": "2025-10-20T09:00:00",
      "updated_at": "2025-10-21T12:00:00"
    "id": 2,
    "name": "personal",
    "note_count": 8
  }
]
```

### Create Tag
```http
POST /api/tags/
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "new-tag"
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "name": "new-tag",
  "note_count": 0
}
```

### Rename Tag
```http
PUT /api/tags/{tag_id}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "updated-name"
}
```

**Response (200 OK):**
```json
{
  "id": 3,
  "name": "updated-name",
  "note_count": 0
}
```

### Delete Tag
```http
DELETE /api/tags/{tag_id}
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (204 No Content)**

### Merge Tags
```http
POST /api/tags/merge
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "source_tag_id": 5,
  "target_tag_id": 3
}
```

**Response (200 OK):**
```json
{
  "message": "Tags merged successfully",
  "updated_notes": 7
}
```

### Tag Autocomplete
```http
GET /api/tags/autocomplete?q=wor
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "work",
    "note_count": 15
  },
  {
    "id": 4,
    "name": "workout",
    "note_count": 3
  }
]
```

---

## Search Analytics Endpoints

### Get Search Suggestions
```http
GET /api/analytics/suggestions?prefix=pro&limit=5
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
[
  {
    "query": "project planning",
    "search_count": 12,
    "last_searched": "2025-10-29T10:30:00"
  }
]
```

### Get Popular Searches
```http
GET /api/analytics/popular?limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
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
```http
GET /api/analytics/trending?limit=10&days=7
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
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
```http
GET /api/analytics/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "total_searches": 234,
  "unique_queries": 87,
  "avg_results_per_search": 8.3,
  "most_searched_query": "meeting notes",
  "most_searched_count": 45
}
```

---

## Advanced Search Endpoint

### Search with Advanced Filters
```http
POST /api/search
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "query": "intitle:meeting tag:work \"project plan\"",
  "tags": ["work"],
  "tag_mode": "and",
  "exclude_tags": ["archived"],
  "note_type": "text",
  "created_after": "2025-01-01T00:00:00",
  "created_before": null,
  "updated_after": null,
  "updated_before": null,
  "title_only": false,
  "sort_by": "relevance",
  "page": 1,
  "per_page": 20
}
```

**Query Operators:**
- `intitle:term` - Search in titles only
- `tag:name` - Include tag
- `-tag:name` - Exclude tag
- `created:>=YYYY-MM-DD` - Date filter
- `"exact phrase"` - Exact match
- `word1 NEAR/5 word2` - Proximity search

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Project Meeting Notes",
      "snippet": "...discussed project plan...",
      "score": 0.95,
      "tags": ["work", "meeting"]
    }
  ],
  "total": 15,
  "page": 1,
  "per_page": 20
}
```

---

## Saved Searches Endpoints

### List Saved Searches
```http
GET /api/search/saved
Authorization: Bearer YOUR_JWT_TOKEN
```

### Create Saved Search
```http
POST /api/search/saved
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Work Meeting Notes",
  "query": "meeting",
  "tags": ["work"],
  "tag_mode": "and"
}
```

### Execute Saved Search
```http
POST /api/search/saved/{saved_search_id}/execute
Authorization: Bearer YOUR_JWT_TOKEN
```

### Update Saved Search
```http
PUT /api/search/saved/{saved_search_id}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "query": "updated query"
}
```

### Delete Saved Search
```http
DELETE /api/search/saved/{saved_search_id}
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 404 Not Found
```json
{
  "detail": "Note not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Rate Limiting

Currently no rate limiting is enforced. Production deployments should implement:
- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated endpoints

---

## Interactive Documentation

Visit `http://localhost:8000/docs` for interactive Swagger UI documentation where you can test all endpoints directly.

---

**Related Documentation:**
- [Tag System Guide](./TAGS.md)
- [Search Analytics Guide](./SEARCH_ANALYTICS.md)
- [Contributing Guide](./CONTRIBUTING.md)
