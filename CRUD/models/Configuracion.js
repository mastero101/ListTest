const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Asegúrate de que esta ruta sea correcta

const Configuracion = sequelize.define('Configuracion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  jsonConfig: {
    type: DataTypes.TEXT, // Usamos TEXT para 'longtext'
    allowNull: true
  },
  fechaHora: {
    type: DataTypes.DATE, // Usamos DATE para 'timestamp'
    allowNull: true
  }
}, {
  tableName: 'configuraciones',
  timestamps: false, 
});

module.exports = Configuracion;