define(['angularAMD', 'skeuocard', 'stripeService'], function (angularAMD) {
    angularAMD.directive('indigewebSkeuocard', ['StripeService', function (StripeService) {
            return {
                require: [],
                restrict: 'C',
                transclude: true,
                scope: {

                },
                templateUrl: '/angular_admin/views/partials/_skeocard.html',
                link: function (scope, element, attrs, controllers) {
                	StripeService.getStripeCardToken();
                    card = new Skeuocard($("#skeuocard"));
                }
            };
    }]);
});
