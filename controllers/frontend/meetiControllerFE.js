const Meetis = require('../../models/Meetis');
const Grupos = require('../../models/Grupo');
const Usuarios = require('../../models/Usuarios');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');

const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


exports.mostrarMeeti = async (req, res) => {
    const meeti = await Meetis.findOne({
        where : {
            slug : req.params.slug
        },
        include : [
            {
                model: Grupos //SE OBTIENE EL GRUPO DE MEETI
            },
            {
                model : Usuarios, //USUARIO DEL MEETI
                attributes : ['id', 'nombre', 'imagen']//==>ID, NOMBRE E IMAGEN DE USUARIO
            }
        ]
    });

    //SI NO EXISTE EL MEETI
    if(!meeti){
        res.redirect('/');
    }

    //CONSULTA POR MEETI CERCANOS ==> CREAMOS UN OBJETO DE POSTGIS 
    //Y EL LITERAL CREA LOS DATOS SIN ESCAPAR (SIN SANITIZAR, NI ARREGLOS, NI OBJETOS)
    //(ST_GEOMFROMTEXT)==> GENERA UN OBJETO Y LO POSICIONA EN EL MAPA
    const ubicacion = Sequelize.literal(`ST_GeomFromText( 'POINT( ${meeti.ubicacion.coordinates[0]} 
                                                                  ${meeti.ubicacion.coordinates[1]} )' )`);

    //ST_SINTANCE_SPHERE ==> RETORNA UNA LINEA EN METROS
    //SE CALCULA LA DISTANCIA EN BASE A LA UBICACION
    const distancia = Sequelize.fn('ST_Distance_Sphere', Sequelize.col('ubicacion'), ubicacion);

    //ENCONTRAR MEETIS CERCANOS
    const cercanos = await Meetis.findAll({
        order : distancia, //ORDEN DEL MAS CERCANO AL MAS LEJANO
        where : Sequelize.where(distancia, {//SE BUSCA LITERALMENTE UN ALIAS (DE LA DISANCIA) Y NO UNA TABLA
            [Op.lte] : 2000                 //DISTANCIA DE 2 KM
        }),
        limit : 3, //MAXIMO 3 MEETIS CERCANOS
        offset : 1, //SALTARSE EL PRIMER
        include : [
            {
                model: Grupos //SE OBTIENE EL GRUPO DE MEETI
            },
            {
                model : Usuarios, //USUARIO DEL MEETI
                attributes : ['id', 'nombre', 'imagen']//==>ID, NOMBRE E IMAGEN DE USUARIO
            }
        ]
    })

    //EXTRAEMOS INFORMACION D ELOS COMENTARIOS PARA MOSTRARLOS EN EL MEETI
    //DE DEBE CONSULTAR LEUGO DE VERIFICAR LA EXISTENCIA DEL MEETI
    const comentarios = await Comentarios.findAll({
        where : {
            meetiId : meeti.id
        },
        include : [
            {
                model : Usuarios,
                attributes : ['id', 'nombre', 'imagen']
            }
        ]
    })
    //RESULTADO HACIA LA VISTA
    res.render('mostrar-meeti', {
        nombrePagina : meeti.titulo,
        meeti,
        moment,
        cercanos,
        comentarios
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