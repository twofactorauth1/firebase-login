/*global app*/
/*jslint unparam: true*/
'use strict';
(function (angular) {
  app.service('UtilService', [function () {
  

    this.flyoverout = '';
    
    this.flyoverhide = function (util) { 
       this.flyoverout = util;
    };
    
    this.flyoverhideonclick = function () {    	
      //if(this.flyoverout)		
       		this.flyoverout.openSidebarPanel = '';
    };

  }]);
}(angular));
