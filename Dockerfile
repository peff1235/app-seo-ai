FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# The command will be provided by smithery.yaml
# This is just a default command for local testing
CMD ["node", "src/mcp.js", "--mcp"]