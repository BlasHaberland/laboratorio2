const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { initConnection } = require('../database/connection');
const autMiddleware = require('../middlewares/aut.middleware');
const albumFormMiddleware = require('../middlewares/album-form.middleware');

//CREAR ALBUM
router.post('/albumes',[autMiddleware, albumFormMiddleware], async (req, res) => {
    try {
        const { titulo, descripcion } = req.body;   
        const id_usuario = req.usuario.id;
        const db = await initConnection();

        const[album] = await db.query(
            'INSERT INTO albumes (id_usuario,titulo, descripcion, portada) VALUES (?, ?, ?, ?)', 
            [id_usuario, titulo, descripcion, null]
        );

        res.status(201).json({
            mensaje: 'Album creado correctamente',
            id_album: album.insertId
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear el album',
            error: error.message
        });
    }  
})
 
// OBTENER ALBUMES PROPIOS

router.get('/albumes/mis-albumes', [autMiddleware], async (req, res) => { 
    try {
        const id_usuario = req.usuario.id;
        const db = await initConnection();

        const[albumes] = await db.query(
            'SELECT * FROM albumes WHERE id_usuario = ?', [id_usuario]
        );
        
        res.status(200).json({
            id_usuario: id_usuario,
            albumes: albumes
        })

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los albumes',
            error: error.message
        });
    }
})
    

module.exports = router;    
