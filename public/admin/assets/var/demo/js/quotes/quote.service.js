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


        quoteService.getQuotes = getQuotes;
        quoteService.getQuoteDetails = getQuoteDetails;
        
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


        function getQuotes() {

            function success(data) {
                quoteService.quotes = data;
            }

            function error(error) {
                console.error('quoteService getQuotes error: ', JSON.stringify(error));
            }

            return quoteRequest($http.get([baseQuoteAPIUrlv2].join('/')).success(success).error(error));
        }

        function getQuoteDetails(_id) {

            function success(data) {
                quoteService.quotes = data;
            }

            function error(error) {
                console.error('quoteService getQuoteDetails error: ', JSON.stringify(error));
            }

            return quoteRequest($http.get([baseQuoteAPIUrlv2, _id].join('/')).success(success).error(error));
        }

		(function init() {
           
		})();


		return quoteService;
	}

})();