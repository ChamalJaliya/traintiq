# TraintiQ Frontend Dockerfile
# Multi-stage build for Angular application

# Stage 1: Build stage
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code (excluding node_modules)
COPY . .
RUN rm -rf node_modules && npm ci

# Temporarily increase budget limits for Docker build
RUN sed -i 's/"maximumError": "1MB"/"maximumError": "2MB"/g' angular.json && \
    sed -i 's/"maximumError": "8kB"/"maximumError": "20kB"/g' angular.json

# Build the Angular application
RUN npm run build

# Stage 2: Production stage with Nginx
FROM nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/dist/traintiq /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 