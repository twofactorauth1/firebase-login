(function(){

app.directive('emailSidebar', emailSidebar);

function emailSidebar() {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            uiState: '='
        },
        templateUrl: 'assets/js/indi-email-builder/email-controls/email-sidebar/email-sidebar.component.html',
        controller: 'EmailBuilderSidebarController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
