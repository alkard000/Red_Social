const Usuarios = require('../models/Usuarios');

exports.formCrearCuenta = (req, res) => {
    res.render('crearcuenta', {
        nombrePagina : 'Crea Tu cuenta'
    });
}
exports.crearNuevaCuenta = async (req, res) => {
    const usuario = req.body;

    req.checkBody('confirmar', 'El Password de confirmacion no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'Los Passwords son distintos').equals(req.body.password);

    //LEER errore de express
    const erroresExpress = req.validationErrors();

    console.log(erroresExpress);

    try{
        await Usuarios.create(usuario);

        //TODO : Flash message y redireccion
        req.flash('exito', 'Hemos enviado un Email, confirma tu cuenta');
        res.redirect('/iniciar-sesion');

        console.log('Usuario creado', nuevoUsuario);
    } catch (error) {
        //MESSAGES
        const erroresSequelize = error.errors.map( err => err.message );
        //MSG
        const errExp = erroresExpress.map( err => err.msg );

        console.log(errExp);

        //UNION
        const listaErrores = [ ...erroresSequelize, ...errExp ];

        //console.log(erroresSequelize);

        req.flash( 'error', listaErrores );
        res.redirect('/crear-cuenta');
    }
}
exports.formIniciarSesion = (req, res) => {
    res.render('iniciarsesion', {
        nombrePagina : 'Iniciar Sesion'
    })
}