const passport = require('passport');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect : '/iniciar-sesion',
    failureFlash : true,
    badRequestMessage : 'Ambos campos son Obligatorios'
});

//Revisar AUTENTICACION

exports.usuarioAutenticado = (req, res, next) => {
    //Usuario AUTENTICADO
    if(req.isAuthenticated() ) {
        return next();
    }
    //Usuario NO AUTENTICADO
    return res.redirect('/iniciar-sesion');
}