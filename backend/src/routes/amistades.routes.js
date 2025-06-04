const router = require('express').Router();
const { initConnection } = require('../database/connection');
const autMiddleware = require('../middlewares/aut.middleware');



// OBTENER AMISTADES ACEPTADAS RECIBIDAS
router.get('/amistades/recibidas', [autMiddleware], async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const db = await initConnection();

        const [amistades] = await db.query(
            `SELECT a.id_amistad, u.id_usuario, u.nombre, u.alias, u.imagen_perfil
             FROM amistades a
             JOIN usuarios u ON u.id_usuario = a.id_remitente
             WHERE a.id_destinatario = ? AND a.estado = 'aceptada'`,
            [id_usuario]
        );

        res.status(200).json({
            mensaje: 'Amistades recibidas aceptadas obtenidas correctamente',
            amistades: amistades
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener amistades recibidas',
            error: error.message
        });
    }
});
// OBTENER AMISTADES ACEPTADAS ENVIADAS
router.get('/amistades/enviadas', [autMiddleware], async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const db = await initConnection();

        const [amistades] = await db.query(
            `SELECT a.id_amistad, u.id_usuario, u.nombre, u.alias, u.imagen_perfil
             FROM amistades a
             JOIN usuarios u ON u.id_usuario = a.id_destinatario
             WHERE a.id_remitente = ? AND a.estado = 'aceptada'`,
            [id_usuario]
        );

        res.status(200).json({
            mensaje: 'Amistades enviadas aceptadas obtenidas correctamente',
            amistades: amistades
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener amistades enviadas',
            error: error.message
        });
    }
});

// OBTENER AMISTADES PENDIENTES
router.get('/amistades/pendientes', [autMiddleware], async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const db = await initConnection();

        const [amistades] = await db.query(
            `SELECT * FROM amistades
             WHERE (id_remitente = ? OR id_destinatario = ?)
             AND estado = 'pendiente'`,
            [id_usuario, id_usuario]
        );

        res.status(200).json({
            mensaje: 'Solicitudes de amistad pendientes obtenidas correctamente',
            amistades: amistades
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener solicitudes de amistad pendientes',
            error: error.message
        });
    }
});

// OBTENER ESTADO DE AMISTAD
router.get('/amistades/estado/:id_otro_usuario', [autMiddleware], async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const id_otro_usuario = req.params.id_otro_usuario;
        const db = await initConnection();

        // Verificar si el usuario es el mismo
        if (id_usuario === id_otro_usuario) {
            return res.status(400).json({ mensaje: 'No puedes verificar tu propio estado de amistad.' });
        }

        const [amistad] = await db.query(
            `SELECT estado FROM amistades
             WHERE (id_remitente = ? AND id_destinatario = ?)
                OR (id_remitente = ? AND id_destinatario = ?)`,
            [id_usuario, id_otro_usuario, id_otro_usuario, id_usuario]
        );

        if (amistad.length === 0) {
            return res.status(404).json({ mensaje: 'No existe una relación de amistad entre estos usuarios.' });
        }

        res.status(200).json({
            estado: amistad[0].estado
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el estado de amistad',
            error: error.message
        });
    }
});

//SOLICITAR AMISTAD
router.post('/amistades/solicitar', [autMiddleware], async (req, res) => {
    try {
        const id_remitente = req.usuario.id;
        const { id_destinatario } = req.body;
        const db = await initConnection();

        if (id_remitente == id_destinatario) {
            return res.status(400).json({ mensaje: 'No puedes enviarte una solicitud a ti mismo.' });
        }

        // Buscar si ya existe una relación
        const [existe] = await db.query(
            'SELECT * FROM amistades WHERE id_remitente = ? AND id_destinatario = ?',
            [id_remitente, id_destinatario]
        );

        if (existe.length > 0) {
            if (existe[0].estado === 'rechazada') {
                // Si fue rechazada, la volvemos a poner como pendiente
                await db.query(
                    'UPDATE amistades SET estado = ? WHERE id_remitente = ? AND id_destinatario = ?',
                    ['pendiente', id_remitente, id_destinatario]
                );
                return res.status(200).json({ mensaje: 'Solicitud de amistad reenviada.' });
            } else {
                return res.status(400).json({ mensaje: 'Ya existe una solicitud o amistad entre estos usuarios.' });
            }
        }

        // Insertar la solicitud de amistad (estado: pendiente)
        await db.query(
            'INSERT INTO amistades (id_remitente, id_destinatario, estado) VALUES (?, ?, ?)',
            [id_remitente, id_destinatario, 'pendiente']
        );

        res.status(200).json({ mensaje: 'Solicitud de amistad enviada.' });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al solicitar amistad',
            error: error.message
        })
    }
});

//ACEPTAR AMISTAD
router.put('/amistades/aceptar', [autMiddleware], async (req, res) => { 
    try {
        const id_destinatario = req.usuario.id;
        const { id_remitente } = req.body;
        const db = await initConnection();

        // Verificar que exista una solicitud pendiente
        const [solicitud] = await db.query(
            'SELECT * FROM amistades WHERE id_remitente = ? AND id_destinatario = ? AND estado = ?',
            [id_remitente, id_destinatario, 'pendiente']
        );
        if (solicitud.length === 0) {
            return res.status(404).json({ mensaje: 'No existe una solicitud pendiente de este usuario.' });
        }

        // Actualizar el estado a 'aceptada'
        await db.query(
            'UPDATE amistades SET estado = ? WHERE id_remitente = ? AND id_destinatario = ?',
            ['aceptada', id_remitente, id_destinatario]
        );

        res.status(200).json({ mensaje: 'Solicitud de amistad aceptada.' });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al aceptar la solicitud de amistad',
            error: error.message
        });
    }
});

//RECHAZAR AMISTAD
router.put('/amistades/rechazar', [autMiddleware], async (req, res) => {
    try {
        const id_destinatario = req.usuario.id;
        const { id_remitente } = req.body;
        const db = await initConnection();

        // Verificar que exista una solicitud pendiente
        const [solicitud] = await db.query(
            'SELECT * FROM amistades WHERE id_remitente = ? AND id_destinatario = ? AND estado = ?',
            [id_remitente, id_destinatario, 'pendiente']
        );
        if (solicitud.length === 0) {
            return res.status(404).json({ mensaje: 'No existe una solicitud pendiente de este usuario.' });
        }

        // Eliminar la solicitud de amistad
        await db.query(
            'UPDATE amistades SET estado = ? WHERE id_remitente = ? AND id_destinatario = ?',
            ['rechazada',id_remitente, id_destinatario]
        );

        res.status(200).json({ mensaje: 'Solicitud de amistad rechazada.' });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al rechazar la solicitud de amistad',
            error: error.message
        });
    }
}); 

// CANCELAR AMISTAD 
router.delete('/amistades/cancelar', [autMiddleware], async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_otro_usuario } = req.body; 
        const db = await initConnection();


        const [result] = await db.query(
            `DELETE FROM amistades
             WHERE (id_remitente = ? AND id_destinatario = ?)
                OR (id_remitente = ? AND id_destinatario = ?)`,
            [id_usuario, id_otro_usuario, id_otro_usuario, id_usuario]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'No existe ninguna relación de amistad entre estos usuarios.' });
        }

        res.status(200).json({ mensaje: 'Todas las relaciones de amistad entre ambos usuarios han sido eliminadas.' });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al cancelar la amistad',
            error: error.message
        });
    }
});


module.exports = router;

