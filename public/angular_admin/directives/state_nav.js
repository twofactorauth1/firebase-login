define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('indigewebStateNav', ['$state', function ($state) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    //TODO: iterate over attrs to pick other type of attributes.
                    element.click(function () {
                        if (attrs.indigewebStateId) {
                            $state.go(attrs.indigewebStateNav, {id: attrs.indigewebStateId});
                        } else {
                            $state.go(attrs.indigewebStateNav);
                        }
                    });
                }
            };
    }]);
});
