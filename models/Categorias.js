const Sequelize = require('sequelize');
const db = require('../config/db');

const Categoria = db.define('categorias', {
    id : {
        type : Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    nombre : Sequelize.TEXT
});
module.exports = Categoria;