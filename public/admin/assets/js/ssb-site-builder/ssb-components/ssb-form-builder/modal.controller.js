'use strict';
/*global app*/
app.controller('SiteBuilderFormBuilderModalController', ['$scope', '$timeout', 'parentVm', 'toaster', 'SimpleSiteBuilderService', function ($scope, $timeout, parentVm, toaster, SimpleSiteBuilderService) {

    var vm = this;

    var pVm = $scope.$parent.vm;

    vm.addCustomField = pVm.addCustomField;
    vm.checkDuplicateField = pVm.checkDuplicateField;
    vm.closeModal = pVm.closeModal;
    vm.component = pVm.state.page.sections[pVm.uiState.activeSectionIndex].components[pVm.uiState.activeComponentIndex];

    (function init() {

        console.debug('init form-builder contact modal');

    })();

}]);
