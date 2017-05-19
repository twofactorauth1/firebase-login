'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

  app.factory('ContactPagingService', ContactPagingService);

  ContactPagingService.$inject = ['$http', '$q', '$timeout'];
  /* @ngInject */
  function ContactPagingService($http, $q, $timeout) {

    var contactService = {            
        skip: 0,
        page: 1,
        fieldSearch:{}
    };

    contactService.setTotalCount = setTotalCount;

    function setTotalCount(total){
      if(!angular.isDefined(contactService.totalCount)){
        contactService.totalCount = total;
      }
    }


    (function init() {
        
    })();

    return contactService;
  }

})();
