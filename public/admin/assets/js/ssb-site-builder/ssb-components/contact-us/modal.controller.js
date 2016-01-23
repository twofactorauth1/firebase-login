'use strict';
/*global app*/
app.controller('SiteBuilderContactUsModalController', ['$timeout', 'parentVm', 'toaster', 'SimpleSiteBuilderService', function ($timeout, parentVm, toaster, SimpleSiteBuilderService) {

    var vm = this;

    vm.parentVm = parentVm;

    vm.component = parentVm.state.page.sections[parentVm.uiState.activeSectionIndex].components[parentVm.uiState.activeComponentIndex];

    (function init() {

        console.debug('ContactUsModalController')

    })();

}]);
