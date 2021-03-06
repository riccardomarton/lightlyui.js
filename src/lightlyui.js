/**
 * Version: 0.3.3
 * Author: Riccardo Marton <marton.riccardo@gmail.com>
 *
 * License: Licensed under The MIT License. See LICENSE file
 */

var lightlyui = function(custom_config) {

	//read configuration
	custom_config = custom_config || {};
	var config = {
		touch: custom_config.touch || true,
		action_class: custom_config.action_class || 'lui-action',
		hammer: custom_config.hammer || new Hammer(),
		hammer_action_event: custom_config.hammer_action_event || 'tap',
		outpage_elements: custom_config.outpage_elements || []
	};

	var container = document.body;

	//check lightly dependency
	if (typeof window.lightly == "undefined") {
		throw {
			name: "lightlyui-dependency-missing",
			message: "lightly.js not found, be sure to include it before lightlyui"
		};
	}

	//check hammer dependency
	if (config.touch) {
		if (typeof window.Hammer == "undefined")
			throw {
				name: "lightlyui-dependency-missing",
				message: "Hammer.js not found, be sure to include it before lightlyui or config touch as false"
			};

		hammer = config.hammer;

		hammer.add(new Hammer.Tap({
			event: 'tap',
			taps: 1,
			pointers: 1,
			interval: 10000,
			time: 10000,
			threshold: 100,
			posThreshold: 10000
		}));
	}


	//initialize lightly
	var app = lightly();

	//define private variables
	var timer_loading,
		timer_panel,
		timer_dialog;

	//cache elements references
	var elements_id = {
		"loader": 	"lui-loading",
		"panel": 	"lui-panel",
		"dialog":  	"lui-dialog"
	};

	//set built-in actions
	app.addAction({
		id: 'lui-navigate',
		callback: animateNavigate,
		history: true
	});
	app.addAction({
		id: 'lui-navigateback',
		callback: animateNavigateBack,
		history: true
	});
	app.addAction({
		id: 'lui-nohistory-navigate',
		callback: animateNavigate,
		history: false
	});
	app.addAction({
		id: 'lui-nohistory-navigateback',
		callback: animateNavigateBack,
		history: false
	});
	app.addAction({
		id: 'lui-showpanel',
		callback: showPanel,
		history: false
	});
	app.addAction({
		id: 'lui-hidepanel',
		callback: hidePanel,
		history: false
	});

	//set listeners
	addEventListeners();

	/**
	 * Loader functions
	 */
	function showLoader() {
		if (typeof timer_loader != "undefined")
			clearTimeout(timer_loader);

		var loader = document.getElementById(elements_id.loader);

		removeClass(loader, 'hidden');
		timer_loader = setTimeout( function() {
			addClass(loader, 'show');
		}, 20 );
	}
	function hideLoader() {
		if (typeof timer_loader != "undefined")
			clearTimeout(timer_loader);

		var loader = document.getElementById(elements_id.loader);

		var duration = getTransitionDuration(loader);
		removeClass(loader, 'show');
		timer_loader = setTimeout( function() {
			addClass(loader, 'hidden');
		}, duration );
	}

	/**
	 * Panel functions
	 */
	function showPanel() {
		if (typeof timer_panel != "undefined")
			clearTimeout(timer_panel);

		var panel = document.getElementById(elements_id.panel);

		removeClass(panel, 'hidden');
		timer_panel = setTimeout( function() {
			addClass(panel, 'show');
		}, 20 );
	}
	function hidePanel() {
		if (typeof timer_panel != "undefined")
			clearTimeout(timer_panel);

		var panel = document.getElementById(elements_id.panel);

		var duration = getTransitionDuration(panel);
		removeClass(panel, 'show');
		timer_panel = setTimeout( function() {
			addClass(panel, 'hidden');
		}, duration );
	}

	/**
	 * Dialog functions
	 */
	function showDialog( html ) {
		if (typeof timer_dialog != "undefined")
			clearTimeout(timer_dialog);

		var dialog = document.getElementById(elements_id.dialog);
		var dialog_contents = dialog.getElementsByClassName('dialog')[0];
		if (typeof html != "undefined")
			dialog_contents.innerHTML = html;

		removeClass(dialog, 'hidden');
		timer_dialog = setTimeout( function() {
			addClass(dialog, 'show');
		}, 20 );
	}
	function hideDialog() {
		if (typeof timer_dialog != "undefined")
			clearTimeout(timer_dialog);

		var dialog = document.getElementById(elements_id.dialog);
		var dialog_contents = dialog.getElementsByClassName('dialog')[0];

		var duration = getTransitionDuration(dialog);
		removeClass(dialog, 'show');
		timer_dialog = setTimeout( function() {
			addClass(dialog, 'hidden');
			dialog_contents.innerHTML = '';
		}, duration );
	}

	function setHomePage(page_id) {
		var pages = app.getPages();
		if (typeof pages[page_id] == "undefined")
			throw {
				name: "lightly-page-nonexistant",
				message: "Page "+page_id+" does not exist"
			};

		var history = app.getHistory();
		history.push({
			action_id: "lui-navigateback",
			params: [page_id]
		});
		app.navigate(page_id);
		var page = document.getElementsByClassName('lui-page')[0];
		triggerEvent(container, "lightlyui-page-shown", {page: page});
	}

	/**
	 * Lightly customizations
	 */
	function animateNavigate(page_id) {
		var pages = app.getPages();
		var page = JSON.stringify(arguments);
		var args = Array.prototype.slice.call(arguments,1);

		if (JSON.stringify(page) == JSON.stringify(app.getCurrentPage()))
			return false;

		var el = app.newPageElement.apply(null, arguments);
		var newpage = el.getElementsByClassName('lui-page')[0];
		var oldpage = document.getElementsByClassName('lui-page')[0];

		addClass(newpage, 'lui-notransition');
		addClass(newpage, 'lui-page-new');
		container.appendChild(newpage);

		for ( i = 0; i < config.outpage_elements.length; i++) {
			var op_class = config.outpage_elements[i];
			var op_el = container.getElementsByClassName(op_class)[0];
			var new_op_el = el.getElementsByClassName(op_class)[0];
			op_el.innerHTML = new_op_el.innerHTML;
		}

		setTimeout( function() {
			triggerEvent(container, "lightlyui-page-shown", {page: newpage});
			removeClass(newpage, 'lui-notransition');

			addClass(newpage, 'lui-transitioning');
			addClass(oldpage, 'lui-transitioning');
			setTimeout( function() {
				removeClass(newpage, 'lui-page-new');
				addClass(oldpage, 'lui-page-old');

				var duration = getTransitionDuration(oldpage);
				timer_pagination = setTimeout( function() {
					removeClass(newpage, 'lui-transitioning');
					container.removeChild(oldpage);
					triggerEvent(container, "lightlyui-page-hidden", {page: oldpage});
				}, duration );
			},10);
			app.setCurrentPage(page);

			if (typeof pages[page_id].callback == "function")
				pages[page_id].callback.apply(null, args);
		}, 50);
	}
	function animateNavigateBack(page_id, vars) {
		var pages = app.getPages();
		var page = JSON.stringify(arguments);
		var args = Array.prototype.slice.call(arguments,1);

		if (JSON.stringify(page) == JSON.stringify(app.getCurrentPage()))
			return false;

		var el = app.newPageElement(page_id, vars);
		var oldpage = el.getElementsByClassName('lui-page')[0];
		var newpage = document.getElementsByClassName('lui-page')[0];

		addClass(oldpage, 'lui-notransition');
		addClass(oldpage, 'lui-page');
		addClass(oldpage, 'lui-page-old');
		container.appendChild(oldpage);

		for ( i = 0; i < config.outpage_elements.length; i++) {
			var op_class = config.outpage_elements[i];
			var op_el = container.getElementsByClassName(op_class)[0];
			var new_op_el = el.getElementsByClassName(op_class)[0];
			op_el.innerHTML = new_op_el.innerHTML;
		}

		setTimeout( function() {
			triggerEvent(container, "lightlyui-page-shown", {page: oldpage});
			removeClass(oldpage, 'lui-notransition');
			addClass(newpage, 'lui-transitioning');
			addClass(oldpage, 'lui-transitioning');
			setTimeout( function() {
				removeClass(oldpage, 'lui-page-old');
				addClass(newpage, 'lui-page-new');

				var duration = getTransitionDuration(newpage);
				timer_pagination = setTimeout( function() {
					removeClass(oldpage, 'lui-transitioning');
					container.removeChild(newpage);
					triggerEvent(container, "lightlyui-page-hidden", {page: newpage});
				}, duration );
			},20);

			app.setCurrentPage(page);

			if (typeof pages[page_id].callback == "function")
				pages[page_id].callback.apply(null, args);
		}, 50);
	}

	function customAddAction(action) {
		if (action.id == "lui-navigate" || action.id == "lui-navigateback")
			throw {
				name: "lui-action-forbidden",
				message: "Cannot overwrite built-in actions"
			};
		app.addAction(action);
	}
	function customBack() {

		var history = app.getHistory();

		if (history.length < 2) {
			triggerEvent(container, "lightly-action-back-end", {});
			return;
		}

		history.pop();

		// var i = history.length - 1;

		var action = history.pop();

		var params = action.params.slice(0);

		if (action.action_id == "lui-navigate")
			action.action_id = "lui-navigateback";

		params.unshift(action.action_id);
		app.executeAction.apply(null, params);

		triggerEvent(container, "lightly-action-back", {action: action});

	}
	function customExecuteAction(action_id) {

		if (container.getElementsByClassName('lui-page').length > 1)
			return false;

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

	/*
	 * Event listeners
	 */
	function addEventListeners() {

		//better touch interaction
		if (config.touch) {

			hammer.on(config.hammer_action_event, function(evt) {
				var el = evt.target;

				if (el.hasAttribute('lui-ignore')) return;

				//blur input if touch away
				if ((['INPUT', 'TEXTAREA'].indexOf(el.nodeName) < 0) &&
					(['INPUT', 'TEXTAREA'].indexOf(document.activeElement.nodeName) !== -1)) {
					document.activeElement.blur();
				}
				
			});

			//add tapped style if touched
			container.addEventListener( 'touchstart', function(evt) {

				var el = evt.target;
				while (el && el != container) {

					if (el.hasAttribute('lui-ignore')) return;

					if ( hasClass(el, config.action_class) ) {
						addClass(el, 'lui-touched');
						return;
					}
					else
						el = el.parentNode;
				}
			});
			container.addEventListener( 'touchend', function(evt) {
				var el = evt.target;
				while (el != container) {

					if (el.hasAttribute('lui-ignore')) return;

					if (el === null) return;
					if ( hasClass(el, config.action_class) ) {
						removeClass(el, 'lui-touched');
						return;
					}
					else
						el = el.parentNode;
				}
			});
		}

		//lui-action_class
		if (config.touch) {
			hammer.on(config.hammer_action_event, function(evt) {

				var el = evt.target;
				while (el != container) {

					if (el.hasAttribute('lui-ignore')) return;

					if (el === null) return;
					if ( hasClass(el, config.action_class) ) {
						evt.preventDefault();
						onClickActionClass(el);
						return;
					}
					el = el.parentNode;
				}
			});
		} else {
			container.addEventListener( 'click', function(evt) {
				var el = evt.target;
				if ( hasClass(el, config.action_class) ) {
					evt.preventDefault();
					evt.stopPropagation();
					onClickActionClass(el);
				}
			});
		}
	}
	function onClickActionClass(el) {
		var action_id = el.getAttribute('lui-action');
		if (!action_id)
			return;

		var args = [action_id];

		var raw_data = el.getAttribute('lui-data');
		var action_data;
		try {
			action_data = JSON.parse(raw_data);
			Array.prototype.push.apply(args,action_data);
		} catch (err) {
			action_data = raw_data;
			args.push(action_data);
		}

		customExecuteAction.apply(null, args);
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
		elem.className=elem.className.replace("  " ," ");
	}
	function addClass(elem, newclass) {
		removeClass(elem, newclass);
		elem.className = elem.className +" "+newclass;
	}
	function hasClass(elem, checkclass) {
		if (elem === undefined || elem === null || elem.className === undefined)
			return false;

		return new RegExp('(\\s|^)' + checkclass + '(\\s|$)').test(elem.className);
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
		hammer: hammer,

		getConfig: function() { return config; },
		addAction: customAddAction,
		getCurrentPage: app.getCurrentPage,
		setCurrentPage: app.setCurrentPage,
		addPage: app.addPage,
		setHomePage: setHomePage,
		showLoader: showLoader,
		hideLoader: hideLoader,
		showPanel: showPanel,
		hidePanel: hidePanel,
		showDialog: showDialog,
		hideDialog: hideDialog,
		navigate: app.navigate,
		animateNavigate: animateNavigate,
		animateNavigateBack: animateNavigateBack,
		getHistory: app.getHistory,
		executeAction: customExecuteAction,
		do: customExecuteAction,

		hasClass: hasClass,
		addClass: addClass,
		removeClass: removeClass,
		triggerEvent: triggerEvent,
		getTransitionDuration: getTransitionDuration,

		lightly: app
	};

};
