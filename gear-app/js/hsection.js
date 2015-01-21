function rot13(str) {
	return str.replace(/[a-zA-Z]/g, function(chr) {
		var start = chr <= 'Z' ? 65 : 97;
		return String.fromCharCode(start + (chr.charCodeAt(0) - start + 13)
				% 26);
	});
}

var parseQueryString = function() {

	var str = window.location.search, objURL = {};

	str.replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"), function($0, $1, $2,
			$3) {
		objURL[$1] = $3;
	});
	return objURL;
};

var truncateDecimals = function (number) {
    return Math[number < 0 ? 'ceil' : 'floor'](number);
};

function deg_to_dm(dd) {
	    var deg = truncateDecimals(dd), // truncate dd to get degrees
		     frac = Math.abs(dd - deg), // get fractional part
		     min = Math.floor(frac * 60), // multiply fraction by 60 and truncate
		     sec = Math.floor(((frac * 3600 - min * 60) * 1000)/60);
	    return deg + " " + min + "." + sec;
}

window.onload = function () {
	function showLocation(location) {
		document.getElementById("nav-lat").innerHTML = deg_to_dm(location.coords.latitude);
		document.getElementById("nav-lon").innerHTML = deg_to_dm(location.coords.longitude);
	}

	var options = { enableHighAccuracy: true };	
	function motionDetected() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(showLocation, null, options);
		}
	}

	window.addEventListener('devicemotion', motionDetected, false);
}


(function(){

	// This listens for the back button press
	document.addEventListener('tizenhwkey', function(e) {
		if (e.keyName === "back")
			tizen.application.getCurrentApplication().exit();
	});

	var page = document.getElementById("hsectionchangerPage"), changer = document
			.getElementById("hsectionchanger"), decode = document
			.getElementById("decode"), hint = document.getElementById("hint"), sectionChanger, idx = 1;

	page.addEventListener("pagebeforeshow", function() {
		// make SectionChanger object
		sectionChanger = new tau.widget.SectionChanger(changer, {
			circular : true,
			orientation : "horizontal",
			useBouncingEffect : true
		});

		var params = parseQueryString();

		document.getElementById("gccode").innerHTML = params["code"];
		document.getElementById("gcname").innerHTML = params["name"];
		document.getElementById("lat").innerHTML = params["lat"];
		document.getElementById("lon").innerHTML = params["lon"];
		document.getElementById("hint").innerHTML = params["hint"];

		// hint.innerHTML = "This is hint";
	});

	page.addEventListener("pagehide", function() {
		// release object
		sectionChanger.destroy();
	});

	decode.onclick = function() {
		var button = document.getElementById("decode");
		hint.innerHTML = rot13(hint.innerHTML);
		button.innerHTML = (button.innerHTML === "&nbsp;Decode&nbsp;") ? "&nbsp;Encode&nbsp;"
				: "&nbsp;Decode&nbsp;";
	}
})();
