(function(){

app.controller('SiteBuilderTopbarController', ssbSiteBuilderTopbarController);

ssbSiteBuilderTopbarController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$modal', '$location', 'SweetAlert'];
/* @ngInject */
function ssbSiteBuilderTopbarController($scope, $attrs, $filter, SimpleSiteBuilderService, $modal, $location, SweetAlert) {

    console.info('site-build topbar directive init...')

    var vm = this;

    vm.init = init;
    vm.savePage = savePage;
    vm.cancelPendingEdits = cancelPendingEdits;

    vm.navigation = {
        loadPage: function(page) {
            if (page._id && page._id !== vm.state.page._id) {
                SimpleSiteBuilderService.getPages();
                $location.path('/website/site-builder/pages/' + page._id);
            }
        }
    };

    function savePage() {
        SweetAlert.swal({
        title: "Are you sure?",
        text: "CAUTION: For testing purposes only! Do not save your edits here unless you're OK with your pages breaking. This editor is under active development. Pages saved in Simple Site Builder will not render and will not be editable in the legacy editor.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes — I'll use Simple Site Builder going forward.",
        cancelButtonText: "No — I will use the legacy editor for now.",
        closeOnConfirm: true,
        closeOnCancel: true
      },
      function (isConfirm) {
        if (isConfirm) {

          vm.state.pendingChanges = false;

          saveWebsite();

          return (
            SimpleSiteBuilderService.savePage(vm.state.page).then(function(response){
              console.log('page saved');
            })
          )

        }
      });
    }

    function cancelPendingEdits() {
      vm.state.pendingChanges = false;
      vm.state.website = vm.state.originalWebsite;
      vm.state.page = vm.state.originalPage;
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
