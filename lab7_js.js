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
        fillColor: setColorFunc(feature.properties.num_bll_5p),
        fillOpacity: 0.9,
        weight: 1,
        opacity: 1,
        color: '#ffffff',
        dashArray: '3'
    };
}

// Set function for color ramp, you can use a better palette
function setColorFunc(density){
    return density > 42 ? '#ae017e' :
        density > 24 ? '#f768a1' :
        density > 11 ? '#fbb4b9' :
        density > 0 ? '#feebe2' :
                        '#BFBCBB';
};

// Now we’ll use the onEachFeature option to add the listeners on our state layers:
function onEachFeatureFunc(feature, layer){
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomFeature
    });
    layer.bindPopup('Number of Children with Elevated BLLs: '+feature.properties.num_bll_5p);
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
    div.innerHTML += '<b>Number of Children</b><br />';
    div.innerHTML += '<b>with BLLs w/ 5+ µg/dL</b><br />';
    div.innerHTML += 'by census tract<br />';
    div.innerHTML += '<br>';
    div.innerHTML += '<i style="background: #ae017e"></i><p>42+</p>';
    div.innerHTML += '<i style="background: #f768a1"></i><p>24-42</p>';
    div.innerHTML += '<i style="background: #fbb4b9"></i><p>12-23</p>';
    div.innerHTML += '<i style="background: #feebe2"></i><p>0-11</p>';
    div.innerHTML += '<hr>';
    div.innerHTML += '<i style="background: #BFBCBB"></i><p>No Data</p>';
    
    // Return the Legend div containing the HTML content
    return div;
};

// Add Legend to Map
legend.addTo(map);