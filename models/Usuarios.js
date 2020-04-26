const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');

//CREANDO EL MODELO DE LOS USUARIOS PARA LA BASE DE DATOS
const Usuarios = db.define('usuarios', {
    id : {
        type  :Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    nombre : Sequelize.STRING(60), 
    imagen : Sequelize.STRING(60),
    email : {
        type : Sequelize.STRING(40),
        allowNull : false,
        validate : {
            isEmail : {
                msg : 'Agrega un Correo Valido'
            }
        },
        unique : {
            args : true, 
            msg : 'Usuario ya registrado'
        }
    },
    password : {
        type  : Sequelize.STRING(60),
        allowNull : false,
        validate : {
            notEmpty : {
                msg : 'El password no puede ir vacio'
            }
        }
    },
    activo : {
        type : Sequelize.INTEGER,
        defaultValue : 0
    },
    tokenPassword : Sequelize.STRING,
    expiraToken : Sequelize.DATE
}, 
{
    hooks : {
        beforeCreate(usuario) {
            usuario.password = bcrypt.hashSync(usuario.password, bcrypt.genSaltSync(10), null);
        }
    }
})

//METODO PARA COMPARAR EL PASSWORD
Usuarios.prototype.validarPassword = function(password){
    return bcrypt.compareSync(password, this.password);
}

module.exports = Usuarios;