define([
    "angularAMD",
    "bootstrap-confirmation"
], function (angularAMD) {
    angularAMD.directive("confirmClick2", function () {
        return {
            restrict: "A",
            scope: {
                confirmClick2Confirm: "&",
                confirmClick2Cancel: "&"
            },
            link: function (scope, element) {
                $(element).confirmation({
                    onConfirm: function() {
                        scope.confirmClick2Confirm && scope.confirmClick2Confirm();
                    },
                    onCancel: function() {
                        scope.confirmClick2Cancel && scope.confirmClick2Cancel();
                    }
                }).off("show");
            }
        };
    });
});