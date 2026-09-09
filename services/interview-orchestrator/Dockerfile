# ==============================================================================
# Edworld Co — Containerized Interview Pipeline Orchestrator
# Base: Node.js 20 LTS (Slim)
# ==============================================================================

FROM node:20-slim AS base

RUN groupadd -r orchestrator && useradd -r -g orchestrator orchestrator \
    && mkdir -p /home/orchestrator \
    && chown -R orchestrator:orchestrator /home/orchestrator

WORKDIR /usr/src/app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src/ ./src/
RUN npx tsc

RUN chown -R orchestrator:orchestrator /usr/src/app
USER orchestrator

ENV NODE_ENV=production \
    PORT=8081

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8081/healthz', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); });"

CMD ["node", "dist/server.js"]
