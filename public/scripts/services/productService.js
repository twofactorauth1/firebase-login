/*
 * Getting Pages Data From Database
 *
 * */
'use strict';
mainApp.service('ProductService', function ($http) {
    var baseUrl = '/api/1.0/';
    this.getAllProducts = function (fn) {
        var apiUrl = baseUrl + ['products'].join('/');
        $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
    };

});