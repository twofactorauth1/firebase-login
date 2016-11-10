'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

    app.factory('AnalyticsWidgetStateService', AnalyticsWidgetStateService);

    AnalyticsWidgetStateService.$inject = ['ipCookie'];
    /* @ngInject */
    function AnalyticsWidgetStateService(ipCookie) {
        var analylicService = {};

        analylicService.analyticsWidgetStateConfig = {
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
        
        analylicService.getAnalyticsWidgetStates = getAnalyticsWidgetStates;
        analylicService.setAnalyticsWidgetStates = setAnalyticsWidgetStates;
        
        function getAnalyticsWidgetStates() {
            analylicService.analyticsWidgetStateConfig;
            if(ipCookie("analyticsWidgetState")){
                analylicService.analyticsWidgetStateConfig = ipCookie("analyticsWidgetState");
            }
            else{
                setCookie(analylicService.analyticsWidgetStateConfig);
            }
        }

        function setAnalyticsWidgetStates(name, value){
            var ckAnalyticsWidgetState = ipCookie("analyticsWidgetState");
            if(ckAnalyticsWidgetState){
                ckAnalyticsWidgetState[name] = value;
                ipCookie.remove("analyticsWidgetState", {
                    path: "/"
                });
                setCookie(ckAnalyticsWidgetState);
            }
        }

        function setCookie(cookie){
            ipCookie("analyticsWidgetState", cookie, {
                expires: 20*365,
                path: "/"
            });
        }


        (function init() {
            
        })();


        return analylicService;
    }

})();
