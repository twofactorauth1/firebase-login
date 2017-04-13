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

        var baseInvoiceAPIUrl = '/api/1.0/integrations/zi/inventory';

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


		(function init() {
            
		})();


		return invoiceService;
	}

})();