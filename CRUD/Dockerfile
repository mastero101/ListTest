FROM node:20-alpine

WORKDIR /usr/src/app

# Instala dependencias para producción
COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e " \
        const useSsl = !!(process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH); \
        const client = require(useSsl ? 'https' : 'http'); \
        const port = process.env.PORT || 3000; \
        const req = client.get({ host: 'localhost', port, path: '/health', rejectUnauthorized: false }, res => process.exit(res.statusCode === 200 ? 0 : 1)); \
        req.on('error', () => process.exit(1)); \
    "

CMD ["node", "app3.js"]
