const Grupos = require('../models/Grupo');
const Meeti = require('../models/Meetis');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');


exports.panelAdministracion = async (req, res) => {

    //CONSULTAS
    const consultas = []
    consultas.push(Grupos.findAll({
        where : {
            usuarioId : req.user.id //FUNCION QUE TRAE LOS GRUPOS DE LOS USUARIOS AUTENTICADOS
        }
    }));
    consultas.push(Meeti.findAll({
        where : {
            usuarioId : req.user.id, //FUNCION QUE TRAE LOS MEETIS DE LOS USUARIOS AUTENTICADOS
            fecha : {
                [Op.gte] : moment(new Date()).format("YYYY-MM-DD") //==>FECHAS MAYORES O IGUALES A LA FECHA ACTUAL. PROXIMOS EVENTOS
            }
        },
        order : [
            ['fecha', 'DESC']
    ]
    }));
    consultas.push(Meeti.findAll({
        where : {
            usuarioId : req.user.id, //FUNCION QUE TRAE LOS MEETIS DE LOS USUARIOS AUTENTICADOS
            fecha : {
                [Op.lt] : moment(new Date()).format("YYYY-MM-DD") //==>FECHAS MAYORES O IGUALES A LA FECHA ACTUAL. ANTERIORES EVENTOS
            }
        }
    }));


    //ARRAY DESTRUCTURING
    const [grupos, meeti, anteriores ] = await Promise.all(consultas);

    res.render('administracion', {
        nombrePagina : 'Panel Administracion',
        grupos,
        meeti,
        anteriores,
        moment
    }) 
}