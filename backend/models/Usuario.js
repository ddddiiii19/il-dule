const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define(
  'Usuario',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre es requerido' },
        len: { args: [2, 100], msg: 'El nombre debe tener entre 2 y 100 caracteres' },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: { name: 'unique_email', msg: 'Este correo ya está registrado' },
      validate: {
        isEmail: { msg: 'Formato de correo inválido' },
        notEmpty: { msg: 'El email es requerido' },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La contraseña es requerida' },
      },
    },
    avatar_inicial: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'usuarios',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: (usuario) => {
        if (usuario.nombre) {
          usuario.avatar_inicial = usuario.nombre.charAt(0).toUpperCase();
        }
      },
    },
  }
);

module.exports = Usuario;
