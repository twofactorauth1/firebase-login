'use strict';
/*global app, $$*/
/*jslint unparam: true*/
(function (angular) {
    app.service('CustomerService', ['$http', '$rootScope', '$cacheFactory', '$q', function ($http, $rootScope, $cacheFactory, $q) {
        var baseUrl = '/api/2.0/customers';

        this.getCache = function () {
            var cache = $cacheFactory.get('CustomerService');
            if (cache) {
                return cache;
            }
            return $cacheFactory('CustomerService');
        };
        
        this.getCustomers = function(sortBy, sortDir, skip, limit, fn){
            var apiUrl = baseUrl;
            var params = [];
            if(sortBy) {
                params.push('sortBy=' + sortBy);
            }
            if(sortDir) {
                params.push('sortDir=' + sortDir);
            }
            if(skip) {
                params.push('skip=' + skip);
            }
            if(limit) {
                params.push('limit=' + limit);
            }
            if(params.length >0) {
                apiUrl += '?' + params.join('&');
            }

            var data = this.getCache().get('customers');
            var cache = this.getCache();
            if(data) {
                fn(data);
            } else {
                $http({
                    url: apiUrl,
                    method: 'GET'
                }).success(function (data) {
                    cache.put('customers', data);
                    fn(data);
                });
            }
        };




    }]);
}(angular));
