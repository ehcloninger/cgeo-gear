
function rot13(str) {
  return str.replace(/[a-zA-Z]/g, function(chr) {
    var start = chr <= 'Z' ? 65 : 97;
    return String.fromCharCode(start + (chr.charCodeAt(0) - start + 13) % 26);
  });
}

var parseQueryString = function() {

    var str = window.location.search;
    var objURL = {};

    str.replace(
        new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
        function( $0, $1, $2, $3 ){
            objURL[ $1 ] = $3;
        }
    );
    return objURL;
};

function replaceContent(id, text)
{
	if (text != undefined)
		document.getElementById(id).innerHTML = text;
}

(function() {
	//This listens for the back button press		
	document.addEventListener('tizenhwkey', function(e) {		
	       if(e.keyName == "back")		
	           tizen.application.getCurrentApplication().exit();		
	});

var page = document.getElementById( "hsectionchangerPage" ),
	changer = document.getElementById( "hsectionchanger" ),
	decode = document.getElementById( "decode" ),
	hint = document.getElementById( "hint" ),
	sectionChanger, 
	idx=1;

page.addEventListener( "pagebeforeshow", function() {
	// make SectionChanger object
	sectionChanger = new tau.widget.SectionChanger(changer, {
		circular: true,
		orientation: "horizontal",
		useBouncingEffect: true
	});
	
	var params = parseQueryString();
	
	replaceContent("gccode", params["code"]);
	replaceContent("gcname", params["name"]);
	replaceContent("lat", params["lat"]);
	replaceContent("lon", params["lon"]);
	replaceContent("hint", params["hint"]);
	
	//	hint.innerHTML = "This is hint";
});

page.addEventListener( "pagehide", function() {
	// release object
	sectionChanger.destroy();
});

decode.onclick=function() {
	var button = document.getElementById("decode");
	hint.innerHTML = rot13(hint.innerHTML);
	button.innerHTML = (button.innerHTML === "&nbsp;Decode&nbsp;") ? "&nbsp;Encode&nbsp;" : "&nbsp;Decode&nbsp;";
}

})();
