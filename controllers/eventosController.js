const Grupos = require('../models/Grupos');

exports.formNuevoEvento = async (req, res) => {
    const grupos = await Grupos.findAll({
        where : {
            usuarioId : req.user.id
        }
    });

    res.render('nuevoevento', {
        nombrePagina : 'Crear Nuevo Evento ',
        grupos
    })
}