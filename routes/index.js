const express = require('express');
const router = express.Router();

//IMPORTAR CONTROLADORES
const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const meetiController = require('../controllers/meetiController');

module.exports = function(){

    router.get('/', homeController.home);

    //RUTAS DE LA CREACION  Y CONFIRMACION DE CUENTAS
    router.get('/crear-cuenta', 
        usuariosController.formCrearCuentas
    );
    router.post('/crear-cuenta', 
        usuariosController.crearNuevaCuenta
    );
    router.get('/confirmar-cuenta/:correo', 
        usuariosController.confirmarCuenta
    );

    //RUTAS DE INICIAR SESSION
    router.get('/iniciar-sesion', 
        usuariosController.formIniciarSesion
    );
    router.post('/iniciar-sesion', 
        authController.autenticarUsuario
    );

    //RUTAS DEL PANEL DE ADMINISTRACION
    router.get('/administracion',
        authController.usuarioAutenticado,
        adminController.panelAdministracion
    );

    //RUTAS PARA LA CREACION DE NUEVOS GRUPOS
    router.get('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.formNuevoGrupo
    );
    router.post('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.crearGrupo
    );

    //RUTAS PARA EDITAR GRUPOS
    router.get('/editar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarGrupo
    );
    router.post('/editar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.editarGrupo
    );

    //RUTAS PARA EDITAR IMAGEN
    router.get('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarImagen
    );
    router.post('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.editarImagen
    );

    //RUTAS ELIMINAR GRUPOS
    router.get('/eliminar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.formEliminarGrupo
    )
    router.post('/eliminar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.eliminarGrupo
    );

    //RUTAS PARA CREAR NUEVOS MEETIS
    router.get('/nuevo-meeti',
        authController.usuarioAutenticado,
        meetiController.formNuevoMeeti
    );


    return router;
}

