const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupo');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const uuid = require('uuid/v4');


const configuracionMulter = {
    limits : {
        fileSize : 100000
    },
    storage : fileStoraged = multer.diskStorage({ //==> SE ALMACENA EN EL DISCO DURO
        destination : (req, res, next) => {
            next(null, __dirname+'/../public/uploads/groups/'); //==> EN QUE CARPETA ESTA CREADA
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

const uploads = multer(configuracionMulter).single('imagen');

exports.subirImagen = (req, res, next) => {
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

exports.formNuevoGrupo = async (req, res) => {
    const categorias = await Categorias.findAll();//TRAEMOS TODAS LAS CATEGORIAS DE LA BASE DE DATOS

    res.render('nuevo-grupo',{
        nombrePagina : 'Crear un nuevo Grupo',
        categorias
    })
}

//ALMACENA LOS GRUPOS EN LA BASE DE DATOS
exports.crearGrupo = async (req, res) => {

    //SANITIZAR LOS GRUPOS
    req.sanitizeBody('nombre');
    req.sanitizeBody('url');
    
    const grupo = req.body;

    //AlMACENA EL USUARIO AUTENTICADO COMO EL CREADOR DEL GRUPO
    grupo.usuarioId = req.user.id;

    //ALMACENA LA CATEGORIA DEL GRUPO
    grupo.categoriaId = req.body.categoria

    //LEER IMAGEN DEL GRUPO
    if(req.file){ //==> REVISAR SI HAY UN ARCHIVO PARA ASIGNARLO
       grupo.imagen = req.file.filename;
    }

    grupo.id = uuid();

    try {

        //ALMACENAR EN LA BASE DE DATOS
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el Grupos correctamente');
        res.redirect('/administracion');

    } catch (error) {

        //RETORANAR LOS ERRORE DE SEGUELIZE
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
}

//EDITAR GRUPO
exports.formEditarGrupo = async (req, res) => {
    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.grupoId));//FILTRAMOS LA BASE DE DATOS "GRUPOS" POR LA LLAVE PRIMARIA
    consultas.push(Categorias.findAll());  //TRAEMOS TODAS LAS CATEGORIAS DE LA BASE DE DATOS 

    //PROMISE PARA EL AWAIT DEL ASYNC
    const [grupo, categorias] = await Promise.all(consultas);//==>SOLUCION A MULTIPLES CONSULTAS PARA NO USAR "N"-AWAITS

    res.render('editar-grupo', {
        nombrePagina : `Editar Grupo : ${grupo.nombre}`,
        grupo,
        categorias
    })
}

//GUARDA LOS CAMBIOS DE LA EDICION EN LA BD
exports.editarGrupo = async (req, res, next) => {

    //SE NECESITA SABER QUE EL GRUPO EXISTE Y QUE LA PERSONA QUE EDITE, SEA LA QUE ESTA UTENTICADA
    const grupo = await Grupos.findOne({
        where : {
            id : req.params.grupoId,
            usuarioId : req.user.id
        }
    });

    //ESTA CONDICIONAL POR SI EL GRUPO NO EXISTE O NO ES DEL USUARIO AUTENTICADO
    if(!grupo) { 
        req.flash('error', 'Operacion no Valida');
        res.redirect('/administracion');
        return next();
    }

    //"TODO BIEN" LEER LOS VALORES
    const {nombre, descripcion, categoriaId, url} = req.body;

    //ASIGNAR LOS VALORES
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    //GUARDAMOS NE LA BASE DE DATOS
    await grupo.save();
    req.flash('exito', 'Cambios Almacenados correctamente');
    res.redirect('/administracion');
    
}

//REVELAR EL FORMULARIO PARA LA EDICION DE LA IMAGEN Y SU POSTERIOR SUBIDA
exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findOne({
        where : {
            id : req.params.grupoId,
            usuarioId : req.user.id
        }
    });

    res.render('imagen-grupo', {
        nombrePagina : `Editar Image del Grupo : ${grupo.nombre}`,
        grupo
    })
}

//MODIFICA LA IMAGEN EN LA BASE DE DATOS Y ELIMINA LA ANTERIOR
exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({
        where : {
            id : req.params.grupoId,
            usuarioId : req.user.id
        }
    });

    ///EL GRUPO EXISTE Y ES VALIDO
    if(!grupo){
        req.flash('error', 'Operacion no Valida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    // //VERIFICAR QUE EL ARCHIVO SEA NUEVO
    // if(req.file) {
    //     console.log(req.file.filename);
    // }

    // //REVISAR EL ARCHIVO ANTERIOR
    // if(grupo.imagen){
    //     console.log(grupo.imagen);
    // }

    //EVIDENTEMENTE, SI EXISTE UNA IMAGEN ANTERIOR Y UNA IMAGEN NUEVA, SE ELIMINA LA ANTERIOR
    if(req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        //ELIMINAR ARCHIVO CON FILESYSTEM
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error){
                console.log(error);
            }
            return;
        })
    }

    //SI LA IMAGEN ES TOTALMENTE NUEVA, SE GUARDA SI O SI
    if(req.file){
        grupo.imagen = req.file.filename;
    }

    //GUARDAR EN LA BASE DE DATOS
    await grupo.save();
    req.flash('exito', 'Cambios almacenados correctamente');
    res.redirect('/administracion');
}

//MUESTAR EL FORMULARIO PARA ELIMINAR EL GRUPO
exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({
        where : {
            id : req.params.grupoId,
            usuarioId : req.user.id
        }
    })

    if(!grupo){
        req.flash('error', 'Operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    //"TODO" BIEN, EJECUTAR LA VISTA
    res.render('eliminar-grupo', {
        nombrePagina : `Eliminar Grupo : ${grupo.nombre}`
    })
}

//ELIMINAR LE GRUPO Y LA IMAGEN
exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({
        where : {
            id : req.params.grupoId,
            usuarioId : req.user.id
        }
    })
    if(!grupo){
        req.flash('error', 'Operacion no valida');
        res.redirect('/administracion');
    }

    //REVISAR SI HAY IMAGEN, SI LA HAY, ELIMINARLA
    if(grupo.imagen) {

        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        //ELIMINAR ARCHIVO CON FILESYSTEM
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error){
                console.log(error);
            }
            return;
        })
    }

    //ELIMINAR EL GRUPO
    await Grupos.destroy({
        where : {
            id : req.params.grupoId
        }
    });

    //REDIRECCIONAR AL USUARIO
    req.flash('exito', 'Grupo Eliminado satisfactoriamente');
    res.redirect('/administracion');
}
