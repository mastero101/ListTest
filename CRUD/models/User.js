const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Asegúrate de que esta ruta sea correcta

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: true // Asumiendo que puede ser nulo
  },
  img: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  id_usuario: {
    type: DataTypes.STRING(255),
    allowNull: true // Asumiendo que puede ser nulo
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true // Asumiendo que puede ser nulo
  },
  correo: {
    type: DataTypes.STRING(255),
    allowNull: true // Asumiendo que puede ser nulo
  }
}, {
  tableName: 'usuarios',
  timestamps: false // Según la imagen, no hay columnas createdAt y updatedAt
});

module.exports = User;