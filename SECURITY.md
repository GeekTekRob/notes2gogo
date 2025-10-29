# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

### Option 1: GitHub Security Advisories (Preferred)

1. Go to https://github.com/GeekTekRob/notes2gogo/security/advisories/new
2. Click "Report a vulnerability"
3. Fill in the details of the vulnerability
4. Submit the report

This method keeps the vulnerability private until a fix is available.

### Option 2: Private Contact

If you prefer, you can report vulnerabilities by:
- Opening a draft security advisory on GitHub
- Contacting the maintainers directly through GitHub

### What to Include

Please include the following information:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
- **Full paths of source file(s)** related to the vulnerability
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if available)
- **Impact of the vulnerability** and how an attacker might exploit it
- **Any possible mitigations** you've identified

## What to Expect

- **Acknowledgment**: We'll acknowledge receipt of your vulnerability report within 48 hours
- **Communication**: We'll keep you informed of progress toward a fix
- **Timeline**: We aim to resolve critical vulnerabilities within 7 days
- **Credit**: If you'd like, we'll publicly credit you for the discovery once the fix is released

## Security Best Practices

When deploying Notes2GoGo in production, please follow these security best practices:

### Environment Variables
- **Never commit `.env` files** to version control
- Use strong, randomly generated values for `SECRET_KEY`
- Set `DEBUG=false` in production
- Use environment-specific configuration

### Database Security
- Use strong passwords for database users
- Limit database user permissions to only what's needed
- Enable SSL/TLS for database connections in production
- Regularly backup your database

### Authentication
- Configure appropriate `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 30)
- Implement rate limiting on authentication endpoints
- Use HTTPS in production
- Consider implementing 2FA for enhanced security

### API Security
- Configure `ALLOWED_ORIGINS` to restrict CORS to your domains
- Implement rate limiting on API endpoints
- Validate and sanitize all user inputs
- Use prepared statements for database queries (already implemented via SQLAlchemy)

### Docker Security
- Don't run containers as root
- Use specific image tags, not `latest`
- Scan images for vulnerabilities regularly
- Keep Docker and dependencies up to date

### Network Security
- Use a reverse proxy (nginx/Traefik) in production
- Enable HTTPS with valid SSL certificates
- Configure proper firewall rules
- Implement DDoS protection if publicly accessible

### Monitoring
- Monitor application logs for suspicious activity
- Set up alerts for authentication failures
- Track API usage and rate limits
- Regular security audits

## Known Security Considerations

### Current Implementation

**Authentication:**
- JWT tokens with configurable expiration
- Bcrypt password hashing
- Per-user data isolation

**Input Validation:**
- Pydantic schemas for request validation
- SQLAlchemy ORM (protects against SQL injection)
- Content Security Policy headers recommended

**Dependencies:**
- Regularly updated via Dependabot (if enabled)
- Review `requirements.txt` and `package.json` for known vulnerabilities

### Planned Security Enhancements

See our [Roadmap](./README.md#-future-features-roadmap) for upcoming security features:
- Rate limiting on API endpoints
- 2FA support
- Audit logging
- Enhanced session management

## Security Updates

Security updates will be released as patch versions and documented in:
- [CHANGELOG.md](./CHANGELOG.md)
- GitHub Security Advisories
- Release notes

## Disclosure Policy

When we receive a security vulnerability report:

1. **Confirmation**: We'll confirm the vulnerability and determine its severity
2. **Development**: We'll develop a fix for all supported versions
3. **Testing**: We'll thoroughly test the fix
4. **Release**: We'll release a security update
5. **Disclosure**: After the fix is available, we'll publicly disclose:
   - The vulnerability details
   - Affected versions
   - Credit to the reporter (if desired)
   - Mitigation steps

We follow a **coordinated disclosure** approach, giving users time to update before full public disclosure.

## Comments on This Policy

If you have suggestions on how this process could be improved, please submit a pull request or open an issue.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [React Security Best Practices](https://react.dev/learn/security)
- [Docker Security](https://docs.docker.com/engine/security/)

---

Thank you for helping keep Notes2GoGo and its users safe!
