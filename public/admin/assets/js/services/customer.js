'use strict';
/*global app, $$*/
/*jslint unparam: true*/
(function (angular) {
    app.service('CustomerService', ['$http', '$rootScope', '$cacheFactory', '$q', function ($http, $rootScope, $cacheFactory, $q) {
        var baseUrl = '/api/2.0/customers';
        var adminUrl = '/api/1.0/admin';
        var awsUrl = '/api/1.0/integrations/aws';

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

        this.loadAllCustomers = function(fn){
            var apiUrl = baseUrl;
            var apiUrl = [baseUrl, 'all'].join('/');
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

        this.getCustomer = function(id, fn) {
            var apiUrl = [baseUrl, id].join('/');
            var data = this.getCache().get(id);
            var cache = this.getCache();
            if(data) {
                fn(null, data);
            } else {
                $http({
                    url: apiUrl,
                    method: 'GET'
                }).success(function (data) {
                    cache.put(id, data);
                    fn(null, data);
                }).error(function(err){
                    fn(err);
                });
            }
        };

        this.getSingleCustomer = function(id, fn) {
            var apiUrl = [baseUrl, 'single', id].join('/');
            
            $http({
                url: apiUrl,
                method: 'GET'
            }).success(function (data) {                
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };

        this.extendTrial = function(id, newLength, fn) {
            var apiUrl = [adminUrl, 'account', id, 'trial', newLength].join('/');
            $http({
                url:apiUrl,
                method: 'POST'
            }).success(function(data){
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };

        this.addNewUser = function(id, username, password, fn) {
            var apiUrl = [adminUrl, 'user', 'account', id].join('/');
            var body = {
                username:username,
                password:password
            };
            $http.post(apiUrl, body).success(function(data){
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };

        this.removeUserFromAccount = function(id, userId, fn) {
            var apiUrl = [adminUrl, 'user', 'account', id, 'user', userId].join('/');
            $http.delete(apiUrl).success(function(data){
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };

        this.setUserPassword = function(userId, password, fn) {
            var apiUrl = [adminUrl, 'user', userId, 'password'].join('/');
            var body = {password:password};
            $http.post(apiUrl, body).success(function(data){
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };

        this.viewNameServers = function(domain, fn) {
            var apiUrl = [awsUrl, 'route53', domain, 'nameservers'].join('/');
            $http.get(apiUrl).success(function(data){
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };

        this.addDomainToAccount = function(domain, accountId, fn) {
            //route53/:domain/account/:accountId
            var apiUrl = [awsUrl, 'route53', domain, 'account', accountId].join('/');
            $http.put(apiUrl).success(function(data){
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        }

        this.addCustomerNotes = function(id, notes, fn){
            var apiUrl = [baseUrl, 'customer', id, 'notes'].join('/');
            var body = {notes:notes};
            var cache = this.getCache();
            $http.post(apiUrl, body).success(function(data){
                if(cache)
                    cache.put(id, data);
                fn(data);
            }).error(function(err){
                fn(err);
            });
        }


    }]);
}(angular));
