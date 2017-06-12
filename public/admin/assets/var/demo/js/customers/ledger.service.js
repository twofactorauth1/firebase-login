'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('LedgerService', LedgerService);

	LedgerService.$inject = ['$http', '$q', '$timeout', 'toaster'];
	/* @ngInject */
	function LedgerService($http, $q, $timeout, toaster) {

        var ledgerService = {
            
        };

        var baseLedgerAPIUrl = '/api/1.0/integrations/zi';

        ledgerService.getLedgerDetails = getLedgerDetails;
        ledgerService.getCustomerDetails = getCustomerDetails;
        ledgerService.loading = {value: 0};

        function ledgerRequest(fn) {
            ledgerService.loading.value = ledgerService.loading.value + 1;
            console.info('service | loading +1 : ' + ledgerService.loading.value);
            fn.finally(function () {
                ledgerService.loading.value = ledgerService.loading.value - 1;
                console.info('service | loading -1 : ' + ledgerService.loading.value);
            });
            return fn;
        }
        
        function getLedgerDetails(customerId) {

            function success(data) {
               
            }

            function error(error) {
                console.error('ledgerService getLedgerDetails error: ', JSON.stringify(error));
            }
            return ledgerRequest($http.get([baseLedgerAPIUrl, 'ledger', customerId].join('/')).success(success).error(error));
        }


        function getCustomerDetails(customerId) {

            function success(data) {
               
            }

            function error(error) {
                console.error('ledgerService getCustomerDetails error: ', JSON.stringify(error));
            }
            return ledgerRequest($http.get([baseLedgerAPIUrl, 'customer', customerId].join('/')).success(success).error(error));
        }


		(function init() {
           
		})();


		return ledgerService;
	}

})();