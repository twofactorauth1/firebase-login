define([
    "angularAMD",
    "bootstrap-confirmation"
], function (angularAMD) {
    angularAMD.directive("confirmClick2", ['$state', function ($state) {
        return {
            restrict: "A",
            scope: {
                confirmClick2Confirm: "&",
                confirmClick2Cancel: "&",
                confirmClick2Href: '@'
            },
            link: function (scope, element) {
                var href= '#/';

                if (scope.confirmClick2Href !== undefined) {
                    if (scope.confirmClick2Href == "#") 
                        href = scope.confirmClick2Href;
                    else
                        href += scope.confirmClick2Href;
                } else {
                    href += $state.current.name;
                }

                $(element).confirmation({
                  placement: 'top',
                    onConfirm: function() {
                        scope.confirmClick2Confirm && scope.confirmClick2Confirm();
                    },
                    onCancel: function() {
                        scope.confirmClick2Cancel && scope.confirmClick2Cancel();
                    },
                    href: href
                }).off("show");
            }
        };
    }]);
});
