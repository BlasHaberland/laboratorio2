const jwt = require('jsonwebtoken');
const autMiddleware = (req, res, next) => { 

    const token = req.cookies.aut_cookie;
    if (!token) {
        return res.status(401).json({
            mensaje: 'No autorizado'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_CLAVE);
        req.usuario = decoded; // <- Guarda la información del usuario en el objeto de solicitud
        next(); 
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return res.status(401).json({
            mensaje: 'Token inválido'
        });
    }
}

module.exports = autMiddleware;