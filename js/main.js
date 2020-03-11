//GOAL: Proportional symbols representing attribute values of mapped features

var map;
var minValue;
var SequenceControls;
var Legend;
var dataStats = {};

//step 1 create map
function createMap(){

    //create the map
	// map method is used to instantiate a map object based on the given div element.
	// tileLayer is used to display layers on the map. Several parameters can be set to customize the initial display status
	// addTo method is used to add the layer to a map object
	var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
		maxZoom: 20,
		attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
	});
	
	var NASAGIBS_ViirsEarthAtNight2012 = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
		attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
		bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
		minZoom: 1,
		maxZoom: 8,
		format: 'jpg',
		time: '',
		tilematrixset: 'GoogleMapsCompatible_Level'
	});
		 
	map = L.map('mapid', {
		center: [38.6322548,-98.4811946],
		zoom: 4,
		layers: [NASAGIBS_ViirsEarthAtNight2012,Stadia_AlidadeSmoothDark]
	});
	
	// add title
	L.Control.TitleControl = L.Control.extend({
	  onAdd: function(map) {
	var el = L.DomUtil.create('div', 'title-control-container');
	el.innerHTML = 'Where did the m$ney go? - The Top-20 Richest U.S. Metropolitan Areas and How They Grow (2010-2018)';
	return el;
	},
	onRemove: function(map) {
			// Nothing to do here
		  }
	});
	L.control.titleControl = function(opts) {
		  return new L.Control.TitleControl(opts);
	}
	L.control.titleControl({
	position: 'topright'
	}).addTo(map);
	
	
	var baseMaps = {
		"ViirsEarthAtNight": NASAGIBS_ViirsEarthAtNight2012,
		"AlidadeSmoothDark": Stadia_AlidadeSmoothDark
	};
	
	L.control.layers(baseMaps).addTo(map);
	
	//call getData function
	getData(map);
};

function calcStats(data){

     //create empty array to store all data values
     var allValues = [];

     //loop through each city
     for(var city of data.features){
          //loop through each year
          for(var year = 2010; year <= 2018; year+=1){
                //get GDP for current year
               var value = city.properties["pop"+ String(year)];
               //add value to array
               allValues.push(value);
           }
     }

		 //get min, max, mean stats for our array
		dataStats.min = Math.min(...allValues);
		dataStats.max = Math.max(...allValues);

		//calculate mean
		var sum = allValues.reduce(function(a, b){return a+b;});
		dataStats.mean = sum/ allValues.length;

     //get minimum value of our array
    //  var minValue = Math.min(...allValues)
		 //
    //  return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {

     //constant factor adjusts symbol sizes evenly
     var minRadius = 6;

     //Flannery Appearance Compensation formula
     var radius = 1.0083 * Math.pow(attValue/dataStats.min,0.5715) * minRadius

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

function createPopupContent(properties, attribute){
    //add city to popup content string
    var popupContent = "<p><b>Metropolitan Statistical Area:</b> " + properties.city + "</p>";

    //add formatted attribute to panel content string
    var year = attribute.split("op")[1];
    popupContent += "<p><b>Real Gross Domestic Product (GDP) in " + year + ":</b> " + Math.round(properties[attribute]/1000)/1000 + " million</p>";

    return popupContent;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
		//Step 4: Assign the current attribute based on the first index of the attributes array
		var attribute = attributes[0];
		//check
		console.log(attribute);

		// create a set of geojsonMarkerOptions used for customizing markers
		var geojsonMarkerOptions = {
				 fillColor: "#85bb65",
				 color: "#fff",
				 weight: 1,
				 opacity: 1,
				 fillOpacity: 0.9,
				 radius: 8
		 };

		 //Step 5: For each feature, determine its value for the selected attribute
		 var attValue = Number(feature.properties[attribute]);

		 //Step 6: Give each feature's circle marker a radius based on its attribute value
		 geojsonMarkerOptions.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);

		//build popup content by procedural refactoring
		var popupContent = createPopupContent(feature.properties, attribute);

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
	    $.getJSON("data/usmon.geojson", function(response){

				//create an attributes array
        var attributes = processData(response);

				//calculate minimum data value
	      // minValue = calcMinValue(response);
				calcStats(response);


        //call function to create proportional symbols
        createPropSymbols(response,attributes);

		//add UI elements
		SequenceControls = createSequenceControls(attributes);
		Legend = createLegend(attributes);
		
		// add description UI elements
		L.Control.DesControl = L.Control.extend({
		  onAdd: function(map) {
		var el = L.DomUtil.create('div', 'des-control-container');
		el.innerHTML = 'The U.S. economy is massive on a global scale, and much of the country’s economic capabilities can be traced back to the innovation, knowledge, and productivity that tends to be clustered in urban areas. The fact is that 80% of Americans live in cities – and the 20 largest metro areas alone combine for around 40% of the country’s total GDP.<br>Not surprisingly, New York City and its surrounding area is the breadwinner every year and even with a GDP of $1.53 trillion in 2018 – the largest for any city in the United States. Behind are another two giant, Los Angeles and Chicago. It is worth mentioning that, the GDP growth rate of Los Angeles is very high, even reaching a staggering 8.1% in 2016.<br>Overall, from 2010 to 2018, the GDPs of the top-20 U.S. metropolitan areas have maintained a rapid growth trend, which reflects the driving force and attraction for economic development, consumption, and talent.';
		return el;
		},
		onRemove: function(map) {
				// Nothing to do here
			  }
		});
		L.control.desControl = function(opts) {
			  return new L.Control.DesControl(opts);
		}
		L.control.desControl({
		position: 'bottomleft'
		}).addTo(map);
				
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
        //only take attributes with GDP values
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

            //add city to popup content string by procedural refactoring
            var popupContent = createPopupContent(props, attribute);

            //update popup content
            popup = layer.getPopup();
            popup.setContent(popupContent).update();

			$('#legend').html('<span style="font-weight: bold;">Real Gross Domestic Product (GDP) In ' + attribute.split("op")[1]) + '</span>';

        };
    });
};


