const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const eventosController = require('../controllers/eventosController');


module.exports = function() {
    router.get('/', 
        homeController.home
    );

    //CREAR Y CONFIRMAR CUENTAS
    router.get('/crear-cuenta', 
        usersController.formCrearCuenta
    );
    router.post('/crear-cuenta',
        usersController.crearNuevaCuenta
    );
    router.get('/confirmar-cuenta/:correo',
        usersController.confirmarCuenta
    );

    //INICIAR SESION
    router.get('/iniciar-sesion', 
        usersController.formIniciarSesion
    );
    router.post('/iniciar-sesion',
        authController.autenticarUsuario
    );

    //ADMINISTRACION
    router.get('/administracion',
        authController.usuarioAutenticado,
        adminController.panelAdministracion
    );

    //-------------------CRUD GRUPOS----------------------//

    //CREAR GRUPOS
    router.get('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.formNuevoGrupo
    );
    router.post('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.crearGrupo
    );

    //EDITAR GRUPOS
    router.get('/editar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarGrupo
    );
    router.post('/editar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.editarGrupo
    );

    //EDITAR IMAGENES
    router.get('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarImagen
    );
    router.post('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.editarImagen 
    );

    //ELIMINAR GURPO
    router.get('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEliminarGrupo
    );
    router.post('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.eliminarGrupo
    );

    //-------------------CRUD GRUPOS----------------------//

    //-------------------CRUD EVENTOS----------------------//

    //NUEVO EVENTO
    router.get('/nuevo-evento', 
        authController.usuarioAutenticado,
        eventosController.formNuevoEvento
    );

    //-------------------CRUD EVENTOS----------------------//
     
    return router;
}