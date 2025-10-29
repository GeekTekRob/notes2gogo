# 🚀 Production Deployment Guide

Comprehensive guide for deploying Notes2GoGo to production environments.

---

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Manual Deployment](#manual-deployment)
- [Database Setup](#database-setup)
- [Security Configuration](#security-configuration)
- [Performance Optimization](#performance-optimization)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Security

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `DEBUG=false` in environment
- [ ] Configure proper `ALLOWED_ORIGINS` for CORS
- [ ] Use HTTPS/SSL certificates
- [ ] Set strong database passwords
- [ ] Enable firewall rules
- [ ] Review and limit exposed ports
- [ ] Configure rate limiting (if applicable)

### Configuration

- [ ] Set production database URL
- [ ] Configure email service (if used)
- [ ] Set up CDN for static assets (optional)
- [ ] Configure environment variables
- [ ] Set proper `ACCESS_TOKEN_EXPIRE_MINUTES`
- [ ] Configure logging level

### Infrastructure

- [ ] Provision servers/containers
- [ ] Set up database (PostgreSQL 15+)
- [ ] Configure reverse proxy (nginx/Traefik)
- [ ] Set up SSL/TLS certificates
- [ ] Configure DNS records
- [ ] Set up monitoring and alerts
- [ ] Configure automated backups

---

## Environment Setup

### Production Environment Variables

#### Backend `.env`
```env
# Database (Use managed PostgreSQL in production)
DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@db.example.com:5432/notes2gogo_prod

# Security (MUST CHANGE)
SECRET_KEY=REPLACE_WITH_RANDOM_64_CHAR_STRING
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (Your production domain)
ALLOWED_ORIGINS=["https://notes.example.com","https://www.notes.example.com"]

# Environment
DEBUG=false
ENVIRONMENT=production

# Optional: Sentry for error tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# Optional: Email configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=email_password
```

**Generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

#### Frontend `.env.production`
```env
VITE_API_URL=https://api.notes.example.com
```

---

## Deployment Options

### Option 1: Docker Compose (Recommended for Small-Medium Deployments)
✅ Easiest to set up  
✅ Consistent across environments  
✅ Good for single-server deployments  
❌ Limited scalability  

### Option 2: Kubernetes (Recommended for Large Scale)
✅ Highly scalable  
✅ Auto-healing and load balancing  
✅ Industry standard  
❌ Complex setup  

### Option 3: Platform as a Service (Heroku, Render, Railway)
✅ Minimal configuration  
✅ Automatic scaling  
❌ Higher cost  
❌ Less control  

### Option 4: Manual Deployment (Traditional VPS)
✅ Full control  
✅ Cost-effective  
❌ More maintenance  
❌ Manual scaling  

---

## Docker Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: notes2gogo-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - notes2gogo-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # FastAPI Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: notes2gogo-backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      SECRET_KEY: ${SECRET_KEY}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
      DEBUG: "false"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - notes2gogo-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: notes2gogo-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - frontend_build:/usr/share/nginx/html:ro
    depends_on:
      - backend
    networks:
      - notes2gogo-network

volumes:
  postgres_data:
  frontend_build:

networks:
  notes2gogo-network:
    driver: bridge
```

### Production Dockerfile (Backend)

Create `backend/Dockerfile.prod`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Run migrations and start server
CMD alembic upgrade head && \
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

    # Upstream backend
    upstream backend {
        server backend:8000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name notes.example.com www.notes.example.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name notes.example.com www.notes.example.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Frontend (React build)
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            expires 1h;
            add_header Cache-Control "public, immutable";
        }

        # Backend API
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # API docs (optional: remove in production)
        location /docs {
            proxy_pass http://backend;
            proxy_set_header Host $host;
        }

        # Login endpoint rate limiting
        location /api/auth/login {
            limit_req zone=login_limit burst=3 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Deployment Steps

```bash
# 1. Clone repository on server
git clone https://github.com/GeekTekRob/notes2gogo.git
cd notes2gogo

# 2. Create production .env file
nano .env.prod
# Add all production environment variables

# 3. Build frontend
cd frontend
npm ci --production
npm run build
# Copy build to nginx volume or mount directly

# 4. Start services
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 5. Check logs
docker compose -f docker-compose.prod.yml logs -f

# 6. Run database migrations
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 7. Verify deployment
curl https://notes.example.com/health
```

---

## Cloud Deployment

### AWS Deployment

#### Architecture
```
Route 53 (DNS)
    ↓
CloudFront (CDN) → S3 (Frontend static files)
    ↓
Application Load Balancer
    ↓
ECS/Fargate (Backend containers)
    ↓
RDS PostgreSQL (Database)
```

#### Steps

1. **RDS PostgreSQL Setup:**
   ```bash
   # Create RDS instance
   aws rds create-db-instance \
     --db-instance-identifier notes2gogo-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --engine-version 15.3 \
     --master-username admin \
     --master-user-password STRONG_PASSWORD \
     --allocated-storage 20
   ```

2. **ECR for Docker Images:**
   ```bash
   # Create ECR repository
   aws ecr create-repository --repository-name notes2gogo-backend
   
   # Build and push
   docker build -t notes2gogo-backend ./backend
   docker tag notes2gogo-backend:latest \
     AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/notes2gogo-backend:latest
   docker push AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/notes2gogo-backend:latest
   ```

3. **ECS Task Definition:**
   ```json
   {
     "family": "notes2gogo-backend",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "containerDefinitions": [
       {
         "name": "backend",
         "image": "AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/notes2gogo-backend:latest",
         "portMappings": [{"containerPort": 8000}],
         "environment": [
           {"name": "DATABASE_URL", "value": "postgresql://..."},
           {"name": "SECRET_KEY", "value": "..."}
         ]
       }
     ]
   }
   ```

4. **S3 + CloudFront for Frontend:**
   ```bash
   # Create S3 bucket
   aws s3 mb s3://notes2gogo-frontend
   
   # Upload build
   cd frontend
   npm run build
   aws s3 sync dist/ s3://notes2gogo-frontend --delete
   
   # Create CloudFront distribution
   # Point to S3 bucket with CloudFront OAI
   ```

---

### DigitalOcean Deployment

#### Using App Platform

1. **Connect GitHub repository**
2. **Configure services:**
   - **Backend:** Dockerfile, port 8000
   - **Database:** Managed PostgreSQL
3. **Set environment variables**
4. **Deploy!**

#### Using Droplet (Manual)

```bash
# 1. Create Ubuntu droplet
doctl compute droplet create notes2gogo \
  --image ubuntu-22-04-x64 \
  --size s-2vcpu-4gb \
  --region nyc3

# 2. SSH into droplet
ssh root@YOUR_DROPLET_IP

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Clone and deploy (same as Docker deployment above)
```

---

### Heroku Deployment

```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create notes2gogo-prod

# 4. Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# 5. Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set ALLOWED_ORIGINS='["https://notes2gogo-prod.herokuapp.com"]'

# 6. Deploy
git push heroku main

# 7. Run migrations
heroku run alembic upgrade head
```

---

## Manual Deployment

### Ubuntu Server (20.04+)

#### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt install python3.11 python3.11-venv python3.11-dev

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install nginx
sudo apt install nginx

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs
```

#### 2. Setup Database

```bash
sudo -u postgres psql

CREATE DATABASE notes2gogo_prod;
CREATE USER notes_user WITH PASSWORD 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE notes2gogo_prod TO notes_user;
\q
```

#### 3. Deploy Backend

```bash
# Create app directory
sudo mkdir -p /var/www/notes2gogo
cd /var/www/notes2gogo

# Clone repository
sudo git clone https://github.com/GeekTekRob/notes2gogo.git .

# Setup virtual environment
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
sudo nano .env
# Add production environment variables

# Run migrations
alembic upgrade head

# Create systemd service
sudo nano /etc/systemd/system/notes2gogo.service
```

**notes2gogo.service:**
```ini
[Unit]
Description=Notes2GoGo FastAPI Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/notes2gogo/backend
Environment="PATH=/var/www/notes2gogo/backend/venv/bin"
ExecStart=/var/www/notes2gogo/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable notes2gogo
sudo systemctl start notes2gogo
sudo systemctl status notes2gogo
```

#### 4. Deploy Frontend

```bash
cd /var/www/notes2gogo/frontend

# Install dependencies and build
npm ci --production
npm run build

# Copy build to nginx
sudo mkdir -p /var/www/html/notes2gogo
sudo cp -r dist/* /var/www/html/notes2gogo/
```

#### 5. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/notes2gogo
```

Use the nginx configuration from the Docker section above, then:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/notes2gogo /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

#### 6. SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d notes.example.com -d www.notes.example.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## Security Configuration

### Firewall Setup (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### Fail2Ban (Brute Force Protection)

```bash
# Install
sudo apt install fail2ban

# Configure
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
```

```bash
# Restart fail2ban
sudo systemctl restart fail2ban
```

---

## Performance Optimization

### Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);
CREATE INDEX idx_tags_user_name ON tags(user_id, name);
CREATE INDEX idx_note_tags_tag ON note_tags(tag_id);
CREATE INDEX idx_search_analytics_user_query ON search_analytics(user_id, query_text);

-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Vacuum and analyze regularly (set up cron job)
VACUUM ANALYZE;
```

### Caching (Optional - Redis)

```yaml
# Add to docker-compose.prod.yml
redis:
  image: redis:alpine
  restart: unless-stopped
  volumes:
    - redis_data:/data
  networks:
    - notes2gogo-network
```

### CDN for Static Assets

Use CloudFlare, CloudFront, or similar to serve:
- Frontend JavaScript/CSS bundles
- Images and fonts
- API responses (with appropriate cache headers)

---

## Monitoring & Logging

### Application Logging

```python
# backend/app/core/logging.py
import logging
from logging.handlers import RotatingFileHandler

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            RotatingFileHandler(
                'logs/app.log',
                maxBytes=10485760,  # 10MB
                backupCount=10
            ),
            logging.StreamHandler()
        ]
    )
```

### Monitoring Tools

**Option 1: Prometheus + Grafana**
- Metrics collection
- Visualization dashboards
- Alerting

**Option 2: Sentry**
- Error tracking
- Performance monitoring
- User feedback

```python
# Install sentry-sdk
# pip install sentry-sdk[fastapi]

# backend/app/main.py
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    traces_sample_rate=1.0,
)
```

**Option 3: Uptime Monitoring**
- UptimeRobot
- Pingdom
- StatusCake

---

## Backup & Recovery

### Database Backups

```bash
# Manual backup
pg_dump -h localhost -U notes_user notes2gogo_prod > backup_$(date +%Y%m%d).sql

# Automated daily backups (cron)
# Add to crontab: crontab -e
0 2 * * * /usr/bin/pg_dump -h localhost -U notes_user notes2gogo_prod | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Retention: Keep 30 days
find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

### Restore from Backup

```bash
# Stop application
sudo systemctl stop notes2gogo

# Restore database
gunzip < backup_20251029.sql.gz | psql -h localhost -U notes_user notes2gogo_prod

# Start application
sudo systemctl start notes2gogo
```

### Docker Volume Backups

```bash
# Backup volume
docker run --rm \
  -v notes2gogo_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz /data

# Restore volume
docker run --rm \
  -v notes2gogo_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_data_20251029.tar.gz -C /
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check service status
sudo systemctl status notes2gogo

# Check logs
sudo journalctl -u notes2gogo -n 50

# Check if port is in use
sudo netstat -tulpn | grep 8000
```

### Database Connection Issues

```bash
# Test database connection
psql -h localhost -U notes_user -d notes2gogo_prod

# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Nginx Issues

```bash
# Test nginx configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Restart nginx
sudo systemctl restart nginx
```

### High Memory Usage

```bash
# Check memory
free -h

# Check processes
top

# Reduce uvicorn workers if needed
# Edit /etc/systemd/system/notes2gogo.service
# Change --workers 4 to --workers 2
```

---

## Post-Deployment

### Verify Deployment

```bash
# Health check
curl https://notes.example.com/health

# API check
curl https://notes.example.com/api/

# SSL check
curl -I https://notes.example.com
```

### Performance Testing

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 https://notes.example.com/api/notes/
```

### Set Up Monitoring Alerts

Configure alerts for:
- Server down
- High CPU/memory usage
- High error rate
- Disk space low
- Database connection failures

---

## Maintenance

### Regular Tasks

**Daily:**
- Check application logs
- Monitor server resources

**Weekly:**
- Review error logs
- Check database size
- Verify backups

**Monthly:**
- Update dependencies
- Review security advisories
- Test backup restoration
- Check SSL certificate expiration

### Updates

```bash
# Backend updates
cd /var/www/notes2gogo
sudo git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
sudo systemctl restart notes2gogo

# Frontend updates
cd /var/www/notes2gogo/frontend
npm ci --production
npm run build
sudo cp -r dist/* /var/www/html/notes2gogo/
```

---

**Last Updated**: October 29, 2025  
**Version**: 1.0.0
