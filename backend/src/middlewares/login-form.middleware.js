const loginFormMiddleware = (req, res, next) => {
    const { alias, clave } = req.body;

    // Validar que ambos campos estén presentes
    if (!alias || !clave) {
        return res.status(400).json({
            mensaje: 'Alias y clave son obligatorios'
        });
    }
    
    next();

 }

module.exports = loginFormMiddleware;