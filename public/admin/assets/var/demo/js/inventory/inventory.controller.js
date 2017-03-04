(function(){

app.controller('InventoryComponentController', inventoryComponentController);

inventoryComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout'];
/* @ngInject */
function inventoryComponentController($scope, $attrs, $filter, $modal, $timeout) {

    var vm = this;

    vm.init = init;

    vm.setInventoryData = setInventoryData;

    function setInventoryData(){
    	var inventory = [];
    	var _d = null;
    	var _rand = null;
    	for (i = 0; i < 50; i++) { 
    		_rand = Math.floor((Math.random() * 100) + 1);
    		_d = {
    		 	
	    		name: 'Pulse Secure PSA50' + _rand,
	    		vendor: "Pulse Secure" + _rand,
	    		sku: 'PSA50' + _rand,
	    		description: "Pulse Secure appliance 50" + _rand + "Base System",
	    		qty: Math.floor((Math.random() * 100) + 1)	
    		}
    		inventory.push(_d);
		}
    	
    	
    	vm.inventory = inventory;
    }

    function init(element) {
        vm.element = element;

        vm.setInventoryData();

    }

}

})();
