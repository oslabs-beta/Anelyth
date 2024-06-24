# Use an official Node.js runtime as a parent image
FROM node:current-alpine3.19

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install TypeScript globally (if needed)
RUN npm install -g typescript

# Copy the rest of the application code
COPY . .

# Build the React app (if you serve it statically from the Node server)
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Node.js app
CMD ["node", "src/Server/server.mjs"]

