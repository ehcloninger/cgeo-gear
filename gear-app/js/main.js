window.onload = function() {
	// TODO:: Do your initialization job

	// add eventListener for tizenhwkey
	document.addEventListener('tizenhwkey', function(e) {
		if (e.keyName == "back")
			tizen.application.getCurrentApplication().exit();
	});

	var index = 1;
	var files = ["000", "045", "090", "135", "180", "225", "270", "315"];
	var compass = document.querySelector('.contents');
	compass.addEventListener("click", function() {
		img = document.querySelector('#compass');
		img.src = "images/" + files[index++] + ".png";
		if (index > 7)
			index = 0;
	});
};
