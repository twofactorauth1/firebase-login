indigenous = window.indigenous || {};
indigenous.utils = window.indigenous.utils || {};

indigenous.utils.trackEvent = function(eventName, metadata) {
    analytics.track(eventName, metadata);
    console.log('track subscribe.');
    return true;
};

indigenous.utils.trackSubscriptionEvent = function() {
    console.log('trackSubscriptionEvent');
    var eventName = 'subscribed';
    var emailAddress = $('input[name="email"]').val();
    var metadata = {'email': emailAddress};
    indigenous.utils.trackEvent(eventName, metadata);
    return true;
};
