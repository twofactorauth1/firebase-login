define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('indigewebStateNav', ['$state', function ($state) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    //TODO: iterate over attrs to pick other type of attributes.
                    element.click(function () {
                        if (attrs.stateId) {
                            $state.go(attrs.stateNav, {id: attrs.stateId});
                        } else {
                            $state.go(attrs.stateNav);
                        }
                    });
                }
            };
    }]);
});
