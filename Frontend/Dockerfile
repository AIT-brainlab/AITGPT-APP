# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Accept build argument for API URL
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Node.js
FROM node:20-alpine

# Install serve globally for serving static files and wget for healthcheck
RUN npm install -g serve && \
    apk add --no-cache wget

# Set working directory
WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/build ./build

# Copy and set permissions for startup script
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

# Expose port 3000 (default for serve)
EXPOSE 3000

# Run startup script
CMD ["/startup.sh"]
