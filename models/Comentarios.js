const Sequelize = require('sequelize');
const db = require('../config/db');
const Usuarios = require('../models/Usuarios');
const Meetis = require('../models/Meetis');

const Comentarios = db.define('comentario', {
    id : {
        type : Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    mensaje : Sequelize.TEXT
},
{
    timestamps : false
});

Comentarios.belongsTo(Usuarios);
Comentarios.belongsTo(Meetis);

module.exports = Comentarios;