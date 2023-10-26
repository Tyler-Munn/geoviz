var map = L.map('map', {center: [39.981192, -75.155399], zoom: 10});
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap' }).addTo(map);
map.doubleClickZoom.disable();

// load GeoJSON from an external file
$.getJSON("blood_lead.geojson",function(data){
    // add GeoJSON layer to the map once the file is loaded
    L.geoJson(data, {
        
    }).addTo(map);
});

var neighborhoodsLayer = null;
$.getJSON("blood_lead.geojson",function(data){
    neighborhoodsLayer = L.geoJson(data, {
        style: styleFunc,
        onEachFeature: onEachFeatureFunc,
    }).addTo(map);
});

// Set style function that sets fill color property equal to blood lead
function styleFunc(feature) {
    return {
        fillColor: setColorFunc(feature.properties.perc_5plus),
        fillOpacity: 0.9,
        weight: 1,
        opacity: 1,
        color: '#ffffff',
        dashArray: '3'
    };
}

// Set function for color ramp, you can use a better palette
function setColorFunc(density){
    return density > 15 ? '#800000' :
        density > 10 ? '#A0522D' :
        density > 5 ? '#DAA520' :
        density > 0 ? '#FFF8DC' :
                        '#BFBCBB';
};

// Now we’ll use the onEachFeature option to add the listeners on our state layers:
function onEachFeatureFunc(feature, layer){
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomFeature
    });
    layer.bindPopup('Blood lead level: '+feature.properties.perc_5plus);
}

function highlightFeature(e){
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    // for different web browsers
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

// Define what happens on mouseout:
function resetHighlight(e) {
    neighborhoodsLayer.resetStyle(e.target);
}

// As an additional touch, let’s define a click listener that zooms to the state: 
function zoomFeature(e){
    console.log(e.target.getBounds());
    map.fitBounds(e.target.getBounds().pad(1.5));
}

// Add Scale Bar to Map
L.control.scale({position: 'bottomleft'}).addTo(map);

// Create Leaflet Control Object for Legend
var legend = L.control({position: 'bottomright'});

// Function that runs when legend is added to map
legend.onAdd = function (map) {
    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');            
    div.innerHTML += '<b>Blood lead level</b><br />';
    div.innerHTML += 'by census tract<br />';
    div.innerHTML += '<br>';
    div.innerHTML += '<i style="background: #800000"></i><p>15+</p>';
    div.innerHTML += '<i style="background: #A0522D"></i><p>10-15</p>';
    div.innerHTML += '<i style="background: #DAA520"></i><p>5-10</p>';
    div.innerHTML += '<i style="background: #DEB887"></i><p>0-5</p>';
    div.innerHTML += '<hr>';
    div.innerHTML += '<i style="background: #BFBCBB"></i><p>No Data</p>';
    
    // Return the Legend div containing the HTML content
    return div;
};

// Add Legend to Map
legend.addTo(map);