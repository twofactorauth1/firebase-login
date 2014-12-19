/*
 * Getting Pages Data From Database
 *
 * */
'use strict';
mainApp.service('productService', function($http) {
    var baseUrl = '/api/1.0/';

    this.getProduct = function(productId, fn) {
        var apiUrl = baseUrl + ['products', productId].join('/');
        $http.get(apiUrl)
            .success(function(data, status, headers, config) {
                fn(data);
            });
    };

    this.getAllProducts = function(fn) {
        var apiUrl = baseUrl + ['products'].join('/');
        $http.get(apiUrl, { cache: true})
            .success(function(data, status, headers, config) {
                fn(data);
            });
    };

});
