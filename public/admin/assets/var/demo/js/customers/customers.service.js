'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('CustomersService', CustomersService);

	CustomersService.$inject = ['$http', '$q', '$timeout'];
	/* @ngInject */
	function CustomersService($http, $q, $timeout) {

        var customerService = {
            
        };

        var baseInvoiceAPIUrl = '/api/1.0/integrations/zi';

        
        customerService.getCustomers = getCustomers;

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
                customerService.customers = data.response.payload.querydata.data.row;
            }

            function error(error) {
                console.error('customerService getCustomers error: ', JSON.stringify(error));
            }

            return customerRequest($http.get([baseInvoiceAPIUrl, 'customers'].join('/')).success(success).error(error));
        }


		(function init() {
            customerService.getCustomers();
		})();


		return customerService;
	}

})();