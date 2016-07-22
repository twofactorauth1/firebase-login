(function () {

app.directive('emailEditControl', emailEditControl);

function emailEditControl() {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            uiState: '=',
            sectionIndex: '=',
            component: '=',
            componentIndex: '=?',
            compiledControlId: '@?'
        },
        templateUrl: '/admin/assets/js/indi-email-builder/email-controls/email-edit-control/email-edit-control.component.html',
        controller: 'EmailBuilderEditControlController',
        controllerAs: 'vm',
        bindToController: true,
        link: function (scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };
}

})();
