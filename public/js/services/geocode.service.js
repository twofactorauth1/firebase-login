/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([], function() {

    var geocodeService = {

        addresstolatlng: function(address) {
            var url = 'http://nominatim.openstreetmap.org/search?q='+address+'&format=json&polygon=1&addressdetails=1';
            return $.getJSON(url);
        }
    };

    $$.svc.GeocodeService = geocodeService;

    return geocodeService;
});
