# Vite React Production Dockerfile
# Multi-stage build for optimized image size

FROM docker.io/library/node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Production with nginx
FROM docker.io/library/nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA with static files support
RUN echo 'server { \
    listen 3000; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Static files first (robots.txt, sitemap.xml, manifest.json, sw.js) \
    location = /robots.txt { \
        try_files $uri =404; \
    } \
    location = /sitemap.xml { \
        try_files $uri =404; \
        add_header Content-Type "application/xml"; \
    } \
    location = /manifest.json { \
        try_files $uri =404; \
        add_header Content-Type "application/json"; \
    } \
    location = /sw.js { \
        try_files $uri =404; \
        add_header Content-Type "application/javascript"; \
        add_header Service-Worker-Allowed "/"; \
    } \
    \
    # Static assets with long cache \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|mp4|woff|woff2)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        try_files $uri =404; \
    } \
    \
    # SPA fallback - everything else \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
