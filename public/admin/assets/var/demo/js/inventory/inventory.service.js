'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('InventoryService', InventoryService);

	InventoryService.$inject = ['$http', '$q', '$timeout'];
	/* @ngInject */
	function InventoryService($http, $q, $timeout) {

        var inventoryService = {
        };
        
        inventoryService.getInventory = getInventory;
        inventoryService.getSingleInventory = getSingleInventory;

        function getInventory() {
            var inventory = [];
            var _d = null;
            var _rand = null;
            for (var i = 0; i < 50; i++) { 
                _rand = Math.floor((Math.random() * 100) + 1);
                _d = {
                    _id: i + 1,
                    name: 'Pulse Secure PSA50' + _rand,
                    vendor: "Pulse Secure" + _rand,
                    sku: 'PSA50' + _rand,
                    description: "Pulse Secure appliance 50" + _rand + "Base System",
                    qty: Math.floor((Math.random() * 100) + 1)  
                }
                inventory.push(_d);
            }
            inventoryService.inventory = inventory;
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