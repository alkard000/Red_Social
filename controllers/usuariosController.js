const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/emails');

//CREACION DE CUENTAS
exports.formCrearCuentas = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina : 'Crear Cuenta'
    })
}
exports.crearNuevaCuenta = async (req, res) => {
    const usuario = req.body;

    req.checkBody('confirmar', 'El password confirmado no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'El password es Distinto').equals(req.body.password);

    //LEER ERRORES DE EXPRESS
    const erroresExpress = req.validationErrors();

    try {
        //CAPTANDO EL EXITO DEL REGISTRO
        await Usuarios.create(usuario);

        //URL DE CONFIRMACION
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        //ENVIAR EMAIL DE CONFIRMACION
        await enviarEmail.enviarEmail({
            usuario,                             //==>ACCEDER AL CORREO
            url,                                 //==>CREAR LA URL
            subject : 'Confirma tu Cuenta Meeti',//==>ASUNTO DEL EMAIL
            archivo : 'confirmar-cuenta'         //==>ARCHIVO CON EL HTML DEL EMAIL
        });

        req.flash('exito', 'Hemos enviado un Email, confirma tu Cuenta');
        res.redirect('/iniciar-sesion');

        console.log('Usuario creado', nuevoUsuario);

    } catch (error) {
        //LEER ERRORES DE SEQUELIZE CON FORMATO MESSAGE
        const erroresSequelize = error.errors.map(err => err.message);
        console.log(erroresSequelize);

        //EXTRAER LOS ERRORES CON FORMATO MSG
        const errExp = erroresExpress.map(err => err.msg);
        console.log(errExp);

        //UNIR ERRORES CON FORMATO MSG Y MESSAGE
        const listaErrores = [...erroresSequelize,  ...errExp];

        //MOSTRAR ERRORES Y REDIRECCIONANDO
        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
}

//CONFIRMA LA SUBSCRIPCION DEL USUARIO
exports.confirmarCuenta = async (req, res, next) => {
    //VERIFICAR SI EL USUARIO EXISTE
    const usuario = await Usuarios.findOne({
        where : {
            email : req.params.correo
        }
    });

    console.log(req.params.correo);

    console.log(usuario);

    //SI NO EXISTE, REDIRECCIONAR
    if(!usuario){
        req.flash('error', 'No existe esta Cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    //SI EXISTE CONFIRMAR SUBSCRIPCION Y REDIRECCIONAR
    usuario.activo = 1;

    await usuario.save();

    req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesion');
    res.redirect('/iniciar-sesion');
}

//INICIO DE SESSION
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina : 'Iniciar Sesion'
    })
}