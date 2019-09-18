const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use( new LocalStrategy ({
    usernameField : 'email',
    passwordField : 'password'
    },
    async (email, password, next) => {
        //Al llenar el FORMULARIO
        const usuario = await Usuarios.findOne( { where :  { email, activo : 1 } } )
        //REVISA la existencia
        if(!usuario) return next(null, false, {
            message : 'Este usuario no Existe'
        });
        //Si EXISTE ---> compara password
        const verificarPassword = usuario.validarPassword(password);
        //Si el PW en incorrecto
        if(!verificarPassword) return next(null, false, { 
            message : 'Password Incorrecto'
        });
        //Todo esta ok
        return next(null, usuario);
    }
) )

passport.serializeUser(function(usuario, cb) {
    cb(null, usuario);
});
passport.deserializeUser(function(usuario, cb) {
    cb(null, usuario);
});

module.exports = passport;