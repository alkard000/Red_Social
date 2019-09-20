const express = require('express');
const expressLayout = require('express-ejs-layouts');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const passport = require('./config/passport');
const router = require('./routes');

//DB Y MODELOS
const db =  require('./config/db');
            require('./models/Usuarios');
            require('./models/Categorias');
            require('./models/Grupos');
db.sync().then(() => console.log('DB Conectado')).catch((error) => console.log(error));

//Variables de DESARROLLO
require('dotenv').config({
    path : 'variable.env'
});

//Entorno de DESARROLLO
const app = express();

//BODY-PARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended : true } ));

//EXPRESS VALIDATOR
app.use(expressValidator());

//Habilitar template engine
app.use(expressLayout);
app.set('view engine', 'ejs');

//UBICACION DE LAS VISTAS
app.set('views', path.join(__dirname, './views'));

//archivos ESTATICOS
app.use(express.static('public'));

//Habilitar COOKIEPARSER
app.use(cookieParser());

//Cear SESSION
app.use(session( {
    secret : process.env.SECRETO,
    key : process.env.KEY,
    resave : false,
    saveUninitialized : false
}))

//INICIALIZAR passport
app.use(passport.initialize());
app.use(passport.session());

//FLASH MESSAGES
app.use(flash());

//MIDDLEWARES
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
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
