const express = require('express');
const { body } = require('express-validator');
const {
  getEventos,
  getEvento,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  toggleCompletado,
} = require('../controllers/eventosController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

const eventoValidation = [
  body('titulo').trim().notEmpty().withMessage('El título es requerido').isLength({ max: 200 }).withMessage('Máximo 200 caracteres'),
  body('fecha_inicio').isISO8601().withMessage('Fecha de inicio inválida'),
  body('prioridad').optional().isIn(['alta', 'media', 'baja']).withMessage('Prioridad inválida'),
  body('tipo').optional().isIn(['tarea', 'clase', 'proyecto', 'examen', 'actividad', 'otro']).withMessage('Tipo inválido'),
];

router.get('/', getEventos);
router.get('/:id', getEvento);
router.post('/', eventoValidation, crearEvento);
router.put('/:id', eventoValidation, actualizarEvento);
router.delete('/:id', eliminarEvento);
router.patch('/:id/complete', toggleCompletado);

module.exports = router;
