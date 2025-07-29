const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const dotenv = require('dotenv');

// Import the database connection from config/db.js
const sequelize = require('./config/db');

// Import routes
const componentRoutes = require('./routes/componentRoutes');
const userRoutes = require('./routes/userRoutes');
const configuracionRoutes = require('./routes/configuracionRoutes');

dotenv.config();

const port = process.env.PORT || 443;

const app = express();

const options = {
                    key: fs.readFileSync('/etc/letsencrypt/live/nodemysql12.duckdns.org-0004/privkey.pem'),
                    cert: fs.readFileSync('/etc/letsencrypt/live/nodemysql12.duckdns.org-0004/fullchain.pem')
                };

                

// Test DB connection and sync models
sequelize.authenticate()
    .then(() => {
        console.log('Conexión a la base de datos establecida correctamente con Sequelize.');
        // Sync models with the database (creates tables if they don't exist)
        // Use { force: true } only in development to drop and re-create tables
        return sequelize.sync();
    })
    .then(() => {
        console.log('Modelos sincronizados con la base de datos.');
    })
    .catch(err => {
        console.error('Error al conectar o sincronizar con la base de datos:', err);
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization"); // Added Authorization
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

// Use the imported routes
app.use('/components', componentRoutes);
app.use('/users', userRoutes);
app.use('/configuraciones', configuracionRoutes);

https.createServer(options, app).listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}.`);
});

/*
http.createServer(app).listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}.`);
});
*/
