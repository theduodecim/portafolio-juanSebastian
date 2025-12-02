---
id: docker-devops-snippets
title: Docker & DevOps — Patrones Modernos & Snippets Reutilizables
---

# Docker & DevOps — Patrones Modernos & Snippets Reutilizables

Esta sección reúne configuraciones prácticas de Docker, Docker Compose, CI/CD con GitHub Actions, Nginx reverse proxy y estrategias de deployment en producción.

---

## 🐳 Dockerfiles Optimizados

### Node.js + TypeScript (Multi-stage Build)

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Angular/React (Production Build)

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Next.js Standalone

```dockerfile
FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

### API REST + Database Connection

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
  CMD node healthcheck.js

EXPOSE 3000

CMD ["node", "server.js"]
```

---

## 🐙 Docker Compose Completo

### Stack Full (Frontend + Backend + DB + Nginx)

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: app_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: app_redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - app_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: app_backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/myapp
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app_network
    volumes:
      - ./backend/uploads:/app/uploads
    expose:
      - "3000"

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: ${API_URL}
    container_name: app_frontend
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - app_network
    expose:
      - "3000"

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: app_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - backend
      - frontend
    networks:
      - app_network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  app_network:
    driver: bridge
```

### Development con Hot Reload

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: dev_backend
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://dev:dev123@postgres:5432/devdb
    ports:
      - "3001:3000"
    command: npm run dev
    networks:
      - dev_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: dev_frontend
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    ports:
      - "3000:3000"
    command: npm run dev
    networks:
      - dev_network

  postgres:
    image: postgres:16-alpine
    container_name: dev_postgres
    environment:
      POSTGRES_DB: devdb
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev123
    ports:
      - "5432:5432"
    volumes:
      - dev_postgres_data:/var/lib/postgresql/data
    networks:
      - dev_network

volumes:
  dev_postgres_data:

networks:
  dev_network:
    driver: bridge
```

---

## 🔧 Nginx Configurations

### Reverse Proxy con SSL

```nginx
# /etc/nginx/nginx.conf

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

    # Upstream backends
    upstream backend_api {
        least_conn;
        server backend:3000 max_fails=3 fail_timeout=30s;
    }

    upstream frontend_app {
        least_conn;
        server frontend:3000 max_fails=3 fail_timeout=30s;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name example.com www.example.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name example.com www.example.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security Headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # API Routes
        location /api {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://backend_api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # WebSocket Support
        location /ws {
            proxy_pass http://backend_api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Static files with caching
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
            proxy_pass http://frontend_app;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Frontend App
        location / {
            limit_req zone=general_limit burst=50 nodelay;
            
            proxy_pass http://frontend_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Load Balancer con Health Checks

```nginx
upstream backend_cluster {
    least_conn;
    
    server backend1:3000 max_fails=3 fail_timeout=30s;
    server backend2:3000 max_fails=3 fail_timeout=30s;
    server backend3:3000 max_fails=3 fail_timeout=30s;
    
    keepalive 32;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # Health check
        proxy_next_upstream error timeout http_500 http_502 http_503;
    }
}
```

---

## 🚀 GitHub Actions CI/CD

### Build, Test & Deploy to Production

```yaml
# .github/workflows/deploy.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Test Job
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  # Build and Push Docker Image
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha,prefix={{branch}}-

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Deploy to Production
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/myapp
            docker-compose pull
            docker-compose up -d --remove-orphans
            docker image prune -f

      - name: Health check
        run: |
          sleep 30
          curl -f https://myapp.com/health || exit 1

      - name: Notify deployment
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "✅ Deployment successful to production",
              fields: [
                {
                  title: "Commit",
                  value: "${{ github.sha }}",
                  short: true
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Multi-Environment Deploy

```yaml
name: Multi-Environment Deploy

on:
  push:
    branches: [main, staging, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Determine environment
        id: env
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            echo "environment=production" >> $GITHUB_OUTPUT
            echo "url=https://app.example.com" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == "refs/heads/staging" ]]; then
            echo "environment=staging" >> $GITHUB_OUTPUT
            echo "url=https://staging.example.com" >> $GITHUB_OUTPUT
          else
            echo "environment=development" >> $GITHUB_OUTPUT
            echo "url=https://dev.example.com" >> $GITHUB_OUTPUT
          fi

      - name: Deploy to ${{ steps.env.outputs.environment }}
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets[format('SERVER_HOST_{0}', steps.env.outputs.environment)] }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/${{ steps.env.outputs.environment }}
            git pull origin ${{ github.ref_name }}
            docker-compose -f docker-compose.${{ steps.env.outputs.environment }}.yml up -d
            
      - name: Verify deployment
        run: |
          sleep 20
          curl -f ${{ steps.env.outputs.url }}/health || exit 1
```

---

## 📦 Docker Utilities

### Docker Compose Commands Útiles

```bash
# Build sin cache
docker-compose build --no-cache

# Ver logs de un servicio específico
docker-compose logs -f backend

# Ejecutar comando en contenedor
docker-compose exec backend npm run migrate

# Escalar servicio
docker-compose up -d --scale backend=3

# Ver recursos usados
docker stats

# Limpiar todo (cuidado en producción)
docker system prune -a --volumes
```

### Healthcheck Script (Node.js)

```javascript
// healthcheck.js
const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log('ERROR:', err);
  process.exit(1);
});

request.end();
```

### Entrypoint Script

```bash
#!/bin/sh
# entrypoint.sh

set -e

echo "🚀 Starting application..."

# Wait for database
echo "⏳ Waiting for database..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "✅ Database is ready"

# Run migrations
echo "🔄 Running migrations..."
npm run migrate

# Start application
echo "✅ Starting server..."
exec "$@"
```

---

## 🔐 Secrets Management

### .env.example

```bash
# Database
DB_USER=myuser
DB_PASSWORD=securepassword
DB_NAME=myapp
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# API Keys
API_KEY=your-api-key
STRIPE_SECRET_KEY=sk_test_xxx

# Frontend
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://api.example.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 🎯 Best Practices

1. **Multi-stage builds** para imágenes pequeñas
2. **Non-root users** en contenedores para seguridad
3. **Health checks** en todos los servicios críticos
4. **Volumes** para persistencia de datos
5. **Networks** aisladas por stack
6. **Environment variables** nunca hardcodeadas
7. **Logs** centralizados y rotativos
8. **Backup** automatizado de volúmenes
9. **CI/CD** con tests antes de deploy
10. **Monitoring** con health endpoints

---

## 📚 Recursos

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Nginx Documentation](https://nginx.org/en/docs/)