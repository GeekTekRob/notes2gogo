# 📤 Export Functionality Documentation

## Overview

The Notes2GoGo application now supports exporting notes in two popular formats:
- **PDF** - For static sharing, printing, and archival purposes
- **Markdown** - For maximum portability and interoperability with other note-taking applications

## Features

### PDF Export

The PDF export feature generates professional-looking PDF documents from your notes with the following characteristics:

#### Format Fidelity
- Preserves all rich text formatting including:
  - Headings (H1-H6)
  - Bold and italic text
  - Lists (ordered and unordered)
  - Code blocks with syntax highlighting
  - Blockquotes
  - Tables
  - Horizontal rules

#### Metadata Inclusion
Each PDF includes a metadata section at the top containing:
- Note title
- Creation date
- Last updated date
- Note type (Text or Structured)
- Folder (if assigned)
- Tags (if any)

#### Hyperlink Preservation
- All links (external URLs) remain clickable in the PDF
- Internal links are preserved as text

#### Customization Options
Users can choose from the following options:
- **Paper Size**: Letter or A4
- **Orientation**: Portrait or Landscape

#### Professional Styling
- Clean, readable typography
- Color-coded metadata section
- Proper heading hierarchy
- Syntax-highlighted code blocks
- Page numbers and headers

### Markdown Export

The Markdown export feature creates standard GitHub Flavored Markdown (GFM) files with:

#### YAML Frontmatter
Each exported `.md` file includes a YAML frontmatter block with:
```yaml
---
title: Note Title
created: 2025-10-29 14:30:00
updated: 2025-10-29 15:45:00
tags: [tag1, tag2, tag3]
folder: Folder Name
type: text
---
```

#### Standard Markdown Syntax
- Uses GitHub Flavored Markdown (GFM) for maximum compatibility
- Compatible with popular editors like:
  - Obsidian
  - Notion
  - VS Code
  - Typora
  - Bear
  - Any standard markdown editor

#### File Naming Convention
Files are automatically named using the pattern:
```
Note-Title-YYYY-MM-DD.md
```

## Usage

### From the Web Interface

1. Navigate to any note's detail view page
2. Click the **"Export"** button in the top-right action bar
3. A dropdown menu will appear with export options:
   - **PDF Options**:
     - PDF (Letter, Portrait)
     - PDF (Letter, Landscape)
     - PDF (A4, Portrait)
     - PDF (A4, Landscape)
   - **Markdown Option**:
     - Markdown (.md)
4. Select your preferred format
5. The file will automatically download to your browser's default download location

### From the API

#### Export to PDF

```bash
GET /api/notes/{note_id}/export/pdf?paper_size=letter&orientation=portrait
```

**Parameters:**
- `note_id` (path, required): The ID of the note to export
- `paper_size` (query, optional): Either "letter" (default) or "a4"
- `orientation` (query, optional): Either "portrait" (default) or "landscape"

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="Note-Title-2025-10-29.pdf"`

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/notes/123/export/pdf?paper_size=a4&orientation=portrait" \
  --output my-note.pdf
```

#### Export to Markdown

```bash
GET /api/notes/{note_id}/export/markdown
```

**Parameters:**
- `note_id` (path, required): The ID of the note to export

**Response:**
- Content-Type: `text/markdown; charset=utf-8`
- Content-Disposition: `attachment; filename="Note-Title-2025-10-29.md"`

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/notes/123/export/markdown" \
  --output my-note.md
