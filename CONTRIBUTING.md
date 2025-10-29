# Contributing to Notes2GoGo

First off, thank you for considering contributing to Notes2GoGo! It's people like you that make Notes2GoGo such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior by opening an issue or using GitHub's reporting features.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find that you don't need to create one. When you are creating a bug report, please include as many details as possible using our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce (be specific!)
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- A clear and descriptive title
- A detailed description of the proposed feature
- Explain why this enhancement would be useful
- List any alternative solutions you've considered
- Note which [roadmap phase](./README.md#-future-features-roadmap) it aligns with

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these issues:

- **good-first-issue** - issues that should only require a few lines of code
- **help-wanted** - issues that may be more involved

### Pull Requests

Please follow these steps to have your contribution considered:

1. **Fork the repo** and create your branch from `main`
2. **Follow the coding style** (see below)
3. **Add tests** if you've added code that should be tested
4. **Update documentation** for any changed functionality
5. **Ensure the test suite passes**
6. **Fill out the PR template** completely
7. **Reference any related issues** in your PR description

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Git

### Getting Started

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/notes2gogo.git
   cd notes2gogo
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/my-amazing-feature
   ```

3. **Set up the development environment**

   **Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

   **Frontend:**
   ```bash
   cd frontend
   npm install
   ```

4. **Start the development environment**
   ```bash
   docker compose up -d
   ```

5. **Run database migrations**
   ```bash
   docker compose exec backend alembic upgrade head
   ```

### Running Tests

**Backend Tests:**
```bash
cd backend
pytest
pytest --cov=app tests/  # With coverage
```

**Frontend Tests:**
```bash
cd frontend
npm test
npm run test:coverage  # With coverage
```

**Linting:**
```bash
# Python
cd backend
pylint app/

# JavaScript
cd frontend
npm run lint
npm run format  # Fix formatting issues
```

## Coding Standards

### Python (Backend)

- Follow [PEP 8](https://pep8.org/) style guide
- Use type hints where appropriate
- Write docstrings for functions and classes
- Maximum line length: 100 characters
- Use meaningful variable and function names

**Example:**
```python
from typing import List, Optional
from pydantic import BaseModel

def get_notes_by_tag(
    tag_id: int,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[NoteSchema]:
    """
    Retrieve notes filtered by tag.
    
    Args:
        tag_id: The ID of the tag to filter by
        user_id: The ID of the user
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of notes matching the criteria
    """
    # Implementation
    pass
```

### JavaScript/React (Frontend)

- Use ES6+ features
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks
- Prop-types or TypeScript for type checking (optional but recommended)
- Use meaningful component and variable names

**Example:**
```javascript
import React, { useState, useEffect } from 'react';

/**
 * NoteCard component displays a single note in card format
 * @param {Object} note - The note object
 * @param {Function} onDelete - Callback when delete is clicked
 */
const NoteCard = ({ note, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    // Cleanup or side effects
  }, [note.id]);
  
  return (
    <div className="note-card">
      {/* Component implementation */}
    </div>
  );
};

export default NoteCard;
```

### Accessibility Standards

We're committed to WCAG 2.1 AA compliance. When contributing UI changes:

- ✅ Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, etc.)
- ✅ Add ARIA labels where needed
- ✅ Ensure keyboard navigation works
- ✅ Test with a screen reader if possible
- ✅ Maintain color contrast ratios (4.5:1 minimum)
- ✅ Add focus indicators for interactive elements
- ✅ Support both light and dark modes

See our [Accessibility Guide](./docs/ACCESSIBILITY.md) for details.

### Git Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect the meaning of the code
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```
feat(tags): add bulk tag operations to notes

fix(search): resolve search suggestions not showing

docs(api): update authentication endpoint examples

style(frontend): format code with prettier

refactor(backend): simplify query logic for notes endpoint

test(api): add tests for tag filtering
```

## Project Structure

Understanding the codebase:

```
notes2gogo/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API route handlers
│   │   ├── core/           # Core functionality (config, db, security)
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   └── services/       # Business logic services
│   ├── alembic/            # Database migrations
│   └── tests/              # Backend tests
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page-level components
│   │   ├── services/       # API client services
│   │   └── store/          # State management (Zustand)
│   └── tests/              # Frontend tests
└── docs/                   # Documentation
```

## Database Migrations

When making schema changes:

1. **Create a migration**
   ```bash
   cd backend
   alembic revision --autogenerate -m "Description of changes"
   ```

2. **Review the generated migration** in `backend/alembic/versions/`

3. **Test the migration**
   ```bash
   alembic upgrade head
   alembic downgrade -1  # Test rollback
   alembic upgrade head  # Re-apply
   ```

4. **Include migration in your PR**

## Adding a New Feature

### Backend Feature Checklist

- [ ] Create/update database models in `app/models/`
- [ ] Create Pydantic schemas in `app/schemas/`
- [ ] Implement business logic in `app/services/` (if complex)
- [ ] Create API endpoints in `app/api/`
- [ ] Add database migrations
- [ ] Write unit tests
- [ ] Update API documentation (docstrings)
- [ ] Update CHANGELOG.md

### Frontend Feature Checklist

- [ ] Create/update components in `src/components/`
- [ ] Add API calls in `src/services/api.js`
- [ ] Update state management if needed
- [ ] Ensure accessibility (ARIA labels, keyboard nav)
- [ ] Add error handling
- [ ] Write component tests
- [ ] Update documentation
- [ ] Test in both light and dark modes

## Testing Guidelines

### What to Test

**Backend:**
- API endpoints (success and error cases)
- Authentication and authorization
- Database queries and transactions
- Input validation
- Business logic in services

**Frontend:**
- Component rendering
- User interactions
- Form validation
- API integration
- Error handling

### Writing Good Tests

```python
# Backend test example
def test_create_note_success(client, test_user_token):
    """Test creating a note with valid data"""
    response = client.post(
        "/api/notes/",
        json={
            "title": "Test Note",
            "content_text": "Test content",
            "note_type": "text"
        },
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Test Note"
```

```javascript
// Frontend test example
import { render, screen, fireEvent } from '@testing-library/react';
import NoteCard from './NoteCard';

test('deletes note when delete button clicked', async () => {
  const mockDelete = jest.fn();
  const note = { id: 1, title: 'Test Note' };
  
  render(<NoteCard note={note} onDelete={mockDelete} />);
  
  const deleteButton = screen.getByRole('button', { name: /delete/i });
  fireEvent.click(deleteButton);
  
  expect(mockDelete).toHaveBeenCalledWith(1);
});
```

## Documentation

- Keep documentation up to date with code changes
- Use clear, concise language
- Include code examples where helpful
- Update the CHANGELOG.md for notable changes
- Add JSDoc/docstrings for new functions and components

## Review Process

1. **Self-review**: Review your own PR first
2. **Automated checks**: Ensure CI passes (tests, linting)
3. **Maintainer review**: A maintainer will review your PR
4. **Address feedback**: Make requested changes
5. **Approval**: Once approved, a maintainer will merge

## Getting Help

- 📖 Check the [documentation](./docs/)
- 💬 Ask questions in [GitHub Discussions](https://github.com/GeekTekRob/notes2gogo/discussions)
- 🐛 Search [existing issues](https://github.com/GeekTekRob/notes2gogo/issues)
- ❓ Open a [question issue](.github/ISSUE_TEMPLATE/question.md)

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- CHANGELOG.md (for significant contributions)
- Documentation credits (for major doc improvements)

## License

By contributing, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

---

Thank you for contributing to Notes2GoGo! 🎉