//Create new sequence controls
function createSequenceControls(attributes){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

				onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');

						//add skip buttons
						$(container).append('<button class="step" id="reverse" title="Reverse"><img src="img/noun_Reverse.png"></button>');
						$(container).append('<button class="step" id="forward" title="Forward"><img src="img/noun_Play.png"></button>');

            return container;
        }
    });

		map.addControl(new SequenceControl());

		// add listeners after adding control

		$('.range-slider').attr({
				max: 8,
				min: 0,
				value: 0,
				step: 1
		});


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

}

function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

						//add temporal legend div to container
            $(container).append('<div id="temporal-legend">');

            //PUT YOUR SCRIPT TO CREATE THE TEMPORAL LEGEND HERE
						$(container).append('<div id="legend"><span style="font-weight: bold;">'+ 'Real Gross Domestic Product (GDP) In '+ attributes[0].split("op")[1] +'</span></div>');

						//Step 1: start attribute legend svg string
            var svg = '<br><svg id="attribute-legend" width="200px" height="60px">';

						//array of circle names to base loop on
						var circles = ["max", "mean", "min"];

						//Step 2: loop to add each circle and text to svg string
						for (var i=0; i<circles.length; i++){
							//Step 3: assign the r and cy attributes
                var radius = calcPropRadius(dataStats[circles[i]]);
								console.log(radius)
                var cy = 60 - radius;

								console.log(cy)

		            //circle string
		            svg += '<circle class="legend-circle" id="' + circles[i] +
								'" r="' + radius + '"cy="' + cy + '" fill="#85bb65" fill-opacity="0.9" stroke="#000000" cx="60"/>';

								//evenly space out labels
								var textY = i * 20 + 20;

								//text string
								svg += '<text id="' + circles[i] + '-text" x="100" y="' + textY + '" fill="white">' + Math.round(dataStats[circles[i]]/1000)/1000 + " million" + '</text>';

						};

						//close svg string
						svg += "</svg>";

						//add attribute legend svg to container
						$(container).append(svg);
						
						$(container).append('<div id="data-source"><br><span style="font-weight: bold;">Data Source: </span>U.S. Bureau of Economic Analysis (BEA)<br><span style="font-weight: bold;">GDP Type: </span>Real Gross Domestic Product (GDP) (Thousands of chained 2012 dollars)<br><span style="font-weight: bold;">Website: </span><a href=https://apps.bea.gov/iTable/index_regional.cfm>https://apps.bea.gov/iTable/index_regional.cfm</a></div>');

            return container;
        }
    });

    map.addControl(new LegendControl());

		//updateLegend(map, attributes[0]);
};

//call the initialize function when the document has loaded
$(document).ready(createMap);
