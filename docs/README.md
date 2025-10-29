# 📚 Documentation Index

Welcome to the Notes2GoGo documentation! This guide will help you find the information you need.

---

## 🚀 Getting Started

New to Notes2GoGo? Start here:
1. Read the [README](../README.md) for project overview and quick start
2. Follow the installation guide in the README
3. Explore the [API Reference](./API.md) for backend integration

---

## 📖 User Guides

### Core Features
- **[Tag System Guide](./TAGS.md)** - Complete guide to organizing notes with tags
  - Creating and managing tags
  - Filtering and bulk operations
  - Best practices and examples

- **[Search Analytics Guide](./SEARCH_ANALYTICS.md)** - Master search capabilities
  - Smart suggestions and autocomplete
  - Search insights dashboard
  - Privacy and data management

### Accessibility
- **[Accessibility Guide](./ACCESSIBILITY.md)** - WCAG 2.1 AA compliance documentation
  - Keyboard shortcuts reference
  - Screen reader support
  - Testing checklist
  - Development guidelines

---

## 🔧 Developer Documentation

### API & Integration
- **[API Reference](./API.md)** - Complete REST API documentation
  - Authentication endpoints
  - Notes CRUD operations
  - Tags management
  - Search analytics
  - Error handling

### Contributing
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to Notes2GoGo
  - Development setup
  - Code standards
  - Pull request process
  - Testing requirements

---

## 📋 Quick Reference

### Keyboard Shortcuts
| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| New Note | `Alt+N` | `Alt+N` |
| Save Note | `Ctrl+S` | `⌘+S` |
| Search | `Ctrl+K` | `⌘+K` |
| Toggle Sidebar | `Ctrl+\` | `⌘+\` |

See [Accessibility Guide](./ACCESSIBILITY.md) for complete shortcuts.

### API Quick Links
- Interactive API Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/health`

---

## 🎯 Common Tasks

### For Users
- **Create a note:** Use `Alt+N` or click "New Note" button
- **Search notes:** Use `Ctrl+K` to focus search bar
- **Filter by tags:** Click any tag in sidebar or note cards
- **Get search suggestions:** Type 2+ characters in search bar

### For Developers
- **Run locally:** `docker compose up -d`
- **Run tests:** `cd backend && pytest` or `cd frontend && npm test`
- **Create migration:** `alembic revision --autogenerate -m "description"`
- **View logs:** `docker compose logs -f backend` or `frontend`

---

## 🆘 Getting Help

### Documentation Issues
- Something unclear? [Open an issue](https://github.com/GeekTekRob/notes2gogo/issues)
- Want to improve docs? See [Contributing Guide](./CONTRIBUTING.md)

### Technical Support
- **Bugs:** Create an issue with reproduction steps
- **Features:** Start a discussion in GitHub Discussions
- **Questions:** Check existing issues or ask in Discussions

---

## 📝 Documentation Structure

```
docs/
├── README.md (this file)      # Documentation index
├── ACCESSIBILITY.md            # Accessibility & keyboard shortcuts
├── API.md                      # Complete API reference
├── CONTRIBUTING.md             # Contribution guidelines
├── TAGS.md                     # Tag system guide
└── SEARCH_ANALYTICS.md         # Search analytics guide
```

---

## 🔄 Changelog

For version history and recent changes, see [CHANGELOG.md](../CHANGELOG.md) in the root directory.

---

**Last Updated:** October 29, 2025  
**Documentation Version:** 1.0.0
