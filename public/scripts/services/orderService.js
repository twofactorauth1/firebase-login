/*global mainApp, moment, angular*/
/*jslint unparam:true*/
'use strict';
mainApp.service('orderService', function ($http) {
  var baseUrl = '/api/1.0/';
  this.createOrder = function (order, fn) {
    var apiUrl = baseUrl + ['orders'].join('/');
    $http({
      url: apiUrl,
      method: "POST",
      data: angular.toJson(order)
    }).success(function (data, status, headers, config) {
      fn(data);
    }).error(function (err) {
      console.log('END:Create Order with ERROR');
    });
  };

});
