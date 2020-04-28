const Grupos = require('../../models/Grupo');
const Meetis = require('../../models/Meetis');

const moment = require('moment');

exports.mostrarGrupo = async (req, res, next) => {

    const consultas = [];

    consultas.push(Grupos.findOne({
        where : {
            id : req.params.id
        }
    }));
    consultas.push(Meetis.findAll({
        where : {
            grupoId : req.params.id
        },
        order : [
            ['fecha', 'ASC']
        ]
    }));

    const [grupo, meetis] = await Promise.all(consultas);

    //SI NO EXISTE EL GRUPO
    if(!grupo){
        res.redirect('/');
        return next();
    }

    //MOSTRAR LA VISTA
    res.render('mostrar-grupo', {
        nombrePagina : `Informacion Grupo : ${grupo.nombre}`,
        grupo,
        meetis,
        moment
    })
}