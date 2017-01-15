var lat;
var lng;
var zoom;

function random_in_range(start, end){
	var diff = end-start;
	return Math.random()*diff + start;
}

function coords_to_string(lat, lng){
	var prec = 7;
	
	var lat_s = lat.toString.substr(0, prec);
	var lng_s = lng.toString.substr(0, prec);
	return lat_s + "," + long_s;
}


function getCoordinates(callback){

	lat = random_in_range(-80, 80);
	lng = random_in_range(-180, 180);

	var coord_string = coords_to_string(lat, lng);

	var xhr = new XMLHttpRequest();
	xhr.open('GET', "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coord_string, true);
	xhr.send();
	 
	xhr.onreadystatechange = processRequest;
	 
	function processRequest(e) {
		if (xhr.readyState == 4 && xhr.status == 200) {
        	var response = JSON.parse(xhr.responseText);
	        
	    }else{
	    	getCoordinates(callback);
	    }
	}
}

function initialize(){

	var xhr = new XMLHttpRequest();

	maxZoomService = new google.maps.MaxZoomService();

	

	maxZoomService.getMaxZoomAtLatLng({lat: lat, lng: lng}, function(response) {
    	if (response.status !== 'OK') {
    		alert("Error in Google's MaxZoomService");
    	} else {
    		zoom = parseInt(response.zoom);
    	}
    });

}