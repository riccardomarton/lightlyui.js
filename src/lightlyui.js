/**
 * Version: 0.1
 * Author: Riccardo Marton <marton.riccardo@gmail.com>
 * 
 * License: Licensed under The MIT License. See LICENSE file
 */

var lightlyui = function() {

	//check lightly dependency
	if (typeof window.lightly == "undefined") {
		throw {
			name: "lightlyui-dependency-missing",
			message: "lightly.js not found, be sure to include it before lightlyui"
		}
	}

	//initialize lightly
	var app = lightly();

	//define private variables
	var timer_loading;

	//cache elements references
	var elements = {
		"loading": document.getElementById("lightlyui-loading")
	}

	//manipulate layers
	function showLoader() {
		if (typeof timer_loader != "undefined")
			clearTimeout(timer_loader);

		removeClass(elements.loading, 'hidden');
		timer_loader = setTimeout( function() {
			addClass(elements.loading, 'show');
		}, 20 );
	}
	function hideLoader() {
		if (typeof timer_loader != "undefined")
			clearTimeout(timer_loader);

		var duration = getTransitionDuration(elements.loading);
		removeClass(elements.loading, 'show');
		timer_loader = setTimeout( function() {
			addClass(elements.loading, 'hidden');
		}, duration );
	}

	/**
	 * Utilities functions
	 */
	function removeClass(elem, rmclass) {
		elem.className=elem.className.replace(rmclass ,"");
	}
	function addClass(elem, newclass) {
		removeClass(elem, newclass);
		elem.className = elem.className +" "+newclass;
	}
	function getTransitionDuration (el, with_delay){
		var style=window.getComputedStyle(el),
		    duration = style.webkitTransitionDuration,
		    delay = style.webkitTransitionDelay; 

		duration = (duration.indexOf("ms")>-1) ? parseFloat(duration) : parseFloat(duration)*1000;
		delay = (delay.indexOf("ms")>-1) ? parseFloat(delay) : parseFloat(delay)*1000;

		if(with_delay) return (duration + delay);
		else return duration;
	}


	//expose methods
	app.showLoader = showLoader;
	app.hideLoader = hideLoader;

	return app;

}