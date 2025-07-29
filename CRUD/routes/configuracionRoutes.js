const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');

// Rutas para configuraciones
router.post('/', configuracionController.guardarConfiguracion);
router.get('/:id', configuracionController.recuperarConfiguracion);
router.put('/:id', configuracionController.updateConfiguracion);

module.exports = router;