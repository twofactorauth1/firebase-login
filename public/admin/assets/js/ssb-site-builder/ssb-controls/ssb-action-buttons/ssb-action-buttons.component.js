(function(){

app.directive('ssbActionButtons', ssbActionButtons);

function ssbActionButtons() {

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
            ctrl.init(element);
        }
    };

}

})();
