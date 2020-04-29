const Comentarios = require('../../models/Comentarios');
const Meetis = require('../../models/Meetis');


exports.agregarComentario = async (req, res, next) => {
    
    //OBTENER EL COMENTARIO
    const {comentario} = req.body

    //CREAR EL COMENTARIO EN LA BASE DE DATOS
    await Comentarios.create({
        mensaje : comentario,
        usuarioId : req.user.id,
        meetiId : req.params.id
    })

    //REDIRECCIONAR A LA MISMA PAGINA
    res.redirect('back');
    next();
}

//ELIMINAR UN COMENTARIOD E LA BASE DE DATOS
exports.eliminarComentario = async (req, res, next) => {
    
    //TOMAR EL ID DEL COMENTARIO
    const {comentarioId} = req.body;

    //CONSULTAR EL COMENTARIO EN LA BASE DATOS
    const comentario = await Comentarios.findOne({
        where : {
            id : comentarioId
        }
    });

    //CONSULTAR SI ES QUE EXISTE ESE COMENTARIO
    if(!comentario){
        res.status(404).send('Accion no valida');
        return next();
    }    
    
    //CONSULTAR EL MEETI DEL COMENTARIO
    const meeti = await Meetis.findOne({
        where : {
            id : comentario.meetiId
        }
    })

    //VERIFICAR QUE EL QUE LOS BORRE SEA EL CREADOR
    if(comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id){

        await Comentarios.destroy({
            where : {
                id : comentario.id
            }
        })
        res.status(200).send('Eliminado Correctamente');
        return next();
    } else { 
        res.status(403).send('Accion no valida');
        return next();
    }
}