const Categorias = require('../models/Categorias');
const Meetis = require('../models/Meetis');
const Grupos = require('../models/Grupo');
const Usuarios = require('../models/Usuarios');

const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.home =  async (req, res) => {

    //PROMISE PARA LAS CONSULTAS EN EL HOME, CON CONDICIONES DE ORDEN Y VARIABLES
    const consultas = [];
    consultas.push(Categorias.findAll({}));
    consultas.push(Meetis.findAll({
        attributes : [ //==> ESTA VARIABLE SOLO TRAE LOS QUE LE DICTAN DE LA BASE DE DATOS
            'slug',
            'titulo',
            'fecha',
            'hora'
        ],
        where : {
            fecha : {
                [Op.gte] : moment(new Date()).format('YYYY-MM-DD') //==>CAMBIO DE FORMATO DE LA FECHAS CON MOMENTJS
            }
        },
        limit : 3,
        order : [
            ['fecha', 'ASC']
        ],
        include : [
            {//==> DEL MODELO GRUPOS SOLO SE EXTRAEN LA IMAGENES GRACIAS A LOS INNER JOINS
            model : Grupos,
            attributes : ['imagen']
            },
            {
            model : Usuarios,
            attributes : ['nombre', 'imagen']
            }
        ]
    }));
    consultas.push(Grupos.findAll({}));

    //ESTRAER Y PASAR A LA VISTA
    const [categorias, meetis] = await Promise.all(consultas);

    res.render('home', {
        nombrePagina : 'Inicio',
        categorias,
        meetis,
        moment
    })
};