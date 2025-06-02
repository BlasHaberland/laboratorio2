const albumFormMiddleware = (req, res, next) => { 
    const {titulo} = req.body;

    // Validar titulo
    if (!titulo) {
        return res.status(400).json({
            mensaje: 'El titulo es obligatorio'
        });
    }


    next(); 
}

module.exports = albumFormMiddleware;   