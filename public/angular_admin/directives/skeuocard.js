define(['angularAMD', 'skeuocard', 'paymentService', 'userService'], function (angularAMD) {
    angularAMD.directive('indigewebSkeuocard', ['PaymentService', 'UserService', function (PaymentService, UserService) {
            return {
                require: [],
                restrict: 'C',
                transclude: false,
                scope: {
					user: '=user',
                    updateFn: '=update'
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

                		PaymentService.getStripeCardToken(cardInput, function (token) {
                			PaymentService.postStripeCustomer(token, function (stripeUser) {
                				UserService.postAccountBilling(stripeUser.id, token, function (billing) {
                                    scope.updateFn(billing);
                					console.info('Bill: ' + billing._id + ' updated with token: ' + token + ' and stripe customer ID: ' + stripeUser.id);
                				});
                			});
                		});
                    };
                }
            };
    }]);
});
