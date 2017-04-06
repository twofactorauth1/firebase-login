/*global app*/
/*jslint unparam: true*/
'use strict';
(function (angular) {
  app.service('UtilService', ['$http', function ($http) {
    var baseUrl = '/api/1.0/';
    this.flyoverout = '';
    
    this.flyoverhide = function (util) {
       this.flyoverout = util;
    };
  }]);
}(angular));
