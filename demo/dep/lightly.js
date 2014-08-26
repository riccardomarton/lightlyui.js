/**
 * Version: 0.3
 * Author: Riccardo Marton <marton.riccardo@gmail.com>
 * 
 * License: Licensed under The MIT License. See LICENSE file
 */

var lightly = function() {

	/*
	 * Private properties
	 */
	var appname = "new App";
	var container = document.body;
	var pages = {};
	var history = [];
	var actions = {
		"navigate": {
			id: "navigate",
			callback: navigate,
			history: true
		},
		"back": {
			id: "back",
			callback: back,
			history: false
		}
	};

	/*
	 * Set a node as main container. lightly will not operate outside of the node
	 * provided
	 */
	function setContainer(node) {

		if (!inDOM(node))
			throw {
				name: "lightly-container-invalid",
				message: "Object provided is not a DOM element"
			}

		container = node;
	}

	/*
	 * Add a page to the pages object
	 */
	function addPage(page) {

		if( !page || typeof page.id != "string" ) {
			throw {
				name: "lightly-page-noid",
				message: "No id specified for new page"
			}
		}

		var new_page = {
			id: page.id,
			title: page.title || "New page",
			contents: page.contents || {},
			callback: page.callback || function() {}
		}

		pages[page.id] = new_page;

		triggerEvent(container, "lightly-page-added", {page: new_page});

	}

	/*
	 * Load and display a page
	 */
	function navigate(page_id, vars, back) {
		//main function, rebuilds DOM

		if (typeof pages[page_id] == "undefined")
			throw {
				name: "lightly-page-nonexistant",
				message: "Page "+page_id+" does not exist"
			}

		var back = back ? true : false;

		var page = pages[page_id];

		document.title = page.title;

		for (id in page.contents) {

			var elem = document.getElementById(id);
			if (elem == null)
				continue;

			if (typeof page.contents[id] == "function") {
				elem.innerHTML = page.contents[id](vars);
			} else {
				elem.innerHTML = page.contents[id];
			}

		}

		if (typeof page.callback == "function")
			page.callback(vars);

		triggerEvent(container, "lightly-page-load", {page: page});

	}

	/*
	 * Add an action to the actions object
	 */
	function addAction(action) {

		if( !action || typeof action.id != "string" )
			throw {
				name: "lightly-action-noid",
				message: "No id specified for new action"
			}

		if (action.id == "navigate" || action.id == "back")
			throw {
				name: "lightly-action-forbidden",
				message: "Cannot overwrite built-in actions"
			}

		var new_action = {
			id: action.id,
			callback: action.callback || function() {},
			history: action.history || true
		}

		actions[action.id] = new_action;

		triggerEvent(container, "lightly-action-added", {action: new_action});

	}

	/*
	 * Execute one of the assigned actions
	 */
	function executeAction(action_id) {

		if (typeof actions[action_id] == "undefined")
			throw {
				name: "lightly-action-nonexistant",
				message: "Action "+action_id+" does not exist"
			}

		var params = Array.prototype.slice.call(arguments,1);

		if (typeof actions[action_id].callback == "function")
			actions[action_id].callback.apply(null, params);

		var history_action = {
			action_id: action_id,
			params: params
		}

		if (actions[action_id].history)
			history.push(history_action);

		triggerEvent(container, "lightly-action-executed", {action: actions[action_id]});
	}

	/*
	 * Go back in the history
	 */
	function back() {

		if (history.length < 2)
			return;

		history.pop();

		// var i = history.length - 1;

		var action = history.pop();

		var params = action.params.slice(0);
		params.unshift(action.action_id);

		executeAction.apply(null, params);

		triggerEvent(container, "lightly-action-back", {action: action});

	}


	/*
	 * Utilities functions
	 */

	/*
	 * Check if elem is a valid DOM element
	 */
	function inDOM(elem) {
		do {
			if (elem == document.documentElement) {
				return true;
			}
		} while (elem = elem.parentNode);

		return false;
	}

	/*
	 * Trigger a custom event
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

	/*
	 * Expose public methods
	 */
	return {

		/*
		 * App name and general infos
		 */
		setAppName: function(new_name) {
			appname = new_name;
		},
		getAppName: function() {
			return appname;
		},
		setContainer: setContainer,

		/*
		 * Pages management
		 */
		addPage: addPage,
		getPages: function() {
			return pages;
		},
		navigate: navigate,

		/*
		 * Actions management
		 */
		addAction: addAction,
		getActions: function() {
			return actions;
		},
		executeAction: executeAction,
		do: executeAction,
		getHistory: function() {
			return history;
		},
	}

}