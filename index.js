const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const bodyParser = require('body-parser');
const flash  = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const passport = require('./config/passport');
const router = require('./routes');

//CONFIGURACION Y MODELOS DE LA BASE DE DATOS
const db = require('./config/db');
    require('./models/Usuarios');
    require('./models/Categorias');
    require('./models/Grupo');
    require('./models/Meetis');
    db.sync().then(() => console.log('DB Conectada')).catch((error) => console.log('error'));

//IMPORTAR EL ARCHIVO DOTENV
require('dotenv').config({ path : 'variables.env' });

//APLICACION PRINCIPAL
const app = express();

//BODY PARSER PARA LEER FORMULARIOS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended : true
}));

//EXPRESS VALIDATOR (VALIDACION DE CONTRASENAS)
app.use(expressValidator());

//HABILITAR EJS COMO TEMPLATE ENGINE =>
app.use(expressLayouts);
app.set('view engine', 'ejs');

//UBICACION DE LAS VISTAS => 
app.set('views', path.join(__dirname, './views'));

//ARCHIVO ESTATICOS => 
app.use(express.static('public'));

//HABILITAR COOKIE PARSER
app.use(cookieParser());

//CREAR LA SESSION =>
app.use(session({
    secret : process.env.SECRETO,
    key : process.env.KEY,
    resave : false,
    saveUninitialized : false
}))

//INICIALIZAR PASSPORT
app.use(passport.initialize());
app.use(passport.session());

//AGREGAR FLASH MESSAGES PARA LA VALIDACION =>
app.use(flash());

//MIDDLEWARES (USUARIO LOGUEAO, FLASH MESSAGES, FECHA ACTUAL =>
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();

    next();
})

// EL ROUTING => 
app.use('/', router());

//Agrega el PUERTO => 
app.listen(process.env.PORT, () => {
    console.log('App listening on port 3000!');
});

