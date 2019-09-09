const express = require('express');
const expressLayout = require('express-ejs-layouts');
const path = require('path');
const router = require('./routes');

require('dotenv').config({
    path : 'variable.env'
});

const app = express();

//Habilitar template engine
app.use(expressLayout);
app.set('view engine', 'ejs');

//UBICACION DE LAS VISTAS
app.set('views', path.join(__dirname, './views'));

//archivos ESTATICOS
app.use(express.static('public'));

//MIDDLEWARES
app.use((req, res, next) => {
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();

    next();
});

//ROUTING
app.use('/', router());


//AGREGA EL PUERTO
app.listen(process.env.PORT, () => {
    console.log('Servidor activo');
});
