define(['angularAMD', 'skeuocard', 'stripeService', 'userService'], function (angularAMD) {
    angularAMD.directive('indigewebSkeuocard', ['StripeService', function (StripeService, UserService) {
            return {
                require: [],
                restrict: 'C',
                transclude: true,
                scope: {
					user: '=user'
                },
                templateUrl: '/angular_admin/views/partials/_skeocard.html',
                link: function (scope, element, attrs, controllers) {
                    scope.card = new Skeuocard($("#skeuocard"));
                	
                    scope.addCardFn = function () {
                    	var cardInput = {
                    		number: $('#cc_number').val(), 
                    		cvc: $('#cc_cvc').val(),
  			   				exp_month: $('#cc_exp_month').val(),
  							exp_year: $('#cc_exp_year').val()
						};
						
                		StripeService.getStripeCardToken(cardInput, function (token) {
                			StripeService.postStripeCustomer(token, scope.user, function (stripeUser) {
                				console.log(stripeUser);
                			});
                		});
                    };
                }
            };
    }]);
});
