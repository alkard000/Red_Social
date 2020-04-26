const Sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid/v4');
const Categorias = require('../models/Categorias');
const Usuarios = require('../models/Usuarios');

const Grupos = db.define('grupos', {
    id : {
        type : Sequelize.UUID,
        primaryKey : true,
        allowNull : false,
        defaultValue : uuid()
    },
    nombre : {
        type : Sequelize.TEXT(100),
        allowNull : false,
        validate : {
            notEmpty : {
                msg : 'El grupo debe tener un nombre'
            }
        }
    },
    descripcion : {
        type : Sequelize.TEXT,
        allowNull : false,
        validate : {
            notEmpty : {
                msg : 'Coloca un Descripcion'
            }
        }
    },
    url : Sequelize.TEXT,
    imagen : Sequelize.TEXT
})


//LLAVES FORANEAS
Grupos.belongsTo(Categorias); //==> UN GRUPO SOLO PUEDE TENER UN CATEGORIA
Grupos.belongsTo(Usuarios);   //==> EL GRUPO PERTENECE AL USUARIO QUE LO CREO

module.exports = Grupos;