const perfilFormMiddleware = (req, res, next) => {
    const { nombre, apellido, email, alias, intereses, antecedentes } = req.body;
    
    
    // Validar que nombre y apellido solo contengan letras y espacios
    const nombreApellidoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;
    if (nombre != undefined &&!nombreApellidoRegex.test(nombre) || apellido!= undefined && !nombreApellidoRegex.test(apellido)) {
        return res.status(400).json({
            mensaje: 'El nombre y el apellido solo deben contener letras y espacios'
        });
    }

      // Validar formato de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    if (email != undefined && !emailRegex.test(email)) {
        return res.status(400).json({
            mensaje: 'El formato del email es inválido'
        });
    }

      //Validar longitud del alias
    if (alias != undefined && alias.length < 3) {
        return res.status(400).json({
            mensaje: 'El alias debe tener al menos 3 caracteres'
        });
    }
    // Validar que el alias sea de 25 caracteres y no contenga espacias
    const aliasRegex = /^[^\s]{1,25}$/;
    if (alias != undefined && !aliasRegex.test(alias)) {
        return res.status(400).json({
            mensaje: 'El alias solo puede contener letras, números y guiones bajos'
        });
    }

    next();
}



module.exports = perfilFormMiddleware;