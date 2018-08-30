// global variables
var g_lat;
var g_lng;
var g_zoom;
var g_counter = 0;

var logger_url = 'logger.php';


function random_in_range(start, end){
	var diff = end-start;
	return Math.random()*diff + start;
}

function coords_to_string(lat, lng){
	var prec = 7;
	
	var lat_s = lat.toString().substr(0, prec);
	var lng_s = lng.toString().substr(0, prec);
	return lat_s + "," + lng_s;
}

// http://mathworld.wolfram.com/SpherePointPicking.html
function uniformRandomCoordinates(){
	var lower = -0.866025403; // cut south at -60 deg
	var upper = 0.994522; // cut north at 84 deg

	var lat = (-Math.acos(random_in_range(lower, upper)) + Math.PI/2) * 180 / Math.PI;
	var lng = random_in_range(-180, 180);

	return {
		lat: lat,
		lng: lng,
	};
}

function getCoordinates(attempts_left, callback){

	if(attempts_left <= 0){
		alert("Too many failed attempts to get coordinates.");
		return;
	}

	var coords = uniformRandomCoordinates();
	var coord_string = coords_to_string(coords.lat, coords.lng);

	console.log("Generated coordinates", coord_string);

	var xhr = new XMLHttpRequest();
	xhr.open('GET', "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coord_string, true);
	xhr.send();
	 
	xhr.onreadystatechange = processRequest;
	 
	function processRequest(e) {
		if(xhr.readyState == 4){
			if (xhr.status == 200) {
				var response = JSON.parse(xhr.responseText);
				if(response.status == "ZERO_RESULTS"){
					console.log("Generated coordinates were in ocean");
					getCoordinates(attempts_left-1, callback);
				}else{
					callback(coords.lat, coords.lng);
				}
			}else{
				// has returned, but not 400
				console.log("getCoordinates failed xhr request");
				getCoordinates(attempts_left-1, callback);
			}
		}
	}
}

function getMaxZoomLevel(lat, lng, callback){
	maxZoomService = new google.maps.MaxZoomService();

	maxZoomService.getMaxZoomAtLatLng({lat: lat, lng: lng}, function(response) {
		if (response.status !== 'OK') {
			alert("Error in Google's MaxZoomService");
		} else {
			callback(parseInt(response.zoom));
		}
	});
}

function generate_map_uri(lat,lng,zoom,type){
	//https://maps.googleapis.com/maps/api/staticmap?center=0,0&zoom=3&size=640x640&maptype=satellite

	var coord_string = coords_to_string(lat,lng);
	var zoom_string = zoom.toString();

	var uri = "https://maps.googleapis.com/maps/api/staticmap?center=" + coord_string
			+ "&zoom=" + zoom_string + "&size=640x640&maptype=" + type + "&key=AIzaSyBQ1VzOXpmdii0cZvx-4l5qex9Y-L8tUjY";

	return uri;
}

function update_map(lat,lng,zoom,type){
	var map = document.getElementById("map");

	var uri = generate_map_uri(lat,lng,zoom,type);

	console.log(uri);

	map.src = uri;
}

function show_solution(){
	update_map(g_lat, g_lng, g_zoom, "hybrid");
}

function zoom_out(){
	var min_zoom = 2;

	if(g_zoom > min_zoom){
		g_zoom --;
		if(g_zoom > 7){
			// double the zoom out speed if zoom > 7
			g_zoom --;
		}
		update_map(g_lat, g_lng, g_zoom, "satellite");
	}
}

function show_coords(){
	var coord_string = coords_to_string(g_lat,g_lng);

	var coords_field = document.getElementById("coords_field");

	coords_field.innerHTML = coord_string;
}

function logString(str, url) {
	if (typeof(window.fetch) == "undefined") {
		console.log("fetch not supported by this browser.");
		return;
	}

	url += "?data=" + str;
	fetch(encodeURI(url), {
		method: 'GET',
	});
}

function start_game(){
	++g_counter;
	var coords_field = document.getElementById("coords_field");
	coords_field.innerHTML = "";

	getCoordinates(10, function(lat, lng){
		g_lat = lat;
		g_lng = lng;
		getMaxZoomLevel(lat, lng, function(zoom){
			g_zoom = zoom;
			var logged_string = coords_to_string(lat, lng) + "," +
								g_zoom.toString() + "," +
								g_counter.toString();
			logString(logged_string, logger_url);

			update_map(lat, lng, zoom, "satellite");
		})
	});
}