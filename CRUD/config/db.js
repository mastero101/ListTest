const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        dialectOptions: {
            ssl: process.env.DB_SSL === 'true' ? {
                require: true,
                rejectUnauthorized: false // Adjust as needed for production
            } : false
        },
        logging: false // Set to true to see SQL queries in console
    }
);

sequelize.authenticate()
    .then(() => {
        console.log('Conexión exitosa con la base de datos (Sequelize).');
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos (Sequelize):', err);
    });

module.exports = sequelize;