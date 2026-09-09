FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Install exact dependencies from package-lock.json
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY src ./src

ENV NODE_ENV=production

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', r => process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

USER app

CMD ["node", "src/server.js"]