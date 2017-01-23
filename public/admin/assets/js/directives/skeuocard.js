'use strict';

app.directive('indigewebSkeuocard',['PaymentService', 'UserService', 'ToasterService', 'formValidations', '$timeout', function(PaymentService, UserService, ToasterService, formValidations, $timeout) {
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
            templateUrl: '/admin/assets/views/partials/_skeuocard.html',
            link: function(scope, element, attrs, controllers) {
                scope.saveLoading = false;
                UserService.getAccount(function(account){
                    scope.account = account;
                });
                scope.$watch('account', function(newValue, oldValue){
                    var renderedcardFlag=0;
                    if (newValue && newValue.billing.stripeCustomerId) {
                        console.log('about to call getCustomerCards', scope.account);
                        PaymentService.getCustomerCards(newValue.billing.stripeCustomerId, function(cards) {
                            scope.cards = cards;
                            if (scope.cards.data.length) {
                                scope.defaultCardValue = "XXXX-XXXX-XXXX-" + scope.cards.data[0].last4;
                                scope.defaultExpiry = scope.cards.data[0].exp_month + '/' + (scope.cards.data[0].exp_year - 2000);
                                element.find('form').card({
                                    container: '.' + scope.wrapper,
                                    values: {
                                        number: "4XXXXXXXXXXX" + scope.cards.data[0].last4,
                                        expiry: scope.cards.data[0].exp_month + '/' + scope.cards.data[0].exp_year
                                    }
                                });
                            } else {
                                if(renderedcardFlag != 0)
                                {
                                    element.find('form').card({
                                        container: '.' + scope.wrapper
                                    });
                                }
                            }
                        }, function(data) {
                            /*element.find('form').card({
                             container: '.' + scope.wrapper
                             });*/

                        });
                    } else {
                        if(renderedcardFlag == 0)
                        {
                            element.find('form').card({
                                container: '.' + scope.wrapper
                            });
                        }
                    }
                });


                scope.checkCardNumber = function() {
                    var card_number = $('#number').val();
                    console.log('checking to see if the card numer exists ', card_number);
                    if (!card_number) {
                        $("#card_number .error").html("Card Number Required");
                        $("#card_number").addClass('has-error');
                        $("#card_number .glyphicon").addClass('glyphicon-remove');
                    } else if (card_number.length < 16) {
                      $("#card_number .error").html("Card Number Invalid");
                      $("#card_number").addClass('has-error');
                      $("#card_number .glyphicon").addClass('glyphicon-remove');
                    } else if (card_number.length >= 16) {
                        $("#card_number .error").html("");
                        $("#card_number").removeClass('has-error').addClass('has-success');
                        $("#card_number .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                    }
                    scope.cardValidated = true;
                };

                scope.checkCardName = function() {
                     var name = $('#card_name #name').val();
                     if (!name) {
                         $("#card_name .error").html("Card Name Required");
                         $("#card_name").addClass('has-error');
                         $("#card_name .glyphicon").addClass('glyphicon-remove');
                         scope.cardNameValidated = false;
                     } else {
                         $("#card_name .error").html("");
                         $("#card_name").removeClass('has-error').addClass('has-success');
                         $("#card_name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                         scope.cardNameValidated = true;
                     }

                };

                scope.checkCardPostcode = function () {
                    var zipcode = $('#address_zip').val();
                    if (!zipcode) {
                        $("#card_postcode .error").html("Postcode Required");
                        $("#card_postcode").addClass('has-error');
                        $("#card_postcode .glyphicon").addClass('glyphicon-remove');
                        scope.cardPostcodeValidated = false;
                    } else {
                        if (formValidations.zip.test(zipcode)) {
                            $("#card_postcode .error").html("");
                            $("#card_postcode").removeClass('has-error').addClass('has-success');
                            $("#card_postcode .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                            scope.cardPostcodeValidated = true;
                        } else {
                            $("#card_postcode .error").html("Invalid postcode");
                            $("#card_postcode").addClass('has-error');
                            $("#card_postcode .glyphicon").addClass('glyphicon-remove');
                            scope.cardPostcodeValidated = false;
                        }
                    }
                };

                scope.currentYear = new Date().getYear() - 100;
                scope.fullCurrentYear = new Date().getFullYear();
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
                        $("#card_expiry .glyphicon").addClass('glyphicon-remove');
                    } else {
                        console.log('year ', parseInt(exp_year));
                        scope.yearLength = exp_year.length;
                        if(scope.yearLength == 2)
                        {
                            if (parseInt(exp_year) < parseInt(scope.currentYear)) {
                                $("#card_expiry .error").html("Card Year has Expired");
                                $("#card_expiry").addClass('has-error');
                                $("#card_expiry .glyphicon").addClass('glyphicon-remove');
                                return;
                            }

                        }
                        else if(scope.yearLength == 4)
                        {
                            if(parseInt(exp_year) < parseInt(scope.fullCurrentYear)){
                            $("#card_expiry .error").html("Card Year has Expired");
                                $("#card_expiry").addClass('has-error');
                                $("#card_expiry .glyphicon").addClass('glyphicon-remove');
                                return;
                            }
                        }
                         if (exp_month < scope.currentMonth && parseInt(exp_year) <= scope.currentYear) {
                            $("#card_expiry .error").html("Card Month has Expired");
                            $("#card_expiry").addClass('has-error');
                            $("#card_expiry .glyphicon").addClass('glyphicon-remove');
                        }
                        else if(exp_month > 12) {
                            $("#card_expiry .error").html("Card Month is invalid");
                            $("#card_expiry").addClass('has-error');
                            $("#card_expiry .glyphicon").addClass('glyphicon-remove');
                        }
                        else {
                            scope.expirationValidated = true;
                            $("#card_expiry .error").html("");
                            $("#card_expiry").removeClass('has-error').addClass('has-success');
                            $("#card_expiry .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                        }
                    }
                };

                scope.checkCardCvv = function() {

                    var card_cvc = $('#cvc').val();
                    console.log('checking to see if the card cvc exists ', card_cvc);

                    if (!card_cvc) {
                        $("#card_cvc .error").html("CVC Required");
                        $("#card_cvc").addClass('has-error');
                        $("#card_cvc .glyphicon").addClass('glyphicon-remove');
                    } else {
                        scope.cvvValidated = true;
                        $("#card_cvc .error").html("");
                        $("#card_cvc").removeClass('has-error').addClass('has-success');
                        $("#card_cvc .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
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
                    scope.cardValidated = scope.expirationValidated = scope.cvvValidated = scope.cardNameValidated = scope.cardPostcodeValidated = false;
                    scope.checkCardCvv();
                    scope.checkCardExpiry();
                    scope.checkCardName();
                    scope.checkCardNumber();
                    scope.checkCardPostcode();
                    if (scope.cardValidated && scope.expirationValidated && scope.cvvValidated && scope.cardNameValidated && scope.cardPostcodeValidated) {
                        scope.saveLoading = true;

                        var parent_div = $("." + scope.wrapper).next();
                        if (parent_div.length && parent_div.attr("wrapper-div")) {
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
                                exp_year: exp_year,
                                name : parent_div.find('#name').val(),
                                address_zip: parent_div.find('#address_zip').val()
                            };
                        } else {
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
                                exp_year: exp_year,
                                name : $('#card_name #name').val(),
                                address_zip: $('#address_zip').val()
                            };
                        }

                        PaymentService.getStripeCardToken(cardInput, function(token) {
                            if(scope.$parent.closeModal && token)
                                scope.$parent.closeModal();
                            if (scope.account && scope.account.billing.stripeCustomerId) {
                                UserService.postAccountBilling(scope.account.billing.stripeCustomerId, token, function(billing) {
                                    scope.updateFn(billing);
                                    scope.saveLoading = false;
                                },
                                function(err){
                                    //ToasterService.clearAll();
                                    ToasterService.show('error', 'The purchase was unsuccessful. Please check your card information.');
                                    //Closing the previous opened
                                    scope.$parent.closeModal();
                                    $timeout(function() {
                                      scope.$parent.openModal('change-card-modal');
                                    }, 500);
                                    scope.saveLoading = false;
                                });
                                if(scope.cards && scope.cards.data){
                                    scope.cards.data.forEach(function(value, index) {
                                        PaymentService.deleteCustomerCard(value.customer, value.id, false, function(card) {});
                                        scope.saveLoading = false;
                                    });
                                }                                

                            } else {
                                if (token !== undefined) {
                                    PaymentService.postStripeCustomer(token, function(stripeUser) {
                                        if (scope.account)
                                            scope.account.billing.stripeCustomerId = stripeUser.id;
                                        UserService.postAccountBilling(stripeUser.id, token, function(billing) {
                                            scope.updateFn(billing);
                                            scope.saveLoading = false;
                                        });

                                    });
                                }
                                else{
                                    scope.saveLoading = false;
                                }
                            }
                        });
                    }
                };
            }
        }
}]);
