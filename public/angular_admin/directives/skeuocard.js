define(['angularAMD', 'skeuocard'], function (angularAMD) {
    angularAMD.directive('indigewebSkeuocard', function () {
            return {
                require: [],
                restrict: 'C',
                transclude: true,
                scope: {

                },
                templateUrl: '/angular_admin/views/partials/_skeocard.html',
                link: function (scope, element, attrs, controllers) {
                    card = new Skeuocard($("#skeuocard"));
                }
            };
    });
});
