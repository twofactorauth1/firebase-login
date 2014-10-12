define([
    'angularAMD',
    'bootstrap-confirmation'
], function (angularAMD) {
    angularAMD.directive('confirmClick2', function () {
        return {
            restrict: 'A',
            scope: {
                confirm: "&",
                cancel: "&"
            },
            link: function (scope, element) {
                $(element).confirmation({
                    onConfirm: function() {
                        scope.confirm && scope.confirm();
                    },
                    onCancel: function() {
                        scope.cancel && scope.cancel();
                    }
                });
            }
        };
    });
});