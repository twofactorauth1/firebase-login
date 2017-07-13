'use strict';
/*global app*/
app.controller('QuoteDetailsModalController', ['$scope', '$timeout', 'parentVm', 'toaster', 'SweetAlert', function ($scope, $timeout, parentVm, toaster, SweetAlert) {

    var vm = this;

    vm.parentVm = parentVm;
    
    vm.state = {
        orgCardAndPermissions: vm.parentVm.state.orgCardAndPermissions
    };
    vm.uiState = {
        
    };
    
    (function init() {
        
    })();

}]);
