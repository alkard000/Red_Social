import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {

    //DETECTAR TODOS LOS FORMS CON EL CLASS DE "ELIMINAR-COMENTARIO"
    const formsEliminar = document.querySelectorAll('.eliminar-comentario');
    
    //REVISAR SI ES QUE EXISTEN LOS COMENTARIO
    if(formsEliminar.length > 0){
        formsEliminar.forEach(form => {
            form.addEventListener('submit', eliminarComentario);//==>ESCUCHAR EL SUBMIT PARA ELIMINAR EL COMENTARIO
        })
    }
});

//CREACION DE LA FUNCION PARA LA CONDICION DE ARRIBA
function eliminarComentario(e) {
    e.preventDefault();

    Swal.fire({
        title: 'Eliminar Comentario',
        text: "Un comentarios eliminado no se puede recuperar",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, borrar!',
        cancelButtonText : 'No borrar'
      }).then((result) => {
        if (result.value) {  

            //TOMAR EL ID DEL COMENTARIO
            const comentarioId = this.children[0].value;

            //CREAR EL OBJETO A ELIMINAR
            const datos = {
                comentarioId
            }

            //EJECUTAR AXIOS Y PASAR LOS DATOS
            axios.post(this.action, datos)
                .then(respuesta => {            
                    Swal.fire(
                        'Eliminado!',
                        respuesta.data,
                        'success'
                    );

                    //ELIMINAR DEL DOM
                    this.parentElement.parentElement.remove();
                    
            })  .catch(error => {
                    if(error.response.status === 404 || error.response.status === 403){
                        Swal.fire(
                            'Error',
                            error.response.status,
                            'error'
                        );
                    }//==> ERRORES PARA AXIOS = ERROR.RESPONSE
            });
        }
    })
}



