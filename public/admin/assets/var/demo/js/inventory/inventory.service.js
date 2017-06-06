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
            fieldSearch:{
                OITM_ItemName: undefined,
                OMRC_FirmName: undefined,
                OITM_ItemCode: undefined,
                Available: undefined
            }
        };

        var baseInventoryAPIUrl = '/api/1.0/integrations/zi/inventory';
        var baseOrgConfigAPIUrl = '/api/1.0/user/orgConfig';

        inventoryService.loading = {value: 0};

        inventoryService.getInventory = getInventory;
        inventoryService.getSingleInventory = getSingleInventory;
        inventoryService.getSingleInventoryByName = getSingleInventoryByName;
        inventoryService.getUserOrgConfig = getUserOrgConfig;
        inventoryService.updateUserOrgConfig = updateUserOrgConfig;

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
        function getInventory(init) {
            var urlParts = [baseInventoryAPIUrl];
            function success(data) {
                if(init)
                    inventoryService.totalInventory = data.total;
                inventoryService.inventory = data;
            }

            function error(error) {
                console.error('inventoryService getInventory error: ', JSON.stringify(error));
            }

            var _qString = "?limit="+inventoryService.limit+"&skip="+ inventoryService.skip;

            if(inventoryService.sortBy){
                _qString += "&sortBy=" + inventoryService.sortBy + "&sortDir=" + inventoryService.sortDir;
            }
            else{
                _qString += "&sortBy=_firmName&sortDir=1";   
            }
            if(checkIfFieldSearch()){
                if(inventoryService.globalSearch){
                    _qString += "&term=" + inventoryService.globalSearch;
                }
                _.each(inventoryService.fieldSearch, function (value, key) {
                    if(value != null){
                        _qString += '&' + key + '=' + value;
                    }
                });
                urlParts.push('search');
            }
            else if(inventoryService.globalSearch){
                _qString += "&term=" + inventoryService.globalSearch;
                urlParts.push('filter');
            }
            return (
                inventoryRequest($http({
                  url: urlParts.join('/') + _qString,
                  method: "GET"
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

        function getSingleInventoryByName(name){
            function success(data) {
                console.log(data);
            }

            function error(error) {
                console.error('inventoryService getSingleInventoryByName error: ', JSON.stringify(error));
            }

            return inventoryRequest($http.get([baseInventoryAPIUrl, 'name', name].join('/')).success(success).error(error));

        }

        function getUserOrgConfig(){
            function success(data) {
                console.log(data);
                inventoryService.userOrgConfig = data;
            }

            function error(error) {
                console.error('inventoryService getUserOrgConfig error: ', JSON.stringify(error));
            }

            return inventoryRequest($http.get([baseOrgConfigAPIUrl].join('/')).success(success).error(error));

        }

        function updateUserOrgConfig(orgConfig){
            function success(data) {
                inventoryService.userOrgConfig = data;
            }

            function error(error) {
                console.error('inventoryService updateUserOrgConfig error: ', JSON.stringify(error));
            }

            return (
                inventoryRequest($http({
                  url: [baseOrgConfigAPIUrl].join('/'),
                  method: "POST",
                  data: angular.toJson(orgConfig)
                }).success(success).error(error))
            );
        }

		(function init() {
            inventoryService.getUserOrgConfig();
            inventoryService.getInventory(true);
           
		})();


		return inventoryService;
	}

})();
