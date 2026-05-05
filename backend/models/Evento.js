const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Usuario = require('./Usuario');

const Evento = sequelize.define(
  'Evento',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El título es requerido' },
        len: { args: [1, 200], msg: 'El título no puede superar 200 caracteres' },
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tipo: {
      type: DataTypes.ENUM('tarea', 'clase', 'proyecto', 'examen', 'actividad', 'otro'),
      defaultValue: 'tarea',
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_limite: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    prioridad: {
      type: DataTypes.ENUM('alta', 'media', 'baja'),
      defaultValue: 'media',
    },
    completado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '#8B7EC8',
    },
    todo_el_dia: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    recordatorio_minutos: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30,
      comment: 'Minutos antes del evento para el recordatorio',
    },
  },
  {
    tableName: 'eventos',
    timestamps: true,
    underscored: true,
  }
);

// Associations
Usuario.hasMany(Evento, { foreignKey: 'usuario_id', as: 'eventos', onDelete: 'CASCADE' });
Evento.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = Evento;
