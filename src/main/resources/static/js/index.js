var map = L.map('map').setView([41.33, 14.33], 7); //inizializzo la mappa su Alife

L.control.scale().addTo(map);   //scala della mappa

//creo la mappa di OpenStreetMap
const openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { 
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//creo la mappa da satellite di Google 
const satellite = L.tileLayer('http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}', {
	attribution: '&copy; <a href="https://www.google.com/intl/it_it/help/terms_maps/">Google</a>'
});

var baseMaps = {
    "OpenStreetMap" : openStreetMap,
    "Satellite" : satellite
}

L.control.layers(baseMaps).addTo(map);  //aggiungo il control per switchare layer
//

/*posiziono un marker sulla mappa
L.marker([41.33, 14.33]).addTo(map)
    .bindPopup('<b>Alife</b>')
    .openPopup();
*/

/*traccio un cerchio sulla mappa
var circle = L.circle([41.33, 14.33], {
    color: 'red',
    fillColor: '#f92',
    fillOpacity: 0.2,
    radius: 1500
}).addTo(map);
*/

//circle.bindPopup("<b>Area di estensione di Alife</b>"); //quando clicco all'interno del cerchio compare questo popup

//Ottenere le coordinate con un click
//var popup = L.popup();

/*function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("<b>Coordinate</b> " + e.latlng.toString())
        .openOn(map);
}*/
//

//map.on('click', onMapClick);
//

function creaPuntino(feature, latlng) { //al posto del marker normale uso un puntino
    return L.circleMarker(latlng, {
        radius: 10, // imposta il raggio del cerchio
        fillColor: "red", // imposta il colore di riempimento
        color: "red", // imposta il colore del bordo
        weight: 1, // imposta lo spessore del bordo
        opacity: 1, // imposta l'opacità del cerchio
        fillOpacity: 0.8 // imposta l'opacità del riempimento
    });
}

//Aggiungo il json con i punti dei terremoti alla mappa
L.geoJSON(jsonTerremoti, {
    pointToLayer: creaPuntino,
    onEachFeature: function(feature, layer){
        layer.bindPopup("<b>Posizione:</b> " + feature.geometry.coordinates[1] + ", " + feature.geometry.coordinates[0] + "<br>" +
                        "<b>Data e ora:</b> " + feature.properties.DateTime + "<br>" +
                        "<b>Magnitudo:</b> " + feature.properties.Magnitude + "<br>" +
                        "<b>Profondità:</b> " + feature.properties.Depth + " km<br>");
    }
}).addTo(map);


function aggiornaLayer(filtrati){
    map.eachLayer(function(layer) {
        if(layer.getAttribution() != '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' && layer.getAttribution() != '&copy; <a href="https://www.google.com/intl/it_it/help/terms_maps/">Google</a>') {
            map.removeLayer(layer);
        }
    });

    map.addLayer(filtrati);  // Aggiungi il layer filtrato
    map.removeLayer(jsonTerremoti);  // Rimuovi il layer originale
    map.invalidateSize();
}

function creaPopup(filtrati){
    filtrati.eachLayer(function(layer) {
        layer.on('click', function(e) {
          var feature = e.target.feature;
          var popupContent = "<b>Posizione:</b> " + feature.geometry.coordinates[1] + ", " + feature.geometry.coordinates[0] + "<br>" +
                             "<b>Magnitudo:</b> " + feature.properties.Magnitude + "<br>" +
                             "<b>Data:</b> " + feature.properties.DateTime + "<br>" +
                             "<b>Profondità:</b> " + feature.properties.Depth + " km <br>";
          layer.bindPopup(popupContent).openPopup();
        });
    });
}

function filtraPerMagnitudo(){
    var magnitudo = document.getElementById('selectMagnitudo').value;
    magnitudo = Math.floor(magnitudo);
    console.log("Scelto il magnitudo " + magnitudo);
    
    var filtrati = L.geoJson(jsonTerremoti, {
        pointToLayer: creaPuntino,
        filter: function(feature) {
            var magn = Math.floor(feature.properties.Magnitude);
            return magn == magnitudo;
        }
    });

    filtrati.eachLayer(function(layer) {    //mi serve a vedere se il filtraggio ha funzionato
        console.log(layer.feature.properties);
    });

    aggiornaLayer(filtrati);
    creaPopup(filtrati)

    return filtrati;
}

function vediHeatmapPerMagnitudo(){
    var filtrati = filtraPerMagnitudo();    //ricevo il layer dalla funzione
    var filtrati2 = filtrati.toGeoJSON();   //converto il layer in un GeoJSON

    var heatmapPoints = [];
    
    //Creo l'heatmap a partire da GeoJson filtrato
    filtrati2.features.forEach(function(feature){
        heatmapPoints.push([feature.geometry.coordinates[1], feature.geometry.coordinates[0], feature.properties.Magnitude]);
    });
    
    console.log(heatmapPoints);
    
    var heatmap = L.heatLayer(heatmapPoints, {
                                               radius: 25,
                                               minOpacity: 0.5}).addTo(map);
    
    aggiornaLayer(heatmap);
}

function filtraPerAnno(){
    var anno = document.getElementById('textInput').value;
    console.log("Scelto l'anno " + anno);

    var annoInt = parseInt(anno);
    if(annoInt < 1990 || annoInt > 2014 || isNaN(annoInt)){ //controllo se l'anno è ammesso
        console.log("Ma che è ooooooo");
        alert("L'anno selezionato non è presente nel dataset\nInserire un valore compreso tra 1990 e 2014");
        return undefined;
    }

    var filtrati = L.geoJson(jsonTerremoti, {
        pointToLayer: creaPuntino,
        filter: function(feature){
        var str = feature.properties.DateTime;
            return str.includes(anno);
        }
    });

    filtrati.eachLayer(function(layer) {    //mi serve a vedere se il filtraggio ha funzionato
        console.log(layer.feature.properties);
    });

    aggiornaLayer(filtrati);
    creaPopup(filtrati);

    return filtrati;
}

function vediHeatmapPerAnno(){
    var filtrati = filtraPerAnno();    //ricevo il layer dalla funzione
    var filtrati2 = filtrati.toGeoJSON();   //converto il layer in un GeoJSON

    var heatmapPoints = [];
    
    //Creo l'heatmap a partire da GeoJson filtrato
    filtrati2.features.forEach(function(feature){
        heatmapPoints.push([feature.geometry.coordinates[1], feature.geometry.coordinates[0], feature.properties.Magnitude]);
    });
    
    console.log(heatmapPoints);
    
    var heatmap = L.heatLayer(heatmapPoints, {
                                               radius: 25,
                                               minOpacity: 0.5}).addTo(map);
    
    aggiornaLayer(heatmap);
}

function vediHeatmap(){
    /*Esce meglio con il plugin
    console.log("Raster caricato");
    var imageUrl = "geofile/raster/raster_terremoti.png";
    var imageBounds = L.latLngBounds([[-90, -180], [90, 180]]);
    L.imageOverlay(imageUrl, imageBounds).addTo(map);
    */

    var heatmapPoints = [];
    //aggiungo latlng e magnitudo ad ogni elemento dell'array
    jsonTerremoti.features.forEach(function(feature){
        heatmapPoints.push([feature.geometry.coordinates[1], feature.geometry.coordinates[0], feature.properties.Magnitude]);
    });
    
    console.log(heatmapPoints);
    
    var heatmap = L.heatLayer(heatmapPoints, {
                                               radius: 25,
                                               minOpacity: 0.5}).addTo(map);
    
    aggiornaLayer(heatmap);  
}



