/*global app*/
/*jslint unparam: true*/
'use strict';
(function (angular) {
  app.service('UtilService', ["$filter", function ($filter) {


    this.flyoverout = '';
    this.checkIfFieldSearch = checkIfFieldSearch;
    
    this.flyoverhide = function (util) {
       this.flyoverout = util;
    };

    this.flyoverhideonclick = function () {
      if(this.flyoverout)
       		this.flyoverout.openSidebarPanel = '';
    };

    this.showFilteredRecords = function(globalSearch, fieldSearch){
      if(globalSearch || checkIfFieldSearch(fieldSearch)){
          return true;
      }
      else{
          return false;
      }
    };

    function checkIfFieldSearch(fieldSearch){
        var isFieldSearch = false;
        if(!_.isEmpty(fieldSearch)){
            for(var i=0; i <= Object.keys(fieldSearch).length - 1; i++){
                var key = Object.keys(fieldSearch)[i];
                var value = fieldSearch[key];

                if(value){
                   isFieldSearch = true;
                }
            }
        }
        return isFieldSearch;
    }

    this.getWidgetRecordsLengthMessage = function(count, item){
      var str = "";
      if(count === 1){
        str = "There is 1 " + item;
      }
      else if(count > 1){
         str = "There are " + $filter('number')(count, 0) + " " + item + "s";
      }
      else{
        str = "There are no " + item + "s";
      }
      return str;
    }

  }]);
}(angular));
