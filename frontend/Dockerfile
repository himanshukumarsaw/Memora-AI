# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Nginx web server
FROM nginx:alpine

# Copy built dist assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx SPA fallback configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
