'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('InvoiceService', InvoiceService);

	InvoiceService.$inject = ['$http', '$q', '$timeout'];
	/* @ngInject */
	function InvoiceService($http, $q, $timeout) {

        var invoiceService = {
            
        };

        var baseInvoiceAPIUrl = '/api/1.0/integrations/zi';
        
        invoiceService.viewCustomerInvoice= viewCustomerInvoice

        invoiceService.loading = {value: 0};

        function invoiceRequest(fn) {
            invoiceService.loading.value = invoiceService.loading.value + 1;
            console.info('service | loading +1 : ' + invoiceService.loading.value);
            fn.finally(function () {
                invoiceService.loading.value = invoiceService.loading.value - 1;
                console.info('service | loading -1 : ' + invoiceService.loading.value);
            });
            return fn;
        }
        /**
            * Get customer invoice details
        */
        function viewCustomerInvoice(customerId, transactionId) {

            function success(data) {
               // invoiceService.invoice = data.response.payload.querydata.data;
            }

            function error(error) {
                console.error('InvoiceService viewCustomerInvoice error: ', JSON.stringify(error));
            }

            var qString = "?transactionId="+ transactionId;

            return invoiceRequest($http.get([baseInvoiceAPIUrl, 'invoices', customerId].join('/') + qString).success(success).error(error));
        }


		(function init() {
            
		})();


		return invoiceService;
	}

})();