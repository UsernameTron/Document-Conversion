FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Build application
RUN npm run build

# Expose ports for the application
EXPOSE 3000 3333

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start:prod"]