# Stage 1: Build the application
FROM node:lts-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code to the working directory
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Run the application
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Reinstall production dependencies
COPY --from=builder /app/node_modules ./node_modules
RUN npm install
RUN npm ci --only=production

# Expose the port the app runs on
EXPOSE ${PORT:-3000}

# Set the environment to production
ENV NODE_ENV=development

# Define the command to run the app
CMD ["node", "dist/main.js"]
