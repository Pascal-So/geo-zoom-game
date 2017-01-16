var g_lat;
var g_lng;
var g_zoom;


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


function getCoordinates(attempts_left, callback){

	if(attempts_left <= 0){
		alert("Too many failed attempts to get coordinates.");
		return;
	}

	lat = random_in_range(-80, 80);
	lng = random_in_range(-180, 180);

	var coord_string = coords_to_string(lat, lng);

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
		        	callback(lat, lng);
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

function generate_map_uri(lat,lng,zoom){
	//https://maps.googleapis.com/maps/api/staticmap?center=0,0&zoom=3&size=640x640&maptype=satellite

	var coord_string = coords_to_string(lat,lng);
	var zoom_string = zoom.toString();

	var uri = "https://maps.googleapis.com/maps/api/staticmap?center=" + coord_string
			+ "&zoom=" + zoom_string + "&size=640x640&maptype=satellite&key=AIzaSyBQ1VzOXpmdii0cZvx-4l5qex9Y-L8tUjY";

	return uri;
}

function update_map(lat,lng,zoom){
	var map = document.getElementById("map");

	var uri = generate_map_uri(lat,lng,zoom);

	console.log(uri);

	map.src = uri;
}

function zoom_out(){
	var min_zoom = 3;

	if(g_zoom > min_zoom){
		g_zoom --;
		if(g_zoom > 7){
			// double the zoom out speed if zoom > 7
			g_zoom --;
		}
		update_map(g_lat, g_lng, g_zoom);
	}
}

function show_coords(){
	var coord_string = coords_to_string(lat,lng);

	var coords_field = document.getElementById("coords_field");

	coords_field.innerHTML = coord_string;
}

function start_game(){
	var coords_field = document.getElementById("coords_field");
	coords_field.innerHTML = "";

	getCoordinates(10, function(lat, lng){
		g_lat = lat;
		g_lng = lng;
		getMaxZoomLevel(g_lat, g_lng, function(zoom){
			g_zoom = zoom;

			update_map(lat, lng, zoom);
		})
	});
	

}