const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Usuario = require('./Usuario');

const PerfilAprendizaje = sequelize.define(
  'PerfilAprendizaje',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'usuarios', key: 'id' },
    },
    estilo_predominante: {
      type: DataTypes.ENUM('visual', 'auditivo', 'kinestesico', 'lectura_escritura'),
      allowNull: false,
    },
    // VARK scores
    puntaje_visual: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    puntaje_auditivo: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    puntaje_kinestesico: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    puntaje_lectura: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Habits
    horas_estudio_diarias: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    nivel_procrastinacion: {
      type: DataTypes.ENUM('bajo', 'medio', 'alto'),
      allowNull: true,
    },
    metodos_preferidos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    respuestas_raw: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Respuestas completas de la encuesta en JSON',
    },
    completado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'perfiles_aprendizaje',
    timestamps: true,
    underscored: true,
  }
);

// Associations
Usuario.hasOne(PerfilAprendizaje, {
  foreignKey: 'usuario_id',
  as: 'perfil',
  onDelete: 'CASCADE',
});
PerfilAprendizaje.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = PerfilAprendizaje;
