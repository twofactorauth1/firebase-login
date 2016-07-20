(function(){

app.directive('emailTopbar', emailTopbar);

function emailTopbar() {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            uiState: '='
        },
        templateUrl: 'assets/js/indi-email-builder/email-controls/email-topbar/email-topbar.component.html',
        controller: 'EmailBuilderTopbarController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
