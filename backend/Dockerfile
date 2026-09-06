FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Install deps first for better layer caching
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', r => process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Run as a non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

CMD ["node", "src/server.js"]
