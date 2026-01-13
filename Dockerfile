# Vite React Production Dockerfile
# Multi-stage build for optimized image size

FROM docker.io/library/node:20-alpine AS builder
WORKDIR /app

ARG NPM_TOKEN
RUN echo "@codeblabdev-max:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc

COPY package.json package-lock.json* ./
RUN npm ci && rm -f .npmrc

COPY . .
RUN npm run build

# Production with nginx
FROM docker.io/library/nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
