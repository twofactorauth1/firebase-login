/*
 * Verifying Account According to Subdomain
 * */


'use strict';
mainApp.service('contactService', ['$http', function ($http) {
    var baseUrl = '/api/1.0/';

    this.getContact = function(id, fn) {
                var apiUrl = baseUrl + ['contact', id].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

    this.putContact = function(contact, fn) {
                var apiUrl = baseUrl + ['contact'].join('/');
                $http.put(apiUrl, contact)
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

    this.postCsvContacts = function(contacts, fn) {
        var apiUrl = baseUrl + ['contact', 'importcsv'].join('/');
        $http.post(apiUrl, contacts)
            .success(function(data, status, headers, config) {
                fn(data);
            });
    };

}]);
