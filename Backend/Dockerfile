# Backend Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies first (use package-lock.json if present)
COPY package*.json ./
RUN npm ci --production

# Copy source
COPY . .

ENV NODE_ENV=production
EXPOSE 5050

CMD ["node", "server.js"]