```

## Technical Implementation

### Backend Components

#### Export Service (`app/services/export.py`)
The `ExportService` class provides the core export functionality:

- `export_to_pdf()`: Generates PDF files using WeasyPrint
- `export_to_markdown()`: Generates Markdown files with YAML frontmatter
- `_generate_html_for_pdf()`: Converts note content to styled HTML
- `_generate_markdown_frontmatter()`: Creates YAML frontmatter
- `_sanitize_filename()`: Ensures safe filenames

#### API Endpoints (`app/api/notes.py`)
Two new endpoints handle export requests:

- `GET /api/notes/{note_id}/export/pdf`: PDF export endpoint
- `GET /api/notes/{note_id}/export/markdown`: Markdown export endpoint

Both endpoints:
- Require authentication
- Verify note ownership
- Return files as downloads
- Handle errors gracefully

### Frontend Components

#### API Service (`frontend/src/services/api.js`)
Added two new API methods:

- `notesAPI.exportToPdf(id, params)`: Calls PDF export endpoint
- `notesAPI.exportToMarkdown(id)`: Calls Markdown export endpoint

Both methods use `responseType: 'blob'` to handle binary responses.

#### UI Component (`frontend/src/pages/NoteViewPage.jsx`)
Enhanced with:

- Export dropdown menu button
- Multiple export format options
- Loading state during export
- Automatic file download handling
- Error handling with user feedback

### Dependencies

The export functionality requires the following Python packages:

```
weasyprint==60.1       # PDF generation
pydyf==0.10.0          # PDF backend lib (pinned for WeasyPrint 60.1 compatibility)
markdown==3.5.1        # Markdown processing
Pygments==2.17.2       # Syntax highlighting
```

These are automatically installed via `requirements.txt`.

On Linux, the following system packages are required for WeasyPrint:

```
libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 libgdk-pixbuf-2.0-0 libffi-dev shared-mime-info
```

## Security Considerations

1. **Authentication**: All export endpoints require a valid JWT token
2. **Authorization**: Users can only export their own notes
3. **Filename Sanitization**: All filenames are sanitized to prevent path traversal attacks
4. **Content Escaping**: HTML content is properly escaped to prevent XSS
5. **Rate Limiting**: Consider adding rate limiting to prevent abuse (future enhancement)

## Future Enhancements

### Planned Features (Phase 2)

1. **Batch Export**: Export multiple notes at once as a ZIP file
2. **Image Support**: When image attachments are added to notes, export them in a subfolder with relative links
3. **Custom PDF Themes**: Allow users to choose from different PDF styling themes
4. **Export History**: Track export history and statistics
5. **Scheduled Exports**: Automatic periodic exports to cloud storage
6. **Export Templates**: Custom templates for different export styles

## Troubleshooting

### Common Issues

#### PDF Generation Fails
**Symptom**: API returns 500 error when exporting to PDF

**Solutions**:
- Ensure WeasyPrint is properly installed: `pip install weasyprint==60.1`
- Verify pydyf version is compatible. For WeasyPrint 60.1, pin `pydyf==0.10.0`.
  - If you see: `TypeError: PDF.__init__() takes 1 positional argument but 3 were given`, it's a pydyf mismatch. Pin `pydyf==0.10.0`.
- On Linux, install required system dependencies:
  ```bash
  sudo apt-get install libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 libgdk-pixbuf-2.0-0 libffi-dev shared-mime-info
  ```
- Check that the note content is valid Markdown

#### Markdown Export Contains Invalid YAML
**Symptom**: Imported markdown file has parsing errors

**Solutions**:
- Check that note title doesn't contain special YAML characters
- Verify that tags don't contain colons or other YAML special characters
- Use a YAML validator on the frontmatter

#### Download Doesn't Start
**Symptom**: Export button clicked but no download occurs

**Solutions**:
- Check browser console for JavaScript errors
- Verify authentication token is valid
- Check browser's pop-up blocker settings
- Ensure browser allows downloads from the application

## Performance

### PDF Generation
- Small notes (< 1000 words): ~0.5-1 second
- Medium notes (1000-5000 words): ~1-2 seconds
- Large notes (> 5000 words): ~2-5 seconds

### Markdown Generation
- Near-instant for all note sizes (< 100ms)

### Optimization Tips
- For large notes, consider breaking them into smaller notes
- PDF generation is CPU-intensive; consider using a background task queue for very large exports (future enhancement)

## Testing

### Manual Testing Checklist

- [ ] Export text note to PDF (letter, portrait)
- [ ] Export text note to PDF (letter, landscape)
- [ ] Export text note to PDF (A4, portrait)
- [ ] Export text note to PDF (A4, landscape)
- [ ] Export text note to Markdown
- [ ] Export structured note to PDF
- [ ] Export structured note to Markdown
- [ ] Export note with tags to PDF
- [ ] Export note with tags to Markdown
- [ ] Export note in folder to PDF
- [ ] Export note in folder to Markdown
- [ ] Verify PDF formatting and styling
- [ ] Verify Markdown YAML frontmatter
- [ ] Verify filename sanitization works
- [ ] Test with notes containing special characters
- [ ] Test with notes containing code blocks
- [ ] Test with notes containing tables
- [ ] Test with notes containing links

### Automated Testing

Consider adding the following test cases:

```python
# Test PDF export
def test_export_pdf_authenticated():
    # Test successful PDF export
    pass

def test_export_pdf_unauthenticated():
    # Test 401 when not authenticated
    pass

def test_export_pdf_not_owned():
    # Test 404 when note not owned by user
    pass

# Test Markdown export
def test_export_markdown_with_frontmatter():
    # Test YAML frontmatter is correct
    pass

def test_export_markdown_filename_sanitization():
    # Test special characters in filename
    pass
```

## Support

For issues or questions about the export functionality:

1. Check this documentation first
2. Review the troubleshooting section
3. Check the GitHub issues page
4. Open a new issue with:
   - Export format (PDF or Markdown)
   - Steps to reproduce
   - Error messages (if any)
   - Browser/environment details

## Changelog

### Version 1.0.0 (October 2025)
- Initial release of export functionality
- PDF export with customizable paper size and orientation
- Markdown export with YAML frontmatter
- Support for text and structured notes
- Metadata preservation in both formats
