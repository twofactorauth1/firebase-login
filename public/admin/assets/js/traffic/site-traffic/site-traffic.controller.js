(function(){

app.controller('SiteTrafficController', siteTrafficController);

siteTrafficController.$inject = ['$scope', '$state', '$window', '$modal', '$stateParams', '$attrs', '$filter', '$document', '$timeout', 'toaster', 'TrafficService'];
/* @ngInject */
function siteTrafficController($scope, $state, $window, $modal, $stateParams, $attrs, $filter, $document, $timeout, toaster, TrafficService) {

    console.info('site-traffic directive init...')

    var vm = this;

    vm.init = init;    
    vm.state ={
    	
    }
    vm.uiState = {
        loading: true,
        itemPerPage: 100,
		showPages: 15
    }
    
    function init(element) {
        vm.element = element;
        TrafficService.getTrafficFingerprints().then(function(response){
        	vm.state.fingerPrints = response.data;
        	vm.uiState.loading = false;
        })
    }

}

})();
