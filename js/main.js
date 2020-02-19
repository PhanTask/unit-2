//GOAL: Proportional symbols representing attribute values of mapped features

var map;
var minValue;

//step 1 create map
function createMap(){

     //create the map
		 // map method is used to instantiate a map object based on the given div element.
		 // setView method is used to set view of the map according to the given geographical center and zoom level
		map = L.map('mapid').setView([44.4327466,-89.5707633], 7);

		 // tileLayer is used to display layers on the map. Several parameters can be set to customize the initial display status
		 // addTo method is used to add the layer to a map object
		 L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		 		maxZoom: 18,
		 		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		 			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		 			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		 		id: 'mapbox/light-v9'
		 	}).addTo(map);

			//call getData function
			getData(map);
};

function calcMinValue(data){

     //create empty array to store all data values
     var allValues = [];

     //loop through each city
     for(var city of data.features){
          //loop through each year
          for(var year = 2010; year <= 2018; year+=1){
                //get population for current year
               var value = city.properties["pop"+ String(year)];
               //add value to array
               allValues.push(value);
           }
     }

     //get minimum value of our array
     var minValue = Math.min(...allValues)

     return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {

     //constant factor adjusts symbol sizes evenly
     var minRadius = 5;

     //Flannery Appearance Compensation formula
     var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

     return radius;
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

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
		//Step 4: Assign the current attribute based on the first index of the attributes array
		var attribute = attributes[0];
		//check
		console.log(attribute);

		// create a set of geojsonMarkerOptions used for customizing markers
		var geojsonMarkerOptions = {
				 fillColor: "#ff7800",
				 color: "#fff",
				 weight: 1,
				 opacity: 1,
				 fillOpacity: 0.8,
				 radius: 8
		 };

		 //Step 5: For each feature, determine its value for the selected attribute
		 var attValue = Number(feature.properties[attribute]);

		 //Step 6: Give each feature's circle marker a radius based on its attribute value
		 geojsonMarkerOptions.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);

		//build popup content string starting with city...Example 2.1 line 24
		var popupContent = "<p><b>City:</b> " + feature.properties.city + "</p>";

		//add formatted attribute to popup content string
		var year = attribute.split("op")[1];
		popupContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute] + " persons</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent,{offset: new L.Point(0,-geojsonMarkerOptions.radius)});

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};





//Step 3: Add circle markers for point features to the map
function createPropSymbols(response,attributes){
	// The data loading is complete when we call this function
	// So the data can be printed in the console here.
	console.log('This is the data: ', response);

	// parse states geojson data
	// generate circleMarker based on coordinates and geojsonMarkerOptions
	// create a geojson layer and add it to the map
	L.geoJson(response, {
          pointToLayer : function(feature, latlng){
						return pointToLayer(feature, latlng, attributes);
					}
     }).addTo(map);
};

//Step 2: Import GeoJSON data
function getData(map){
// declaim the mydata variable
	var mydata;
	//load the data
	    $.getJSON("data/map_new.geojson", function(response){

				//create an attributes array
        var attributes = processData(response);

				//calculate minimum data value
	      minValue = calcMinValue(response);

        //call function to create proportional symbols
        createPropSymbols(response,attributes);

				//add UI elements
				createSequenceControls(attributes);
			});
};

//GOAL: Allow the user to sequence through the attributes and resymbolize the map according to each attribute

//Step 1: Create new sequence controls
function createSequenceControls(attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
		//set slider attributes
		$('.range-slider').attr({
				max: 8,
				min: 0,
				value: 0,
				step: 1
		});
		//below Example 3.6...add step buttons
    $('#panel').append('<button class="step" id="reverse">Reverse</button>');
    $('#panel').append('<button class="step" id="forward">Forward</button>');
		//replace button content with images
		$('#reverse').html('<img src="img/noun_Reverse.png">');
		$('#forward').html('<img src="img/noun_Play.png">');

		//Step 5: click listener for buttons
		$('.step').click(function(){
			//get the old index value
			var index = $('.range-slider').val();

			//Step 6: increment or decrement depending on button clicked
			if ($(this).attr('id') == 'forward'){
				index++;
				//Step 7: if past the last attribute, wrap around to first attribute
				index = index > 8 ? 0 : index;
			} else if ($(this).attr('id') == 'reverse'){
				index--;
				//Step 7: if past the first attribute, wrap around to last attribute
				index = index < 0 ? 8 : index;
			};

			//Step 8: update slider
			$('.range-slider').val(index);

			//Called in both step button and slider event listener handlers
			//Step 9: pass new attribute to update symbols
			updatePropSymbols(attributes[index]);

		});

		//Step 5: input listener for slider
		$('.range-slider').on('input', function(){
			//Step 6: get the new index value
			var index = $(this).val();
			console.log(index);

			//Called in both step button and slider event listener handlers
			//Step 9: pass new attribute to update symbols
			updatePropSymbols(attributes[index]);

		});
};

//Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("pop") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup

						//access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.city + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("op")[1];
            popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " persons</p>";

            //update popup content
            popup = layer.getPopup();
            popup.setContent(popupContent).update();

        };
    });
};

//call the initialize function when the document has loaded
$(document).ready(createMap);
