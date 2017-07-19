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
        quoteService.updateQuote = updateQuote;
        quoteService.updateQuoteAttachment = updateQuoteAttachment;
        quoteService.submitQuote = submitQuote;
        
        var baseQuoteAPIUrlv2 = '/api/2.0/quotes';

        quoteService.loading = {value: 0};

        function quoteServiceRequest(fn) {
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

            return quoteServiceRequest($http.get([baseQuoteAPIUrlv2].join('/')).success(success).error(error));
        }

        function getQuoteDetails(_id) {

            function success(data) {
                
            }

            function error(error) {
                console.error('quoteService getQuoteDetails error: ', JSON.stringify(error));
            }

            return quoteServiceRequest($http.get([baseQuoteAPIUrlv2, _id].join('/')).success(success).error(error));
        }

        function updateQuote(quote){
            function success(data) {
                
            }

            function error(error) {
                console.error('quoteCartService updateQuote error: ', JSON.stringify(error));
            }

            var apiUrl = [baseQuoteAPIUrlv2, quote._id].join('/');


            return quoteServiceRequest($http.post(apiUrl, quote).success(success).error(error));
        }

        function updateQuoteAttachment(attachment, _id, fn){
            function success(data) {                
                console.log(data);
            }

            function error(error) {
                console.error('quoteCartService updateQuoteAttachment error: ', JSON.stringify(error));
            }

            var _formData = new FormData();
            _formData.append('file', attachment);
            
            return quoteServiceRequest($http.post([baseQuoteAPIUrlv2, 'attachment', _id].join('/'), _formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).success(success).error(error));
        }


        function submitQuote(quote){
            function success(data) {
                
            }

            function error(error) {
                console.error('quoteCartService submitQuote error: ', JSON.stringify(error));
            }

            var apiUrl = [baseQuoteAPIUrlv2, quote._id, "submit"].join('/');


            return quoteServiceRequest($http.post(apiUrl, quote).success(success).error(error));
        }

		(function init() {
           
		})();


		return quoteService;
	}

})();