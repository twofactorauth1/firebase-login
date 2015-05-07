app.directive("confirmClick", function ($state) {
        return {
            restrict: "A",
            scope: {
                confirmClickConfirm: "&",
                confirmClickCancel: "&",
                confirmClickHref: '@',
                confirmClickBtnOkLabel: '='
            },
            link: function (scope, element) {
                var href= '#/';

                if (scope.confirmClickHref !== undefined) {
                    if (scope.confirmClickHref == "#")
                        href = scope.confirmClickHref;
                    else
                        href += scope.confirmClickHref;
                } else {
                    href += $state.current.name;
                }

                $(element).confirmation({
                  placement: 'top',
                  btnOkLabel: scope.confirmClickBtnOkLabel,
                    onConfirm: function() {
                        scope.confirmClickConfirm && scope.confirmClickConfirm();
                    },
                    onCancel: function() {
                        scope.confirmClickCancel && scope.confirmClickCancel();
                    },
                    href: href
                }).off("show");
            }
        };
    });