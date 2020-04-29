import { OpenStreetMapProvider } from 'leaflet-geosearch';
import asistencia from './asistencia';
import eliminarComentario from './eliminarComentario';

//OBTENER LOS VALORES DE LA BASE DE DATOS


const lat = document.querySelector('#lat').value || -33.4372;
const lng = document.querySelector('#lng').value || -70.6506;
const direccion = document.querySelector('#direccion').value || '';
const geocodeService = L.esri.Geocoding.geocodeService();


const map = L.map('mapa').setView([lat, lng], 15);

let markers = new L.FeatureGroup().addTo(map);
let marker;

//COLOCAR EL PING EN EDICION
if(lat && lng){
    marker = new L.marker([lat, lng], { //==> SE UBICA EL PUNTERO A MEDIDA QUE SE BUSCA EN EL INPUT
        draggable : true, //==> SE MUEVE EL MAPA CON EL PUNTERO
        autoPan : true    //==> SE CENTRA EL MAPA
    })
    .addTo(map)
    .bindPopup(direccion)
    .openPopup();

    //DETECTAR EL MOVIMIENTO DEL MARKER ==> SE CAMBIAN LAS COORDENADAS POR EL MOVIMIENTO
    marker.on('moveend', function(e){
        marker = e.target;
        const posicion = marker.getLatLng(); //==>ACCEDEMOS A LA LATITUD Y LONGITUD
        map.panTo(new L.LatLng(posicion.lat, posicion.lng)); //==> ESTA FUNCION CENTRA EL MAPA A MEDIDA QUE SE CAMBIA EL AMRCADOR

        //REVERSE GEOCODING CUANDO EL USUARIO REUBICA EL PIN
        geocodeService.reverse().latlng(posicion, 15).run(function(error, result) { //==>SE LE PASA EL NUEVO PUNTO, CON REVERSE GEOCODING A LA POSICION DEL PIN CUANDO REINICIA E LMOVIMIENTO
            
            llenarInputs(result);

            //ASIGNA LOS VALORES DLE POPUP DEL MARKER 
            marker.bindPopup(result.address.LongLabel);
            console.log(result);
        });
    })    
}

document.addEventListener('DOMContentLoaded', () => {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //BUSCAR LA DIRECCION 
    const buscador = document.querySelector('#formbuscador'); //==> DELECCIONA LA ID DEL INPUT DEL FORMULARIO
    buscador.addEventListener('input', buscarDireccion);      //==> ESCUCHA LO QUE ESCRIBE EL USUARIO
})

function buscarDireccion(e) {
    if(e.target.value.length > 10){

        //SI EXISTE UN PIN ANTERIOR, LIMPIARLO
        markers.clearLayers();

        //USAR EL PROVIDER Y GEOCODER
        const geocodeService = L.esri.Geocoding.geocodeService();

        const provider = new OpenStreetMapProvider();
        provider.search({
            query : e.target.value
        }).then((resultado) => {

            geocodeService.reverse().latlng(resultado[0].bounds[0], 15).run(function(error, result) {
                
                llenarInputs(result);

                //UBICAR EL MAPA
                map.setView(resultado[0].bounds[0], 15) //==>SE UBICA EL MAPA A MEDIDA QUE SE BUSCA EN EL INPUT

                //AGREGAR EL PIN
                marker = new L.marker(resultado[0].bounds[0], { //==> SE UBICA EL PUNTERO A MEDIDA QUE SE BUSCA EN EL INPUT
                    draggable : true, //==> SE MUEVE EL MAPA CON EL PUNTERO
                    autoPan : true    //==> SE CENTRA EL MAPA
                })
                .addTo(map)
                .bindPopup(resultado[0].label)
                .openPopup();

                //DETECTAR EL MOVIMIENTO DEL MARKER ==> SE CAMBIAN LAS COORDENADAS POR EL MOVIMIENTO
                marker.on('moveend', function(e){
                    marker = e.target;
                    const posicion = marker.getLatLng(); //==>ACCEDEMOS A LA LATITUD Y LONGITUD
                    map.panTo(new L.LatLng(posicion.lat, posicion.lng)); //==> ESTA FUNCION CENTRA EL MAPA A MEDIDA QUE SE CAMBIA EL AMRCADOR

                    //REVERSE GEOCODING CUANDO EL USUARIO REUBICA EL PIN
                    geocodeService.reverse().latlng(posicion, 15).run(function(error, result) { //==>SE LE PASA EL NUEVO PUNTO, CON REVERSE GEOCODING A LA POSICION DEL PIN CUANDO REINICIA E LMOVIMIENTO
                        
                        llenarInputs(result);

                        //ASIGNA LOS VALORES DLE POPUP DEL MARKER 
                        marker.bindPopup(result.address.LongLabel);
                        console.log(result);
                    });
                })

                //ASIGNAR AL CONTENEDOR MARKERS
                markers.addLayer(marker);
                })

        })
    } //==>ACCEDER A LOS QUE EL USUARIO ESCRIBA EN EL INPUT CUANDO EL STRING SEA MAYOR A 8
}

//LLENAR LOS INPUTS DE LA INFORMACION DEL MARKER
function llenarInputs(resultado){
    document.querySelector('#direccion').value = resultado.address.Address || '';
    document.querySelector('#ciudad').value = resultado.address.City || '';
    document.querySelector('#estado').value = resultado.address.Region || '';
    document.querySelector('#pais').value = resultado.address.CountryCode || '';
    document.querySelector('#lat').value = resultado.latlng.lat || '';
    document.querySelector('#lng').value = resultado.latlng.lng || '';

}

