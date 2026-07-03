# Use your specific Node version on lightweight Alpine Linux
FROM node:26.4.0-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy ONLY package files first to leverage Docker's layer caching
COPY package*.json ./

# Install dependencies using ci (clean install) for deterministic builds
RUN npm ci

# Copy the rest of your backend code into the container
COPY . .

# Expose port 5000 exactly as configured in your environment
EXPOSE 5000

# Start the application using your standard npm script
CMD ["npm", "start"]