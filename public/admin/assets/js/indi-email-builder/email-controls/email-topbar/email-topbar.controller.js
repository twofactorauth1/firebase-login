(function(){

app.controller('EmailBuilderTopbarController', ssbEmailBuilderTopbarController);

ssbEmailBuilderTopbarController.$inject = ['$scope', '$rootScope', '$timeout', '$attrs', '$filter', 'EmailBuilderService', '$modal', '$location', 'SweetAlert', 'toaster', '$q'];
/* @ngInject */
function ssbEmailBuilderTopbarController($scope, $rootScope, $timeout, $attrs, $filter, EmailBuilderService, $modal, $location, SweetAlert, toaster, $q) {

    console.info('email-build topbar directive init...')

    var vm = this;

    vm.init = init;


    function init(element) {
    	vm.element = element;
        if (!vm.state.email) {
            vm.state.email = EmailBuilderService.email;
        }
    }

}

})();
