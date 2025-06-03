const claveDeleteMiddleware = (req, res, next) => {
    const { clave } = req.body;
    if (!clave || clave.trim() === '') {
        return res.status(400).json({
            mensaje: 'La clave es obligatoria'
        });
    }

    next()
}

module.exports = claveDeleteMiddleware;