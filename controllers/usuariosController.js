const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits : {
        fileSize : 100000
    },
    storage : fileStoraged = multer.diskStorage({ //==> SE ALMACENA EN EL DISCO DURO
        destination : (req, res, next) => {
            next(null, __dirname+'/../public/uploads/perfiles/'); //==> EN QUE CARPETA ESTA CREADA
        },
        filename : (req, file, next) => {
            const extension = file.mimetype.split('/')[1]; //==> NOMBRE UNICO PARA EVITAR REPETICIONES DE LOS NOMBRES DE IMAGENES
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
            //EL FORMATO ES VALIDO
            next(null, true); //ACEPTAMOS EL ARCHIVO CON EL TRUE

        } else {
            //EL FORMATO NO ES VALIDO
            next(new Error('Formato no Valido'), false); //==> IGNORAMOS EL ARCHIVO CON EL FALSE
        }
    }
}

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

//MUESTRA EL FORMULARIO PARA EDITAR EL PERFIL
exports.formEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina : 'Editar Perfil', 
        usuario
    })
}

//ALMACENA EN LA BD LOS CAMBIOS DEL PERFIL
exports.editarPerfil = async (req, res) => {

    const usuario = await Usuarios.findByPk(req.user.id);

    //SANITIZAR CAMPOS
    req.sanitizeBody('nombre');
    req.sanitizeBody('email');

    //LEER DATOS DEL FORM
    const {nombre, descripcion, email} = req.body;

    //ASIGNAR LOS VALORES
    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    //AGUARDAR EN LA BASE DE DATOS
    await usuario.save();

    //REDIRECCION Y MENSAJES
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');
}

//FORMULARIO CAMBIAR PASSWORD
exports.formCambiarPassword = async (req, res) => {
    res.render('cambiar-password', {
        nombrePagina : 'Cambiar Password'
    })
}

//REVISA SI EL PASSWORD ANTERIOR ES CORRECTO Y CAMBIA PASSWORD
exports.cambiarPassword = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //VERIFICAR SI EL PASSWORD ANTERIOR ES CORRECTO
    if(!usuario.validarPassword(req.body.anterior)){
        req.flash('error', 'El password Actual es incorrecto, intenta denuevo');
        res.redirect('/administracion');
        return next();
    }

    //SI EL PASSWORD ES CORRECTO, HASHEAR EL NUEVO
    const hash = usuario.hashPassword(req.body.nuevo);

    //ASIGNAR EL PASSWORD HASHEADO AL USUARIO
    usuario.password = hash

    //GUARDAR EN LA BASE DE DATOS
    await usuario.save();

    //REDIRECCIONAR
    req.logout();
    req.flash('exito', 'Password cambiado correctamente, vuelve a iniciar sesion');
    res.redirect('/iniciar-sesion');
}

//FORMULARIO PARA SUBIR IMAGEN DE PERFIL
exports.formSubirImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);
    res.render('subir-imagen', {
        nombrePagina : 'Subir Imagen de mi Perfil',
        usuario
    })
}

//GUARDAR IMAGEN EN LA BASE DE DATOS
const uploads = multer(configuracionMulter).single('imagen');

exports.subirImagenPerfil = (req, res, next) => {
    uploads(req, res, function(error){
        if(error){
            if(error instanceof multer.MulterError){ //REVISION DE INSTANCIA DE  MULTER
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande')
                } else {
                    req.flash('error', error.message);
                }
            } else if(error.hasOwnProperty('message')) { //==>REVISAR SI EXISTE UN ERROR
                req.flash('error', error.message); //ACCEDEMOS AL NEW ERROR
            }
            res.redirect('back');
            return;
            //TODO : MNEJAR ERRORES
        } else {
            next(); //==> NOS VAMOS AL SIGUIENTE MIDDLEWARE
        }
    })
}

//GUARDAR IMAGEN NUEVA, Y ELIMINAR IMAGEN ANTERIOR, LUEGO GUARDAR EN LA BD
exports.guardarImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //SIA HAY IMAGEN ANTERIOR ELIMINARLA
    if(req.file && usuario.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;

        //ELIMINAR ARCHIVO CON FILESYSTEM
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error){
                console.log(error);
            }
            return;
        })
    }
    
    //SI EXISTE NUEVA IMAGEN, SE DEBE GUARDAR
    if(req.file){
        usuario.imagen = req.file.filename;
    }
    
    //GUARDAR NUEVA IMAGEN EN LA BD
    await usuario.save();
    req.flash('exito', 'Cambios almacenados correctamente');
    res.redirect('/administracion');
}