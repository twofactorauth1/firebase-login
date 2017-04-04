'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('PurchaseOrderService', PurchaseOrderService);

	PurchaseOrderService.$inject = ['$http', '$q', '$timeout'];
	/* @ngInject */
	function PurchaseOrderService($http, $q, $timeout) {


        var poService = {
        };

        
        var basePoAPIUrlv2 = '/api/2.0/purchaseorders';

        poService.loading = {value: 0};


    
        poService.getPurchaseOrders = getPurchaseOrders;
        poService.createPurchaseOrder = createPurchaseOrder;

        function poRequest(fn) {
            poService.loading.value = poService.loading.value + 1;
            console.info('service | loading +1 : ' + poService.loading.value);
            fn.finally(function () {
                poService.loading.value = poService.loading.value - 1;
                console.info('service | loading -1 : ' + poService.loading.value);
            })
            return fn;
        }


        /**
            * Get list of all po's for the account
        */
        function getPurchaseOrders() {

          function success(data) {
            poService.purchaseOrders = data;
          }

          function error(error) {
            console.error('PurchaseOrderService getPurchaseOrders error: ', JSON.stringify(error));
          }

          return poRequest($http.get([basePoAPIUrlv2].join('/')).success(success).error(error));
        }



        /**
            * Create new PO
        */
        function createPurchaseOrder(po) {

            function success(data) {
                poService.purchaseOrders = data;
            }

            function error(error) {
                console.error('PurchaseOrderService getPurchaseOrders error: ', JSON.stringify(error));
            }

            var fd = new FormData();
            fd.append('file', po.attachment);
            fd.append('po', angular.toJson(po));
            $http.post(basePoAPIUrlv2, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
        }

		(function init() {
            getPurchaseOrders();
		})();


		return poService;
	}

})();