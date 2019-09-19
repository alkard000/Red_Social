const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');


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
        
    return router;
}