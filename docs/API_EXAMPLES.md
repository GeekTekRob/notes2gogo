# 📡 API Examples

Practical examples for all API endpoints using curl, HTTPie, and JavaScript.

---

## Table of Contents

- [Authentication](#authentication)
- [Notes](#notes)
- [Tags](#tags)
- [Search](#search)
- [Search Analytics](#search-analytics)
- [Saved Searches](#saved-searches)
- [Error Handling](#error-handling)

---

## Base URL

```
Development: http://localhost:8000
Production: https://api.notes.example.com
```

---

## Authentication

### Register New User

**curl:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**HTTPie:**
```bash
http POST http://localhost:8000/api/auth/register \
  username=johndoe \
  email=john@example.com \
  password=SecurePass123!
```

**JavaScript (Axios):**
```javascript
const response = await axios.post('/api/auth/register', {
  username: 'johndoe',
  email: 'john@example.com',
  password: 'SecurePass123!'
});
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "created_at": "2025-10-29T10:30:00Z"
}
```

---

### Login

**curl:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=johndoe&password=SecurePass123!"
```

**HTTPie:**
```bash
http --form POST http://localhost:8000/api/auth/login \
  username=johndoe \
  password=SecurePass123!
```

**JavaScript:**
```javascript
const formData = new URLSearchParams();
formData.append('username', 'johndoe');
formData.append('password', 'SecurePass123!');

const response = await axios.post('/api/auth/login', formData);
const token = response.data.access_token;

// Store token
localStorage.setItem('token', token);
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### Get Current User

**curl:**
```bash
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**JavaScript:**
```javascript
const response = await axios.get('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "created_at": "2025-10-29T10:30:00Z"
}
```

---

## Notes

### Create Text Note

**curl:**
```bash
curl -X POST http://localhost:8000/api/notes/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Note",
    "note_type": "text",
    "content_text": "# Hello World\n\nThis is my first note with **markdown** support!",
    "tag_ids": [1, 2]
  }'
```

**JavaScript:**
```javascript
const response = await axios.post('/api/notes/', {
  title: 'My First Note',
  note_type: 'text',
  content_text: '# Hello World\n\nThis is my first note!',
  tag_ids: [1, 2]
}, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "My First Note",
  "note_type": "text",
  "content_text": "# Hello World\n\nThis is my first note!",
  "content_structured": null,
  "tags": [
    {"id": 1, "name": "personal"},
    {"id": 2, "name": "ideas"}
  ],
  "created_at": "2025-10-29T10:35:00Z",
  "updated_at": "2025-10-29T10:35:00Z"
}
```

---

### Create Structured Note

**curl:**
```bash
curl -X POST http://localhost:8000/api/notes/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Project Planning",
    "note_type": "structured",
    "content_structured": {
      "Objective": "Launch new feature",
      "Timeline": "Q4 2025",
      "Budget": "$50,000",
      "Team": "Engineering, Design, Marketing"
    },
    "tag_ids": [3]
  }'
```

**JavaScript:**
```javascript
const response = await axios.post('/api/notes/', {
  title: 'Project Planning',
  note_type: 'structured',
  content_structured: {
    'Objective': 'Launch new feature',
    'Timeline': 'Q4 2025',
    'Budget': '$50,000',
    'Team': 'Engineering, Design, Marketing'
  },
  tag_ids: [3]
}, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### Get All Notes

**curl:**
```bash
# Basic list
curl http://localhost:8000/api/notes/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# With pagination
curl "http://localhost:8000/api/notes/?skip=0&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by note type
curl "http://localhost:8000/api/notes/?note_type=text" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**JavaScript:**
```javascript
// Get all notes
const response = await axios.get('/api/notes/', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// With pagination and filters
const response = await axios.get('/api/notes/', {
  params: {
    skip: 0,
    limit: 20,
    note_type: 'text'
  },
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "My First Note",
    "note_type": "text",
    "tags": [{"id": 1, "name": "personal"}],
    "created_at": "2025-10-29T10:35:00Z",
    "updated_at": "2025-10-29T10:35:00Z"
  },
  {
    "id": 2,
    "title": "Project Planning",
    "note_type": "structured",
    "tags": [{"id": 3, "name": "work"}],
    "created_at": "2025-10-29T11:00:00Z",
    "updated_at": "2025-10-29T11:00:00Z"
  }
]
```

---

### Get Single Note

**curl:**
```bash
curl http://localhost:8000/api/notes/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**JavaScript:**
```javascript
const response = await axios.get(`/api/notes/${noteId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### Update Note

**curl:**
```bash
curl -X PUT http://localhost:8000/api/notes/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content_text": "Updated content",
    "tag_ids": [1, 3, 4]
  }'
```

**JavaScript:**
```javascript
const response = await axios.put(`/api/notes/${noteId}`, {
  title: 'Updated Title',
  content_text: 'Updated content',
  tag_ids: [1, 3, 4]
}, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### Delete Note

**curl:**
```bash
curl -X DELETE http://localhost:8000/api/notes/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**JavaScript:**
```javascript
await axios.delete(`/api/notes/${noteId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Response:**
```json
{
  "detail": "Note deleted successfully"
}
```

---

### Search Notes

**curl:**
```bash
# Simple search
curl "http://localhost:8000/api/notes/?search=project" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search with filters
curl "http://localhost:8000/api/notes/?search=meeting&tag_ids=1,2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**JavaScript:**
```javascript
const response = await axios.get('/api/notes/', {
  params: {
    search: 'project',
    tag_ids: '1,2'
  },
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Tags

### Create Tag

**curl:**
```bash
curl -X POST http://localhost:8000/api/tags/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "important"
  }'
```

**JavaScript:**
```javascript
const response = await axios.post('/api/tags/', {
  name: 'important'
}, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Response:**
```json
{
  "id": 5,
  "user_id": 1,
  "name": "important",
  "created_at": "2025-10-29T12:00:00Z"
}
```

---

### Get All Tags

**curl:**
```bash
curl http://localhost:8000/api/tags/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**JavaScript:**
```javascript
const response = await axios.get('/api/tags/', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "personal",
    "note_count": 5,
    "created_at": "2025-10-29T10:00:00Z"
  },
  {
    "id": 2,
    "name": "work",
    "note_count": 12,
    "created_at": "2025-10-29T10:05:00Z"
  }
]
```

---

### Update Tag

**curl:**
```bash
curl -X PUT http://localhost:8000/api/tags/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "personal-life"
  }'
```

**JavaScript:**
```javascript
const response = await axios.put(`/api/tags/${tagId}`, {
  name: 'personal-life'
}, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### Delete Tag

**curl:**
```bash
curl -X DELETE http://localhost:8000/api/tags/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**JavaScript:**
```javascript
await axios.delete(`/api/tags/${tagId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### Bulk Operations

**Add tags to multiple notes:**
```bash
curl -X POST http://localhost:8000/api/tags/bulk-add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note_ids": [1, 2, 3],
    "tag_ids": [5, 6]
  }'
```

**Remove tags from multiple notes:**
```bash
curl -X POST http://localhost:8000/api/tags/bulk-remove \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note_ids": [1, 2, 3],
    "tag_ids": [5]
  }'
```

**JavaScript:**
```javascript
// Bulk add
await axios.post('/api/tags/bulk-add', {
  note_ids: [1, 2, 3],
  tag_ids: [5, 6]
}, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Bulk remove
await axios.post('/api/tags/bulk-remove', {
  note_ids: [1, 2, 3],
  tag_ids: [5]
}, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Search Analytics

### Get Search Suggestions

**curl:**
```bash
curl "http://localhost:8000/api/analytics/search-suggestions?prefix=proj" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**JavaScript:**
```javascript
const response = await axios.get('/api/analytics/search-suggestions', {
  params: { prefix: 'proj' },
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Response:**
```json
[
  {
    "query": "project planning",
    "frequency": 15,
    "last_searched": "2025-10-29T12:00:00Z"
  },
  {
    "query": "project status",
    "frequency": 8,
    "last_searched": "2025-10-28T15:30:00Z"
  }
]
```

---

### Get Analytics Dashboard

**curl:**
```bash
curl http://localhost:8000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**JavaScript:**
```javascript
const response = await axios.get('/api/analytics/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Response:**
```json
{
  "total_searches": 150,
  "unique_queries": 45,
  "avg_results_per_search": 3.5,
  "popular_searches": [
    {"query": "meeting notes", "count": 25},
    {"query": "project status", "count": 18}
  ],
  "trending_searches": [
    {"query": "quarterly review", "trend_score": 5.2},
    {"query": "team sync", "trend_score": 3.8}
  ],
  "recent_searches": [
    {"query": "budget", "timestamp": "2025-10-29T12:30:00Z"}
  ]
}
```

---

### Clear Search History

**curl:**
```bash
curl -X DELETE http://localhost:8000/api/analytics/clear-history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**JavaScript:**
```javascript
await axios.delete('/api/analytics/clear-history', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Saved Searches

### Create Saved Search

**curl:**
```bash
curl -X POST http://localhost:8000/api/saved-searches/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Work Projects",
    "query_params": {
      "search": "project",
      "tag_ids": [2],
      "note_type": "text"
    }
  }'
```

**JavaScript:**
```javascript
const response = await axios.post('/api/saved-searches/', {
  name: 'Work Projects',
  query_params: {
    search: 'project',
    tag_ids: [2],
    note_type: 'text'
  }
}, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### Get All Saved Searches

**curl:**
```bash
curl http://localhost:8000/api/saved-searches/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**JavaScript:**
```javascript
const response = await axios.get('/api/saved-searches/', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Work Projects",
    "query_params": {
      "search": "project",
      "tag_ids": [2]
    },
    "created_at": "2025-10-29T10:00:00Z"
  }
]
```

---

### Execute Saved Search

**curl:**
```bash
curl http://localhost:8000/api/saved-searches/1/execute \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**JavaScript:**
```javascript
const response = await axios.get(`/api/saved-searches/${searchId}/execute`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Response:** Returns array of notes matching the saved search criteria.

---

### Delete Saved Search

**curl:**
```bash
curl -X DELETE http://localhost:8000/api/saved-searches/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**JavaScript:**
```javascript
await axios.delete(`/api/saved-searches/${searchId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden:**
```json
{
  "detail": "Not enough permissions"
}
```

**404 Not Found:**
```json
{
  "detail": "Note not found"
}
```

**422 Validation Error:**
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

### JavaScript Error Handling

```javascript
try {
  const response = await axios.post('/api/notes/', noteData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Success:', response.data);
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
    
    if (error.response.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.response.status === 422) {
      // Validation errors
      const errors = error.response.data.detail;
      errors.forEach(err => {
        console.error(`${err.loc.join('.')}: ${err.msg}`);
      });
    }
  } else if (error.request) {
    // Request made but no response
    console.error('Network error:', error.message);
  } else {
    // Something else happened
    console.error('Error:', error.message);
  }
}
```

---

## Rate Limiting

Default rate limits (production):
- **API endpoints**: 10 requests/second
- **Login endpoint**: 5 requests/minute

Rate limit headers in response:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1698765432
```

---

## Postman Collection

Import this Postman collection URL:
```
https://www.postman.com/notes2gogo/workspace/notes2gogo-api
```

Or download the collection from:
```
/docs/postman_collection.json
```

---

## Interactive API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Try out all endpoints interactively with authentication!

---

**Last Updated**: October 29, 2025  
**Version**: 1.0.0
