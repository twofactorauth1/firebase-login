/*global app, Fingerprint*/
app.directive('paymentFormComponent', ['$filter', '$q', 'productService', 'paymentService', 'userService', 'commonService', 'ipCookie', 'formValidations', '$location', function($filter, $q, ProductService, PaymentService, UserService, CommonService, ipCookie, formValidations, $location) {
    return {
        require: [],
        scope: {
            component: '='
        },
        templateUrl: '/components/component-wrap.html',
        link: function(scope, element, attrs, ctrl) {
            scope.newAccount = {
                email: ''
            };

            if (scope.component.version === 2) {
                //TODO: set true plan _id's
                scope.newAccount.plan = scope.component.productIds['ALLINONE'];
                scope.newAccount.addSignupFee = true;
            }

            scope.emailValidation = formValidations.email;
            scope.havingNetworkIssue = false;

            //scope.domainExistsAlready = false;  // needs to be undefined to begin with
            scope.emptyBusinessName = false;
            scope.validBusinessName = true;
            scope.dotComExt = false;



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

            scope.showExtension = '';
            scope.$watch('newAccount.phone', function (newValue){
                if (newValue !== undefined && newValue != '') {
                    scope.showExtension = true;
                } else {
                    scope.showExtension = false;
                }
            });

            scope.$watch('newAccount.fullName', function (newValue) {
                if (newValue !== undefined) {
                    var nameSplit = newValue.match(/\S+/g);
                    if (nameSplit) {
                        if (nameSplit.length >= 3) {
                            scope.newAccount.first = nameSplit[0];
                            scope.newAccount.last = nameSplit[2];
                        } else if (nameSplit.length === 2) {
                            scope.newAccount.first = nameSplit[0];
                            scope.newAccount.last = nameSplit[1];
                        } else if (nameSplit.length === 1) {
                            scope.newAccount.first = nameSplit[0];
                            scope.newAccount.last = '';
                        }
                    } else {
                        scope.newAccount.first = '';
                        scope.newAccount.last = '';
                    }
                }
            }, true);

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
                if (scope.component.version === 1) {
                    scope.createAccountVersion1(newAccount);
                } else {
                    scope.createAccountVersion2(newAccount);
                }
            };

            scope.createAccountVersion2 = function(newAccount) {

                if (!scope.validateFormVersion2()) {
                    scope.requiredFieldsFilled = false;
                    return;
                }
                scope.requiredFieldsFilled = true;
                scope.showFooter(false);
                scope.loading = true;
                var tmpAccount = scope.tmpAccount;
                tmpAccount.subdomain = $.trim(newAccount.businessName).replace(/ /g, '').replace(/\./g, '_').replace(/@/g, '').replace(/_/g, ' ').replace(/\W+/g, '').toLowerCase();
                tmpAccount.business = tmpAccount.business || {};
                tmpAccount.business.name = newAccount.businessName;

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

                    PaymentService.getStripeCardToken(newAccount.card, function(token, error) {
                        if (error) {
                            console.info(error);
                            scope.$apply(function() {
                                scope.isFormValid = false;
                                scope.showFooter(true);
                                scope.loading = false;
                            });
                            switch (error.param) {
                                case "number":
                                    angular.element("#card_number .error").html(error.message);
                                    angular.element("#card_number").addClass('has-error');
                                    angular.element("#card_number .glyphicon").addClass('glyphicon-remove');
                                    break;
                                case "exp_year":
                                    angular.element("#card_expiry .error").html(error.message);
                                    angular.element("#card_expiry").addClass('has-error');
                                    angular.element("#card_expiry .glyphicon").addClass('glyphicon-remove');
                                    break;
                                case "cvc":
                                    angular.element("#card_cvc .error").html(error.message);
                                    angular.element("#card_cvc").addClass('has-error');
                                    angular.element("#card_cvc .glyphicon").addClass('glyphicon-remove');
                                    break;
                                case "exp_month":
                                    angular.element("#card_expiry .error").html(error.message);
                                    angular.element("#card_expiry").addClass('has-error');
                                    angular.element("#card_expiry .glyphicon").addClass('glyphicon-remove');
                                    break;
                            }
                        } else {
                            newUser.cardToken = token;
                            newUser.plan = scope.newAccount.plan;
                            newUser.anonymousId = window.analytics.user().anonymousId();
                            newUser.permanent_cookie = ipCookie("permanent_cookie");
                            newUser.fingerprint = new Fingerprint().get();
                            newUser.setupFee = 0;
                            if(newAccount.addSignupFee === true) {
                                newUser.setupFee = 50000;//$500.00
                            }

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
                                        //send facebook tracking info
                                        window._fbq = window._fbq || [];
                                        window._fbq.push(['track', '6032779610613', {'value':'0.00','currency':'USD'}]);


                                        if (!_gaw || !_gaw.loaded) {
                                            var adWordsInjectable =
                                                'var google_conversion_id = 941009161;' +
                                                'var google_conversion_language = "en";' +
                                                'var google_conversion_format = "3";' +
                                                'var google_conversion_color = "ffffff";' +
                                                'var google_conversion_label = "eRTgCNSRo2EQidLawAM";' +
                                                'var google_remarketing_only = false;';

                                            var gaw_vars = document.createElement('script');
                                            gaw_vars.type = 'text/javascript';
                                            gaw_vars.innerText = adWordsInjectable;
                                            document.getElementsByTagName('head')[0].appendChild(gaw_vars);

                                            var gaw_scr = document.createElement('script');
                                            gaw_scr.type = 'text/javascript';
                                            gaw_scr.src = '//www.googleadservices.com/pagead/conversion.js';
                                            document.getElementsByTagName('head')[0].appendChild(gaw_scr);

                                            _gaw.loaded = true;
                                        }
                                        scope.loading = false;
                                        //TODO: setTimeout?
                                        window.location = data.accountUrl;
                                    } else {
                                        scope.loading = false;
                                        window.location = data.accountUrl;
                                    }

                                } else {
                                    scope.isFormValid = false;
                                    scope.loading = false;
                                    if (err.message === 'card_declined') {
                                        angular.element("#card_number .error").html('There was an error charging your card.');
                                        angular.element("#card_number").addClass('has-error');
                                        angular.element("#card_number .glyphicon").addClass('glyphicon-remove');
                                    }
                                    scope.showFooter(true);
                                }
                            });
                        }

                    });

                });
            };

            scope.validateFormVersion2 = function() {

                scope.isFormValid = false;
                var checkIfFormValid = true;

                if (!scope.newAccount.email) {
                    scope.checkEmailExists(scope.newAccount);
                    checkIfFormValid = false;
                }

                scope.checkPasswordLength(scope.newAccount);

                if (!scope.newAccount.password && !scope.newAccount.tempUserId && !scope.newAccount.hidePassword) {                    
                    checkIfFormValid = false;
                }

                if(!scope.newAccount.hidePassword && scope.newAccount.password) {                    
                    if(!scope.passwordIsValid) {
                        checkIfFormValid = false;
                    }
                }

                if (!scope.newAccount.businessName) {
                    scope.checkDomainExists(scope.newAccount);
                    checkIfFormValid = false;;
                }

                scope.newAccount.card = {
                    number: angular.element('#number').val(),
                    cvc: angular.element('#cvc').val(),
                    exp_month: parseInt(angular.element('#expiry').val().split('/')[0]),
                    exp_year: parseInt(angular.element('#expiry').val().split('/')[1])
                };

                var cc_name = angular.element('#name').val();

                if (!scope.newAccount.card.number || !scope.newAccount.card.cvc || !scope.newAccount.card.exp_month || !scope.newAccount.card.exp_year) {
                    //|| !cc_name
                    //hightlight card in red
                    scope.checkCardNumber();
                    scope.checkCardExpiry();
                    scope.checkCardCvv();
                    checkIfFormValid = false;
                }
                scope.checkCoupon();
                if (!scope.couponIsValid) {
                    checkIfFormValid = false;
                }

                if(checkIfFormValid){
                    scope.isFormValid = true;
                    return true;
                }
                else{
                    return false;
                }


            }

            scope.createAccountVersion1 = function(newAccount) {
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
                tmpAccount.subdomain = $.trim(newAccount.businessName).replace(/ /g, '').replace(/\./g, '_').replace(/@/g, '').replace(/_/g, ' ').replace(/\W+/g, '').toLowerCase();
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
                                        //send facebook tracking info
                                        window._fbq = window._fbq || [];
                                        window._fbq.push(['track', '6032779610613', {'value':'0.00','currency':'USD'}]);


                                        if (!_gaw.loaded) {
                                            var adWordsInjectable =
                                                'var google_conversion_id = 941009161;' +
                                                'var google_conversion_language = "en";' +
                                                'var google_conversion_format = "3";' +
                                                'var google_conversion_color = "ffffff";' +
                                                'var google_conversion_label = "eRTgCNSRo2EQidLawAM";' +
                                                'var google_remarketing_only = false;';

                                            var gaw_vars = document.createElement('script');
                                            gaw_vars.type = 'text/javascript';
                                            gaw_vars.innerText = adWordsInjectable;
                                            document.getElementsByTagName('head')[0].appendChild(gaw_vars);

                                            var gaw_scr = document.createElement('script');
                                            gaw_scr.type = 'text/javascript';
                                            gaw_scr.src = '//www.googleadservices.com/pagead/conversion.js';
                                            document.getElementsByTagName('head')[0].appendChild(gaw_scr);

                                            _gaw.loaded = true;
                                        }
                                        //TODO: setTimeout?
                                        window.location = data.accountUrl;
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
            scope.loading = false;
            scope.createAccountWithoutCC = function(newAccount) {
                //validate
                //email
                if(scope.loading)
                    return;
                scope.isFormValid = false;
                scope.validateForm = true;
                scope.loading = true;
                scope.promises = [];

                scope.showFooter(true);

                scope.checkEmailExists(newAccount, true);

                scope.checkPhoneExtension(newAccount);

                //pass
                if (!scope.newAccount.password && !scope.newAccount.tempUserId && !scope.newAccount.hidePassword) {
                    scope.checkPasswordLength(newAccount);
                    scope.validateForm = false;
                    scope.loading = false;
                }

                //url
                scope.checkDomainExists(newAccount);
                if(!scope.validBusinessName) {
                    scope.validateForm = false;
                    scope.loading = false;
                }

                //if (!scope.newAccount.first) {
                //    scope.checkFirstName(newAccount);
                //    scope.validateForm = false;
                //}

                //if (!scope.newAccount.last) {
                //    scope.checkLastName(newAccount);
                //    scope.validateForm = false;
                //}

                if(!scope.newAccount.hidePassword) {
                    scope.checkPasswordLength(newAccount);
                    if(!scope.passwordIsValid) {
                        scope.validateForm = false;
                        scope.loading = false;
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

                if (scope.promises.length) {
                $q.all(scope.promises)
                  .then(function (data) {
                    _.each(data, function (value, index) {
                      if(index === 0)
                        scope.validateEmail(value.data);
                    });
                    if(!scope.validateForm)
                        return;
                    scope.isFormValid = true;
                    scope.loading = false;
                    scope.showFooter(false);
                    var tmpAccount = scope.tmpAccount;
                    tmpAccount.subdomain = $.trim(newAccount.businessName).replace(/ /g, '').replace(/\./g, '_').replace(/@/g, '').replace(/_/g, ' ').replace(/\W+/g, '').toLowerCase();
                    tmpAccount.business = tmpAccount.business || {};
                    tmpAccount.business.name = newAccount.businessName;
                    tmpAccount.signupPage = $location.path();
                    if(scope.newAccount.phone) {
                        tmpAccount.business.phones = [];
                        tmpAccount.business.phones[0] = {
                            _id: CommonService.generateUniqueAlphaNumericShort(),
                            number: scope.newAccount.phone,
                            extension: scope.newAccount.extension,
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
                            last: newAccount.last,
                            campaignId: scope.component.campaignId,
                            existingUser: newAccount.existingUser
                        };

                        newUser.plan = '';
                        if(window.analytics && window.analytics.user) {
                            newUser.anonymousId = window.analytics.user().anonymousId();
                        } else {
                            newUser.anonymousId = '';
                        }

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
                                    /*
                                     * We will now create the intercom user in the admin
                                     * var hash = CryptoJS.HmacSHA256(newUser.email, "vZ7kG_bS_S-jnsNq4M2Vxjsa5mZCxOCJM9nezRUQ");
                                     //send data to intercom
                                     window.intercomSettings = {
                                     name: newUser.username,
                                     email: newUser.email,
                                     user_hash: hash.toString(CryptoJS.enc.Hex),
                                     created_at: Math.floor(Date.now() / 1000),
                                     app_id: "b3st2skm"
                                     };
                                     */

                                    //send facebook tracking info
                                    window._fbq = window._fbq || [];
                                    window._fbq.push(['track', '6032779610613', {'value':'0.00','currency':'USD'}]);
                                    //console.log('sent facebook message');


                                    //TODO: setTimeout?
                                    window.location = data.accountUrl;
                                } else {
                                    window.location = data.accountUrl;
                                }
                            } else {
                                scope.isFormValid = false;

                                scope.showFooter(true);
                            }
                        });

                    });
                  })
                  .catch(function (err) {
                    scope.loading = false;
                    console.error(err);
                  });
              }
            };

            scope.validateBusinessName = function(domainExists)
            {
                if (domainExists) {
                    scope.validateForm = false;
                    scope.loading = false;
                    scope.validBusinessName = false;
                }
                else {
                    scope.validBusinessName = true;
                    scope.validateForm = true;
                }
            };

            scope.validateEmail = function(data, newAccount)
            {
                if (data === true) {
                    //scope.validateForm = false;
                    scope.loading = false;
                    if(newAccount) {
                        newAccount.hidePassword = true;
                        newAccount.existingUser = true;
                    }

                    angular.element("#email .error").html("You will be able to log in to this account with your existing credentials.");
                    angular.element("#email").addClass('has-success');
                    angular.element("#email .glyphicon").addClass('glyphicon-ok');
                } else {
                    scope.validateForm = true;
                    if(newAccount) {
                        newAccount.hidePassword = false;
                        newAccount.existingUser = false;
                    }
                    angular.element("#email .error").html("");
                    angular.element("#email").removeClass('has-error').addClass('has-success');
                    angular.element("#email .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
            };

            scope.checkDomainExists = function(newAccount) {
                scope.havingNetworkIssue = false;
                if (!newAccount.businessName) {
                    scope.validBusinessName = false;
                    scope.emptyBusinessName = true;
                }
                else {
                    scope.emptyBusinessName = false;

                    var name = $.trim(newAccount.businessName);

                    var comExtension = ".com";
                    if(new RegExp("\\b"+comExtension+"\\b").test(name))
                    {
                        scope.dotComExt = true;
                    }
                    name = name.replace(/ /g, '').replace(/\./g, '_').replace(/@/g, '').replace(/_/g, ' ').replace(/\W+/g, '').toLowerCase();

                    newAccount.businessName = name;
                    UserService.checkDomainExists(name, function(err, domainAvailable) {
                        if (err) {
                            scope.isFormValid = false;
                            scope.showFooter(true);
                        }

                        if (domainAvailable) {
                            scope.domainExistsAlready = domainAvailable==='false';
                            scope.validateBusinessName(scope.domainExistsAlready);
                        } else {
                            scope.isFormValid = false;
                            scope.showFooter(true);
                            scope.havingNetworkIssue = true;
                        }

                    });
                }
            };

            scope.checkEmailExists = function(newAccount, skip) {
                scope.newAccount.email = newAccount.email;
                if (!newAccount.email) {
                    angular.element("#email .error").html("Valid Email Required");
                    angular.element("#email").addClass('has-error');
                    angular.element("#email .glyphicon").addClass('glyphicon-remove');
                    scope.validateForm = false;
                    scope.loading = false;
                } else {
                    if(skip)
                        scope.promises.push(UserService.checkDuplicateEmail(newAccount.email));
                    else
                        UserService.checkEmailExists(newAccount.email, function(data) {
                            scope.validateEmail(data, newAccount);
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

            scope.checkPhoneExtension = function(newAccount) {
                scope.newAccount.extension = newAccount.extension;
                console.log('newAccount.extension ', newAccount.extension);
                var regex = formValidations.extension;
                var result =  regex.test(newAccount.extension);
                if (result || !newAccount.extension) {
                    angular.element("#extension .error").html("");
                    angular.element("#extension").removeClass('has-error').addClass('has-success');
                    angular.element("#extension .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                } else {
                    angular.element("#extension .error").html("Enter a valid extension");
                    angular.element("#extension").addClass('has-error');
                    angular.element("#extension .glyphicon").addClass('glyphicon-remove');
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
                    PaymentService.validateIndigenousCoupon(coupon, function(data) {
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
                    scope.checkingCoupon = false;
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
