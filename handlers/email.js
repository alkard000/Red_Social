const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');
const fs = require('fs');
const util = require('util');
const ejs = require('ejs');

let transport = nodemailer.createTransport( {
    host : emailConfig.host,
    port : emailConfig.port,
    auth : {
        user : emailConfig.user,
        pass : emailConfig.pass
    }
});

exports.enviarEmail = async ( opciones) => {
    console.log(opciones);

    //Leer ARCHIVO
    const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`;
    //COMPILAR
    const compilado = ejs.compile(fs.readFileSync(archivo, 'utf8'));
    //crear HTML
    const html = compilado( { url : opciones.url } )
    //CONFIGURACION
    const opcionesEmail = {
        from : 'Meeti <no-reply@meeti.com',
        to : opciones.usuario.email,
        subject: opciones.subject,
        html
    }
    //ENVIAR
    const sendEmail  = util.promisify( transport.sendMail, transport );
    return sendEmail.call( transport, opcionesEmail );
}