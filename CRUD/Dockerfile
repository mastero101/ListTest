FROM node:20-alpine

WORKDIR /usr/src/app

# Instala dependencias con el lockfile exacto (más rápido y reproducible que npm install)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# bcrypt requiere compilar un binario nativo; correr como root solo durante el build
# y bajar de privilegios para ejecutar la app.
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /usr/src/app
USER app

EXPOSE 443

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e " \
        const useSsl = !!(process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH); \
        const client = require(useSsl ? 'https' : 'http'); \
        const port = process.env.PORT || 443; \
        const req = client.get({ host: 'localhost', port, path: '/health', rejectUnauthorized: false }, res => process.exit(res.statusCode === 200 ? 0 : 1)); \
        req.on('error', () => process.exit(1)); \
    "

CMD ["node", "app3.js"]
