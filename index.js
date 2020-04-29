const express = require('express');
const router = express.Router();

//IMPORTAR CONTROLADORES DEL BACKEND
const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const meetiController = require('../controllers/meetiController');

//IMPORTAR CONTROLADORES DEL FRONTEND
const meetiControllerFE = require('../controllers/frontend/meetiControllerFE');
const usuariosControllerFE = require('../controllers/frontend/usuariosControllerFE');
const gruposControllerFE = require('../controllers/frontend/gruposControllerFE');
const comentariosControllerFE = require('../controllers/frontend/comentariosControllerFE');
const busquedaControllerFE = require('../controllers/frontend/busquedaControllerFE');

module.exports = function(){

    router.get('/', 
        homeController.home
    );

//========================RUTAS DEL FRONTEND, PARA MOSTRAR==============================//

    //MOSTRAR UN MEETI Y SU INFORMACION
    router.get('/meeti/:slug',
        meetiControllerFE.mostrarMeeti
    );    
    
    //MOSTRAR LOS COMENTARIOS DEL MEETI
    router.post('/meeti/:id', 
        comentariosControllerFE.agregarComentario
    );

    //ELIMINAR COMENTARIOS DEL MEETI
    router.post('/eliminar-comentario',
        comentariosControllerFE.eliminarComentario
    );

    //MOSTRAR ASISTENTES DEL MEETI
    router.get('/asistentes/:slug', 
        meetiControllerFE.mostrarAsistentes
    );

    //MOSTRAR PERFIL EN EL FRONTEND
    router.get('/usuarios/:id',
        usuariosControllerFE.mostrarUsuario
    );

    //MOSTRAR ASISTENCIA DEL USUARIO A UN MEETI
    router.post('/confirmar-asistencia/:slug',
        meetiControllerFE.confirmarAsistencia
    );

    //MUESTRA LOS GRUPOS EN EL FRONTEND
    router.get('/grupos/:id',
        gruposControllerFE.mostrarGrupo
    );

    //MUESTRA MEETIS POR CATEGORIA
    router.get('/categoria/:categoria',
        meetiControllerFE.mostrarCategoria
    );

    //BUSQUEDA
    router.get('/busqueda',
        busquedaControllerFE.resultadosBusqueda
    );

//========================RUTAS PARA LAS CUENTAS==============================//

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

    //RUTAS PARA CERRAR SESION
    router.get('/cerrar-sesion',
        authController.usuarioAutenticado,
        authController.cerrarSesion
    );

//========================RUTAS INTERNAS, PARA EL USUARIO AUTENTICADO==============================//

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
    router.post('/nuevo-meeti',
        authController.usuarioAutenticado,
        meetiController.sanitizarMeeti,
        meetiController.crearMeeti
    );

    //RUTAS PARA EDITAR EL MEETI
    router.get('/editar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.formEditarMeeti,
        meetiController.formEliminarMeeti
    );
    router.post('/editar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.editarMeeti,
        meetiController.eliminarMeeti
    );
    
    //RUTAS PARA ELIMINAR EL MEETI
    router.get('/eliminar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.formEliminarMeeti
    );
    router.post('/eliminar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.eliminarMeeti
    );

//========================RUTAS PARA LOS PERFILES==============================//

    //RUTAS PARA EDITAR INFORMACION DE PERFIL
    router.get('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.formEditarPerfil
    ); 
    router.post('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.editarPerfil
    ); 

    //RUTAS PARA CAMBIAR EL PASSWORD
    router.get('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.formCambiarPassword
    ); 
    router.post('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.cambiarPassword
    );  
    
    //RUTAS PARA SUBIR IMAGEN DE PERFIL
    router.get('/imagen-perfil',
        authController.usuarioAutenticado,
        usuariosController.formSubirImagenPerfil
    );  
    router.post('/imagen-perfil',
        authController.usuarioAutenticado,
        usuariosController.subirImagenPerfil,
        usuariosController.guardarImagenPerfil
    );  

    return router;
}

