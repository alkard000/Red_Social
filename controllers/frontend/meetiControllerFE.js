const Meetis = require('../../models/Meetis');
const Grupos = require('../../models/Grupo');
const Usuarios = require('../../models/Usuarios');
const Categorias = require('../../models/Categorias');

const moment = require('moment');
const Sequelize = require('sequelize');


exports.mostrarMeeti = async (req, res) => {
    const meeti = await Meetis.findOne({
        where : {
            slug : req.params.slug
        },
        include : [
            {
                model: Grupos
            },
            {
                model : Usuarios,
                attributes : ['id', 'nombre', 'imagen']
            }
        ]
    });

    //SI NO EXISTE LE MEETI
    if(!meeti){
        res.redirect('/');
    }

    //RESULTADO HACIA LA VISTA
    res.render('mostrar-meeti', {
        nombrePagina : meeti.titulo,
        meeti,
        moment
    })
}

//CONFIRMA O CANCELA SI EL USUSARIO ASISTIRA AL MEETI
exports.confirmarAsistencia = async (req, res) => {

    console.log(req.body);

    //EXTRAER ACCION
    const {accion} = req.body;

    if(accion === 'confirmar'){

        //AGREGAR EL USUARIO
        Meetis.update(
            {
                'interesados' : Sequelize.fn(
                    'array_append', 
                    Sequelize.col('interesados'), 
                    req.user.id
                )
            },
            {
                'where' :{
                    'slug' : req.params.slug
                }
            }
        );    
        
        //MENSAJE DE CONRIFMACION DE ASISTENCIA
        res.send('Confirmado asistencia');
        
    } else { 
        
        //ELEIMINAR AL USUARIO DEL MEETI
        Meetis.update(
            {
                'interesados' : Sequelize.fn(
                    'array_remove', 
                    Sequelize.col('interesados'), 
                    req.user.id
                )
            },
            {
                'where' :{
                    'slug' : req.params.slug
                }
            }
        );

        //MENSAJE DE CONRIFMACION DE ASISTENCIA
        res.send('Cancelar asistencia');  
    }
}

//MOSTRAR LOS ASISTENTES AL MEETI
exports.mostrarAsistentes = async (req, res) => {
    const meeti = await Meetis.findOne({ //==> EXTRAEMOS A LOS INTERESADOS DEL SLUG CORRESPONDIENTE
        where : {
            slug : req.params.slug
        },
        attributes : [
            'interesados'
        ]
    });

    //EXTRAER A LOS INTERESADOS DEL MEETI
    const {interesados} = meeti; //==>SE GUARDA LA CONSULTA DEL MEETI EN UN OBJETO

    const asistentes = await Usuarios.findAll({//==> SE REANUDA LA CONSULTA, PERO ESTA VEZ PARA USUARIOS, 
                                                //   SE EXTRAE NOMBRE E IMAGEN, DONDE EL ID DDEL USUARIO ES EL INTERESAOD
        attributes : [
            'nombre',
            'imagen'
        ],
        where : {
            id : interesados
        }
    })

    //CREAR LA VISTA
    res.render('asistentes-meeti', {
        nombrePagina : 'Listado Asistentes del Meeti',
        asistentes
    })
}

//MOSTRAR MEETIS AGRUPADOS POR CATEGORIAS

exports.mostrarCategoria = async (req, res, next) => {
    const categoria = await Categorias.findOne({
        where : {
            slug : req.params.categoria
        },
        attributes : [
            'id',
            'nombre'
        ]
    });

    const meetis = await Meetis.findAll({
        order : [
            ['fecha', 'ASC'],
            ['hora', 'ASC']
        ],
        include : [
            {
                model : Grupos,
                where : {categoriaId : categoria.id}
            },
            {
                model : Usuarios
            }
        ]
    });

    //PASARLO A LA VISTA
    res.render('categoria', {
        nombrePagina : `Categoria : ${categoria.nombre}`,
        meetis,
        categoria,
        moment
    })
    console.log(categoria.id);
}