/*global app, Fingerprint*/
app.directive('paymentFormComponent', ['$filter', '$q', 'productService', 'paymentService', 'userService', 'commonService', 'ipCookie', 'formValidations', '$location', function($filter, $q, ProductService, PaymentService, UserService, CommonService, ipCookie, formValidations, $location) {
    return {
        require: [],
        scope: {
            component: '='
        },
        templateUrl: '/components/component-wrap.html',
        link: function(scope, element, attrs, ctrl) {
            scope.newAccount = {};

            UserService.getTmpAccount(function(data) {
                scope.tmpAccount = data;
                var tmpAccount = data;
                scope.newAccount.hidePassword = false;
                if (tmpAccount.tempUser) {
                    if (tmpAccount.tempUser.email) {
                        scope.newAccount.email = tmpAccount.tempUser.email;
                        scope.newAccount.tempUserId = tmpAccount.tempUser._id;
                        scope.newAccount.hidePassword = true;
                    }
                    //if it is a twitter account, we need the email still but not a password
                    if (tmpAccount.tempUser.credentials[0].type === 'tw') {
                        scope.newAccount.hidePassword = true;
                    }
                    if (tmpAccount.tempUser.businessName) {
                        scope.newAccount.businessName = tmpAccount.tempUser.businessName;
                    }
                    if (tmpAccount.tempUser.profilePhotos && tmpAccount.tempUser.profilePhotos.length) {
                        scope.newAccount.profilePhoto = tmpAccount.tempUser.profilePhotos[0];
                    }
                } else {
                    UserService.saveOrUpdateTmpAccount(tmpAccount, function(data) {});
                }
            });

            // scope.planStatus = {};
            // scope.emailValidation = formValidations.email;
            // var productId = scope.component.productId;
            // console.log('productId ', productId);
            // ProductService.getProduct(productId, function(product) {
            //     console.log('product ', product);
            //     scope.paymentFormProduct = product;
            //     var promises = [];
            //     scope.subscriptionPlans = [];
            //     var attributes = scope.paymentFormProduct.product_attributes;
            //     if (attributes.hasOwnProperty('stripePlans')) {
            //         scope.paymentFormProduct.product_attributes.stripePlans.forEach(function(value) {
            //             if (value.active) {
            //                 scope.planStatus[value.id] = value;
            //             }
            //             promises.push(PaymentService.getPlanPromise(value.id));
            //         });
            //         $q.all(promises)
            //             .then(function(data) {
            //                 data.forEach(function(value) {
            //                     scope.subscriptionPlans.push(value.data);
            //                     if (scope.subscriptionPlans.length === 1) {
            //                         var plan = scope.subscriptionPlans[0];
            //                         scope.selectSubscriptionPlanFn(plan.id, plan.amount, plan.interval, scope.planStatus[plan.id].signup_fee);
            //                     }
            //                 });
            //             })
            //             .catch(function(err) {
            //                 console.error(err);
            //             });
            //     }
            // });

            scope.isAdmin = function() {
                return scope.isAdmin;
            };
            // scope.selectSubscriptionPlanFn = function(planId, amount, interval, cost) {
            //     scope.newAccount.membership = planId;
            //     scope.subscriptionPlanAmount = amount;
            //     scope.subscriptionPlanInterval = interval;
            //     scope.subscriptionPlanOneTimeFee = parseInt(cost, 10);
            // };
            // scope.monthly_sub_cost = 49.95;
            // scope.yearly_sub_cost = 32.91;
            // scope.selected_sub_cost = scope.monthly_sub_cost;


            scope.removeAccount = function(type) {
                scope.newAccount.businessName = null;
                scope.newAccount.profilePhoto = null;
                scope.newAccount.tempUserId = null;
                scope.newAccount.email = null;
                scope.tmpAccount.tempUser = null;
                scope.newAccount.hidePassword = false;
            };

            scope.makeSocailAccount = function(socialType) {
                if (socialType) {
                    var _url = "/signup/" + socialType + "?redirectTo=/signup";
                    console.log('scope.newAccount ', JSON.stringify(scope.newAccount));
                    if (scope.newAccount.coupon) {
                        _url = _url + "?coupon=" + scope.poulateCoupon;
                    }
                    console.log('_url >>> ', _url);
                    window.location.href = _url;
                    return;
                }
            };

            scope.showFooter = function(status) {
                if (status) {
                    angular.element("#footer").show();
                } else {
                    angular.element("#footer").hide();
                }
            };

            scope.createAccount = function(newAccount) {
                //validate
                //email
                scope.isFormValid = false;
                scope.showFooter(true);
                if (!scope.newAccount.email) {
                    scope.checkEmailExists(newAccount);
                    return;
                }

                //pass
                if (!scope.newAccount.password && !scope.newAccount.tempUserId && !scope.newAccount.hidePassword) {
                    scope.checkPasswordLength(newAccount);
                    return;
                }

                //url
                if (!scope.newAccount.businessName) {
                    scope.checkDomainExists(newAccount);
                    return;
                }

                //membership selection
                // if (!scope.newAccount.membership) {
                //     scope.checkMembership(newAccount);
                //     return;
                // }

                //credit card

                // newAccount.card = {
                //     number: angular.element('#number').val(),
                //     cvc: angular.element('#cvc').val(),
                //     exp_month: parseInt(angular.element('#expiry').val().split('/')[0]),
                //     exp_year: parseInt(angular.element('#expiry').val().split('/')[1])
                // };

                // var cc_name = angular.element('#name').val();

                // if (!newAccount.card.number || !newAccount.card.cvc || !newAccount.card.exp_month || !newAccount.card.exp_year) {
                //     //|| !cc_name
                //     //hightlight card in red
                //     scope.checkCardNumber();
                //     scope.checkCardExpiry();
                //     scope.checkCardCvv();
                //     return;
                // }
                // scope.checkCoupon();
                // if (!scope.couponIsValid) {
                //     return;
                // }
                //end validate
                scope.isFormValid = true;
                scope.showFooter(false);
                var tmpAccount = scope.tmpAccount;
                tmpAccount.subdomain = $.trim(newAccount.businessName).replace(" ", "").replace(".", "_").replace("@", "");
                tmpAccount.business = tmpAccount.business || {};
                tmpAccount.business.name = newAccount.businessName;
                UserService.saveOrUpdateTmpAccount(tmpAccount, function(data) {
                    var newUser = {
                        username: newAccount.email,
                        password: newAccount.password,
                        email: newAccount.email,
                        accountToken: data.token,
                        coupon: newAccount.coupon
                    };
                    //get the token
                    // PaymentService.getStripeCardToken(newAccount.card, function(token, error) {
                    //     if (error) {
                    //         console.info(error);
                    //         scope.$apply(function() {
                    //             scope.isFormValid = false;
                    //             scope.showFooter(true);
                    //         })
                    //         switch (error.param) {
                    //             case "number":
                    //                 angular.element("#card_number .error").html(error.message);
                    //                 angular.element("#card_number").addClass('has-error');
                    //                 angular.element("#card_number .glyphicon").addClass('glyphicon-remove');
                    //                 break;
                    //             case "exp_year":
                    //                 angular.element("#card_expiry .error").html(error.message);
                    //                 angular.element("#card_expiry").addClass('has-error');
                    //                 angular.element("#card_expiry .glyphicon").addClass('glyphicon-remove');
                    //                 break;
                    //             case "cvc":
                    //                 angular.element("#card_cvc .error").html(error.message);
                    //                 angular.element("#card_cvc").addClass('has-error');
                    //                 angular.element("#card_cvc .glyphicon").addClass('glyphicon-remove');
                    //                 break;
                    //         }
                    //     } else {
                            // newUser.cardToken = token;
                            // newUser.plan = scope.newAccount.membership;
                            newUser.anonymousId = window.analytics.user().anonymousId();
                            newUser.permanent_cookie = ipCookie("permanent_cookie");
                            newUser.fingerprint = new Fingerprint().get();

                            // if (scope.subscriptionPlanOneTimeFee) {
                            //     newUser.setupFee = scope.subscriptionPlanOneTimeFee * 100;
                            // }


                            UserService.initializeUser(newUser, function(err, data) {
                                if (data && data.accountUrl) {
                                    console.log('$location ', $location);
                                    console.log('data.accountUrl ', data.accountUrl);
                                    //we don't want to record purchases in non-prod environments
                                    if ($location.host() === 'indigenous.io' || $location.host() === 'www.indigenous.io') {
                                        var hash = CryptoJS.HmacSHA256(newUser.email, "vZ7kG_bS_S-jnsNq4M2Vxjsa5mZCxOCJM9nezRUQ");
                                        //send data to intercom
                                        window.intercomSettings = {
                                            name: newUser.username,
                                            email: newUser.email,
                                            user_hash: hash.toString(CryptoJS.enc.Hex),
                                            created_at: Math.floor(Date.now() / 1000),
                                            app_id: "b3st2skm"
                                        };
                                        //send affiliate purchase info
                                        LeadDyno.key = "b2a1f6ba361b15f4ce8ad5c36758de951af61a50";
                                        LeadDyno.recordPurchase(newUser.email, null, function(){
                                            window.location = data.accountUrl;
                                        });

                                        //send facebook tracking info
                                        window._fbq = window._fbq || [];
                                        window._fbq.push(['track', '6032779610613', {'value':'0.00','currency':'USD'}]);
                                    } else {
                                        window.location = data.accountUrl;
                                    }

                                } else {
                                    scope.isFormValid = false;
                                    // if (err.message === 'card_declined') {
                                    //     angular.element("#card_number .error").html('There was an error charging your card.');
                                    //     angular.element("#card_number").addClass('has-error');
                                    //     angular.element("#card_number .glyphicon").addClass('glyphicon-remove');
                                    // }
                                    scope.showFooter(true);
                                }
                            });
                    //     }

                    // });

                });
            };

            scope.createAccountWithoutCC = function(newAccount) {
                //validate
                //email
                scope.isFormValid = false;
                scope.validateForm = true;
                scope.showFooter(true);
                if (!scope.newAccount.email) {
                    scope.checkEmailExists(newAccount);
                    scope.validateForm = false;
                }

                //pass
                if (!scope.newAccount.password && !scope.newAccount.tempUserId && !scope.newAccount.hidePassword) {
                    scope.checkPasswordLength(newAccount);
                    scope.validateForm = false;
                }

                //url
                if (!scope.newAccount.businessName) {
                    console.log('business name does not exist');
                    scope.checkDomainExists(newAccount);
                    scope.validateForm = false;
                }

                if (!scope.newAccount.first) {
                    scope.checkFirstName(newAccount);
                    scope.validateForm = false;
                }

                if (!scope.newAccount.last) {
                    scope.checkLastName(newAccount);
                    scope.validateForm = false;
                }

                if(!scope.newAccount.hidePassword) {
                    scope.checkPasswordLength(newAccount);
                    if(!scope.passwordIsValid) {
                        scope.validateForm = false;
                    }
                }

                if(!scope.validateForm)
                    return;

                //if (!scope.newAccount.phone) {
                //    scope.checkPhone(newAccount);
                //    return;
                //}

                //membership selection
                // if (!scope.newAccount.membership) {
                //     scope.checkMembership(newAccount);
                //     return;
                // }

                var cc_name = angular.element('#name').val();


                scope.checkCoupon();
                if (!scope.couponIsValid) {
                    return;
                }
                //end validate
                scope.isFormValid = true;
                scope.showFooter(false);
                var tmpAccount = scope.tmpAccount;
                tmpAccount.subdomain = $.trim(newAccount.businessName).replace(" ", "").replace(".", "_").replace("@", "");
                tmpAccount.business = tmpAccount.business || {};
                tmpAccount.business.name = newAccount.businessName;

                if(scope.newAccount.phone) {
                    tmpAccount.business.phones = [];
                    tmpAccount.business.phones[0] = {
                        _id: CommonService.generateUniqueAlphaNumericShort(),
                        number: scope.newAccount.phone,
                        default: true
                    };
                }
                UserService.saveOrUpdateTmpAccount(tmpAccount, function(data) {
                    var newUser = {
                        username: newAccount.email,
                        password: newAccount.password,
                        email: newAccount.email,
                        accountToken: data.token,
                        coupon: newAccount.coupon,
                        first: newAccount.first,
                        middle: newAccount.middle,
                        last: newAccount.last
                    };

                    newUser.plan = '';
                    newUser.anonymousId = window.analytics.user().anonymousId();
                    newUser.permanent_cookie = ipCookie("permanent_cookie");
                    newUser.fingerprint = new Fingerprint().get();

                    // Add name
                    var name = $('#card_name #name').val();
                    if(name) {
                        var nameAry = name.split(' ');
                        if(nameAry.length===3) {
                            newUser.first = nameAry[0];
                            newUser.middle = nameAry[1];
                            newUser.last = nameAry[2];
                        } else if(nameAry.length === 2) {
                            newUser.first = nameAry[0];
                            newUser.last = nameAry[1];
                        } else if(nameAry.length === 1) {
                            newUser.last = nameAry[0];
                        }
                    }
                    UserService.initializeUser(newUser, function(err, data) {
                        if (data && data.accountUrl) {
                            console.log('$location ', $location);
                            if ($location.host() === 'indigenous.io' || $location.host() === 'www.indigenous.io') {
                                var hash = CryptoJS.HmacSHA256(newUser.email, "vZ7kG_bS_S-jnsNq4M2Vxjsa5mZCxOCJM9nezRUQ");
                                //send data to intercom
                                window.intercomSettings = {
                                    name: newUser.username,
                                    email: newUser.email,
                                    user_hash: hash.toString(CryptoJS.enc.Hex),
                                    created_at: Math.floor(Date.now() / 1000),
                                    app_id: "b3st2skm"
                                };
                                //send facebook tracking info
                                window._fbq = window._fbq || [];
                                window._fbq.push(['track', '6032779610613', {'value':'0.00','currency':'USD'}]);

                                console.log('sent facebook message');
                                //send affiliate purchase info
                                var leadData = {
                                    first_name: newAccount.first,
                                    last_name: newAccount.last,
                                    company: newAccount.businessName,
                                    custom_status: 'trialing'
                                };
                                LeadDyno.key = "b2a1f6ba361b15f4ce8ad5c36758de951af61a50";
                                LeadDyno.recordLead(newUser.email, leadData, function(){
                                    console.log('recorded lead');
                                    LeadDyno.recordPurchase(newUser.email, {}, function(){
                                        console.log('recorded purchase');
                                        window.location = data.accountUrl;
                                    });
                                });



                            } else {
                                window.location = data.accountUrl;
                            }

                        } else {
                            scope.isFormValid = false;

                            scope.showFooter(true);
                        }
                    });

                });
            };

            scope.checkDomainExists = function(newAccount) {                
                if (!newAccount.businessName) {
                    scope.validBusinessName = false;
                    angular.element("#business-name .error").html("Business Name Required");
                    angular.element("#business-name").addClass('has-error');
                    angular.element("#business-name .glyphicon").addClass('glyphicon-remove');
                } else {
                    var name = $.trim(newAccount.businessName).replace(" ", "").replace(".", "_").replace("@", "");
                    UserService.checkDomainExists(name, function(data) {
                        if (data !== 'true') {
                            scope.validBusinessName = false;
                            angular.element("#business-name .error").html("Domain Already Exists");
                            angular.element("#business-name").addClass('has-error');
                            angular.element("#business-name .glyphicon").addClass('glyphicon-remove');
                        } else {
                            scope.validBusinessName = true;
                            angular.element("#business-name .error").html("");
                            angular.element("#business-name").removeClass('has-error').addClass('has-success');
                            angular.element("#business-name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                        }
                    });
                }
            };

            scope.checkEmailExists = function(newAccount) {
                scope.newAccount.email = newAccount.email;
                if (!newAccount.email) {
                    angular.element("#email .error").html("Valid Email Required");
                    angular.element("#email").addClass('has-error');
                    angular.element("#email .glyphicon").addClass('glyphicon-remove');
                } else {
                    UserService.checkEmailExists(newAccount.email, function(data) {
                        if (data === 'true') {
                            angular.element("#email .error").html("Email Already Exists");
                            angular.element("#email").addClass('has-error');
                            angular.element("#email .glyphicon").addClass('glyphicon-remove');
                        } else {
                            angular.element("#email .error").html("");
                            angular.element("#email").removeClass('has-error').addClass('has-success');
                            angular.element("#email .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                        }
                    });
                }
            };

            scope.checkFirstName = function(newAccount) {
                scope.newAccount.first = newAccount.first;
                console.log('newAccount.first ', newAccount.first);
                if (!newAccount.first) {
                    angular.element("#first .error").html("First Name Required");
                    angular.element("#first").addClass('has-error');
                    angular.element("#first .glyphicon").addClass('glyphicon-remove');
                } else {
                    angular.element("#first .error").html("");
                    angular.element("#first").removeClass('has-error').addClass('has-success');
                    angular.element("#first .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
            };

            scope.checkLastName = function(newAccount) {
                scope.newAccount.last = newAccount.last;
                if (!newAccount.last) {
                    angular.element("#last .error").html("Last Name Required");
                    angular.element("#last").addClass('has-error');
                    angular.element("#last .glyphicon").addClass('glyphicon-remove');
                } else {
                    angular.element("#last .error").html("");
                    angular.element("#last").removeClass('has-error').addClass('has-success');
                    angular.element("#last .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
            };

            scope.checkPhone = function(newAccount) {
                scope.newAccount.phone = newAccount.phone;
                if (!newAccount.phone) {
                    angular.element("#phone .error").html("Phone Required");
                    angular.element("#phone").addClass('has-error');
                    angular.element("#phone .glyphicon").addClass('glyphicon-remove');
                } else {
                    angular.element("#phone .error").html("");
                    angular.element("#phone").removeClass('has-error').addClass('has-success');
                    angular.element("#phone .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
            };

            scope.checkPasswordLength = function(newAccount) {
                if (!newAccount.password || newAccount.password.length < 6) {
                    //angular.element("#password .error").html("Password must contain at least 6 characters");
                    angular.element("#password").addClass('has-error');
                    angular.element("#password .glyphicon").addClass('glyphicon-remove');
                    scope.passwordIsValid = false;
                } else {
                    angular.element("#password .error").html("");
                    angular.element("#password").removeClass('has-error').addClass('has-success');
                    angular.element("#password .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                    scope.passwordIsValid = true;
                }
            };

            scope.checkMembership = function(newAccount) {
                if (!newAccount.membership) {
                    console.log('membership not selected');
                } else {
                    console.log('membership has been selected');
                }
            };

            scope.checkCardNumber = function() {
                var card_number = angular.element('#number').val();
                if (!card_number) {
                    angular.element("#card_number .error").html("Card Number Required");
                    angular.element("#card_number").addClass('has-error');
                    angular.element("#card_number .glyphicon").addClass('glyphicon-remove');
                } else {
                    angular.element("#card_number .error").html("");
                    angular.element("#card_number").removeClass('has-error').addClass('has-success');
                    angular.element("#card_number .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
            };

            scope.checkCardExpiry = function() {
                var expiry = angular.element('#expiry').val();
                var card_expiry = expiry.split("/");
                var exp_month = card_expiry[0].trim();
                var exp_year;
                if (card_expiry.length > 1) {
                    exp_year = card_expiry[1].trim();
                }

                if (!expiry || !exp_month || !exp_year) {
                    if (!expiry) {
                        angular.element("#card_expiry .error").html("Expiry Required");
                    } else if (!exp_month) {
                        angular.element("#card_expiry .error").html("Expiry Month Required");
                    } else if (!exp_year) {
                        angular.element("#card_expiry .error").html("Expiry Year Required");
                    }
                    angular.element("#card_expiry").addClass('has-error');
                    angular.element("#card_expiry .glyphicon").addClass('glyphicon-remove');
                } else {
                    angular.element("#card_expiry .error").html("");
                    angular.element("#card_expiry .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                    angular.element("#card_expiry").removeClass('has-error').addClass('has-success');
                }
            };

            scope.checkCardCvv = function() {
                var card_cvc = angular.element('#cvc').val();
                if (!card_cvc) {
                    angular.element("#card_cvc .error").html("CVC Required");
                    angular.element("#card_cvc").addClass('has-error');
                    angular.element("#card_cvc .glyphicon").addClass('glyphicon-remove');
                } else {
                    angular.element("#card_cvc .error").html("");
                    angular.element("#card_cvc").removeClass('has-error').addClass('has-success');
                    angular.element("#card_cvc .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
            };

            scope.checkCoupon = function() {
                scope.couponChecked = true;
                scope.checkingCoupon = true;
                console.log('>> checkCoupon');
                var coupon = scope.newAccount.coupon;
                //console.dir(coupon);
                //console.log(scope.newAccount.coupon);
                if (coupon) {
                    PaymentService.validateCoupon(coupon, function(data) {
                        console.log('data ', data);
                        scope.currentCoupon = data;
                        scope.checkingCoupon = false;
                        console.log('validate coupon');
                        if (data.id && data.id === coupon) {
                            console.log('valid');
                            angular.element("#coupon-name .error").html("");
                            scope.couponIsValid = true;
                        } else {
                            console.log('invalid');
                            angular.element("#coupon-name .error").html("Invalid Coupon");
                            scope.couponIsValid = false;
                        }
                    });
                } else {
                    scope.couponIsValid = true;
                    angular.element("#coupon-name .error").html("");
                    angular.element("#coupon-name").removeClass('has-error').addClass('has-success');
                    angular.element("#coupon-name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
            };

            scope.checkCardName = function() {
                var name = $('#card_name #name').val();
                if (name) {
                    $("#card_name .error").html("");
                    $("#card_name").removeClass('has-error').addClass('has-success');
                    $("#card_name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
            };

            if ($location.search().coupon) {
                scope.poulateCoupon = angular.copy($location.search().coupon);
                // $location.search('coupon', null);
                scope.poulateCoupon = scope.poulateCoupon;
                scope.newAccount.coupon = scope.poulateCoupon;
                scope.checkCoupon();
            }

            if ($location.search().email) {
                scope.poulateEmail = angular.copy($location.search().email);
                // $location.search('email', null);
                console.log('scope.poulateEmail ', scope.poulateEmail);
                scope.newAccount.email = scope.poulateEmail;
                console.log('scope.newAccount.email ', scope.newAccount.email);
                scope.checkEmailExists(scope.newAccount);
            }
        }
    };
}]);
