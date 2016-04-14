(function(){

app.directive('ssbActionButtons', ssbActionButtons);

function ssbActionButtons(SimpleSiteBuilderService) {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            saveAction: '&',
            cancelAction: '&',
            revertAction: '&',
            publishAction: '&'
        },
        templateUrl: 'assets/js/ssb-site-builder/ssb-controls/ssb-action-buttons/ssb-action-buttons.component.html',
        controller: 'SiteBuilderActionButtonsController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            scope.pageVersions = [];
            scope.hideHistoryTT = false;

            scope.historyDropdownFn = function (open) {
                scope.hideHistoryTT = open;
                if (open) {
                    $('.tooltip').hide();
                    SimpleSiteBuilderService.getPageVersions(scope.vm.state.page._id, function (data) {
                        scope.pageVersions = data;
                    });
                } else {
                    scope.pageVersions = [];
                    $('.tooltip').show();
                }
            };

            ctrl.init(element);
        }
    };

}

})();
