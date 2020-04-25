const passport = require('passport');

//AUTENTICACION DEL USUSARIO
exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect : '/iniciar-sesion',
    failureFlash : true,
    badRequestMessage : 'Ambos campos son obligatorios'
});

//REVISAR SI EL USUARIO ESTA AUTENTICADO
exports.usuarioAutenticado = (req, res, next) => {

    //SI EL USUARIO ESTA AUTENTICADO, "NO PROBLEM"
    if(req.isAuthenticated()){
        return next();
    }

    //SI NO ESTA AUTENTICADO
    return res.redirect('/iniciar-sesion');
}