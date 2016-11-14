'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

    app.factory('AnalyticsWidgetStateService', AnalyticsWidgetStateService);

    AnalyticsWidgetStateService.$inject = ['ipCookie'];
    /* @ngInject */
    function AnalyticsWidgetStateService(ipCookie) {
        var analyticService = {};

        analyticService.plateformAnalyticsWidgetStateConfig = {
            "overview": false,
            "locations": false,
            "interactions": false,
            "device": false,
            "newVReturning": false,
            "trafficSources": false,
            "pageanalytics": false,
            "ua": false,
            "userAgentsTable": false,
            "rev": false,
            "os": false,
            "campaigns": false
        };

        analyticService.siteAnalyticsWidgetStateConfig = {
            "overview": false,
            "locations": false,
            "interactions": false,
            "device": false,
            "newVReturning": false,
            "trafficSources": false,
            "pageanalytics": false,
            "ua": false,
            "userAgentsTable": false,
            "rev": false
        };

        analyticService.customerAnalyticsWidgetStateConfig = {
            "overview": false,
            "locations": false,
            "interactions": false,
            "device": false,
            "newVReturning": false,
            "trafficSources": false,
            "pageanalytics": false,
            "ua": false,
            "userAgentsTable": false,
            "rev": false
        };
        
        analyticService.getSiteAnalyticsWidgetStates = getSiteAnalyticsWidgetStates;
        analyticService.getPlateformAnalyticsWidgetStates = getPlateformAnalyticsWidgetStates;
        analyticService.getCustomerAnalyticsWidgetStates = getCustomerAnalyticsWidgetStates;
        analyticService.setSiteAnalyticsWidgetStates = setSiteAnalyticsWidgetStates;
        analyticService.setPlateformAnalyticsWidgetStates = setPlateformAnalyticsWidgetStates;
        analyticService.setCustomerAnalyticsWidgetStates = setCustomerAnalyticsWidgetStates;
        
        function getSiteAnalyticsWidgetStates() {            
            if(ipCookie("siteAnalyticsWidgetState")){
                analyticService.siteAnalyticsWidgetStateConfig = ipCookie("siteAnalyticsWidgetState");
            }
            else{
                setCookie(analyticService.siteAnalyticsWidgetStateConfig, "siteAnalyticsWidgetState");
            }
        }

        function getPlateformAnalyticsWidgetStates() {            
            if(ipCookie("plateformAnalyticsWidgetState")){
                analyticService.plateformAnalyticsWidgetStateConfig = ipCookie("plateformAnalyticsWidgetState");
            }
            else{
                setCookie(analyticService.plateformAnalyticsWidgetStateConfig, "plateformAnalyticsWidgetState");
            }
        }

        function getCustomerAnalyticsWidgetStates() {
            if(ipCookie("customerAnalyticsWidgetState")){
                analyticService.customerAnalyticsWidgetStateConfig = ipCookie("customerAnalyticsWidgetState");
            }
            else{
                setCookie(analyticService.customerAnalyticsWidgetStateConfig, "customerAnalyticsWidgetState");
            }
        }

        function setSiteAnalyticsWidgetStates(name, value){
            var ckAnalyticsWidgetState = ipCookie("siteAnalyticsWidgetState");
            if(ckAnalyticsWidgetState){
                ckAnalyticsWidgetState[name] = value;
                ipCookie.remove("siteAnalyticsWidgetState", {
                    path: "/"
                });
                setCookie(ckAnalyticsWidgetState, "siteAnalyticsWidgetState");
            }
        }

        function setPlateformAnalyticsWidgetStates(name, value){
            var ckAnalyticsWidgetState = ipCookie("plateformAnalyticsWidgetState");
            if(ckAnalyticsWidgetState){
                ckAnalyticsWidgetState[name] = value;
                ipCookie.remove("plateformAnalyticsWidgetState", {
                    path: "/"
                });
                setCookie(ckAnalyticsWidgetState, "plateformAnalyticsWidgetState");
            }
        }

        function setCustomerAnalyticsWidgetStates(name, value){
            var ckAnalyticsWidgetState = ipCookie("customerAnalyticsWidgetState");
            if(ckAnalyticsWidgetState){
                ckAnalyticsWidgetState[name] = value;
                ipCookie.remove("customerAnalyticsWidgetState", {
                    path: "/"
                });
                setCookie(ckAnalyticsWidgetState, "customerAnalyticsWidgetState");
            }
        }

        function setCookie(cookie, name){
            ipCookie(name, cookie, {
                expires: 20*365,
                path: "/"
            });
        }


        (function init() {
            
        })();


        return analyticService;
    }

})();
