const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { initConnection } = require('../database/connection');
const autMiddleware = require('../middlewares/aut.middleware');
const perfilFormMiddleware = require('../middlewares/perfil-form.middleware');
const claveFormMiddleware = require('../middlewares/clave-form.middleware');


// MOSTRAR PERFIL DEL USUARIO 
router.get('/usuarios/mi-perfil',[autMiddleware], async (req, res) => { 
    try {
        const id_usuario = req.usuario.id;  
        const db = await initConnection();

        const [usuario] = await db.query(
            'SELECT id_usuario, nombre, apellido, email, alias, imagen_perfil, intereses, antecedentes FROM usuarios WHERE id_usuario = ?', [id_usuario]
        );

        res.status(200).json({
            mensaje: 'Perfil obtenido correctamente',
            usuario: usuario
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el perfil del usuario',
            error: error.message
        });
    }
})

// BUSCAR USUARIOS

router.get('/usuarios/buscar', [], async (req, res) => {
    try {
        const {query} = req.query
        const db = await initConnection();  

        const [usuarios] = await db.query(
            'SELECT id_usuario, nombre, apellido, email, alias, imagen_perfil FROM usuarios WHERE nombre LIKE ? OR apellido LIKE ? OR alias LIKE ? OR email LIKE ?', 
            [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
        );

        res.status(200).json({
            mensaje: 'Usuarios encontrados',
            usuarios: usuarios
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar usuarios',
            error: error.message
        }); 
    }
 })


// ACTUALIZAR PERFIL DEL USUARIO
router.put('/usuarios/mi-perfil', [autMiddleware, perfilFormMiddleware], async (req, res) => {
    try {
        const id_usuario = req.usuario.id
        const { nombre, apellido, email, alias, intereses, antecedentes } = req.body;
        const db = await initConnection();

        await db.query(
            'UPDATE usuarios SET nombre = COALESCE(?,nombre), apellido = COALESCE(?,apellido), email = COALESCE(?,email), alias = COALESCE(?,alias), intereses = COALESCE(?,intereses), antecedentes = COALESCE(?,antecedentes) WHERE id_usuario = ?', [nombre, apellido, email, alias, intereses, antecedentes, id_usuario]
       )

        res.status(200).json({
            mensaje: 'Usuario modificado exitosamente',
       })
        
    } catch (error) {
        res.status(500).json({
            mensaje: 'No se pudo actualizar el usuario',
            error: error.message
        })
    }
})

//ACTUALIZAR CLAVE DEL USUARIO 
router.put('/usuarios/mi-perfil/clave', [autMiddleware, claveFormMiddleware], async (req, res) => { 
    try {
        const id_usuario = req.usuario.id;
        const { clave_actual, clave_nueva } = req.body;
        const db = await initConnection();

        const [usuario] = await db.query(
            'SELECT clave FROM usuarios WHERE id_usuario = ?', [id_usuario]
        )

        if(!usuario.length || !bcrypt.compareSync(clave_actual, usuario[0].clave)) {
            return res.status(401).json({
                mensaje: 'Clave actual incorrecta'
            });
        }

        const hashClave = bcrypt.hashSync(clave_nueva, 10);
        await db.query(
            'UPDATE usuarios SET clave = ? WHERE id_usuario = ?', [hashClave, id_usuario]
        );

        res.status(200).json({
            mensaje: 'Clave actualizada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'No se pudo actualizar la clave del usuario',
            error: error.message
        })
    }
})



module.exports = router;

// TODO: Implementar rutas de usuario para Artesanos.com
// *- PUT /usuarios/mi-perfil                -> Actualizar datos del perfil del usuario autenticado
// *- PUT /usuarios/mi-perfil/clave          -> Cambiar contraseña del usuario autenticado
// !- GET /usuarios/buscar?query=texto       -> Buscar usuarios por nombre, alias o email

// !- PUT /usuarios/mi-perfil/imagen         -> Cambiar imagen de perfil
// !- DELETE /usuarios/mi-perfil             -> Eliminar cuenta del usuario autenticado
// !- GET /usuarios/:id_usuario              -> Obtener perfil público de otro usuario
// !- (Opcional) GET /usuarios               -> Listar todos los usuarios (para administración)