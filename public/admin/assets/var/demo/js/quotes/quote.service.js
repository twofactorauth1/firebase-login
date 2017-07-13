'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('QuoteService', QuoteService);

	QuoteService.$inject = ['$rootScope', '$http', '$q', '$timeout', '$location'];
	/* @ngInject */
	function QuoteService($rootScope, $http, $q, $timeout, $location) {


        var quoteService = {
            
        };

        
        var baseQuoteAPIUrlv2 = '/api/2.0/quotes';

        quoteService.loading = {value: 0};

        function quoteRequest(fn) {
            quoteService.loading.value = quoteService.loading.value + 1;
            console.info('service | loading +1 : ' + quoteService.loading.value);
            fn.finally(function () {
                quoteService.loading.value = quoteService.loading.value - 1;
                console.info('service | loading -1 : ' + quoteService.loading.value);
            })
            return fn;
        }

		(function init() {
           
		})();


		return quoteService;
	}

})();