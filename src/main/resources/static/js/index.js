var map = L.map('map').setView([41.33, 14.33], 7); //inizializzo la mappa su Alife

//do il contenuto alla mappa
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { 
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
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
var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("<b>Coordinate</b> " + e.latlng.toString())
        .openOn(map);
}
//

map.on('click', onMapClick);
//

//Aggiungo il json con i punti dei terremoti alla mappa
L.geoJSON(jsonTerremoti).addTo(map);
L.geoJSON(jsonTerremoti, {
    onEachFeature: function(feature, layer){
    layer.bindPopup("<b>Posizione:</b> " + feature.geometry.coordinates[1] + ", " + feature.geometry.coordinates[0] + "<br>" +
                    "<b>Data e ora:</b> " + feature.properties.DateTime + "<br>" +
                    "<b>Magnitudo:</b> " + feature.properties.Magnitude + "<br>" +
                    "<b>Profondità:</b> " + feature.properties.Depth + " km<br>");
    }
}).addTo(map);
//

function aggiornaLayer(filtrati){
    map.eachLayer(function(layer) {
        if(layer.getAttribution() != '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>') {
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
    magnitudo = parseFloat(magnitudo);
    console.log("Scelto il magnitudo " + magnitudo);
    
    var filtrati = L.geoJson(jsonTerremoti, {
        filter: function(feature) {
            var magn = parseFloat(feature.properties.Magnitude);
            return magn >= magnitudo;
        }
    });

    filtrati.eachLayer(function(layer) {    //mi serve a vedere se il filtraggio ha funzionato
        console.log(layer.feature.properties);
    });

     aggiornaLayer(filtrati);
     creaPopup(filtrati)
}

function filtraPerAnno(){
    var anno = document.getElementById('textInput').value;
    console.log("Scelto l'anno " + anno);

    var filtrati = L.geoJson(jsonTerremoti, {
        filter: function(feature){
        var str = feature.properties.DateTime;
            return str.includes(anno);
        }
    });

    filtrati.eachLayer(function(layer) {    //mi serve a vedere se il filtraggio ha funzionato
        console.log(layer.feature.properties);
    });

     aggiornaLayer(filtrati);
     creaPopup(filtrati)
}

function vediRaster(){
    console.log("Raster caricato");
    var imageUrl = "geofile/raster/prova.png";
    var imageBounds = [[181.1110000000000184,85.9479999999999933], [-180.9890000000000043,-67.5520000000000067]];
    L.imageOverlay(imageUrl, imageBounds).addTo(map);
}



