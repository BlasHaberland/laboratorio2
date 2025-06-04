const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { initConnection } = require('../database/connection');
const registroFormMiddleware = require('../middlewares/registro-form.middleware');
const loginFormMiddleware = require('../middlewares/login-form.middleware');
const autMiddleware = require('../middlewares/aut.middleware');

//REGISTRO DE USUARIO
router.post('/aut/registro', [registroFormMiddleware], async (req, res) => {
    try {
        const { nombre, apellido, email, clave, alias } = req.body;
        
        const db = await initConnection();

        // hashear la clave antes de guardarla
        const hashClave = bcrypt.hashSync(clave, 10);

        const [usuario] = await db.query(
            'INSERT INTO usuarios (nombre, apellido, email, clave, alias) VALUES (?, ?, ?, ?, ?)', [nombre, apellido, email, hashClave, alias]
        );

        res.status(201).json({
            mensaje: 'Usuario creado correctamente',
            usuario
        }); 
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({
            mensaje: 'Error al registrar el usuario',
            error: error.message
        }); 
    }
    
});

// LOGIN DE USUARIO
router.post('/aut/login', [loginFormMiddleware], async (req, res) => {
    try {
        const { alias, clave } = req.body;
    const db = await initConnection();

    const [usuario] = await db.query(
        'SELECT * FROM usuarios WHERE alias = ?', [alias]
    );
    
    if (usuario.length === 0) {
        return res.status(404).json({ mensaje: 'Usuario o clave incorrecto' });     
    }

    if (!bcrypt.compareSync(clave, usuario[0].clave)) { 
        return res.status(401).json({ mensaje: 'Usuario o clave incorrecto' }); // <- Compara la clave proporcionada con la clave hasheada almacenada
    }

    const firmaUsuario = { id: usuario[0].id_usuario, alias: usuario[0].alias, email: usuario[0].email };

    const usuarioData = jwt.sign(firmaUsuario, process.env.JWT_CLAVE);

    res.cookie('aut_cookie', usuarioData, { httpOnly: true })

    res.status(200).json({
        mensaje: 'LOGEADO'
    });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({
            mensaje: 'Error al iniciar sesión',
            error: error.message
        }); 
    }
})

// LOGOUT DE USUARIO
router.post('/aut/logout', (req, res) => {
    try {
        res.clearCookie('aut_cookie');
        res.status(200).json({ mensaje: 'Sesión cerrada correctamente'});
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).json({
            mensaje: 'Error al cerrar sesión',
            error: error.message
        });
    }
});


// EJEMPLO RUTA PROTEGIDA
router.get('/aut/protegido',[autMiddleware], (req, res) => { 
    res.status(200).json({
        mensaje: 'Ruta protegida, acceso permitido'
    });
})
module.exports = router;