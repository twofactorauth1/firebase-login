'use strict';
/*global app, $$*/
/*jslint unparam: true*/
(function (angular) {
    app.service('CustomerService', ['$http', '$rootScope', '$cacheFactory', '$q', function ($http, $rootScope, $cacheFactory, $q) {
        var baseUrl = '/api/2.0/customers';
        var adminUrl = '/api/1.0/admin';
        var awsUrl = '/api/1.0/integrations/aws';
        var insightUrl = '/api/2.0/insights';
        var newCustomerUrl = '/api/1.0/account';

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

        this.getPagedCustomers = function (pagingParams, isFieldSearchEnabled, fn) {
            var urlParts = ['paged', 'list'];
            var _method = "GET";
            var _qString = "?limit=" + pagingParams.limit + "&skip=" + pagingParams.skip;
            if (pagingParams.sortBy) {
                _qString += "&sortBy=" + pagingParams.sortBy + "&sortDir=" + pagingParams.sortDir;
            }
            if (pagingParams.globalSearch) {
                _qString += "&term=" + encodeURIComponent(pagingParams.globalSearch);
            }
            if (isFieldSearchEnabled) {
                _method = "GET";
                urlParts.push('filter');
                _.each(pagingParams.fieldSearch, function (value, key) {
                    if(value != null){
                        _qString += '&' + key + '=' + encodeURIComponent(value);
                    }
                });
            }
            var apiUrl = baseUrl + "/" + urlParts.join('/') + _qString;
            return $http({
                url: apiUrl,
                method: _method,
                data: angular.toJson(pagingParams.fieldSearch)
            })
            .success(function (data) {
                fn(data);
            });
        };

        this.refreshCustomers = function(fn) {
            var apiUrl = [baseUrl, 'all'].join('/');
            var cache = this.getCache();
            $http({
                url: apiUrl,
                method: 'GET'
            }).success(function (data) {
                cache.put('customers', data);
                fn(data);
            });
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

        this.excludeUserFromCustomerView = function(userId, exclude, fn) {
            var apiUrl = [adminUrl, 'user', userId, 'exclude'].join('/');
            var body = {excludeUser:exclude};
            $http.post(apiUrl, body).success(function(data){
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
        };

        this.addCustomerNotes = function(id, notes, fn){
            var apiUrl = [baseUrl, 'customer', id, 'notes'].join('/');
            var body = {notes:notes};
            var cache = this.getCache();
            $http.post(apiUrl, body).success(function(data){
                if(cache) {
                    cache.get(id).notes = data.notes;
                }
                fn(data);
            }).error(function(err){
                fn(err);
            });
        };

        this.generateInsightReport = function(id, fn) {
            var apiUrl = [insightUrl];
            var body = {accountId:id};
            $http.post(apiUrl, body).success(function(data){
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };

        this.updateCustomerTemplateAccount = function(customer, generateScreenCap, fn){
            var id = customer._id;
            
            var apiUrl = [baseUrl, 'customer', id, 'templateAccount'].join('/');
            var body = {
                isTemplateAccount:customer.isTemplateAccount,
                templateImageUrl: customer.templateImageUrl,
                generateScreenCap: generateScreenCap
            };
            var cache = this.getCache();
            $http.post(apiUrl, body).success(function(data){
                if(cache) {
                    cache.get(id).isTemplateAccount = data.isTemplateAccount;
                    cache.get(id).templateImageUrl = data.templateImageUrl;
                }
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };

        this.refreshTemplateImage = function(customer, fn){
            var id = customer._id;
            
            var apiUrl = [baseUrl, 'customer', id, 'refreshTemplateImage'].join('/');
            var cache = this.getCache();
            $http.post(apiUrl).success(function(data){
                if(cache) {
                    cache.get(id).templateImageUrl = data.templateImageUrl;
                }
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };

        this.updateCustomerOEM = function(customer, oem, fn) {
            var id = customer._id;

            var apiUrl = [baseUrl, 'customer', id, 'oem'].join('/');
            var body = {
                oem:oem
            };
            var cache = this.getCache();
            $http.post(apiUrl, body).success(function(data){
                if(cache) {
                    cache.get(id).oem = data.oem;
                }
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };


        this.updateCustomerReceiveInsights = function(customer, receiveInsights, fn) {
            var id = customer._id;

            var apiUrl = [baseUrl, 'customer', id, 'insights'].join('/');
            var body = {
                receiveInsights:receiveInsights
            };
            var cache = this.getCache();
            $http.post(apiUrl, body).success(function(data){
                if(cache) {
                    cache.get(id).email_preferences.receiveInsights = receiveInsights;
                }
                fn(null, data);
            }).error(function(err){
                fn(err);
            });

        };

        this.updateCustomerShowHide = function(customer, fn) {
            var id = customer._id;

            var apiUrl = [baseUrl, 'customer', id, 'showhide'].join('/');
            var body = {showhide: customer.showhide};
            var cache = this.getCache();
            $http.post(apiUrl, body).success(function(data){
                if(cache) {
                    cache.get(id).showHide = customer.showHide;
                }
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };

        this.cancelAccountSubscription = function(accountId, reason, cancelNow, fn){
            var apiUrl = [adminUrl, 'account', accountId, 'cancel'].join('/');
            var body = {
                reason:reason,
                cancelNow:cancelNow
            };
            $http.post(apiUrl, body).success(function(data){
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };

        this.makeEvergreen = function(accountId, fn) {
            var apiUrl = [adminUrl, 'user', 'account', accountId, 'evergreen'].join('/');
            $http.post(apiUrl).success(function(data){
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };
        this.addUserToAccountTo = function(id, userId, fn) {
            var apiUrl = [adminUrl, 'user', 'account', id,'user',userId].join('/');
            $http.post(apiUrl).success(function(data){
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };

        this.addNewCustomer = function(orgId, subdomain, username, password, oem, passkey, fn) {
            var apiUrl = newCustomerUrl;
            var body = {
                orgId:orgId,
                subdomain:subdomain,
                username:username,
                password:password,
                oem:oem,
                passkey:passkey
            };
            $http.post(apiUrl, body).success(function(data){
                fn(null, data);
            }).error(function(err){
                fn(err);
            });
        };

        this.getTotalCustomers = function (fn) {
            var apiUrl = baseUrl + "/" + ['customer' ,'count'].join('/');
            var _method = 'GET';
            return $http({
                url: apiUrl,
                method: _method
            }).success(function (data) {
                fn(data)
            });
        };

    }]);
}(angular));
