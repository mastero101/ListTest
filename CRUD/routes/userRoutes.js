const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const userController = require('../controllers/userController');

// Limita intentos de login/registro por IP para dificultar fuerza bruta y spam de cuentas.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Demasiados intentos. Intenta de nuevo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rutas para usuarios
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/register', authLimiter, userController.registerUser);
router.post('/auth', authLimiter, userController.authenticateUser);

module.exports = router;