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

// OBTENER UN ÁLBUM POR ID (según amistad o portafolio público)
router.get('/albumes/:id_album', [autMiddleware], async (req, res) => {
    try {
        const id_album = req.params.id_album;
        const id_usuario_autenticado = req.usuario.id;
        const db = await initConnection();

        // Obtener el álbum y el usuario dueño
        const [albumes] = await db.query(
            `SELECT a.*, u.portafolio_publico, u.id_usuario AS id_duenio
             FROM albumes a
             JOIN usuarios u ON a.id_usuario = u.id_usuario
             WHERE a.id_album = ?`,
            [id_album]
        );

        if (albumes.length === 0) {
            return res.status(404).json({ mensaje: 'Álbum no encontrado.' });
        }

        const album = albumes[0];

        // Si el usuario autenticado es el dueño
        if (album.id_duenio == id_usuario_autenticado) {
            return res.status(200).json({ album });
        }

        // Verifica si son amigos 
        const [amistad] = await db.query(
            `SELECT * FROM amistades
             WHERE (
                (id_remitente = ? AND id_destinatario = ?)
                OR
                (id_remitente = ? AND id_destinatario = ?)
             ) AND estado = 'aceptada'`,
            [id_usuario_autenticado, album.id_duenio, album.id_duenio, id_usuario_autenticado]
        );

        if (amistad.length > 0) {
            return res.status(200).json({ album });
        }

        if (album.portafolio_publico == 1) {
            return res.status(200).json({ album });
        }

        return res.status(403).json({ mensaje: 'No tienes permiso para ver este álbum.' });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el álbum',
            error: error.message
        });
    }
});


module.exports = router;    

// TODO: Rutas recomendadas para albumes según la consigna
// * [x] POST   /albumes                        -> Crear álbum propio
// *[x] GET    /albumes/mis-albumes            -> Obtener álbumes propios
// *[x] GET    /albumes/:id_album              -> Obtener un álbum por id (si el usuario tiene permiso de verlo)
// ![ ] PUT    /albumes/:id_album              -> Editar álbum propio (título, descripción, portada)
// ![[ ] DELETE /albumes/:id_album              -> Eliminar álbum propio y sus imágenes
// ![[ ] POST   /albumes/:id_album/imagenes     -> Agregar imagen a álbum (con caption opcional)
// ![[ ] DELETE /albumes/:id_album/imagenes/:id_imagen -> Eliminar imagen de álbum
// ![[ ] PUT    /albumes/:id_album/imagenes/:id_imagen -> Editar imagen de álbum (caption o reemplazo)
// ![[ ] POST   /albumes/:id_album/etiquetas    -> Agregar/quitar etiquetas a álbum
// ![[ ] POST   /albumes/:id_album/imagenes/:id_imagen/etiquetas -> Agregar/quitar etiquetas a imagen
// ![[ ] GET    /albumes/buscar?query=...&etiquetas=... -> Buscar álbumes por nombre o etiquetas
// ![[ ] POST   /albumes/:id_album/compartir    -> Compartir álbum o imágenes con contactos
// ![[ ] GET    /albumes/compartidos-conmigo    -> Obtener álbumes/imágenes compartidos conmigo
// ![[ ] GET    /albumes/:id_album/imagenes/:id_imagen/comentarios -> Obtener comentarios de una imagen
// ![[ ] POST   /albumes/:id_album/imagenes/:id_imagen/comentarios -> Agregar comentario a una imagen