/*global app*/
/*jslint unparam: true*/
'use strict';
(function (angular) {
  app.service('UtilService', ['$http', function ($http) {
  

    this.flyoverout = '';
    
    this.flyoverhide = function (util) {
    

       this.flyoverout = util;
      

    };
     this.flyoverhideonclick = function () {
     

      
       this.flyoverout.openSidebarPanel = '';

    };
  }]);
}(angular));
