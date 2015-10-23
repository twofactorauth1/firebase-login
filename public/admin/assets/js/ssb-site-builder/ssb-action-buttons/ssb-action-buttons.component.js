(function(){

app.directive('ssbActionButtons', ssbActionButtons);

function ssbActionButtons() {

    return {
        scope: {
            page: '=',
            saveAction: '&',
            cancelAction: '&'
        },
        templateUrl: 'assets/js/ssb-site-builder/ssb-action-buttons/ssb-action-buttons.component.html',
        controller: 'SiteBuilderActionButtonsController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();