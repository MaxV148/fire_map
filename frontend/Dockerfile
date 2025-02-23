# Use the official Node.js base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock first to leverage Docker caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the project files
COPY . .

# Expose the development port (Vite uses 5173 by default)
EXPOSE 5173

# Start Vite development server
CMD ["yarn", "run", "dev", "--host"]
