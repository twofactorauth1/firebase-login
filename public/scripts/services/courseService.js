/*
 * Getting Pages Data From Database
 *
 * */
'use strict';
mainApp.service('courseService', function ($http) {
    var baseUrl = '/api/1.0/';
    this.getAllCourses = function (fn) {
        var apiUrl = baseUrl + ['courses'].join('/');
        $http.get(apiUrl, { cache: true})
            .success(function (data, status, headers, config) {
                fn(data);
            });
    };
});