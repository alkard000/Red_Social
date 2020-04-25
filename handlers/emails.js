const nodemailer = require('nodemailer');
const emailConfig = require('../config/emails');
const fs = require('fs');
const util = require('util');
const ejs = require('ejs');

let transport = nodemailer.createTransport({
    host : emailConfig.host,
    port : emailConfig.port,
    auth : {
        user : emailConfig.auth.user,
        pass : emailConfig.auth.pass
    }
});

exports.enviarEmail = async (opciones) => {
    console.log(opciones);

    //LEER EL ARCHIVO PARA EL EMAIL
    const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`; //==> SE LE PASA EL LINK DEL ARCHIVO

    //COMPILAR EL EMAIL
    const compilado = ejs.compile(fs.readFileSync(archivo, 'utf8'));//==> SE COMPILA Y SE LE PASA EL UTF8

    //CREAR HTML DEL EMAIL
    const html = compilado({   
        url : opciones.url                                          //==> SE LE PASA LA URL PARA CREAR EL HTML
    });

    //CONFIGURAR LAS OPCIONES DEL EMAIL
    const opcionesEmail = {
        from : 'Meeti <noreply@meeti.com>', //==> EL REMITENTE
        to : opciones.usuario.email,       //==> A QUIEN VA DIRIGIDO EL EMAIL
        subject : opciones.subject,         //==> ASUNTO DEL EMAIL
        html                                //==> EL HTML DEL EMAIL
    }

    //ENVIAR EL EMAIL
    const sendEmail = util.promisify(transport.sendMail, transport);
    return sendEmail.call(transport, opcionesEmail); //==>AL CALL SE LE PASA LA CONFIGURACION DEL TRANSPORT Y LAS OPCIONES DEL EMAIL
}