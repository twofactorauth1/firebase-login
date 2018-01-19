(function(){

app.controller('CustomerTrafficController', customerTrafficController);

customerTrafficController.$inject = ['$scope', '$state', '$window', '$modal', '$stateParams', '$attrs', '$filter', '$document', '$timeout', 'toaster', 'TrafficService'];
/* @ngInject */
function customerTrafficController($scope, $state, $window, $modal, $stateParams, $attrs, $filter, $document, $timeout, toaster, TrafficService) {

    console.info('customer-traffic directive init...')

    var vm = this;

    vm.init = init;    
    vm.state ={
    	
    }
    vm.uiState = {
        loading: true,
        itemPerPage: 100,
		showPages: 15
    }

	vm.viewFingerprintDetails = viewFingerprintDetails;

	function viewFingerprintDetails(fingerprint){
		$state.go('app.anonymousContact', {fingerprintId: fingerprint._id});
	}    

    function init(element) {
        vm.element = element;
        TrafficService.getAdminTrafficFingerprints().then(function(response){
        	vm.state.fingerPrints = response.data;
        	vm.uiState.loading = false;
        })
    }

}

})();
