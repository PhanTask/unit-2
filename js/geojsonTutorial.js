// map method is used to instantiate a map object based on the given div element.
// setView method is used to set view of the map according to the given geographical center and zoom level
var map = L.map('mapid').setView([39.74739, -105], 5);

// tileLayer is used to display layers on the map. Several parameters can be set to customize the initial display status
// addTo method is used to add the layer to a map object
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/light-v9'
	}).addTo(map);

// create a javascript object in the geojson format (point)
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

// geoJSON method is used to parse geojson format data and create a geojson layer
L.geoJSON(geojsonFeature).addTo(map);

// create a list of javascript objects in the geojson format (a list of linestrings)
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

var myLayer = L.geoJSON().addTo(map);

// addData method is used to add a GeoJSON object to the layer.
myLayer.addData(geojsonFeature);

// create a list of javascript objects in the geojson format (a list of linestrings)
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

// define a style object used for styling geojson objects
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

// parse myLines geojson data, style them using myStyle, create a geojson layer, and add it to the map
L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

// create a list of javascript objects in the geojson format (a list of polygons)
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

// parse states geojson data
// style(color) them feature by feature based on feature.properties.party attributes values
// create a geojson layer and add it to the map
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);

// create a set of geojsonMarkerOptions used for customizing markers
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

// parse states geojson data
// generate circleMarker based on coordinates and geojsonMarkerOptions
// create a geojson layer and add it to the map
L.geoJSON(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);

// define a onEachFeature function and judge if both feature.properties and feature.properties.popupContent exist
// if exist, bind a popup with the popupContent in the layer
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

// create an object in the geojson format (point)
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

// parse states geojson data
// attach the onEachFeature function to each feature
// create a geojson layer and add it to the map
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);

// create a list of javascript objects in the geojson format (a list of points)
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

// parse states geojson data
// filter(don't include) the features that didn't show on the map
// create a geojson layer and add it to the map
L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);
