FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

# PORT is set via docker-compose environment (7001, 7002, 7003)
ENV NODE_ENV=production

CMD ["node", "server.js"]
