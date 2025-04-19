# Use Node.js LTS as base image
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built frontend from build stage
COPY --from=build /app/dist ./dist

# Copy backend code
COPY --from=build /app/backend ./backend

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "backend/index.js"]
