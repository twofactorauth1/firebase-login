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
            skip: 0,
            page: 0
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
            
            if(inventoryService.sortBy){
                _qString += "&sortBy=" + inventoryService.sortBy + "&sortDir=" + inventoryService.sortDir;
            }

            if(inventoryService.globalSearch){
                _qString += "&term=" + inventoryService.globalSearch;
            }
            return inventoryRequest($http.get([basePoAPIUrlv2].join('/') + _qString).success(success).error(error));
        }

        function getSingleInventory(productId){           
            function success(data) {
                console.log(data);
            }

            function error(error) {
                console.error('inventoryService getSingleInventory error: ', JSON.stringify(error));
            }
           
            return inventoryRequest($http.get([basePoAPIUrlv2, productId].join('/')).success(success).error(error));                       
            
        }

		(function init() {
            inventoryService.getInventory();
		})();


		return inventoryService;
	}

})();