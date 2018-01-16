'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

  app.factory('CustomerPagingService', CustomerPagingService);

  CustomerPagingService.$inject = ['$http', '$q', '$timeout'];
  /* @ngInject */
  function CustomerPagingService($http, $q, $timeout) {

    var customerService = {            
        skip: 0,
        page: 1,
        fieldSearch:{}
    };

    customerService.setTotalCount = setTotalCount;

    function setTotalCount(total){
      if(!angular.isDefined(customerService.totalCount)){
        customerService.totalCount = total;
      }
    }


    (function init() {
        
    })();

    return customerService;
  }

})();
