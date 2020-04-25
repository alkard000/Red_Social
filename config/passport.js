const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use(new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password'
    },
    async (email, password, next) => {
        //CODIGO QUE SE EJECUTA AL RELELNAR EL FORMULARIO
        const usuario = await Usuarios.findOne({
            where : {
                email,
                activo : 1
            }
        });

        //REVISAR SI EXISTE USUARIO
        if(!usuario) return next(null, false, {
            message : 'Ese Usuario no existe'
        });

        //SI EL USUARIO EXISTE, COMPARAR EL PASSWORD
        const verificarPass = usuario.validarPassword(password);

        //SI EL PASSWORD ES INCORRECTO
        if(!verificarPass) return next(null, false, {
            message : 'Password Incorrecto'
        });

        // SI TODOS ESTA BIEN
        return next(null, usuario);
    }
))

passport.serializeUser(function(usuario, cb){
    cb(null, usuario);
});
passport.deserializeUser(function(usuario, cb){
    cb(null, usuario);
});

module.exports = passport;