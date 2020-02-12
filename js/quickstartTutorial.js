// map method is used to instantiate a map object based on the given div element.
// setView method is used to set view of the map according to the given geographical center and zoom level
var mymap = L.map('mapid').setView([51.505, -0.09], 13);

// tileLayer is used to display layers on the map. Several parameters can be set to customize the initial display status
// addTo method is used to add the layer to a map object
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1IjoicGhhbnRhc2siLCJhIjoiY2s2anZvMjFwMDBkazNscGxnaDAzOGZ2aiJ9.soaX4ADVPz6DGTjURhPo4w'
}).addTo(mymap);

// marker method is used to create clickable/draggable icons on the specific location on the map
var marker = L.marker([51.5, -0.09]).addTo(mymap);

// circle method is used to create circles on the specific location on the map
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);

// polygon method is used to create polygon based on specific vertices locations on the map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);

// bindPopup method is used to bind a popup to an object
// openPopup method is used to open/display the popup
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

// popup method is used to open/display a popup at a specific location on the map
// setLatLng method is used to set the geographic location where the popup will open
// setContent method is used to set the content of the popup
// openOn method is used to add the popup to the map and closes the previous one
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap);

// define a onMapClick function which pops up a alert message when clicking somewhere on the map
function onMapClick(e) {
        alert("You clicked the map at " + e.latlng);
    }

// connect the click event to the alert-message-based onMapClick function
mymap.on('click', onMapClick);

// popup method is used to open/display a popup at a specific location on the map
var popup = L.popup();

// define a onMapClick function which creates a popup at the clicked location on the map
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

// connect the click event to the popup-based onMapClick function
mymap.on('click', onMapClick);
