(function(){

app.directive('ssbActionButtons', ssbActionButtons);

function ssbActionButtons(SimpleSiteBuilderService) {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            saveAction: '&',
            cancelAction: '&',
            revertAction: '&'
        },
        templateUrl: 'assets/js/ssb-site-builder/ssb-controls/ssb-action-buttons/ssb-action-buttons.component.html',
        controller: 'SiteBuilderActionButtonsController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            scope.pageVersions = [];
            scope.historyDropdownFn = function (open) {
                if (open) {
                    SimpleSiteBuilderService.getPageVersions(scope.vm.state.page._id, function (data) {
                        scope.pageVersions = data;
                    });
                } else {
                    scope.pageVersions = [];
                }
            };
            ctrl.init(element);
        }
    };

}

})();
