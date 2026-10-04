FROM node:22-bookworm-slim AS web
WORKDIR /build/mobile
COPY mobile/package.json mobile/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY mobile/ ./
RUN npm run web:build

FROM python:3.12-slim
WORKDIR /app
COPY server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY server/src/ ./src/
COPY --from=web /build/mobile/dist-web/ ./web/
ENV HOST=0.0.0.0 PORT=8000 WEB_DIST_DIR=/app/web ENABLE_NATIVE_API=false
EXPOSE 8000
CMD ["python", "src/server.py"]
