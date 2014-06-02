/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

define([], function() {

    var geoServices = {

        searchAddress: function(addressString) {
            var url = $$.api.getApiUrl("geo", "search/address/" + addressString);
            var helper = new Backbone.Model();
            helper.url = url;
            helper.fetch()
                .done(function() {
                    deferred.resolve(helper);
                })
                .fail(function(resp) {
                    deferred.reject(resp);
                });

            var deferred = $.Deferred();
            return deferred;
        }
    };

    $$.svc.GeoService = geoServices;

    return geoServices;
});
