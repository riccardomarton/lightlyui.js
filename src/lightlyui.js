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

	var container = document.body;

	//define private variables
	var timer_loading;

	//cache elements references
	var elements = {
		"loading": document.getElementById("lightlyui-loading")
	}

	//set built-in actions
	app.addAction({
		id: 'animatenavigate',
		callback: animateNavigate,
		history: true
	});
	app.addAction({
		id: 'animatenavigateback',
		callback: animateNavigateBack,
		history: true
	});


	/**
	 * Loader functions
	 */
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
	function animateNavigate(page_id, vars) {
		var newpage = app.newPageElement(page_id, vars);
		var oldpage = document.getElementsByClassName('lightlyui-page')[0];

		addClass(newpage, 'lightlyui-notransition');
		addClass(newpage, 'lightlyui-page');
		addClass(newpage, 'lightlyui-page-new');
		container.appendChild(newpage);
		removeClass(newpage, 'lightlyui-notransition');
		setTimeout( function() {
			removeClass(newpage, 'lightlyui-page-new');
			addClass(oldpage, 'lightlyui-page-old');

			var duration = getTransitionDuration(oldpage);
			timer_pagination = setTimeout( function() {
				container.removeChild(oldpage);
			}, duration );
		},20);
	}
	function animateNavigateBack(page_id, vars) {
		var oldpage = app.newPageElement(page_id, vars);
		var newpage = document.getElementsByClassName('lightlyui-page')[0];

		addClass(oldpage, 'lightlyui-notransition');
		addClass(oldpage, 'lightlyui-page');
		addClass(oldpage, 'lightlyui-page-old');
		container.appendChild(oldpage);
		removeClass(oldpage, 'lightlyui-notransition');
		setTimeout( function() {
			removeClass(oldpage, 'lightlyui-page-old');
			addClass(newpage, 'lightlyui-page-new');

			var duration = getTransitionDuration(newpage);
			timer_pagination = setTimeout( function() {
				container.removeChild(newpage);
			}, duration );
		},20);
	}

	function customAddAction(action) {
		if (action.id == "animatenavigate" || action.id == "animatenavigateback")
			throw {
				name: "lightlyui-action-forbidden",
				message: "Cannot overwrite built-in actions"
			}
		app.addAction(action); 
	}
	function customBack() {

		var history = app.getHistory();

		if (history.length < 2)
			return;

		history.pop();

		// var i = history.length - 1;

		var action = history.pop();

		var params = action.params.slice(0);

		if (action.action_id == "animatenavigate")
			action.action_id = "animatenavigateback";

		params.unshift(action.action_id);
		app.executeAction.apply(null, params);

		triggerEvent(container, "lightly-action-back", {action: action});

	}
	function customExecuteAction(action_id) {
		switch(action_id) {
			case 'back':
				customBack();
				break;
			default:
				args = Array.prototype.slice.call(arguments,0);
				app.executeAction.apply(null, args);
				break;
		}
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
	function getTransitionDuration(el, with_delay) {
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
		addAction: customAddAction,
		addPage: app.addPage,
		showLoader: showLoader,
		hideLoader: hideLoader,
		getHistory: app.getHistory,
		executeAction: customExecuteAction,
		do: customExecuteAction
	};

}