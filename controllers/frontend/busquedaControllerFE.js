const Meetis = require('../../models/Meetis');
const Grupos = require('../../models/Grupo');
const Usuarios = require('../../models/Usuarios');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

exports.resultadosBusqueda = async (req, res) => {
    
    //LEER DATOS DE LA URL
    const {categoria, titulo, ciudad, pais} = req.query;

    //SI LA CATEGORIA ESTA VACIA
    let query;

    if(categoria === ''){
        query = '';                 //SI LA CATEGORIA ESTA VACIA
    } else {                        //==> SE PASA LA BUSQUEDA DEL QEURY COMO ESTRING
        query = `where : {
                    categoriaId : {
                    [Op.eq] : ${categoria}
                }
            }`
    }

    //FILTRAR LOS MEETIS POR LOS TERMINOS DE BUSQUEDA
    const meetis = await Meetis.findAll({
        where : {
            titulo : {
                [Op.iLike] : '%' + titulo + '%'
            },
            ciudad : {
                [Op.iLike] : '%' + ciudad + '%'
            },
            pais : {
                [Op.iLike] : '%' + pais + '%'
            }
        },
        include : [
            {
                model: Grupos, //SE OBTIENE EL GRUPO DE MEETI
                query
            },
            {
                model : Usuarios, //USUARIO DEL MEETI
                attributes : ['id', 'nombre', 'imagen']//==>ID, NOMBRE E IMAGEN DE USUARIO
            }
        ]
    });

    //PASAR LOS RESULTADOS A LA BUSQUEDA
    res.render('busqueda', {
        nombrePagina : 'Resultados Busqueda',
        meetis,
        moment
    })
}