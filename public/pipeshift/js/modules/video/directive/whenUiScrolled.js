angular.module('app.directives').directive('whenUiScrolled', function () {
    return function (scope, elm, attr) {
        elm.bind("scroll", function (event) {
            if (event.currentTarget.scrollTop > 0.9 * (event.currentTarget.scrollHeight - event.currentTarget.offsetHeight)) {
                scope.$apply(attr.whenUiScrolled);
            }
        });
    };
});
