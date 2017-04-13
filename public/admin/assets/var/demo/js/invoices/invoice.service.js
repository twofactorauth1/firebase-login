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

        invoiceService.getInvoices = getInvoices;

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
            * Get list of all invoices
        */
        function getInvoices() {
            var invoices = [];
            var _d = null;
            var _rand = null;
            for (var i = 0; i < 30; i++) { 
                _rand = (Math.random() * 1000000).toFixed(2);
                _d = {

                    invoiceNumber: Math.floor((Math.random() * 1000000) + 1),
                    poNumber: Math.floor((Math.random() * 100000) + 1),
                    invoiceDate: new Date(new Date().setDate(new Date().getDate() - 1)),
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
                    invoiceTotal:_rand,
                    invoiceBalance: _rand,
                    invoiceStatus: 'Open'
                } 
                invoices.push(_d);   
            }
            
            invoiceService.invoices = invoices;
        }


		(function init() {
            invoiceService.getInvoices();
		})();


		return invoiceService;
	}

})();