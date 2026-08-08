const express = require('express');
const router = express.Router();
const componentController = require('../controllers/componentController');
const verifyToken = require('../middleware/verifyToken');

// Rutas para componentes
router.get('/', componentController.getAllComponents);
router.get('/modelo/:modelo', componentController.getComponentsByModel);
router.get('/tipo/:tipo', componentController.getComponentsByType);
router.get('/:id', componentController.getComponentById);
router.post('/', verifyToken, componentController.createComponent);
router.put('/:id', verifyToken, componentController.updateComponent);
router.delete('/:id', verifyToken, componentController.deleteComponent);

module.exports = router;