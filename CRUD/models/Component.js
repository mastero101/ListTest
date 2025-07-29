const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Asegúrate de que esta ruta sea correcta

const Component = sequelize.define('Component', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {
    type: DataTypes.STRING(250),
    allowNull: true // Asumiendo que puede ser nulo si no se especifica en la imagen
  },
  modelo: {
    type: DataTypes.STRING(250),
    allowNull: true // Asumiendo que puede ser nulo
  },
  precio: {
    type: DataTypes.INTEGER,
    allowNull: true // Asumiendo que puede ser nulo
  },
  tienda: {
    type: DataTypes.STRING(250),
    allowNull: true // Asumiendo que puede ser nulo
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: true // Asumiendo que puede ser nulo
  },
  consumo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  socket: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  rams: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  potencia: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  img: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'componentes',
  timestamps: false // Según la imagen, no hay columnas createdAt y updatedAt
});

module.exports = Component;