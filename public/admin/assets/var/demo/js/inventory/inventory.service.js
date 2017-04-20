'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('InventoryService', InventoryService);

	InventoryService.$inject = ['$http', '$q', '$timeout', 'pagingConstant'];
	/* @ngInject */
	function InventoryService($http, $q, $timeout, pagingConstant) {

        var inventoryService = {
            limit: pagingConstant.numberOfRowsPerPage || 50,
            skip: 0,
            page: 1,
            fieldSearch:{}
        };

        var baseInventoryAPIUrl = '/api/1.0/integrations/zi/inventory';

        inventoryService.loading = {value: 0};

        inventoryService.getInventory = getInventory;
        inventoryService.getSingleInventory = getSingleInventory;
        inventoryService.getSingleInventoryBySKU = getSingleInventoryBySKU;

        function inventoryRequest(fn) {
            inventoryService.loading.value = inventoryService.loading.value + 1;
            console.info('service | loading +1 : ' + inventoryService.loading.value);
            fn.finally(function () {
                inventoryService.loading.value = inventoryService.loading.value - 1;
                console.info('service | loading -1 : ' + inventoryService.loading.value);
            });
            return fn;
        }

        /**
            * Get list of all inventories
        */
        function getInventory() {
            var urlParts = [baseInventoryAPIUrl];
            function success(data) {
                inventoryService.inventory = data;
            }

            function error(error) {
                console.error('inventoryService getInventory error: ', JSON.stringify(error));
            }

            var _method = "GET";

            var _qString = "?limit="+inventoryService.limit+"&skip="+ inventoryService.skip;

            if(inventoryService.sortBy){
                _qString += "&sortBy=" + inventoryService.sortBy + "&sortDir=" + inventoryService.sortDir;
            }

            if(checkIfFieldSearch()){
                _method = "POST";
                urlParts.push('search');
            }
            else if(inventoryService.globalSearch){
                _qString += "&term=" + inventoryService.globalSearch;
                urlParts.push('filter');
            }
            return (
                inventoryRequest($http({
                  url: urlParts.join('/') + _qString,
                  method: _method,
                  data: angular.toJson(inventoryService.fieldSearch)
                }).success(success).error(error))
            );

        }

        function checkIfFieldSearch(){
            var isFieldSearch = false;
            var fieldSearch = inventoryService.fieldSearch;
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

        function getSingleInventory(productId){
            function success(data) {
                console.log(data);
            }

            function error(error) {
                console.error('inventoryService getSingleInventory error: ', JSON.stringify(error));
            }

            return inventoryRequest($http.get([baseInventoryAPIUrl, productId].join('/')).success(success).error(error));

        }

        function getSingleInventoryBySKU(sku){
            function success(data) {
                console.log(data);
            }

            function error(error) {
                console.error('inventoryService getSingleInventoryBySKU error: ', JSON.stringify(error));
            }

            return inventoryRequest($http.get([baseInventoryAPIUrl, 'sku', sku].join('/')).success(success).error(error));

        }

		(function init() {
            inventoryService.getInventory();
		})();


		return inventoryService;
	}

})();
