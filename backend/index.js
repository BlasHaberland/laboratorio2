// "IMPORTS"
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const socketIo = require('socket.io');
const autRouter = require('./src/routes/aut.routes');
const albumRouter = require('./src/routes/album.routes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// "MIDDLEWARES GLOBALES"

app.use(cors()); // Habilita CORS para todas as rotas
app.use(express.json()); // Analiza el cuerpo de las solicitudes JSON
app.use(cookieParser()); // Analiza las cookies en las solicitudes
app.use(express.static(path.join(__dirname, 'public'))); // Sirve archivos estáticos desde la carpeta 'public'


/* "RUTAS" */

app.use(autRouter);
app.use(albumRouter);

// "INICIALIZACIÓN DE SERVIDOR"
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
