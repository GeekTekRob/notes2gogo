# 🏷️ Tag System Guide

Complete guide to using and managing tags in Notes2GoGo.

---

## Overview

The tag system provides powerful organization and filtering capabilities for your notes. Tags are flexible labels that help you categorize, find, and manage notes efficiently.

---

## Creating Tags

### In Note Editor
1. Navigate to the note editor (create new or edit existing note)
2. Find the **Tags** input field
3. Start typing to see autocomplete suggestions
4. Press **Enter**, **Comma**, or **Space** to add a tag
5. Create new tags on-the-fly by typing a unique name

### Quick Tips
- Tag names are case-insensitive
- Spaces in tag names are supported
- Use **Backspace** with empty input to remove the last tag
- Tags are automatically created if they don't exist

---

## Managing Tags

### Tag Browser
Located in the dashboard sidebar, showing:
- All your tags alphabetically
- Note count for each tag
- Quick actions (rename, delete)

### Rename Tags
1. Click the **pencil icon** (✏️) next to any tag
2. Enter the new name
3. Tag is renamed across all notes automatically

### Delete Tags
1. Click the **trash icon** (🗑️) next to any tag
2. Confirm deletion
3. Tag is removed from all notes (notes remain intact)

### Merge Tags
Combine duplicate or similar tags:
```bash
POST /api/tags/merge
{
  "source_tag_id": 1,
  "target_tag_id": 2
}
```
All notes with the source tag will be updated to use the target tag.

---

## Filtering with Tags

### Click to Filter
- **In Tag Browser**: Click any tag to show only notes with that tag
- **On Note Cards**: Click a tag chip to filter by that tag
- **Clear Filter**: Click the active tag again or the clear button

### Advanced Filtering

#### AND Logic (All Tags Required)
Show notes that have ALL specified tags:
```bash
GET /api/notes/?tags=work,urgent&tag_filter_mode=and
```

#### OR Logic (Any Tag Match)
Show notes that have AT LEAST ONE of the specified tags:
```bash
GET /api/notes/?tags=personal,ideas&tag_filter_mode=or
```

#### Exclude Tags
Filter out notes with specific tags:
```bash
GET /api/notes/?exclude_tags=archive,draft
```

#### Combined Filtering
Use multiple filter types together:
```bash
GET /api/notes/?tags=work&exclude_tags=completed&tag_filter_mode=and
```

---

## Bulk Tag Operations

Apply tags to multiple notes at once using the bulk tag endpoint:

### Add Tags to Multiple Notes
```bash
POST /api/notes/bulk-tag
{
  "note_ids": [1, 2, 3, 4],
  "tag_names": ["important", "urgent"],
  "operation": "add"
}
```

### Remove Tags from Multiple Notes
```bash
POST /api/notes/bulk-tag
{
  "note_ids": [1, 2, 3],
  "tag_names": ["draft"],
  "operation": "remove"
}
```

### Replace All Tags
```bash
POST /api/notes/bulk-tag
{
  "note_ids": [5, 6],
  "tag_names": ["reviewed", "final"],
  "operation": "replace"
}
```

---

## API Reference

### List All Tags
```bash
GET /api/tags/
```
Returns all tags with note counts.

### Create Tag
```bash
POST /api/tags/
{
  "name": "new-tag"
}
```

### Rename Tag
```bash
PUT /api/tags/{tag_id}
{
  "name": "updated-name"
}
```

### Delete Tag
```bash
DELETE /api/tags/{tag_id}
```

### Autocomplete Suggestions
```bash
GET /api/tags/autocomplete?q=wor
```
Returns tags matching the query (e.g., "work", "workout").

---

## Best Practices

### Naming Conventions
- **Use consistent naming**: `work` vs `Work` vs `WORK` (they're treated the same)
- **Be specific**: `project-alpha` instead of just `project`
- **Use hyphens or underscores**: For multi-word tags (`meeting-notes`, `quick_ideas`)

### Organization Strategies
- **Category tags**: `work`, `personal`, `learning`
- **Status tags**: `draft`, `in-progress`, `completed`
- **Priority tags**: `urgent`, `important`, `low-priority`
- **Project tags**: `project-alpha`, `client-xyz`
- **Topic tags**: `javascript`, `api-design`, `database`

### Tag Maintenance
- Regularly review and merge similar tags
- Delete unused tags to keep the system clean
- Use bulk operations for efficiency
- Leverage autocomplete to avoid duplicates

---

## Examples

### Personal Knowledge Base
```
Tags: learning, javascript, tutorial, completed
Use: Track learning progress and resources
```

### Project Management
```
Tags: project-alpha, urgent, meeting-notes, action-items
Use: Organize project-related notes with priority
```

### Daily Journal
```
Tags: journal, 2025, personal, gratitude
Use: Categorize journal entries by theme and year
```

### Recipe Collection
```
Tags: recipes, dinner, vegetarian, quick-meals
Use: Filter recipes by meal type and dietary preferences
```

---

## Troubleshooting

### Tag Not Appearing in Autocomplete
- Ensure the tag exists (check Tag Browser)
- Type more characters for better matching
- Tag might be on notes you don't have access to

### Can't Delete Tag
- You must be the owner of notes using that tag
- Check if notes are properly loaded

### Tags Not Filtering Correctly
- Verify the `tag_filter_mode` parameter
- Check for typos in tag names
- Ensure you're using the correct tag IDs in API calls

---

**Related Documentation:**
- [Search Analytics Guide](./SEARCH_ANALYTICS.md)
- [API Reference](./API.md)
- [Contributing Guide](./CONTRIBUTING.md)
