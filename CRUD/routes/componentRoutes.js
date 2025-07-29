const express = require('express');
const router = express.Router();
const componentController = require('../controllers/componentController');

// Rutas para componentes
router.get('/', componentController.getAllComponents);
router.get('/modelo/:modelo', componentController.getComponentsByModel);
router.get('/tipo/:tipo', componentController.getComponentsByType);
router.get('/:id', componentController.getComponentById);
router.post('/', componentController.createComponent);
router.put('/:id', componentController.updateComponent);
router.delete('/:id', componentController.deleteComponent);

module.exports = router;