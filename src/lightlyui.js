/**
 * Version: 0.1
 * Author: Riccardo Marton <marton.riccardo@gmail.com>
 * 
 * License: Licensed under The MIT License. See LICENSE file
 */

var lightlyui = function(config) {

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
	 * Lightly customizations
	 */
	function customNavigate(page_id, vars) {
		var newpage = app.newPageElement(page_id, vars);
		var oldpage = document.getElementsByClassName('lightlyui-page')[0];

		addClass(newpage, 'lightlyui-notransition');
		addClass(newpage, 'lightlyui-page');
		addClass(newpage, 'lightlyui-page-new');
		document.body.appendChild(newpage);
		removeClass(newpage, 'lightlyui-notransition');
		setTimeout( function() {
			removeClass(newpage, 'lightlyui-page-new');
			addClass(oldpage, 'lightlyui-page-old');

			var duration = getTransitionDuration(oldpage);
			timer_pagination = setTimeout( function() {
				document.body.removeChild(oldpage);
			}, duration );
		},20);
	}
	function customNavigateBack(page_id, vars) {
		var oldpage = app.newPageElement(page_id, vars);
		var newpage = document.getElementsByClassName('lightlyui-page')[0];

		addClass(oldpage, 'lightlyui-notransition');
		addClass(oldpage, 'lightlyui-page');
		addClass(oldpage, 'lightlyui-page-old');
		document.body.appendChild(oldpage);
		removeClass(oldpage, 'lightlyui-notransition');
		setTimeout( function() {
			removeClass(oldpage, 'lightlyui-page-old');
			addClass(newpage, 'lightlyui-page-new');

			var duration = getTransitionDuration(newpage);
			timer_pagination = setTimeout( function() {
				document.body.removeChild(newpage);
			}, duration );
		},20);
	}
	function customBack() {
		
	}

	function customAddAction(action) {
		if (action.id == "lightlyui-navigate" || action.id == "lightlyui-back")
			throw {
				name: "lightlyui-action-forbidden",
				message: "Cannot overwrite built-in actions"
			}
		app.addAction(action); 
	}
	function customExecuteAction() {

	}



	/**
	 * Utilities functions
	 */
	function triggerEvent(element, eventname, vars) {
		var event; // The custom event that will be created

		if (document.createEvent) {
			event = document.createEvent("HTMLEvents");
			event.initEvent(eventname, true, true);
		} else {
			event = document.createEventObject();
			event.eventType = eventname;
		}

		event.eventName = eventname;
		event.vars = vars;

		if (document.createEvent) {
			element.dispatchEvent(event);
		} else {
			element.fireEvent("on" + event.eventType, event);
		}
	}
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

	return {
		addAction: app.addAction,
		addPage: app.addPage,
		showLoader: showLoader,
		hideLoader: hideLoader,
		customNavigate: customNavigate,	//testing
		customNavigateBack: customNavigateBack	//testing
	};

}