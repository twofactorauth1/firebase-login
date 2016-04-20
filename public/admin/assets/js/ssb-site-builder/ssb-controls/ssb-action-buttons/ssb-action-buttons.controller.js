(function(){

app.controller('SiteBuilderActionButtonsController', ssbSiteBuilderActionButtonsController);

ssbSiteBuilderActionButtonsController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$timeout'];
/* @ngInject */
function ssbSiteBuilderActionButtonsController($scope, $attrs, $filter, SimpleSiteBuilderService, $timeout) {

    console.info('site-build sidebar directive init...')

    var vm = this;

    vm.pageVersions = [];
    vm.hideHistoryTT = false;
    vm.spinTimeoutPromise = null;

    vm.init = init;
    vm.save = save;
    vm.cancel = cancel;
    vm.revert = revert;
    vm.publish = publish;
    vm.historyDropdownFn = historyDropdownFn;

    $scope.$watch(vm.state, function(newValue, oldValue) {
        if (angular.isDefined(vm.state.page.published)) {
            if (vm.state.page.published.date < vm.state.page.modified.date) {
                if (vm.spinTimeoutPromise) {
                    $timeout.cancel(vm.spinTimeoutPromise);
                }
                vm.spinTimeoutPromise = $timeout(function () {
                    $('.fa.fa-globe.fa-spin').removeClass('fa-spin');
                }, 10000);
            }
        }
    }, true);

    function save() {
    	vm.saveAction();
    }

    function cancel() {
    	vm.cancelAction();
    }

    function revert(versionId) {
        vm.revertAction({versionId: versionId});
    }

    function publish() {
        vm.publishAction();
    }

    function init(element) {
    	vm.element = element;
    }

    function historyDropdownFn (open) {
        vm.hideHistoryTT = open;
        if (open) {
            $('.tooltip').hide();
            SimpleSiteBuilderService.getPageVersions(vm.state.page._id, function (data) {
                vm.pageVersions = data;
            });
        } else {
            vm.pageVersions = [];
            $('.tooltip').show();
        }
    };

}

})();
