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
                        if (newValue && newValue.stripeId) {
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
                        } else {
                            element.find('form').card({
                                container: '.' + scope.wrapper
                            });
                        }
                    });

                    scope.checkCardNumber = function() {
                      var card_number = $('#number').val();
                      console.log('checking to see if the card numer exists ', card_number);
                      if (!card_number) {
                        $("#card_number .error").html("Card Number Required");
                        $("#card_number").addClass('has-error');
                      } else if (card_number.length > 16){
                        $("#card_number .error").html("");
                        $("#card_number").removeClass('has-error').addClass('has-success');
                      }
                        scope.cardValidated = true;
                    };

                    scope.checkCardName = function() {
                      var name = $('#card_name #name').val();
                      if (!name) {
                        $("#card_name .error").html("Card Name Required");
                        $("#card_name").addClass('has-error');
                      } else {
                        $("#card_name .error").html("");
                        $("#card_name").removeClass('has-error').addClass('has-success');
                      }
                      scope.cardNameValidated = true;
                    };

                    scope.currentYear = new Date().getFullYear().toString();
                    scope.currentMonth = new Date().getMonth() + 1;

                    scope.checkCardExpiry = function() {
                      var expiry = $('#expiry').val();
                      var card_expiry = expiry.split("/")
                      var exp_month = card_expiry[0].trim();
                      var exp_year;
                      if (card_expiry.length > 1)
                        exp_year = card_expiry[1].trim();

                      console.log('checking to see if the card expiry details exists ', card_expiry);
                      var valid = false;
                      if (!expiry || !exp_month || !exp_year) {
                        if (!expiry)
                          $("#card_expiry .error").html("Expiry Required");
                        else if (!exp_month)
                          $("#card_expiry .error").html("Expiry Month Required");
                        else if (!exp_year)
                          $("#card_expiry .error").html("Expiry Year Required");
                        $("#card_expiry").addClass('has-error');
                      } else {
                        console.log('year ', parseInt(exp_year));
                        if (parseInt(exp_year) < parseInt(scope.currentYear)) {
                            $("#card_expiry .error").html("Card Year has Expired");
                            $("#card_expiry").addClass('has-error');
                        } else if  (exp_month <= scope.currentMonth && exp_year >= scope.currentYear) {
                            $("#card_expiry .error").html("Card Month has Expired");
                            $("#card_expiry").addClass('has-error');
                        } else {
                             scope.expirationValidated = true;
                            $("#card_expiry .error").html("");
                            $("#card_expiry").removeClass('has-error').addClass('has-success');
                        }
                      }
                    };

                    scope.checkCardCvv = function() {

                      var card_cvc = $('#cvc').val();
                      console.log('checking to see if the card cvc exists ', card_cvc);

                      if (!card_cvc) {
                        $("#card_cvc .error").html("CVC Required");
                        $("#card_cvc").addClass('has-error');
                      } else {
                        scope.cvvValidated = true;
                        $("#card_cvc .error").html("");
                        $("#card_cvc").removeClass('has-error').addClass('has-success');
                      }
                    };

                    // scope.checkCouponCode = function() {

                    //   var couponCode = $('#coupon').val();
                    //   console.log('checking to see if coupon code is valid ', couponCode);

                    //   if (!couponCode) {
                    //     $("#coupon_code .error").html("CVC Required");
                    //     $("#coupon_code").addClass('has-error');
                    //   } else {
                    //     scope.cvvValidated = true;
                    //     $("#coupon_code .error").html("");
                    //     $("#coupon_code").removeClass('has-error').addClass('has-success');
                    //   }
                    // };

                    scope.addCardFn = function() {
                        console.log('addCardFn >>>');
                        scope.cardValidated = scope.expirationValidated = scope.cvvValidated = scope.cardNameValidated = false;
                        scope.checkCardCvv();
                        scope.checkCardExpiry();
                        scope.checkCardName();
                        scope.checkCardNumber();
                        if (scope.cardValidated && scope.expirationValidated && scope.cvvValidated && scope.cardNameValidated) {
                            $('#changeCardModal').modal('hide');

                            var parent_div = $("." + scope.wrapper).next();
                            if(parent_div.length && parent_div.attr("wrapper-div"))
                            {
                                var expiry = parent_div.find('#expiry').val().split("/")
                                var exp_month = expiry[0].trim();
                                var exp_year = "";
                                if (expiry.length > 1)
                                    exp_year = expiry[1].trim();
                                parent_div.find('#expiry').val().split("/")[0].trim()
                                var cardInput = {
                                    number: parent_div.find('#number').val(),
                                    cvc: parent_div.find('#cvc').val(),
                                    exp_month: exp_month,
                                    exp_year: exp_year
                                };
                            }
                            else
                            {
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
                            }

                            PaymentService.getStripeCardToken(cardInput, function(token) {

                                if (scope.user.stripeId) {
                                    UserService.postAccountBilling(scope.user.stripeId, token, function(billing) {
                                        scope.updateFn(billing);
                                    });
                                    scope.cards.data.forEach(function(value, index) {
                                        PaymentService.deleteCustomerCard(value.customer, value.id, false, function(card) {});
                                    });

                                } else {
                                    if (token !== undefined) {
                                        PaymentService.postStripeCustomer(token, function(stripeUser) {
                                            scope.user.stripeId = stripeUser.id;
                                            UserService.postAccountBilling(stripeUser.id, token, function(billing) {
                                                scope.updateFn(billing);
                                            });

                                        });
                                    }
                                }
                            });
                        }
                    };
                }
            };
        }
    ]);
});
