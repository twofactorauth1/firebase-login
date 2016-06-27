(function () {

    app.directive('emailComponentLoader', emailComponentLoader);

    emailComponentLoader.$inject = ['$compile', '$timeout'];
    /* @ngInject */
    function emailComponentLoader($compile, $timeout) {
        return {
            restrict: 'E',
            controller: 'EmailBuilderComponentLoaderController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {
                component: "=",
                website: "=",
                account: '=',
                componentClass: '&',
                componentStyle: '&',
                componentIndex: '='
            },
            replace: true,
            link: function (scope, element, attrs, ctrl) {
                console.log(scope);
                var newEl;
                var template = '<div ' + ctrl.component.type + '-email-component ' +
                        'id="email-component_' + ctrl.component._id + '" ' +
                        'component="vm.component" ' +
                        'website="vm.website" ' +
                        'account="vm.account" ' +
                        'class="email-component email-{{vm.component.type}} {{vm.componentClass(vm.component)}}" ' +
                        'ng-attr-style="{{vm.componentStyle(vm.component)}}" ' +
                        'ng-mouseenter="vm.hover($event);" ' +
                        'component-index="vm.componentIndex">' +
                        '</div>';

                var compiled = $compile(template)(scope);
                element.replaceWith(compiled);

                $timeout(function () {
                    newEl = angular.element('#email-component_' + ctrl.component._id);
                    ctrl.init(newEl);
                });

            }
        }

    }

})();
