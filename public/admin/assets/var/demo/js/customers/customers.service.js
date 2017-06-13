'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('CustomersService', CustomersService);

	CustomersService.$inject = ['$http', '$q', '$timeout', 'toaster', 'pagingConstant'];
	/* @ngInject */
	function CustomersService($http, $q, $timeout, toaster, pagingConstant) {

        var customerService = {
            limit: pagingConstant.numberOfRowsPerPage || 50,            
            skip: 0,
            page: 1
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
        function getCustomers(init) {

            function success(data) {
                if(init)
                    customerService.totalCustomers = data.total;
                customerService.customers = data;
            }

            function error(error) {
                customerService.customers = [];
                console.error('customerService getCustomers error: ', JSON.stringify(error));
            }
            var urlParts = [baseCustomerAPIUrl, 'customers'];
            var _qString = "?limit="+ customerService.limit+"&skip="+ customerService.skip;
            if(customerService.sortBy){
                _qString += "&sortBy=" + customerService.sortBy + "&sortDir=" + customerService.sortDir;
            }
            if(customerService.globalSearch){
                _qString += "&term=" + customerService.globalSearch;
            }
            if(checkIfFieldSearch()){
                _.each(customerService.fieldSearch, function (value, key) {
                    if(value != null){
                        _qString += '&' + key + '=' + value;
                    }
                });
                urlParts.push('filter');
            }
            return customerRequest($http.get(urlParts.join('/') + _qString).success(success).error(error));
        }

        function checkIfFieldSearch(){
            var isFieldSearch = false;
            var fieldSearch = customerService.fieldSearch;
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
            customerService.getCustomers(true).then(function(){

            }).catch(function(error) {
                if(error.data && error.data.message)
                    toaster.pop('error', 'Error', error.data.message);
            });
		})();


		return customerService;
	}

})();