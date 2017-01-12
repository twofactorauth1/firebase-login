'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

    app.factory('RssFeedService', RssFeedService);

    RssFeedService.$inject = ['$http'];
    /* @ngInject */

    var baseCmsAPIUrlv2 = '/api/2.0/cms/feed/rss';

    function RssFeedService($http) {
        var SsbFeedService = {};


        SsbFeedService.parseFeed = parseFeed;


        
        function parseFeed(feedUrl) {
            var apiUrl = [baseCmsAPIUrlv2].join('/');  
            function success(data) {
                
            }

            function error(error) {
               
            }

            return (ssbRequest($http({
                url: apiUrl,
                method: 'POST',
                data: { feedUrl: feedUrl }
            }).success(success).error(error)));         
            //return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
        }


        function ssbRequest(fn) {
            
            fn.finally(function() {
                console.log("function ")
            });
            return fn;
        }

        
       

        (function init() {
            
        })();

        return SsbFeedService;
    }

})();
