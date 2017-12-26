'use strict';
/*global app, $$*/
/*jslint unparam: true*/
(function (angular) {
    app.service('OrganizationService', ['$http', '$rootScope', '$cacheFactory', '$q', function ($http, $rootScope, $cacheFactory, $q) {
        var baseUrl = '/api/2.0/organization';

        this.getCache = function () {
            var cache = $cacheFactory.get('OrganizationService');
            if (cache) {
                return cache;
            }
            return $cacheFactory('OrganizationService');
        };

        this.loadOrganizations = function(fn){
            var apiUrl =[baseUrl, 'all'].join('/');
            var data = this.getCache().get('organizations');
            var cache = this.getCache();
            if(data) {
                fn(data);
            } else {
                $http({
                    url: apiUrl,
                    method: 'GET'
                }).success(function (data) {
                    cache.put('organizations', data);
                    fn(data);
                });
            }
        };
    }]);
}(angular));
