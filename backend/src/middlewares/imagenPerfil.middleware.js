const imagenPerfilMiddleware = (req, res, next) => { 
    const { file } = req;
    
    if (!file) {
        return res.status(400).json({
            mensaje: 'No se ha proporcionado una imagen de perfil'
        });
    }
    
    next();
}

module.exports = imagenPerfilMiddleware;