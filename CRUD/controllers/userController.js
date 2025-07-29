const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

const userController = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll({
                attributes: ['id', 'nombre', 'id_usuario', 'telefono', 'direccion', 'img']
            });
            res.status(200).json(users);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
        }
    },

    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id, {
                attributes: ['id', 'nombre', 'id_usuario', 'telefono', 'direccion', 'img']
            });
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado.' });
            }
            res.status(200).json(user);
        } catch (error) {
            console.error('Error al obtener usuario por ID:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener usuario.' });
        }
    },

    registerUser: async (req, res) => {
        const { nombre, img, id_usuario, direccion, telefono, password, correo } = req.body;

        if (!nombre || !img || !id_usuario || !direccion || !telefono || !password || !correo) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }

        try {
            const existingUser = await User.findOne({ where: { id_usuario } });
            if (existingUser) {
                return res.status(409).json({ message: 'Ya existe un usuario con el mismo ID de usuario.' });
            }

            const saltRounds = Number(process.env.SALT_ROUNDS);
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newUser = await User.create({
                nombre,
                img,
                id_usuario,
                direccion,
                telefono,
                password: hashedPassword,
                correo
            });

            res.status(201).json({ message: 'Usuario creado exitosamente.', user: newUser });
        } catch (error) {
            console.error('Error al registrar el usuario:', error);
            res.status(500).json({ message: 'Error interno del servidor al registrar el usuario.' });
        }
    },

    authenticateUser: async (req, res) => {
        const { id_usuario, password } = req.body;

        console.log('Intento de autenticación para usuario:', id_usuario); // Agrega esta línea

        if (!id_usuario || !password) {
            console.log('Faltan credenciales: id_usuario o password.'); // Agrega esta línea
            return res.status(400).json({ message: 'Por favor, ingrese usuario y contraseña.' });
        }

        try {
            const user = await User.findOne({ where: { id_usuario } });

            if (!user) {
                console.log('Usuario no encontrado en la base de datos:', id_usuario); // Agrega esta línea
                return res.status(401).json({ message: 'Usuario y/o contraseña incorrectos.' });
            }

            console.log('Usuario encontrado. Comparando contraseñas...'); // Agrega esta línea
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                console.log('Contraseña coincide. Generando token para:', id_usuario); // Agrega esta línea
                const token = jwt.sign({ id_usuario: user.id_usuario }, jwtSecret, { expiresIn: '1h' });
                return res.status(200).json({ message: 'Login exitoso', token });
            } else {
                console.log('Contraseña no coincide para el usuario:', id_usuario); // Agrega esta línea
                return res.status(401).json({ message: 'Usuario y/o contraseña incorrectos.' });
            }
        } catch (error) {
            console.error('Error en la autenticación (catch block):', error); // Modifica esta línea
            res.status(500).json({ message: 'Error interno del servidor en la autenticación.' });
        }
    }
};

module.exports = userController;