const { initConnection } = require('../database/connection');

const albumFormMiddleware = async (req, res, next) => { 
    const { titulo } = req.body;
    const id_usuario = req.usuario.id;

    // Validar titulo
    if (!titulo) {
        return res.status(400).json({
            mensaje: 'El titulo es obligatorio'
        });
    }
    try {

        const db = await initConnection();
        // Verificar si ya existe un álbum con el mismo título para este usuario
        const [existe] = await db.query(
            'SELECT * FROM albumes WHERE id_usuario = ? AND titulo = ?',
            [id_usuario, titulo]
        );
        if (existe.length > 0) {
            return res.status(400).json({ mensaje: 'Ya tienes un álbum con ese título.' });
        }

        next();
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al validar el título del álbum',
            error: error.message
        });
    }
}

module.exports = albumFormMiddleware;   