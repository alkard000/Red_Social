const Usuarios = require('../../models/Usuarios');
const Grupos = require('../../models/Grupo');


exports.mostrarUsuario = async (req, res, next) => {

    const consultas = [];

    //CONSULTAS AL MISMO TIMEPO
    consultas.push(Usuarios.findOne({
        where : {
            id : req.params.id
        }
    }));
    consultas.push(Grupos.findAll({
        where : {
            usuarioId : req.params.id
        }
    }));

    //CREANDO EL DESCONTRUCTURING
    const [usuario, grupos] = await Promise.all(consultas);

    if(!usuario){
        res.redirect('/');
        return next();
    }

    //MOSTRAR LA VISTA
    res.render('mostrar-perfil', {
        nombrePagina : `Perfil de Usuario : ${usuario.nombre}`,
        usuario, 
        grupos
    })
}