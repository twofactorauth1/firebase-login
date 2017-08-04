'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('QuoteService', QuoteService);

	QuoteService.$inject = ['$rootScope', '$http', '$timeout', '$location', '$filter'];
	/* @ngInject */
	function QuoteService($rootScope, $http, $timeout, $location, $filter) {


        var quoteService = {
            
        };

        var baseQuoteAPIUrlv2 = '/api/2.0/quotes';
        var baseCustomerAPIUrl = '/api/1.0/integrations/zi';
        
        quoteService.getQuotes = getQuotes;
        quoteService.getQuoteDetails = getQuoteDetails;
        quoteService.updateQuote = updateQuote;
        quoteService.updateQuoteAttachment = updateQuoteAttachment;
        quoteService.submitQuote = submitQuote;
        quoteService.getCustomers = getCustomers;
        quoteService.deleteQuote = deleteQuote;

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
                console.error('quoteService updateQuote error: ', JSON.stringify(error));
            }

            var apiUrl = [baseQuoteAPIUrlv2, quote._id].join('/');


            return quoteServiceRequest($http.post(apiUrl, quote).success(success).error(error));
        }

        function updateQuoteAttachment(attachment, _id, fn){
            function success(data) {                
                console.log(data);
            }

            function error(error) {
                console.error('quoteService updateQuoteAttachment error: ', JSON.stringify(error));
            }

            var _formData = new FormData();
            _formData.append('file', attachment);
            
            return quoteServiceRequest($http.post([baseQuoteAPIUrlv2, 'attachment', _id].join('/'), _formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).success(success).error(error));
        }


        function deleteQuote(quote) {

            function success(data) {
                quoteService.quotes = _.reject(quoteService.quotes, function(c){ return c._id == quote._id });
            }

            function error(error) {
                console.error('quoteService deleteQuote error: ', JSON.stringify(error));
            }

            return quoteServiceRequest(
                $http({
                    url: [baseQuoteAPIUrlv2, quote._id].join('/'),
                    method: "DELETE"
                }).success(success).error(error)
            )
        }


        function submitQuote(quote){
            function success(data) {
                
            }

            function error(error) {
                console.error('quoteService submitQuote error: ', JSON.stringify(error));
            }

            var apiUrl = [baseQuoteAPIUrlv2, quote._id, "submit"].join('/');


            return quoteServiceRequest($http.post(apiUrl, quote).success(success).error(error));
        }

        /**
            * Get list of all VARs
        */
        function getCustomers() {

            function success(data) {
                var _list = data.results;
                _list = $filter('orderBy')(_list, ["OCRD_CardName", "OCRD_CardCode"]);
                quoteService.customers = _list;
            }

            function error(error) {
                quoteService.customers = [];
                console.error('quoteService getCustomers error: ', JSON.stringify(error));
            }

            return quoteServiceRequest($http.get([baseCustomerAPIUrl, 'customers'].join('/')).success(success).error(error));
        }

		(function init() {
           quoteService.getCustomers();
		})();


		return quoteService;
	}

})();