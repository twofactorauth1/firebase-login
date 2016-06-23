(function () {

    app.directive('indiEmailBuilder', indiEmailBuilder);

    function indiEmailBuilder() {

        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'assets/js/indi-email-builder/indi-email-builder.component.html',
            controller: 'EmailBuilderController',
            controllerAs: 'vm',
            bindToController: true,
            link: function (scope, element, attrs, ctrl) {
                ctrl.init(element);
            }
        };

    }

})();