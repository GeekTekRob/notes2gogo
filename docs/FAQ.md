# ❓ Frequently Asked Questions (FAQ)

Common questions and answers about Notes2GoGo.

---

## Table of Contents

- [General](#general)
- [Getting Started](#getting-started)
- [Features](#features)
- [Technical](#technical)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Privacy & Security](#privacy--security)

---

## General

### What is Notes2GoGo?

Notes2GoGo is an open-source, accessible-first note-taking application that supports both simple Markdown text notes and structured key-value notes. It features full-text search, tagging, search analytics, and comprehensive keyboard shortcuts - all while maintaining WCAG 2.1 AA accessibility standards.

### Is Notes2GoGo free?

Yes! Notes2GoGo is completely free and open-source under the MIT License. You can use it, modify it, and even deploy your own instance.

### Who is Notes2GoGo for?

- **Everyone**: From casual note-takers to power users
- **Accessibility-conscious users**: Built with screen readers and keyboard navigation in mind
- **Developers**: Self-host, customize, and extend
- **Teams**: Collaboration features coming in Phase 3
- **Privacy-focused individuals**: Your data stays with you

### How is Notes2GoGo different from other note apps?

- ✅ **Truly accessible**: WCAG 2.1 AA compliant from day one
- ✅ **Dual note types**: Text (Markdown) and structured (key-value)
- ✅ **Privacy-first**: Per-user analytics, no tracking across users
- ✅ **Open source**: Transparent, community-driven
- ✅ **Self-hostable**: Own your data completely
- ✅ **Modern stack**: React, FastAPI, PostgreSQL

### Can I use Notes2GoGo offline?

Currently, Notes2GoGo requires an internet connection. Offline support is planned for the mobile apps (future phase).

---

## Getting Started

### How do I install Notes2GoGo?

**Easiest way (Docker):**
```bash
git clone https://github.com/GeekTekRob/notes2gogo.git
cd notes2gogo
docker compose up -d
```

Then visit http://localhost:3000

See [README.md](../README.md#-quick-start) for detailed instructions.

### Do I need coding knowledge to use Notes2GoGo?

No! The Docker installation is simple and works on any platform. For advanced deployment or development, technical knowledge helps but isn't required for basic usage.

### What are the system requirements?

**To run (Docker):**
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- 2GB RAM minimum
- 1GB disk space

**To develop:**
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### How do I create my first note?

1. Register an account at http://localhost:3000/register
2. Login with your credentials
3. Click "Dashboard" or press `Alt+N`
4. Choose "Text Note" or "Structured Note"
5. Fill in title and content
6. Press `Ctrl/Cmd+S` or click "Save"

### Can I import my existing notes?

Import functionality is planned for Phase 5 (Q4 2026) with support for:
- Markdown files
- Evernote exports (.enex)
- Notion exports
- JSON/CSV

Currently, you'll need to manually create notes or use the API to bulk-import.

---

## Features

### What's the difference between text and structured notes?

**Text Notes:**
- Free-form content
- Markdown formatting
- Best for: Articles, journal entries, meeting notes

**Structured Notes:**
- Key-value pairs (like a form)
- Each section is labeled
- Best for: Contact info, recipes, project specs, checklists

### How does the search work?

Notes2GoGo uses **PostgreSQL full-text search** with:
- Searches across titles, content, and tags
- Searches inside structured note fields
- Real-time filtering as you type (300ms debounce)
- Search analytics for suggestions

### What are tags and how do I use them?

Tags are labels you assign to notes for organization. Think of them like folders, but:
- Notes can have multiple tags
- Filter by one or multiple tags (AND/OR logic)
- Auto-complete suggests existing tags
- Bulk operations to add/remove tags

See [TAGS.md](./TAGS.md) for detailed guide.

### What keyboard shortcuts are available?

- `Alt+N`: Create new note
- `Ctrl/Cmd+S`: Save current note
- `Ctrl/Cmd+K` or `Ctrl/Cmd+F`: Focus search
- `Ctrl/Cmd+\`: Toggle sidebar
- `Ctrl/Cmd+B`: Bold text (in editor)
- `Ctrl/Cmd+I`: Italic text (in editor)
- `Esc`: Clear search or close modals
- `?`: Show keyboard shortcuts help

See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for complete list.

### Can I customize the theme?

Yes! Notes2GoGo supports:
- **Light mode** (default)
- **Dark mode** (toggle in navbar)
- **System preference** detection

Advanced theming (custom colors, fonts) is planned for Phase 5.

### How does search analytics work?

Search analytics tracks:
- What you search for
- How often you search each term
- How many results each search returns
- Recent, popular, and trending searches

**Privacy**: All analytics are per-user only. We never track or share your searches with anyone.

See [SEARCH_ANALYTICS.md](./SEARCH_ANALYTICS.md) for detailed guide.

### What are saved searches?

Saved searches let you save complex search queries for quick access:
- Save filter combinations
- One-click execution
- Share via URL (planned)

The backend API is ready; full UI is coming in Phase 2.

### Can I share notes with others?

Not yet. Real-time collaboration is planned for Phase 3 (Q2 2026) with:
- Share links (view/edit permissions)
- Real-time collaborative editing
- Comments and annotations
- Activity feeds

### Can I export my notes?

Export functionality is planned for Phase 1 extension (November 2025):
- Export as Markdown
- Export as PDF
- Bulk export as ZIP

Currently, you can use the API to programmatically export notes.

---

## Technical

### What technology stack does Notes2GoGo use?

**Backend:**
- Python 3.11 + FastAPI
- PostgreSQL 15 (with JSONB and full-text search)
- SQLAlchemy ORM
- Alembic migrations
- JWT authentication

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Zustand (state management)
- React Router
- Axios

**Infrastructure:**
- Docker + Docker Compose
- Nginx (production)

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture.

### Can I self-host Notes2GoGo?

Absolutely! That's one of our core features. See:
- [Quick Start](../README.md#-quick-start) for development
- [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

### How do I contribute code?

1. Fork the repository
2. Create a feature branch
3. Make your changes (follow coding standards)
4. Write tests
5. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guide.

### Where is the API documentation?

Interactive API docs are available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Also see:
- [API.md](./API.md) - Complete API reference
- [API_EXAMPLES.md](./API_EXAMPLES.md) - Curl/JavaScript examples

### Can I use the API from external applications?

Yes! The API is RESTful and well-documented. You can:
- Build custom integrations
- Create mobile apps
- Automate note creation
- Build browser extensions

Public API with rate limiting is planned for future phases.

### How do I run tests?

**Backend:**
```bash
cd backend
pytest
pytest --cov=app tests/  # With coverage
```

**Frontend:**
```bash
cd frontend
npm test
npm run test:coverage  # With coverage
```

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed testing guide.

### How do I report a bug?

Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md):
1. Go to [Issues](https://github.com/GeekTekRob/notes2gogo/issues)
2. Click "New Issue"
3. Choose "Bug Report"
4. Fill in the template
5. Submit

### How do I request a feature?

Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md):
1. Go to [Issues](https://github.com/GeekTekRob/notes2gogo/issues)
2. Click "New Issue"
3. Choose "Feature Request"
4. Fill in the template
5. Submit

Also check the [Roadmap](./ROADMAP.md) to see if it's already planned!

---

## Troubleshooting

### The application won't start

**Docker issues:**
```bash
# Check if Docker is running
docker ps

# Check logs
docker compose logs -f

# Rebuild containers
docker compose up --build -d

# Reset everything (DELETES DATA)
docker compose down -v
docker compose up -d
```

See [DEVELOPMENT.md](./DEVELOPMENT.md#common-issues--solutions) for detailed troubleshooting.

### I forgot my password

Currently, there's no password reset feature. You'll need to:

**Option 1**: Create a new account

**Option 2**: Reset password via database (if self-hosting):
```bash
# Access PostgreSQL
docker compose exec db psql -U notes_user notes2gogo

# Update password (replace 'username' and 'new_hash')
UPDATE users SET password_hash = 'new_bcrypt_hash' WHERE username = 'username';
```

Password reset feature is planned for a future release.

### Search isn't finding my notes

**Check these:**
1. Is the search term spelled correctly?
2. Try searching part of a word
3. Check if note has the content you're searching for
4. Try without filters first
5. Check if you're searching the right user account

**Still not working?**
- Check backend logs: `docker compose logs backend`
- Database might need reindexing: `VACUUM ANALYZE notes;`

### Tags aren't showing up

**Common causes:**
1. Tags not saved with note (click Save after adding tags)
2. JavaScript error in console (F12 to check)
3. API error (check Network tab in DevTools)

**Fix:**
1. Refresh the page (F5)
2. Check browser console for errors
3. Restart backend: `docker compose restart backend`

### Keyboard shortcuts aren't working

**Check these:**
1. Are you focused in an input field? (Some shortcuts disabled in inputs)
2. Are you using a browser extension that overrides shortcuts?
3. Try clicking outside any input fields first
4. Check keyboard shortcuts help (click "?" icon or press "?")

**Platform-specific:**
- Use `Alt+N` (not Ctrl+N) for new notes
- Use `Ctrl` on Windows/Linux, `Cmd` on Mac

### Dark mode isn't working

1. Check theme toggle in navbar (moon/sun icon)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check browser console for JavaScript errors
4. Try in incognito/private window

### API returns 401 Unauthorized

**Causes:**
- Token expired (default: 30 minutes)
- Token not sent in request
- Invalid token format

**Solutions:**
1. Log out and log back in
2. Check Authorization header: `Bearer YOUR_TOKEN`
3. Token should be in format: `eyJhbGciOiJIUzI1NiIs...`

### Docker containers keep restarting

**Check logs:**
```bash
docker compose logs backend
docker compose logs db
```

**Common issues:**
- Database not ready when backend starts (should auto-retry)
- Wrong environment variables
- Port conflicts (check ports 3000, 8000, 5432)

### Database migration fails

**Common causes:**
- Database schema out of sync
- Corrupted migration state

**Solutions:**
```bash
# Check current migration
docker compose exec backend alembic current

# Try upgrading
docker compose exec backend alembic upgrade head

# If all else fails (LOSES DATA):
docker compose down -v
docker compose up -d
docker compose exec backend alembic upgrade head
```

---

## Contributing

### I'm not a developer. Can I still contribute?

Yes! You can:
- Report bugs
- Suggest features
- Improve documentation
- Test new features
- Share Notes2GoGo with others
- Answer questions in Discussions

### What skills are needed to contribute code?

**Backend:**
- Python (intermediate)
- FastAPI / Flask experience
- SQL / PostgreSQL
- REST API design

**Frontend:**
- JavaScript/React (intermediate)
- HTML/CSS
- Tailwind CSS
- Accessibility basics

**DevOps:**
- Docker
- Linux administration
- nginx configuration

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guide.

### How long does a PR take to review?

- **Small PRs** (bug fixes, typos): 1-3 days
- **Medium PRs** (new features): 3-7 days
- **Large PRs** (major features): 1-2 weeks

We review PRs in order, so please be patient!

### Can I get paid to contribute?

Currently, Notes2GoGo is a volunteer project. We don't have funding for paid contributors. However:
- Your contributions are credited
- You gain real-world experience
- You help build something useful

If we get sponsorship in the future, we may offer bounties for specific features.

---

## Privacy & Security

### Is my data private?

Yes! Your data is:
- **Never shared** with other users
- **Never sold** to third parties
- **Never used for advertising**
- **Encrypted in transit** (HTTPS)
- **Stored securely** in PostgreSQL

### How is my password stored?

Passwords are:
- **Never stored in plain text**
- **Hashed with bcrypt** (industry standard)
- **Salted** (unique per password)
- **Cannot be reverse-engineered**

Even database admins can't see your password.

### What data do you collect?

**Account data:**
- Username, email, password hash
- Account creation date

**Notes data:**
- Note content, titles, tags
- Creation and update timestamps
- Note type (text/structured)

**Search analytics (per-user only):**
- Search queries
- Result counts
- Search timestamps

**We do NOT collect:**
- IP addresses (except in server logs)
- Browsing history
- Cross-user behavior
- Personal information beyond what you provide

### Can I delete my account?

Account deletion is not yet implemented in the UI. If self-hosting, you can:

```sql
-- Delete all user data
DELETE FROM notes WHERE user_id = YOUR_USER_ID;
DELETE FROM tags WHERE user_id = YOUR_USER_ID;
DELETE FROM search_analytics WHERE user_id = YOUR_USER_ID;
DELETE FROM saved_searches WHERE user_id = YOUR_USER_ID;
DELETE FROM users WHERE id = YOUR_USER_ID;
```

Account deletion UI is planned for a future release.

### How do I report a security vulnerability?

**DO NOT** open a public GitHub issue. Instead:

1. Use [GitHub Security Advisories](https://github.com/GeekTekRob/notes2gogo/security/advisories/new)
2. Or email the maintainers (see [SECURITY.md](../SECURITY.md))

We take security seriously and will respond promptly.

### Is Notes2GoGo GDPR compliant?

Notes2GoGo is designed with privacy in mind and includes features that support GDPR compliance:
- Data export (planned)
- Account deletion (planned)
- No third-party tracking
- Clear data usage

If you're deploying for a business, consult with legal counsel about your specific requirements.

### What are your security best practices?

See [SECURITY.md](../SECURITY.md) for:
- Vulnerability reporting
- Production security configuration
- Environment variable management
- Database security
- Network security

---

## Deployment

### Can I deploy to Heroku/Vercel/Netlify?

**Heroku**: Yes, but requires configuration (see [DEPLOYMENT.md](./DEPLOYMENT.md#heroku-deployment))

**Vercel/Netlify**: Frontend only. You'll need separate backend hosting.

**Recommended**: DigitalOcean, AWS, or your own VPS for full control.

### What are the hosting costs?

**Development**: Free (localhost)

**Small deployment** (DigitalOcean):
- $6/month: Droplet (basic VM)
- $8/month: Managed PostgreSQL (optional)
- **Total**: ~$6-14/month

**Medium deployment** (AWS):
- ~$30-50/month with RDS, ECS, CloudFront

### Do I need a domain name?

No, you can access via IP address. But for production:
- Domain recommended for HTTPS
- Required for SSL certificates (Let's Encrypt)
- Better for branding and sharing

Domains cost ~$10-15/year.

### How do I enable HTTPS?

**Option 1**: Let's Encrypt (Free)
```bash
sudo certbot --nginx -d notes.example.com
```

**Option 2**: Cloudflare (Free tier includes SSL)

**Option 3**: Buy SSL certificate from provider

See [DEPLOYMENT.md](./DEPLOYMENT.md#ssl-certificate-lets-encrypt) for details.

---

## Roadmap

### When is [feature] coming?

Check our [Roadmap](./ROADMAP.md) for planned features and timelines.

**Current focus**: Phase 1 completion (Export functionality)
**Next phase**: Phase 2 (Folders, Natural language dates, Saved searches UI)

### Can I vote on features?

Yes! Features with more community interest get higher priority.

**How to vote:**
1. Check [GitHub Discussions](https://github.com/GeekTekRob/notes2gogo/discussions)
2. Upvote existing feature requests
3. Or create a new feature request issue

### How can I help speed up development?

- **Contribute code** (see [CONTRIBUTING.md](../CONTRIBUTING.md))
- **Test beta features** and provide feedback
- **Improve documentation**
- **Report bugs** early
- **Spread the word** about Notes2GoGo

---

## Still Have Questions?

- 💬 **Ask in Discussions**: [GitHub Discussions](https://github.com/GeekTekRob/notes2gogo/discussions)
- 🐛 **Report an issue**: [GitHub Issues](https://github.com/GeekTekRob/notes2gogo/issues)
- 📖 **Read the docs**: [Documentation](./README.md)
- 📧 **Contact maintainers**: Via GitHub

---

**Last Updated**: October 29, 2025  
**Not finding your question?** [Ask in Discussions](https://github.com/GeekTekRob/notes2gogo/discussions) or [open an issue](https://github.com/GeekTekRob/notes2gogo/issues/new/choose).
