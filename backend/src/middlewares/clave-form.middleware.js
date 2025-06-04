const claveFormMiddleware = (req, res, next) => { 
    const { clave_actual, clave_nueva } = req.body; 

    // Validar que ambos campos estén presentes 
    if (!clave_actual || !clave_nueva) { 
        return res.status(400).json({ 
            mensaje: 'Debes enviar la clave actual y la nueva clave' 
        }); 
    }

    // Validar longitud de la nueva clave
    if (clave_nueva.length < 4) { 
        return res.status(400).json({ 
            mensaje: 'La nueva clave debe tener al menos 4 caracteres' 
        }); 
    }

    // Validar que la nueva clave no contenga espacios
    const claveRegex = /^[^\s]+$/;
    if (!claveRegex.test(clave_nueva)) { 
        return res.status(400).json({ 
            mensaje: 'La nueva clave no puede contener espacios' 
        }); 
    }   

    next(); 
}

module.exports = claveFormMiddleware;