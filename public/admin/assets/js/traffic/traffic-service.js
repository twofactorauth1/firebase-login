'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

    app.factory('TrafficService', TrafficService);

    TrafficService.$inject = ['$http'];
    /* @ngInject */
    function TrafficService($http) {
        var trafficService = {};
        var baseAnalyticsAPIUrl = '/api/1.0/analytics/';
        
        trafficService.loading = {value:0};
        trafficService.getTrafficFingerprints = getTrafficFingerprints;

        /**
         * A wrapper around API requests
         * @param {function} fn - callback
         *
         * @returns {function} fn - callback
         *
         */
        function trafficRequest(fn) {
            trafficService.loading.value = trafficService.loading.value + 1;
            console.info('service | loading +1 : ' + trafficService.loading.value);
            fn.finally(function() {
                trafficService.loading.value = trafficService.loading.value - 1;
                console.info('service | loading -1 : ' + trafficService.loading.value);
            });
            return fn;
        }


        function getTrafficFingerprints() {            
            function success(data) {
                
            }

            function error(error) {
                console.error('TrafficService getTrafficFingerprints error: ', JSON.stringify(error));
            }

            return trafficRequest($http.get(baseAnalyticsAPIUrl + ["traffic", "list", "fingerprint"].join("/")).success(success).error(error));
        }

        return trafficService;
    }

})();
