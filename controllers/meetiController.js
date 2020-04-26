const Grupos = require('../models/Grupo');
const Meeti = require('../models/Meetis');
const uuid = require('uuid/v4');



//MUESTRA EL FORMULARIO PARA CREAR NUEVOS MEETI
exports.formNuevoMeeti = async (req, res) => {

    const grupos = await Grupos.findAll({
        where : {
            usuarioId : req.user.id
        }
    });
    res.render('nuevo-meeti', {
        nombrePagina : 'Crear Nuevo Meeti',
        grupos
    })
}

//INSERTAR NUEVOS MEETI A LA BASE DE DATOS
exports.crearMeeti = async (req, res) => {

    //OBTENER LOS DATOS
    const meeti = req.body;

    //ASIGNAR USUARIO CREADOR
    meeti.usuarioId = req.user.id;

    //ALMACENAR LA UBICACION CON UN POINT
    const point = {
        type : 'Point',
        coordinates : [
            parseFloat(req.body.lat),
            parseFloat(req.body.lng)
        ]
    };
    meeti.ubicacion = point;

    //CUPO OPCIONAL
    if(req.body.cupo === ''){
        meeti.cupo = 0;
    }

    meeti.id = uuid();


    //ALMACENAR EN LA BASE DE DATOS
    try {
        await  Meeti.create(meeti);
        req.flash('exito', 'Se ha Creado el Meeti Correctamente');
        res.redirect('/administracion');
    } catch (error) {
        //EXTRAER MENSAJE DE ERRORES
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }
}

//SANITIZAR LOS MEETI
exports.sanitizarMeeti = (req, res, next) => {
    req.sanitizeBody('titulo');
    req.sanitizeBody('invitado');
    req.sanitizeBody('cupo');
    req.sanitizeBody('fecha');
    req.sanitizeBody('hora');
    req.sanitizeBody('direccion');
    req.sanitizeBody('ciudad');
    req.sanitizeBody('estado');
    req.sanitizeBody('pais');
    req.sanitizeBody('lat');
    req.sanitizeBody('lng');
    req.sanitizeBody('grupoId');

    next();

}

//MUESTRA EL FORMULARIO PARA EDITAR EL MEETI
exports.formEditarMeeti = async ( req, res, next) => {
    const consultas = [];
    consultas.push(Grupos.findAll({
        where : {
            usuarioId : req.user.id
        }
    }));
    consultas.push(Meeti.findByPk(req.params.id));

    //RETURN PROMISE CON DESTRUCTURING
    const [grupos, meeti] = await Promise.all(consultas);

    if(!grupos || !meeti){
        req.flash('error', 'Operacion no Valida');
        res.redirect('/administracion');
        return next();
    }

    //MOSTRAR LA VISTA DE LA EDICION
    res.render('editar-meeti', {
        nombrePagina : `Editar Meeti : ${meeti.titulo}`,
        grupos,
        meeti
    })
}

//ALMACENA LOS CAMBIOS EN EL MEETI
exports.editarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({
        where : {
            id : req.params.id,
            usuarioId : req.user.id
        }
    });

    //VALIDAR PERMISOS
    if(!meeti){ //==>SI NO EXISTE EL MEETI
        req.flash('error', 'Operacion no Valida');
        res.redirect('/administracion');
        return next();
    }

    //ASIGNAR VALORES
    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng } = req.body; 

    //REASIGNACION MANUAL, DEBDIDO A QUE EL .SAVE() REASIGNARIA LOS METODOS Y VALORES
    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;
    meeti.pais = pais;

    //ASIGNAR POINT
    const point = {
        type : 'Point',
        coordinates : [
            parseFloat(lat),
            parseFloat(lng)
        ]
    }

    meeti.ubicacion = point; //==>ASIGNAR UBICACION

    //ALMACENAR EN LA BD
    await meeti.save();
    req.flash('exito', 'Cambios Realizados correctamente');
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

    //TODO BIEN, EJECUTAR LA VISTA
    res.render('eliminar-grupo', {
        nombrePagina : `Eliminar Grupo : ${grupo.nombre}`
    })
}

//FORMULARIO PARA ELIMINAR EL MEETI
exports.formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({
        where : {
            id : req.params.id,
            usuarioId : req.user.id
        }
    })
    if(!meeti){
        req.flash('error', 'Operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    // mostrar la vista
    res.render('eliminar-meeti', {
        nombrePagina : `Eliminar Meeti : ${meeti.titulo}`
    })
}        

//ELIMINAR EL MEETI DE LA BASE DE DATOS
exports.eliminarMeeti =  async (req, res) => {
    await Meeti.destroy({
        where : {
            id : req.params.id
        }
    });

    req.flash('exito', 'Meeti Eliminado correctamente');
    res.redirect('/administracion');
}
