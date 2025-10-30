# Quick Start Guide - Testing Export Functionality

## Prerequisites

1. Backend server running with PostgreSQL
2. Frontend development server running
3. A user account with at least one note created

## Installation Steps

### 1. Install Backend Dependencies

```powershell
# Navigate to backend directory
cd e:\Source\notes2gogo\backend

# Activate virtual environment
..\.venv\Scripts\activate

# Install export dependencies
pip install weasyprint==60.1 pydyf==0.10.0 markdown==3.5.1 Pygments==2.17.2

# Verify installation
python -c "import weasyprint, markdown; print('✓ Dependencies installed')"
```

### 2. Start Backend Server

```powershell
# In backend directory with virtual environment activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server should start on http://localhost:8000

### 3. Start Frontend Server

```powershell
# In a new terminal, navigate to frontend directory
cd e:\Source\notes2gogo\frontend

# Start development server
npm run dev
```

The frontend should start on http://localhost:5173

## Testing the Export Functionality

### Method 1: Using the Web Interface (Recommended)

1. **Login to the application**
   - Navigate to http://localhost:5173
   - Login with your credentials

2. **Create or open a note**
   - Create a new note with some content, or
   - Open an existing note

3. **Test PDF Export**
   - Click the "Export" button (download icon) in the top-right
   - A dropdown menu will appear with export options
   - Try each PDF option:
     - PDF (Letter, Portrait)
     - PDF (Letter, Landscape)
     - PDF (A4, Portrait)
     - PDF (A4, Landscape)
   - The PDF should automatically download
   - Open the PDF and verify:
     - Note title is displayed
     - Metadata section shows creation date, tags, folder
     - Content is properly formatted
     - Code blocks have syntax highlighting
     - Links are clickable

4. **Test Markdown Export**
   - Click the "Export" button again
   - Select "Markdown (.md)"
   - The .md file should download
   - Open the file in a text editor and verify:
     - YAML frontmatter at the top
     - Note title as H1 heading
     - Content is properly formatted Markdown
     - Tags are listed in frontmatter

### Method 2: Using the API Directly

#### Test PDF Export
```powershell
# Get your auth token first by logging in through the web interface
# Check browser DevTools → Application → Local Storage → auth-storage

# Replace TOKEN and NOTE_ID with actual values
$token = "your_jwt_token_here"
$noteId = 1

# Export as PDF
Invoke-WebRequest `
  -Uri "http://localhost:8000/api/notes/$noteId/export/pdf?paper_size=letter&orientation=portrait" `
  -Headers @{"Authorization" = "Bearer $token"} `
  -OutFile "test_export.pdf"

Write-Host "✓ PDF exported to test_export.pdf"
```

#### Test Markdown Export
```powershell
# Export as Markdown
Invoke-WebRequest `
  -Uri "http://localhost:8000/api/notes/$noteId/export/markdown" `
  -Headers @{"Authorization" = "Bearer $token"} `
  -OutFile "test_export.md"

Write-Host "✓ Markdown exported to test_export.md"
```

### Method 3: Using the Test Script

1. **Edit test credentials**
   ```powershell
   # Open the test file
   code backend/tests/test_export.py
   
   # Update these lines with valid credentials:
   TEST_USERNAME = "your_username"
   TEST_PASSWORD = "your_password"
   ```

2. **Run the test script**
   ```powershell
   cd backend
   ..\.venv\Scripts\activate
   python tests/test_export.py
   ```

3. **Check results**
   - Test results will be printed to console
   - Exported files will be saved to `backend/export_tests/`
   - Verify all tests passed

## Expected Results

### PDF Export Should Produce:
- ✅ A valid PDF file
- ✅ Professional formatting with styled content
- ✅ Metadata box at the top with note info
- ✅ Syntax-highlighted code blocks
- ✅ Clickable hyperlinks
- ✅ Proper pagination with page numbers
- ✅ File named like: `Note-Title-2025-10-29.pdf`

### Markdown Export Should Produce:
- ✅ A valid .md file
- ✅ YAML frontmatter with title, dates, tags, folder, type
- ✅ Standard GFM syntax
- ✅ Preserved formatting (bold, italic, code, etc.)
- ✅ UTF-8 encoding
- ✅ File named like: `Note-Title-2025-10-29.md`

## Troubleshooting

### Issue: "Module not found: weasyprint"
**Solution:**
```powershell
pip install weasyprint==60.1
```

### Issue: PDF export returns 500 error
**Possible causes:**
1. WeasyPrint not installed correctly
2. pydyf version incompatible with WeasyPrint (pin pydyf==0.10.0 for 60.1)
3. Note content has invalid Markdown
4. Server error - check backend logs

**Solution:**
```powershell
# Check backend logs for detailed error
# Restart backend server after installing dependencies
```

### Issue: Export button doesn't appear
**Possible causes:**
1. Frontend code not updated
2. Browser cache

**Solution:**
```powershell
# Hard refresh browser (Ctrl+F5)
# Or clear browser cache and reload
```

### Issue: Download doesn't start
**Possible causes:**
1. Browser blocked download
2. Authentication token expired

**Solution:**
- Check browser's download settings/popups
- Try logging out and back in
- Check browser console for errors (F12)

## Verification Checklist

- [ ] Backend dependencies installed without errors
- [ ] Backend server starts successfully
- [ ] Frontend server starts successfully
- [ ] Can login to the application
- [ ] Export button appears on note view page
- [ ] Export dropdown menu opens
- [ ] PDF (Letter, Portrait) downloads successfully
- [ ] PDF (Letter, Landscape) downloads successfully
- [ ] PDF (A4, Portrait) downloads successfully
- [ ] PDF (A4, Landscape) downloads successfully
- [ ] Markdown export downloads successfully
- [ ] PDF opens and displays correctly
- [ ] Markdown file contains YAML frontmatter
- [ ] Markdown content is properly formatted
- [ ] Metadata (tags, dates) appears correctly in both formats
- [ ] Filename is properly sanitized and descriptive

## Sample Test Note Content

Use this content to create a comprehensive test note:

```markdown
# Export Test Note

This note contains various formatting elements to test the export functionality.

## Text Formatting

This paragraph contains **bold text**, *italic text*, and `inline code`.

## Lists

### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List
1. First step
2. Second step
3. Third step

## Code Block

```python
def hello_world():
    """A simple function to test code highlighting."""
    print("Hello, World!")
    return True
```

## Blockquote

> This is a blockquote to test PDF rendering.
> It should be visually distinct from regular text.

## Table

| Feature | Status | Notes |
|---------|--------|-------|
| PDF Export | ✓ | Working |
| Markdown Export | ✓ | Working |
| Code Highlighting | ✓ | Tested |

## Links

- [External Link](https://github.com)
- [Another Link](https://example.com)

---

**Tags**: test, export, sample
**Created**: 2025-10-29
```

## Next Steps

After verifying the export functionality:

1. Test with different note types (text vs structured)
2. Test with notes containing special characters
3. Test with very long notes (>5000 words)
4. Test with notes containing multiple tags
5. Test with notes in different folders
6. Share feedback or report issues

## Support

If you encounter issues:

1. Check the [Export Documentation](./EXPORT.md)
2. Review the [Implementation Summary](./EXPORT_IMPLEMENTATION.md)
3. Check backend server logs for errors
4. Check browser console for frontend errors
5. Open a GitHub issue with details

## Success!

If all tests pass, you've successfully implemented and verified the export functionality! 🎉

The export feature is now ready to use for:
- Creating shareable PDF documents
- Backing up notes in portable Markdown format
- Migrating notes to other applications
- Printing professional-looking documents
