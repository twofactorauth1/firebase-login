(function(){

app.controller('SiteBuilderTopbarController', ssbSiteBuilderTopbarController);

ssbSiteBuilderTopbarController.$inject = ['$scope', '$timeout', '$attrs', '$filter', 'SimpleSiteBuilderService', '$modal', '$location', 'SweetAlert'];
/* @ngInject */
function ssbSiteBuilderTopbarController($scope, $timeout, $attrs, $filter, SimpleSiteBuilderService, $modal, $location, SweetAlert) {

    console.info('site-build topbar directive init...')

    var vm = this;

    vm.init = init;
    vm.savePage = savePage;
    vm.cancelPendingEdits = cancelPendingEdits;
    vm.loadPage = loadPage;

    function loadPage(page) {
        vm.uiState.navigation.loadPage(page._id);
        SimpleSiteBuilderService.getPages();
    };

    function savePage() {
        var isLegacyPage = vm.state.page.ssb;

        console.log(isLegacyPage);

        if (!vm.uiState.hasSeenWarning && isLegacyPage) {

            SweetAlert.swal({
              title: "Are you sure?",
              text: "CAUTION: This editor is under active development. Pages saved in Site Builder will not render or be editable in the legacy Pages editor.",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes — Use Site Builder editor.",
              cancelButtonText: "No — Use the legacy editor.",
              closeOnConfirm: true,
              closeOnCancel: true
            },
            function (isConfirm) {
                if (isConfirm) {

                    vm.uiState.hasSeenWarning = true;

                    vm.state.pendingChanges = false;

                    saveWebsite();

                    return (
                        SimpleSiteBuilderService.savePage(vm.state.page).then(function(response){
                            console.log('page saved');
                        })
                    )

                }
            });

        } else {
            vm.state.pendingChanges = false;

            saveWebsite();

            return (
                SimpleSiteBuilderService.savePage(vm.state.page).then(function(response){
                    console.log('page saved');
                })
            )
        }

    }

    function cancelPendingEdits() {
      vm.state.pendingChanges = false;
      vm.state.website = angular.copy(vm.state.originalWebsite);
      vm.state.page = angular.copy(vm.state.originalPage);
    }

    function saveWebsite() {
        vm.state.pendingChanges = false;
        return (
            SimpleSiteBuilderService.saveWebsite(vm.state.website).then(function(response){
                console.log('website saved');
            })
        )
    }

    function init(element) {
    	vm.element = element;
        if(!vm.state.page)
            vm.state.page = SimpleSiteBuilderService.page;
    }

}

})();
