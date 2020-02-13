// map method is used to instantiate a map object based on the given div element.
// setView method is used to set view of the map according to the given geographical center and zoom level
var map = L.map('mapid').setView([44.4327466,-89.5707633], 7);

// tileLayer is used to display layers on the map. Several parameters can be set to customize the initial display status
// addTo method is used to add the layer to a map object
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/light-v9'
	}).addTo(map);

//initialize function called when the script loads
function initialize(){
	// call the adaptedAjax function and acquire the data result.
	var mydata = adaptedAjax();
	// Note that the process is asynchronous, so the data loading may not be complete,
	// and thus the mydata we get here may still be undefined
	console.log('This is undefined: ',mydata);
};

// define a onEachFeature function and judge if both feature.properties exists
// if exists, bind a popup with the popupContent (geojson properties) in the layer
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};


// callback function for ajax
function adaptedCallback(response){
	// The data loading is complete when we call this function
	// So the data can be printed in the console here.
	console.log('This is the data: ', response);

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
	L.geoJson(response, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
								onEachFeature: onEachFeature
  }).addTo(map);
};

function adaptedAjax(){
// declaim the mydata variable
	var mydata;
	// JQuery Ajax Requests method for loading and using geoJSON data
	$.ajax("data/map.geojson", {
		// set dataType to json since we are loading geoJSON file
		dataType: "json",
		// When succeed, trigger this anonymous callback function
		success: function(response){
			// assign response data to mydata
			mydata = response;
			// trigger another function named debugCallback
			adaptedCallback(mydata);
		}
	});
	// The data loading may not be complete since it is outside the anonymous function
	// so we got undefined here
	console.log('This is undefined: ',mydata);

	// return our data (may not finish the loading yet)
	return mydata;
};

//call the initialize function when the document has loaded
$(document).ready(initialize);
