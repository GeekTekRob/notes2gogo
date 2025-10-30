"""
Test script for export functionality.
Run this after the backend is running to test PDF and Markdown exports.
"""
import requests
import json
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"
OUTPUT_DIR = Path("./export_tests")

# Test credentials - Update these with valid credentials
TEST_USERNAME = "testuser"
TEST_PASSWORD = "testpassword"


def login():
    """Login and get access token."""
    response = requests.post(
        f"{BASE_URL}/api/auth/login-json",
        json={"username": TEST_USERNAME, "password": TEST_PASSWORD}
    )
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"✓ Logged in successfully")
        return token
    else:
        print(f"✗ Login failed: {response.status_code}")
        print(response.text)
        return None


def create_test_note(token):
    """Create a test note for export testing."""
    headers = {"Authorization": f"Bearer {token}"}
    
    note_data = {
        "title": "Export Test Note - Sample Content",
        "note_type": "text",
        "content": """# Welcome to Export Test

This is a **test note** for the export functionality.

## Features to Test

- **Bold text**
- *Italic text*
- `Inline code`

### Code Block

```python
def hello_world():
    print("Hello, World!")
    return True
```

### Lists

1. First item
2. Second item
3. Third item

### Quote

> This is a blockquote to test PDF rendering.

### Table

| Feature | Status |
|---------|--------|
| PDF Export | ✓ |
| Markdown Export | ✓ |

### Links

- External: [GitHub](https://github.com)
- Internal: [Link to another note](#)

---

**Created**: 2025-10-29  
**Tags**: test, export, sample
""",
        "tags": ["test", "export", "sample"]
    }
    
    response = requests.post(
        f"{BASE_URL}/api/notes/",
        headers=headers,
        json=note_data
    )
    
    if response.status_code == 201:
        note_id = response.json()["id"]
        print(f"✓ Created test note with ID: {note_id}")
        return note_id
    else:
        print(f"✗ Failed to create test note: {response.status_code}")
        print(response.text)
        return None


def test_pdf_export(token, note_id, paper_size="letter", orientation="portrait"):
    """Test PDF export."""
    headers = {"Authorization": f"Bearer {token}"}
    params = {"paper_size": paper_size, "orientation": orientation}
    
    response = requests.get(
        f"{BASE_URL}/api/notes/{note_id}/export/pdf",
        headers=headers,
        params=params
    )
    
    if response.status_code == 200:
        # Save PDF file
        OUTPUT_DIR.mkdir(exist_ok=True)
        filename = f"test_note_{paper_size}_{orientation}.pdf"
        filepath = OUTPUT_DIR / filename
        
        with open(filepath, "wb") as f:
            f.write(response.content)
        
        print(f"✓ PDF exported successfully ({paper_size}, {orientation}): {filepath}")
        return True
    else:
        print(f"✗ PDF export failed: {response.status_code}")
        print(response.text)
        return False


def test_markdown_export(token, note_id):
    """Test Markdown export."""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/api/notes/{note_id}/export/markdown",
        headers=headers
    )
    
    if response.status_code == 200:
        # Save Markdown file
        OUTPUT_DIR.mkdir(exist_ok=True)
        filename = "test_note.md"
        filepath = OUTPUT_DIR / filename
        
        with open(filepath, "wb") as f:
            f.write(response.content)
        
        print(f"✓ Markdown exported successfully: {filepath}")
        
        # Print content for verification
        print("\n--- Markdown Content Preview ---")
        content = response.content.decode('utf-8')
        print(content[:500])  # First 500 characters
        print("...\n")
        
        return True
    else:
        print(f"✗ Markdown export failed: {response.status_code}")
        print(response.text)
        return False


def cleanup_test_note(token, note_id):
    """Delete the test note."""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.delete(
        f"{BASE_URL}/api/notes/{note_id}",
        headers=headers
    )
    
    if response.status_code == 204:
        print(f"✓ Cleaned up test note")
        return True
    else:
        print(f"⚠ Failed to cleanup test note: {response.status_code}")
        return False


def main():
    """Run all export tests."""
    print("=" * 60)
    print("Export Functionality Test Suite")
    print("=" * 60)
    print()
    
    # Login
    print("1. Authentication")
    print("-" * 60)
    token = login()
    if not token:
        print("\n✗ Tests aborted: Login failed")
        return
    print()
    
    # Create test note
    print("2. Create Test Note")
    print("-" * 60)
    note_id = create_test_note(token)
    if not note_id:
        print("\n✗ Tests aborted: Failed to create test note")
        return
    print()
    
    # Test PDF exports
    print("3. PDF Export Tests")
    print("-" * 60)
    test_pdf_export(token, note_id, "letter", "portrait")
    test_pdf_export(token, note_id, "letter", "landscape")
    test_pdf_export(token, note_id, "a4", "portrait")
    test_pdf_export(token, note_id, "a4", "landscape")
    print()
    
    # Test Markdown export
    print("4. Markdown Export Test")
    print("-" * 60)
    test_markdown_export(token, note_id)
    print()
    
    # Cleanup
    print("5. Cleanup")
    print("-" * 60)
    cleanup_test_note(token, note_id)
    print()
    
    print("=" * 60)
    print("✓ All tests completed!")
    print(f"✓ Exported files saved to: {OUTPUT_DIR.absolute()}")
    print("=" * 60)


if __name__ == "__main__":
    main()
