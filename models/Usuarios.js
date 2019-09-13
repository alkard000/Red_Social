const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');

const Usuarios = db.define('usuarios', {
    id : {
        type : Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    nombre : Sequelize.STRING(60),
    imagen : Sequelize.STRING(40),
    email : {
        type : Sequelize.STRING(30),
        allowNull : false,
        validate : {
            isEmail : {
                msg : 'Agrega un Correo Valido'
            }
        },
        unique : {
            args : true,
            msg : 'Email ya Registrado'
        }
    },
    password : {
        type : Sequelize.STRING(60),
        allowNull : false,
        validate : {
            notEmpty : {
                msg : 'El password no puede ir Vacio'
            }
        }
    },
    activo : {
        type : Sequelize.INTEGER(1),
        defaultValue : 0
    },
    tokenPassword : Sequelize.STRING,
    expiraToken : Sequelize.DATE
}, {//HASHEAR
    hooks : {
        beforeCreate(usuario) {
            usuario.password = bcrypt.hashSync(usuario.password, bcrypt.genSaltSync(10), null)
        },
    }
});
//COMPARAR
Usuarios.prototype.validarPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}
// EXPORTAR
module.exports = Usuarios;