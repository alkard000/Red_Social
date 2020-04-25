//CONFIGURACION DE POSTGRES

const Sequelize = require('sequelize');

module.exports = new Sequelize('meeti', '', '', {
    host : '127.0.0.1', 
    port : '5555',
    dialect : 'postgres',
    pool : {
        max : 5, 
        min : 0,
        acquire : 30000, 
        idle : 10000
    },
    //define : {
    //    timestamps : false
    //}
    //logging : false
});