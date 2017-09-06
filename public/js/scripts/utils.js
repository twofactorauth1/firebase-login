/*global indigenous, window ,analytics, console ,$ */
indigenous = window.indigenous || {};
indigenous.utils = window.indigenous.utils || {};

indigenous.utils.trackEvent = function (eventName, metadata) {
	"use strict";
	analytics.track(eventName, metadata);
	//console.log('track subscribe.');
	return true;
};

indigenous.utils.trackSubscriptionEvent = function () {
	"use strict";
	console.log('trackSubscriptionEvent');
	var eventName = 'subscribed',
		emailAddress = $('input[name="EMAIL"]').val(),
		metadata = {
			'email': emailAddress
		};
	indigenous.utils.trackEvent(eventName, metadata);
	if (window.analytics) {
		analytics.identify({
			email: emailAddress
		});
	}

	return true;
};
