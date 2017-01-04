'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

    app.factory('RssFeedService', RssFeedService);

    RssFeedService.$inject = ['$http'];
    /* @ngInject */



    function RssFeedService($http) {
        var SsbFeedService = {};


        SsbFeedService.parseFeed = parseFeed;
        
        function parseFeed(url) {            
            return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
        }

        (function init() {
            
        })();

        return SsbFeedService;
    }

})();
