const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const multer = require('multer');
const shortid = require('shortid');
const fs =require('fs');
const uuid = require('uuid/v4');


const configuracionMulter = {
    limits : { filesize : 100000 },
    storage : fileStorage = multer.diskStorage({
        destination : (req, res, next) => {
            next(null, __dirname + '/../public/uploads/grupos')
        },
        filename : (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            //Formato VALIDO
            next(null, true);
        } else {
            //Formato NO VALIDO
            next(new Error('Formato no Valido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if(error){
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El Archivo de Imagen es muy Grande');
                } else {
                    req.flash('error', error.message);
                }
            } else if(error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        }else {
            next();
        }
    })
}

exports.formNuevoGrupo = async (req, res) => {

    const categorias = await Categorias.findAll();

    res.render('nuevogrupo', {
        nombrePagina : 'Crea un nuevo grupo',
        categorias
    })
}

//Almacenar lo GRUPOS
exports.crearGrupo = async (req, res) => {    
    
    //SANITIZAR
    req.sanitizeBody('nombre');
    req.sanitizeBody('url');

    const grupo = req.body;
    console.log(grupo);
    grupo.usuarioId = req.user.id;

    //LEER la imagen
    if(req.file){
      grupo.imagen = req.file.filename;
    }

    grupo.id = uuid();

    try {
        //Almacenar
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el Grupo existosamente');
        res.redirect('/administracion');
    } catch (error) {
        //MESSAGES
        const erroresSequelize = error.errors.map( err => err.message );
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
}

exports.formEditarGrupo = async (req, res) => {

    const consultas = [];
    consultas.push( Grupos.findByPk(req.params.grupoId) );
    consultas.push( Categorias.findAll() );

    //PROMISES
    const [grupo, categorias] = await Promise.all(consultas);

    res.render('editargrupo', {
        nombrePagina : `Editar Grupo : ${grupo.nombre}`,
        grupo,
        categorias
    })
}
//GUARDAR CAMBIOS
exports.editarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne( { where : { id : req.params.grupoId, usuarioId : req.user.id } } );

    //no EXISTE el grupo o NO ES EL CREADOR
    if(!grupo) {
        req.flash('error', 'Operacion no Valida');
        res.redirect('/administracion');
        return next();
    }

    //LEER Valores
    const { nombre, descripcion, categoriaId, url } = req.body;

    //ASIGNAR valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    //GUARDAR valores
    await grupo.save();
    req.flash('exito', 'Cambios guardados Existosamente');
    res.redirect('/administracion');
}
//EDITAR IMAGEN
exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findByPk(req.params.grupoId);

    res.render('imagengrupo', {
        nombrePagina : `Editar Imagen Grupo : ${grupo.nombre}`,
        grupo
    })
}
//MODIFICAR IMAGEN
exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne( { where : { id : req.params.grupoId, usuarioId : req.user.id } } );

    if(!grupo) {
        req.flash('error', 'Operacion no Valida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    //VALIDACION DE ARCHIVO

    //NUEVO
    //if(req.file) {
    //}
    //ANTIGUO
    //if(grupo.imagen) {
    //}

    //SI HAY ANTIGUO Y NUEVA, BORRAR ANTIGUA
    if(req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        //ELIMINAR ARCHIVO CON FS
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        })
    }
    //SI HYA IMAGEN NUEVA, LA GUARDAMOS
    if(req.file) {
        grupo.imagen = req.file.filename;
    }
    //GUARDAR EN BD
    await grupo.save();
    req.flash('exito', 'Cambios guardados Existosamente');
    res.redirect('/administracion');
}
//FORMULARIO PARA ELIMINAR
exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne( { 
        where : { 
            id : req.params.grupoId, 
            usuarioId : req.user.id 
        } 
    });

    //SIN PRIVILEGIOS NI EXISTE GRUPO
    if(!grupo) {
        req.flash('error', 'Operacion no Valida');
        res.redirect('/administracion');
        return next();
    }
    //TODO BIEN
    res.render('eliminargrupo', { 
        nombrePagina : `Eliminar Grupo : ${grupo.nombre}`
    })
}
//ELIMINAR GRUPO E IMAGEN
exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne( { 
        where : { 
            id : req.params.grupoId, 
            usuarioId : req.user.id 
        } 
    });

    if(grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;  

        //ELIMINAR ARCHIVO CON FS
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        });
    }
    //ELIMINAR GRUPO
    await Grupos.destroy({
        where : {
            id : req.params.grupoId
        }
    });
    //REDIREAACIONAR 
    req.flash('exito', 'Grupo Eliminado Exitosamente');
    res.redirect('/administracion');
}