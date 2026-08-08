FROM node:20-alpine

WORKDIR /usr/src/app

# Instala dependencias con el lockfile exacto (más rápido y reproducible que npm install)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# El proceso corre como root: privkey.pem de Let's Encrypt solo lo puede leer
# root (permisos 640, dueño root:root) y este proceso lo lee directamente al
# arrancar (sin arquitectura de privilege-drop-after-bind). El proceso PM2
# actual en producción también corre como root, así que esto no es una
# regresión respecto al comportamiento de hoy.
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
