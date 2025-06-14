# Use the official Node.js base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock first to leverage Docker caching
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install

# Create necessary directories for volume mounting
RUN mkdir -p src app public

# Expose the development port (Vite uses 5173 by default)
EXPOSE 5173

# Start Vite development server with proper host binding
CMD ["yarn", "run", "dev", "--host", "0.0.0.0"]
