define(['angularAMD', 'skeuocard', 'paymentService', 'userService'], function(angularAMD) {
    angularAMD.directive('indigewebSkeuocard', ['PaymentService', 'UserService',
        function(PaymentService, UserService) {
            return {
                require: [],
                restrict: 'C',
                transclude: false,
                scope: {
                    user: '=user',
                    updateFn: '=update',
                    autoClose: '=autoClose',
                    wrapper: '=wrapperDiv'
                },
                templateUrl: '/angular_admin/views/partials/_skeocard.html',
                link: function(scope, element, attrs, controllers) {
                    UserService.getUser(function(user) {
                        scope.user = user;
                    });
                    scope.$watch('user', function(newValue, oldValue) {
                        if (newValue) {
                            PaymentService.getCustomerCards(newValue.stripeId, function(cards) {
                                scope.cards = cards;
                                if (scope.cards.data.length) {
                                    element.find('form').card({
                                        container: '.' + scope.wrapper,
                                        values: {
                                            number: "4XXXXXXXXXXX" + scope.cards.data[0].last4,
                                            expiry: scope.cards.data[0].exp_month + '/' + scope.cards.data[0].exp_year
                                        }
                                    });
                                } else {
                                    element.find('form').card({
                                        container: '.' + scope.wrapper
                                    });
                                }
                            }, function(data) {
                                element.find('form').card({
                                    container: '.' + scope.wrapper
                                });

                            });
                        }
                    });

                    scope.addCardFn = function() {
                        var expiry = $('#expiry').val().split("/")
                        var exp_month = expiry[0].trim();
                        var exp_year = "";
                        if (expiry.length > 1)
                            exp_year = expiry[1].trim();
                        $('#expiry').val().split("/")[0].trim()
                        var cardInput = {
                            number: $('#number').val(),
                            cvc: $('#cvc').val(),
                            exp_month: exp_month,
                            exp_year: exp_year
                        };
                        PaymentService.getStripeCardToken(cardInput, function(token) {
                            //scope.card.flip();
                            if (scope.user.stripeId) {
                                UserService.postAccountBilling(scope.user.stripeId, token, function(billing) {
                                    scope.updateFn(billing);
                                });
                                scope.cards.data.forEach(function(value, index) {
                                    PaymentService.deleteCustomerCard(value.customer, value.id, false, function(card) {});
                                });
                                PaymentService.putCustomerCard(scope.user.stripeId, token, function(card) {});
                            } else {
                                if (token !== undefined) {
                                    PaymentService.postStripeCustomer(token, function(stripeUser) {
                                        scope.user.stripeId = stripeUser.id;
                                        UserService.postAccountBilling(stripeUser.id, token, function(billing) {
                                            scope.updateFn(billing);
                                        });
                                        PaymentService.putCustomerCard(stripeUser.id, token, function(card) {});
                                    });
                                }
                            }
                        });
                    };
                }
            };
        }
    ]);
});
