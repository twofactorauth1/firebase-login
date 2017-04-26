'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('PurchaseOrderService', PurchaseOrderService);

	PurchaseOrderService.$inject = ['$http', '$q', '$timeout', '$location'];
	/* @ngInject */
	function PurchaseOrderService($http, $q, $timeout, $location) {


        var poService = {
        };

        
        var basePoAPIUrlv2 = '/api/2.0/purchaseorders';

        poService.loading = {value: 0};


    
        poService.getPurchaseOrders = getPurchaseOrders;
        poService.createPurchaseOrder = createPurchaseOrder;
        poService.getPurchaseOrderDetails = getPurchaseOrderDetails;
        poService.addPurchaseOrderNote = addPurchaseOrderNote;
        poService.deletePurchaseOrder = deletePurchaseOrder;
        poService.archivePurchaseOrder = archivePurchaseOrder;
        poService.archiveBulkPurchaseOrders = archiveBulkPurchaseOrders;

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
                poService.purchaseOrders.splice(0, 0, data);
            }

            function error(error) {
                console.error('PurchaseOrderService getPurchaseOrders error: ', JSON.stringify(error));
            }

            var _formData = new FormData();
            _formData.append('file', po.attachment);
            _formData.append('po', angular.toJson(po));
            _formData.append('adminUrl', $location.$$absUrl.split("#")[0]);
            return poRequest($http.post(basePoAPIUrlv2, _formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).success(success).error(error));
        }

        /**
            * Get PO details
        */


        function getPurchaseOrderDetails(orderId) {

            function success(data) {
                console.log("purchase order loaded");
            }

            function error(error) {
                console.error('PurchaseOrderService getPurchaseOrderDetails error: ', JSON.stringify(error));
            }

            return poRequest($http.get([basePoAPIUrlv2, 'po', orderId].join('/')).success(success).error(error));
        }

        /**
            * Create PO notes
        */

        function addPurchaseOrderNote(orderId, note) {

            function success(data) {                
                console.log("note added");
            }

            function error(error) {
                console.error('PurchaseOrderService getPurchaseOrders error: ', JSON.stringify(error));
            }

            return (
                poRequest($http({
                  url: [basePoAPIUrlv2, 'po', orderId, "notes"].join('/'),
                  method: 'POST',
                  data: angular.toJson(note)
                }).success(success).error(error))
            );
        }

        /**
            * Get PO details
        */


        function deletePurchaseOrder(orderId) {

            function success(data) {
                console.log("purchase order deleted");
                poService.purchaseOrders = _.reject(poService.purchaseOrders, function(c){ return c._id == orderId });                   
            }

            function error(error) {
                console.error('PurchaseOrderService deletePurchaseOrder error: ', JSON.stringify(error));
            }

            return poRequest($http.delete([basePoAPIUrlv2, 'po', orderId].join('/')).success(success).error(error));
        }



        function archiveBulkPurchaseOrders(orderArray) {

            function success(data) {
                console.log("purchase order deleted");                
                _.each(orderArray, function(orderId){
                    poService.purchaseOrders = _.reject(poService.purchaseOrders, function(c){ return c._id == orderId });
                }) 
            }

            function error(error) {
                console.error('PurchaseOrderService archiveBulkPurchaseOrders error: ', JSON.stringify(error));
            }
            return (
                poRequest($http({
                    url: [basePoAPIUrlv2, 'po', 'archivepurchaseorders'].join('/'),
                    method: 'POST',
                    data: orderArray
                }).success(success).error(error))
            );
        }


        function archivePurchaseOrder(orderId) {

            function success(data) {
                console.log("purchase order archive");
                poService.purchaseOrders = _.reject(poService.purchaseOrders, function(c){ return c._id == orderId });                   
            }

            function error(error) {
                console.error('PurchaseOrderService archivePurchaseOrder error: ', JSON.stringify(error));
            }

            return (
                poRequest($http({
                    url: [basePoAPIUrlv2, 'po', 'archive', orderId].join('/'),
                    method: 'PUT'
                }).success(success).error(error))
            );
        }


		(function init() {
            getPurchaseOrders();
		})();


		return poService;
	}

})();