const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');

exports.formNuevoGrupo = async (req, res) => {

    const categorias = await Categorias.findAll();

    res.render('nuevogrupo', {
        nombrePagina : 'Crea un nuevo grupo',
        categorias
    })
}

//Almacenar lo GRUPOS
exports.crearGrupo = async (req, res) => {    
    
    //SANITIZAR
    req.sanitizeBody('nombre');
    req.sanitizeBody('url');

    const grupo = req.body;
    console.log(grupo);
    grupo.usuarioId = req.user.id;

    

    try {
        //Almacenar
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el Grupo existosamente');
        res.redirect('/administracion');
    } catch (error) {
        //MESSAGES
        const erroresSequelize = error.errors.map( err => err.message );
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
}