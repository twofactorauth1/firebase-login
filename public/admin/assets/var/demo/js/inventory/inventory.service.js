'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('InventoryService', InventoryService);

	InventoryService.$inject = ['$http', '$q', '$timeout'];
	/* @ngInject */
	function InventoryService($http, $q, $timeout) {

        var inventoryService = {
            limit: 50,
            skip: 0
        };

        var basePoAPIUrlv2 = '/api/1.0/integrations/zi/inventory';

        inventoryService.loading = {value: 0};
        
        inventoryService.getInventory = getInventory;
        inventoryService.getSingleInventory = getSingleInventory;



        function inventoryRequest(fn) {
            inventoryService.loading.value = inventoryService.loading.value + 1;
            console.info('service | loading +1 : ' + inventoryService.loading.value);
            fn.finally(function () {
                inventoryService.loading.value = inventoryService.loading.value - 1;
                console.info('service | loading -1 : ' + inventoryService.loading.value);
            })
            return fn;
        }

        /**
            * Get list of all inventories
        */
        function getInventory() {

            function success(data) {
                inventoryService.inventory = data;
            }

            function error(error) {
                console.error('inventoryService getInventory error: ', JSON.stringify(error));
            }

            var _qString = "?limit="+inventoryService.limit+"&skip="+ inventoryService.skip;

            return inventoryRequest($http.get([basePoAPIUrlv2].join('/') + _qString).success(success).error(error));
        }

        function getSingleInventory(productId){
            var deferred = $q.defer();
            var inventory = _.find(inventoryService.inventory, function (data) {
                return data._id == productId;
            });            
            deferred.resolve(inventory);            
            return deferred.promise;
        }

		(function init() {
            inventoryService.getInventory();
		})();


		return inventoryService;
	}

})();