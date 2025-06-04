const registroFormMiddleware = (req, res, next) => { 
    const { nombre, apellido, email, clave, alias } = req.body;

    // Validar que todos los campos estén presentes
    if (!nombre || !apellido || !email || !clave || !alias) {
        return res.status(400).json({
            mensaje: 'Todos los campos son obligatorios'
        });
    }

    // Validar formato de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            mensaje: 'El formato del email es inválido'
        });
    }

    // Validar longitud de la clave
    if (clave.length < 3) {
        return res.status(400).json({
            mensaje: 'La clave debe tener al menos 4 caracteres'
        });
    }

    // Validar que la clave no contenga espacios
    const claveRegex = /^[^\s]+$/;
    if (!claveRegex.test(clave)) { 
        return res.status(400).json({ 
            mensaje: 'La clave no puede contener espacios' 
        }); 
    }   
    
    //Validar longitud del alias
    if (alias.length < 3) {
        return res.status(400).json({
            mensaje: 'El alias debe tener al menos 3 caracteres'
        });
    }
    // Validar que el alias sea de 25 caracteres y no contenga espacias
    const aliasRegex = /^[^\s]{1,25}$/;
    if (!aliasRegex.test(alias)) {
        return res.status(400).json({
            mensaje: 'El alias solo puede contener letras, números y guiones bajos'
        });
    }

    // Validar que nombre y apellido solo contengan letras y espacios
    const nombreApellidoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;
    if (!nombreApellidoRegex.test(nombre) || !nombreApellidoRegex.test(apellido)) {
        return res.status(400).json({
            mensaje: 'El nombre y el apellido solo deben contener letras y espacios'
        });
    }

    next();
}

module.exports = registroFormMiddleware;