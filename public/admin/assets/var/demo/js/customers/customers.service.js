'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('CustomersService', CustomersService);

	CustomersService.$inject = ['$http', '$q', '$timeout', 'toaster'];
	/* @ngInject */
	function CustomersService($http, $q, $timeout, toaster) {

        var customerService = {
            
        };

        var baseCustomerAPIUrl = '/api/1.0/integrations/zi';

        
        customerService.getCustomers = getCustomers;
        customerService.getLedgerDetails = getLedgerDetails;

        customerService.loading = {value: 0};

        function customerRequest(fn) {
            customerService.loading.value = customerService.loading.value + 1;
            console.info('service | loading +1 : ' + customerService.loading.value);
            fn.finally(function () {
                customerService.loading.value = customerService.loading.value - 1;
                console.info('service | loading -1 : ' + customerService.loading.value);
            });
            return fn;
        }

       


        /**
            * Get list of all customers
        */
        function getCustomers() {

            function success(data) {
                customerService.customers = data;
            }

            function error(error) {
                customerService.customers = [];
                console.error('customerService getCustomers error: ', JSON.stringify(error));
            }

            return customerRequest($http.get([baseCustomerAPIUrl, 'customers'].join('/')).success(success).error(error));
        }


        /**
            * Get list of all customers
        */
        function getLedgerDetails(customerId) {

            function success(data) {
               // invoiceService.invoice = data.response.payload.querydata.data;
            }

            function error(error) {
                console.error('CustomerService getLedgerDetails error: ', JSON.stringify(error));
            }

            var qString = "?cardCodeFrom="+ customerId + "&cardCodeTo=" + customerId;

            return customerRequest($http.get([baseCustomerAPIUrl, 'ledger'].join('/') + qString).success(success).error(error));
        }


		(function init() {
            customerService.getCustomers().then(function(){

            }).catch(function(error) {
                if(error.data && error.data.message)
                    toaster.pop('error', 'Error', error.data.message);
            });
		})();


		return customerService;
	}

})();