/*
 * Verifying Account According to Subdomain
 * */


'use strict';
mainApp.service('customerService', ['$http', function ($http) {
    var baseUrl = '/api/1.0/';

    this.getCustomer = function(id, fn) {
                var apiUrl = baseUrl + ['contact', id].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

    this.putCustomer = function(customer, fn) {
                var apiUrl = baseUrl + ['contact'].join('/');
                $http.put(apiUrl, customer)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

    this.getAddressByType = function(contact, type) {
        var _address = null;
        if (contact.details && contact.details.length > 0) {
            if (contact.details && contact.details[0].addresses && contact.details[0].addresses.length > 0) {
                if (type == "billing") {
                    var addresses = _.findWhere(contact.details[0].addresses, {
                        defaultBilling: true
                    });
                } else {
                    var addresses = _.findWhere(contact.details[0].addresses, {
                        defaultShipping: true
                    });
                }
                if(addresses) {
                    return addresses;    
                }
                return "";
            }
        }
        return "";
    };

     this.getGeoSearchAddress = function(addressStr, fn) {
        var apiUrl = baseUrl + ['geo', 'search', 'address', addressStr].join('/');
        $http.get(apiUrl)
            .success(function(data, status, headers, config) {
                fn(data);
        });
    };

    this.postCsvCustomers = function(customers, fn) {
        var apiUrl = baseUrl + ['contact', 'importcsv'].join('/');
        $http.post(apiUrl, customers)
            .success(function(data, status, headers, config) {
                fn(data);
            });
    };

}]);