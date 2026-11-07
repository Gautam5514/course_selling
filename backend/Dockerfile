# Production image for the API. Build from the repo root:
#   docker build -t course-api ./backend
#   docker run -p 5001:5001 --env-file backend/.env course-api
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies from the lockfile (reproducible builds).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

# Uploads only matter when Cloudinary is not configured.
RUN mkdir -p uploads && chown -R node:node /app
USER node

EXPOSE 5001
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
