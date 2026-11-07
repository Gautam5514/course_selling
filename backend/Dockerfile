FROM node:20-alpine

WORKDIR /app

# Install dependencies (production only).
COPY package.json ./
RUN npm install --omit=dev

# Copy source.
COPY src ./src

ENV NODE_ENV=production
EXPOSE 5001

CMD ["node", "src/server.js"]
