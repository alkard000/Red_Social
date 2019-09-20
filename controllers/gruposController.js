const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const multer = require('multer');
const shortid = require('shortid');

const configuracionMulter = {
    limits : { filesize : 100000 },
    storage : fileStorage = multer.diskStorage({
        destination : (req, res, next) => {
            next(null, __dirname + '/../public/uploads/grupos')
        },
        filename : (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    })
}

const upload = multer(configuracionMulter).single('imagen');

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if(error){
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El Archivo de Imagen es muy Grande')
                } else {
                    req.flash('error', error.message);
                }
            } else if(error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        }else {
            next();
        }
    }),
    fileFilter(req, file, next) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            //Formato VALIDO
            next(null, true);
        } else {
            //Formato NO VALIDO
            next(new Error('Formato no Valido'), false);
        }
    }
}

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

    //LEER la imagen
    if(req.file){
      grupo.imagen = req.file.filename;
    }

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