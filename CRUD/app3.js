const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const mysql = require('mysql');
const fs = require('fs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const mailersend_apikey = process.env.MAILERSEND_API
const port = process.env.PORT || 3000;

const app = express();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true'
};


const options = {
                    key: fs.readFileSync('/etc/letsencrypt/live/nodemysql12.duckdns.org-0004/privkey.pem'),
                    cert: fs.readFileSync('/etc/letsencrypt/live/nodemysql12.duckdns.org-0004/fullchain.pem')
                };

  

const connection = mysql.createConnection(dbConfig);

connection.connect((error) => {
    if (error) {
        console.error('Error al conectar con la base de datos:', error);
        return;
    }
    console.log('Conexión exitosa con la base de datos.');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

app.get('/', (req, res) => {
    connection.query('SELECT * FROM componentes', (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/usuarios/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM componentes WHERE id = ?', id, (error, results, fields) => {
      if (error) {
        console.error('Error al obtener datos de la base de datos:', error);
        res.status(500).send('Error al obtener datos de la base de datos.');
        return;
      }
      if (results.length === 0) {
        res.status(404).send('No se encontró ningún usuario con el ID proporcionado.');
        return;
      }
      res.send(results[0]);
    });
});

app.get('/modelo/:modelo', (req, res) => {
    const modelo = req.params.modelo;
    const query = 'SELECT * FROM componentes WHERE modelo LIKE ?';
    const searchTerm = `%${modelo}%`;
    connection.query(query, searchTerm, (error, results, fields) => {
      if (error) {
        console.error('Error al obtener datos de la base de datos:', error);
        res.status(500).send('Error al obtener datos de la base de datos.');
        return;
      }
      if (results.length === 0) {
        res.status(404).send('No se encontró ningún usuario con el ID proporcionado.');
        return;
      }
      res.send(results[0]);
    });
});

app.get('/procesadores', (req, res) => {
    connection.query("SELECT modelo, precio, tienda, url, img, consumo, socket FROM componentes WHERE tipo = 'procesador'", (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/motherboards', (req, res) => {
    connection.query("SELECT modelo, precio, tienda, url, consumo, socket, img, rams FROM componentes WHERE tipo = 'motherboard'", (error, results, fields) => { 
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/rams', (req, res) => {
    connection.query("SELECT modelo, precio, tienda, url, img, consumo, rams FROM componentes WHERE tipo = 'ram'", (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/almacenamientos', (req, res) => {
    connection.query("SELECT modelo, precio, tienda, url, img, consumo FROM componentes WHERE tipo = 'almacenamiento'", (error, results, fields) => { 
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/disipadores', (req, res) => {
    connection.query("SELECT modelo, precio, tienda, url, img, consumo FROM componentes WHERE tipo = 'disipador'", (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/fuentes', (req, res) => {
    connection.query("SELECT modelo, precio, tienda, url, consumo, img, potencia FROM componentes WHERE tipo = 'psu'", (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/graficas', (req, res) => {
    connection.query("SELECT modelo, precio, tienda, url, img, consumo FROM componentes WHERE tipo = 'gpu'", (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});


app.get('/gabinetes', (req, res) => {
    connection.query("SELECT modelo, precio, tienda, url, img, consumo FROM componentes WHERE tipo = 'gabinete'", (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/usuarios', (req, res) => {
    const sql = 'SELECT id,nombre,id_usuario, telefono, direccion, img FROM usuarios';

    connection.query(sql, (error, results) => {
        if (error) throw error;
        if (results.length > 0) {
            res.json(results);
        } else {
            res.send('No results');
        }
    });
});

app.post('/', (req, res) => {
    const data = req.body;
    connection.query('INSERT INTO componentes SET ?', data, (error, results, fields) => {
        if (error) {
            console.error('Error al insertar datos en la base de datos:', error);
            res.status(500).send('Error al insertar datos en la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.post('/auth', function(request, response) {
    // Capture the input fields
    let id_usuario = request.body.id_usuario;
    let password = request.body.password;
    // Ensure the input fields exist and are not empty
    if (id_usuario && password) {
        // Execute SQL query that'll select the account from the database based on the specified username
        connection.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id_usuario], async function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                // Get the stored hashed password
                const hashedPassword = results[0].password;
                // Compare the hashed password with the provided password
                const match = await bcrypt.compare(password, hashedPassword);
                if (match) {
                    // Passwords match, generate JWT token
                    const token = jwt.sign({ id_usuario }, jwtSecret, { expiresIn: '1h' }); // Expira en 1 hora
                    // Respond with token
                    response.status(200).json({ message: 'Login successful', token });
                    console.log("Login successful");
                } else {
                    // Passwords don't match
                    response.status(401).json({ message: 'Incorrect Username and/or Password!' });
                }
            } else {
                // Account not found
                response.status(401).json({ message: 'Incorrect Username and/or Password!' });
            }
            response.end();
        });
    } else {
        // Username or password not provided
        response.status(400).json({ message: 'Please enter Username and Password!' });
        response.end();
    }
});

app.post('/registro_usuario', async (req, res) => {
    const { nombre, img, id_usuario, direccion, telefono, password, correo } = req.body;

    // Verifica si todos los campos requeridos están presentes
    if (!nombre || !img || !id_usuario || !direccion || !telefono || !password || !correo) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Verifica que los campos cumplan con ciertas restricciones (opcional)
    if (nombre.length > 255 || img.length > 255 || id_usuario.length > 255 || direccion.length > 255 || telefono.length > 255 || password.length > 255 || correo.length > 255) {
        return res.status(400).json({ message: 'Los campos exceden la longitud máxima permitida (255 caracteres).' });
    }

    try {
        // Verificar si ya existe un usuario con el mismo id_usuario
        const existingUser = await new Promise((resolve, reject) => {
            connection.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id_usuario], function(error, results, fields) {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            });
        });

        if (existingUser) {
            // Si ya existe un usuario con el mismo id_usuario, devolver un mensaje indicando que el usuario ya está registrado
            return res.status(409).json({ message: 'Ya existe un usuario con el mismo ID de usuario.' });
        }

        const saltRounds = Number(process.env.SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, saltRounds); // 10 es el número de saltRounds
        const usuario = {
            nombre: nombre,
            img: img,
            id_usuario: id_usuario,
            direccion: direccion,
            telefono: telefono,
            password: hashedPassword,
            correo: correo
        };

        const sql = 'INSERT INTO usuarios SET ?';
        connection.query(sql, usuario, error => {
            if (error) {
                console.error('Error al registrar el usuario:', error);
                res.status(500).json({ message: 'Error al registrar el usuario.' });
            } else {
                res.status(201).json({ message: 'Usuario creado exitosamente.' });
            }
        });
    } catch (error) {
        console.error('Error al encriptar la contraseña:', error);
        res.status(500).json({ message: 'Error al encriptar la contraseña.' });
    }
});

app.post('/send_email', (req, res) => {
    const { id_usuario, password, telefono, correo } = req.body;
  
    const emailData = {
      from: {
        email: "info@trial-zr6ke4n8vmy4on12.mlsender.net"
      },
      to: [
        {
          email: correo
        }
      ],
      subject: "Confirmación de accesos Cotizador Cloud",
      text: `Se le hacen llegar sus credenciales de acceso a la aplicacion\n
             ID Usuario: ${id_usuario}\nContraseña: ${password}\nTeléfono: ${telefono}`,
      html: `<p>Se le hacen llegar sus credenciales de acceso a la aplicacion</p>
             <p>ID Usuario: ${id_usuario}</p><p>Contraseña: ${password}</p><p>Teléfono: ${telefono}</p>`
    };
  
    axios.post('https://api.mailersend.com/v1/email', emailData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mailersend_apikey}` 
      }
    })
    .then(response => {
      console.log('Correo electrónico enviado', response.data);
      res.status(200).send('Correo electrónico enviado correctamente.');
    })
    .catch(error => {
      console.error('Error al enviar el correo electrónico:', error);
      res.status(500).send('Error al enviar el correo electrónico.');
    });
  });

app.post('/guardar-configuracion', (req, res) => {
    const config = req.body;

    connection.query('INSERT INTO configuraciones SET ?', { jsonConfig: JSON.stringify(config) }, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error interno del servidor');
            return;
        }

        const configId = results.insertId; // Obtiene el ID asignado a la nueva configuración
        const configUrl = `https://cotizador.cloud/builds/${configId}`; // Construye la URL con el ID

        res.status(200).json({ message: 'Configuración guardada con éxito', url: configUrl });
    });
});

app.get('/recuperar-configuracion/:id', (req, res) => {
    const configId = req.params.id;

    connection.query('SELECT jsonConfig, fechaHora FROM configuraciones WHERE id = ?', configId, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error interno del servidor');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Configuración no encontrada');
            return;
        }

        const configData = JSON.parse(results[0].jsonConfig);
        const fechaHora = results[0].fechaHora;
        res.status(200).json({ configData, fechaHora });
    });
});

app.put('/:id', (req, res) => {
    const id = req.params.id;
    const data = req.body;
    connection.query('UPDATE componentes SET ? WHERE id = ?', [data, id], (error, results, fields) => {
        if (error) {
            console.error('Error al actualizar datos en la base de datos:', error);
            res.status(500).send('Error al actualizar datos en la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.delete('/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM componentes WHERE id = ?', id, (error, results, fields) => {
        if (error) {
            console.error('Error al eliminar datos de la base de datos:', error);
            res.status(500).send('Error al eliminar datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});


https.createServer(options, app).listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}.`);
});

/*
http.createServer(app).listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}.`);
});
*/
