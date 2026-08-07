const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const https = require('https');
const fs = require('fs');

// Import the database connection from config/db.js
const sequelize = require('./config/db');

// Import routes
const componentRoutes = require('./routes/componentRoutes');
const userRoutes = require('./routes/userRoutes');
const configuracionRoutes = require('./routes/configuracionRoutes');

const port = process.env.PORT || 443;
const SSL_KEY_PATH = process.env.SSL_KEY_PATH;
const SSL_CERT_PATH = process.env.SSL_CERT_PATH;

const app = express();

// Conecta a la base de datos con reintentos: si la conexión inicial falla (DB
// aún no lista, red caída, etc.) no tira el proceso, reintenta con backoff fijo.
// Una vez que el pool de Sequelize queda configurado (ver config/db.js), las
// queries individuales también reintentan adquirir conexión por su cuenta,
// así que una caída pasajera de MySQL ya no requiere reiniciar el servidor.
async function connectWithRetry(retries = 10, delayMs = 5000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await sequelize.authenticate();
            console.log('Conexión a la base de datos establecida correctamente con Sequelize.');
            // Use { force: true } only in development to drop and re-create tables
            await sequelize.sync();
            console.log('Modelos sincronizados con la base de datos.');
            return;
        } catch (err) {
            console.error(`Intento ${attempt}/${retries} de conexión a la base de datos falló:`, err.message);
            if (attempt === retries) {
                console.error('No se pudo conectar a la base de datos tras varios intentos. El servidor seguirá corriendo.');
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
}

connectWithRetry();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization"); // Added Authorization
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Use the imported routes
app.use('/components', componentRoutes);
app.use('/users', userRoutes);
app.use('/configuraciones', configuracionRoutes);

const hasSslConfig = SSL_KEY_PATH && SSL_CERT_PATH && fs.existsSync(SSL_KEY_PATH) && fs.existsSync(SSL_CERT_PATH);

if (hasSslConfig) {
    const options = {
        key: fs.readFileSync(SSL_KEY_PATH),
        cert: fs.readFileSync(SSL_CERT_PATH),
    };
    https.createServer(options, app).listen(port, () => {
        console.log(`Servidor HTTPS escuchando en el puerto ${port}.`);
    });
} else {
    app.listen(port, () => {
        console.log(`Servidor HTTP escuchando en el puerto ${port}.`);
    });
}
