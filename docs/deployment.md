# Deployment Guide - YojnaSathi

## Overview

This guide covers deploying YojnaSathi to production environments with focus on security, scalability, and reliability.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Database Setup](#database-setup)
6. [SSL/HTTPS Configuration](#ssltls-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backup & Recovery](#backup--recovery)
9. [Performance Tuning](#performance-tuning)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`pytest`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No linting errors (`eslint`, `flake8`)
- [ ] Code review completed
- [ ] Documentation updated

### Security
- [ ] Secrets in `.env` (not in code)
- [ ] CORS configured correctly
- [ ] CSRF protection enabled
- [ ] SQL injection prevention verified
- [ ] XSS protection implemented
- [ ] Rate limiting configured
- [ ] Input validation comprehensive

### Configuration
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] ML models updated and tested
- [ ] API endpoints verified
- [ ] Third-party services configured

### Performance
- [ ] Frontend build optimized
- [ ] Backend async implemented
- [ ] Database indexes created
- [ ] Caching configured
- [ ] Load testing completed

### Backup & Recovery
- [ ] Database backup verified
- [ ] Code repository backed up
- [ ] Disaster recovery plan ready
- [ ] Rollback procedure documented

---

## Environment Setup

### Development Environment

```bash
# Clone repository
git clone <repository-url>
cd YojnaSathi

# Create virtual environment
python -m venv venv

# Activate venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate      # Windows

# Install Python dependencies
pip install -r requirements.txt

# Setup frontend
cd frontend
npm install
npm run dev

# In another terminal, run backend
cd backend
python -m uvicorn app.main:app --reload
```

### Production Environment

```bash
# Use Python 3.11+
python --version

# Create production user
sudo useradd -m -s /bin/bash yojnasathi

# Switch to production user
sudo su - yojnasathi

# Clone with specific branch
git clone -b production <repository-url>

# Install dependencies in venv
python -m venv /home/yojnasathi/venv
source /home/yojnasathi/venv/bin/activate
pip install -r requirements.txt

# Setup frontend build
cd frontend
npm install --production
npm run build

# Copy build to web server
sudo cp -r dist/* /var/www/yojnasathi/
```

---

## Docker Deployment

### Dockerfile Structure

#### Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run with gunicorn for production
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app.main:app", "--timeout", "60"]
```

#### Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  database:
    image: postgres:15-alpine
    container_name: yojnasathi_db
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: yojnasathi_backend
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@database:5432/${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGINS: ${CORS_ORIGINS}
      ML_MODEL_PATH: /app/ml/models/scheme_model.pkl
    volumes:
      - ./ml:/app/ml:ro
      - ./logs:/app/logs
    ports:
      - "8000:8000"
    depends_on:
      database:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: frontend
      dockerfile: Dockerfile
    container_name: yojnasathi_frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      REACT_APP_API_URL: http://backend:8000

  redis:
    image: redis:7-alpine
    container_name: yojnasathi_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  db_data:
  redis_data:

networks:
  default:
    name: yojnasathi_network
```

### Deploy with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Remove everything
docker-compose down -v
```

---

## Cloud Deployment

### AWS Deployment

#### 1. Backend on ECS (Elastic Container Service)

```bash
# Create ECR repository
aws ecr create-repository --repository-name yojnasathi-backend

# Build and push image
docker build -t yojnasathi-backend:latest backend/
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag yojnasathi-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/yojnasathi-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/yojnasathi-backend:latest
```

#### 2. Frontend on S3 + CloudFront

```bash
# Build frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://yojnasathi-frontend/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"
```

#### 3. Database on RDS

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier yojnasathi-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 20 \
  --storage-type gp3
```

#### 4. Application Load Balancer

```bash
# Create load balancer
aws elbv2 create-load-balancer \
  --name yojnasathi-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx \
  --scheme internet-facing \
  --type application
```

### GCP Deployment

#### Cloud Run

```bash
# Build image
gcloud builds submit --tag gcr.io/PROJECT_ID/yojnasathi-backend backend/

# Deploy to Cloud Run
gcloud run deploy yojnasathi-backend \
  --image gcr.io/PROJECT_ID/yojnasathi-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=$DATABASE_URL,JWT_SECRET=$JWT_SECRET
```

### Heroku Deployment

```bash
# Login
heroku login

# Create app
heroku create yojnasathi

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

---

## Database Setup

### PostgreSQL Migration from SQLite

```sql
-- Create PostgreSQL database
CREATE DATABASE yojnasathi;

-- Create user
CREATE USER yojnasathi_user WITH PASSWORD 'strong_password';
ALTER ROLE yojnasathi_user SET client_encoding TO 'utf8';
ALTER ROLE yojnasathi_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE yojnasathi_user SET default_transaction_deferrable TO ON;
GRANT ALL PRIVILEGES ON DATABASE yojnasathi TO yojnasathi_user;
```

### Run Migrations

```python
# Using SQLAlchemy Alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

# Or manually
python -c "from app.db.base import Base; Base.metadata.create_all()"
```

### Database Backups

```bash
# Automated daily backup (cron)
0 2 * * * pg_dump -h localhost -U yojnasathi_user yojnasathi | gzip > /backups/yojnasathi_$(date +\%Y\%m\%d).sql.gz

# Restore backup
gunzip < /backups/yojnasathi_20240115.sql.gz | psql -h localhost -U yojnasathi_user yojnasathi
```

---

## SSL/TLS Configuration

### Nginx Configuration (`nginx.conf`)

```nginx
upstream backend {
    server backend:8000;
}

server {
    listen 80;
    server_name yojnasathi.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yojnasathi.com;
    
    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yojnasathi.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yojnasathi.com/privkey.pem;
    
    # SSL protocols and ciphers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        
        # Cache busting for static assets
        location ~ ^/static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT, User-Agent, X-Requested-With, If-Modified-Since, Cache-Control, Content-Type, Range, Authorization' always;
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

### Let's Encrypt SSL Certificate

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yojnasathi.com -d www.yojnasathi.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Manual renewal
sudo certbot renew --dry-run
```

---

## Monitoring & Logging

### Application Monitoring

```python
# Backend logging (app/utils/logger.py)
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        return json.dumps(log_data)

# Configure logging
logger = logging.getLogger(__name__)
handler = logging.FileHandler('logs/app.log')
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
```

### Prometheus Metrics

```python
from prometheus_client import Counter, Histogram, Gauge
import time

# Metrics
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

active_connections = Gauge(
    'active_connections',
    'Active database connections'
)

# Use in routes
@app.post("/api/eligibility/check")
def check_eligibility(request: EligibilityCheckRequest):
    start_time = time.time()
    try:
        # ... business logic ...
        request_count.labels(
            method='POST',
            endpoint='/api/eligibility/check',
            status=200
        ).inc()
        return response
    except Exception as e:
        request_count.labels(
            method='POST',
            endpoint='/api/eligibility/check',
            status=500
        ).inc()
    finally:
        duration = time.time() - start_time
        request_duration.labels(
            method='POST',
            endpoint='/api/eligibility/check'
        ).observe(duration)
```

### ELK Stack (Elasticsearch, Logstash, Kibana)

```yaml
# docker-compose.yml addition
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
  environment:
    - xpack.security.enabled=false
  ports:
    - "9200:9200"

logstash:
  image: docker.elastic.co/logstash/logstash:8.0.0
  volumes:
    - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf:ro
  ports:
    - "5000:5000"

kibana:
  image: docker.elastic.co/kibana/kibana:8.0.0
  ports:
    - "5601:5601"
```

---

## Backup & Recovery

### Automated Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DB_NAME="yojnasathi"
DB_USER="yojnasathi_user"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump -h localhost -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Code backup
tar -czf $BACKUP_DIR/code_$DATE.tar.gz ./app ./ml

# ML models backup
tar -czf $BACKUP_DIR/models_$DATE.tar.gz ./ml/models

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://yojnasathi-backups/
aws s3 cp $BACKUP_DIR/code_$DATE.tar.gz s3://yojnasathi-backups/
aws s3 cp $BACKUP_DIR/models_$DATE.tar.gz s3://yojnasathi-backups/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete
```

### Cron Schedule

```bash
# Add to crontab
0 2 * * * /home/yojnasathi/backup.sh

# View crontab
crontab -l

# Edit crontab
crontab -e
```

### Disaster Recovery

```bash
# Restore database
psql -h localhost -U yojnasathi_user yojnasathi < backup_db.sql

# Restore application
tar -xzf backup_code.tar.gz

# Restore ML models
tar -xzf backup_models.tar.gz -C /app/ml/

# Restart services
docker-compose restart
```

---

## Performance Tuning

### Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_scheme_category ON schemes(category);
CREATE INDEX idx_eligibility_user_scheme ON eligibility_checks(user_id, scheme_id);

-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM schemes WHERE category = 'agriculture';

-- Vacuum and analyze
VACUUM ANALYZE;
```

### Backend Optimization

```python
# Connection pooling
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,
    pool_recycle=3600
)

# Async queries
async def get_schemes():
    async with get_async_session() as session:
        result = await session.execute(select(Scheme))
        return result.scalars().all()

# Caching
from functools import lru_cache
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

@cache_result(ttl=3600)
def get_scheme_details(scheme_id: int):
    # Expensive operation
    pass
```

### Frontend Optimization

```javascript
// Code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));

// Lazy loading images
<img loading="lazy" src="..." />

// Service worker for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}

// Bundle analysis
npm run build -- --analyze

// Optimize bundle
npm install --save-dev webpack-bundle-analyzer
```

---

## Troubleshooting

### Common Issues

#### 1. High Memory Usage

```bash
# Check memory
free -h
ps aux --sort=-%mem | head

# Solution: Increase swap, optimize queries, use pagination
```

#### 2. Slow API Responses

```bash
# Check slow queries
pg_stat_statements

# Add indexes
CREATE INDEX idx_scheme_searches ON schemes USING gin(name, description);

# Profile with py-spy
pip install py-spy
py-spy record -o profile.svg -- python -m uvicorn app.main:app
```

#### 3. Database Connection Issues

```bash
# Check connections
SELECT count(*) FROM pg_stat_activity;

# Kill idle connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' AND query_start < now() - interval '1 hour';
```

#### 4. SSL Certificate Errors

```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/yojnasathi.com/cert.pem -text -noout

# Renew certificate
certbot renew

# Force renewal
certbot renew --force-renewal
```

---

## Monitoring Checklist

- [ ] Application logs monitored
- [ ] Database performance tracked
- [ ] Server CPU/Memory monitored
- [ ] API response times tracked
- [ ] Error rates monitored
- [ ] User activity logged
- [ ] Security events logged
- [ ] Backups verified working
- [ ] SSL certificates scheduled for renewal
- [ ] Load testing completed

---

*Last Updated: January 2026*
*Version: 1.0*
