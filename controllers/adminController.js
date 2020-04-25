const Grupos = require('../models/Grupo');

exports.panelAdministracion = async (req, res) => {
    const grupos = await Grupos.findAll({ //FUNCION QUE TRAE LOS GRUPOS DE LOS USUARIOS AUTENTICADOS
        where : {
            usuarioId : req.user.id
        }
    });
    res.render('administracion', {
        nombrePagina : 'Panel Administracion',
        grupos
    }) 
}