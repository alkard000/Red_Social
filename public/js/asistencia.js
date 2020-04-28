import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
    const asistencia = document.querySelector('#confirmar-asistencia');
    if(asistencia){
        asistencia.addEventListener('submit', confirmarAsistencia)
    }
});

function confirmarAsistencia(e) {
    e.preventDefault();

    const btn = document.querySelector('#confirmar-asistencia input[type = "submit"]');
    let accion = document.querySelector('#accion').value;
    const mensaje = document.querySelector('#mensaje');

    //LIMPIAR LA RESPUESTA PREVIA
    while(mensaje.firstChild){
        mensaje.removeChild(mensaje.firstChild);
    }

    //OBTIENE EL VALOR DE ASISTIR O CANCELAR DEL HIDDEN

    const datos = {
        accion
    }

    axios.post(this.action, datos)
        .then(respuesta => {
            
            console.log(respuesta);

            if(accion === "confirmar"){

                //MODIFICAR EL TEXTO A CANCELAR
                document.querySelector('#accion').value = 'cancelar';
                btn.value = 'Cancelar';
                btn.classList.remove('btn-azul');
                btn.classList.add('btn-rojo');
            } else {

                //CONTRARIO A LOS DE ARRIBA
                document.querySelector('#accion').value = 'confirmar';
                btn.value = 'Si';
                btn.classList.remove('btn-rojo');
                btn.classList.add('btn-azul');
            }

            //MOSTRAR MENSAJE
            mensaje.appendChild(document.createTextNode(respuesta.data))
        })
}