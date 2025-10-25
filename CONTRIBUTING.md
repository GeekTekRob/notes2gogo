# Contributing to Notes2GoGo

Thank you for your interest in contributing to Notes2GoGo! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Git
- Basic knowledge of Python (FastAPI) and/or JavaScript (React)

### Setting Up Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/notes2gogo.git
   cd notes2gogo
   ```

2. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

3. **Access the services**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

#### Backend Development
- Write code following PEP 8 style guidelines
- Add type hints to function signatures
- Update/create Pydantic schemas for new endpoints
- Create database migrations if schema changes:
  ```bash
  docker-compose exec backend alembic revision --autogenerate -m "Description"
  ```

#### Frontend Development
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Maintain component modularity
- Use Tailwind CSS for styling
- Ensure responsive design

### 3. Test Your Changes

#### Backend Tests
```bash
docker-compose exec backend pytest
```

#### Manual Testing
- Test all affected functionality
- Verify API endpoints with Swagger UI
- Check database changes in PostgreSQL
- Test authentication flows

### 4. Commit Your Changes
Use conventional commits format:
```bash
git commit -m "feat: add live search functionality"
git commit -m "fix: resolve button layout issue"
git commit -m "docs: update README with new features"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear description of changes
- Reference to any related issues
- Screenshots for UI changes
- Test results

## Code Style Guidelines

### Python (Backend)
- Follow PEP 8
- Use type hints
- Maximum line length: 100 characters
- Use docstrings for functions and classes
- Keep functions focused and small

```python
from typing import List, Optional

async def get_notes(
    user_id: int,
    search: Optional[str] = None,
    page: int = 1
) -> List[Note]:
    """
    Retrieve paginated notes for a user.
    
    Args:
        user_id: The ID of the user
        search: Optional search term
        page: Page number for pagination
        
    Returns:
        List of Note objects
    """
    # Implementation
```

### JavaScript/React (Frontend)
- Use ES6+ features
- Prefer functional components
- Use descriptive variable names
- Keep components small and focused
- Extract reusable logic into custom hooks

```javascript
// Good
const [isLoading, setIsLoading] = useState(false)
const handleSearch = useCallback((query) => {
  // Implementation
}, [dependencies])

// Component structure
const MyComponent = () => {
  // Hooks
  // Event handlers
  // Effects
  // Render
}
```

### CSS (Tailwind)
- Use Tailwind utility classes
- Create custom classes in index.css for reusable patterns
- Follow mobile-first responsive design
- Maintain consistent spacing and colors

## Project Structure

```
notes2gogo/
├── backend/
│   ├── app/
│   │   ├── api/           # API route handlers
│   │   ├── core/          # Core functionality (auth, db, config)
│   │   ├── models/        # SQLAlchemy models
│   │   └── schemas/       # Pydantic schemas
│   ├── alembic/           # Database migrations
│   └── tests/             # Backend tests
├── frontend/
│   └── src/
│       ├── components/    # Reusable React components
│       ├── pages/         # Page components (routes)
│       ├── services/      # API service layer
│       ├── store/         # Zustand state management
│       └── utils/         # Utility functions
└── docker-compose.yml     # Docker orchestration
```

## What to Contribute

### Good First Issues
- Documentation improvements
- UI/UX enhancements
- Bug fixes
- Test coverage
- Performance optimizations

### Feature Ideas
- Export/import notes functionality
- Note sharing capabilities
- Dark mode support
- Mobile responsive improvements
- Keyboard shortcuts
- Note templates
- Rich text editor enhancements
- File attachments

## Review Process

1. **Automated Checks**: CI/CD pipeline runs tests
2. **Code Review**: Maintainers review code quality and design
3. **Testing**: Changes are tested in various scenarios
4. **Merge**: Approved PRs are merged into main branch

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues before creating new ones

## License

By contributing to Notes2GoGo, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Notes2GoGo! 🎉
