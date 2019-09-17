const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');

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

        //URL
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        //Enviar EMAIL
        await enviarEmail.enviarEmail( {
            usuario,
            url,
            subject : 'Confirma tu Cuenta',
            archivo : 'confirmarcuenta'
        });

        //TODO : Flash message y redireccion
        req.flash('exito', 'Hemos enviado un Email, confirma tu cuenta');
        res.redirect('/iniciar-sesion');

        console.log('Usuario creado', nuevoUsuario);
    } catch (error) {
        console.log(error);
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
exports.confirmarCuenta = async (req, res, next) => {
    //Verificar EXISTENCIA
    const usuario = await Usuarios.findOne( { where : { email : req.params.correo } } );
    //si NO existe, REDIRECCIONAR
    if(!usuario) {
        req.flash( 'error', 'Es cuenta No Existe' );
        res.redirect('/crear-cuenta');
        return next();
    }
    //SI existe confirmar subscripcion
    usuario.activo = 1;
    await usuario.save();
    req.flash('exito', 'La Cuenta esta confirmada');
    res.redirect('/iniciar-sesion');
}
exports.formIniciarSesion = (req, res) => {
    res.render('iniciarsesion', {
        nombrePagina : 'Iniciar Sesion'
    })
}