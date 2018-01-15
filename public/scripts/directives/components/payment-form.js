/*global app, angular, window,Fingerprint,CryptoJS,document,console, $*/
/*jslint unparam:true*/
/* eslint-disable no-console */
app.directive('paymentFormComponent', ['$q', 'paymentService', 'userService', 'commonService', 'ipCookie', 'formValidations', '$location', 'geocodeService', function ($q, PaymentService, UserService, CommonService, ipCookie, formValidations, $location, geocodeService) {
	'use strict';
	return {
		require: [],
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			scope.newAccount = {
				email: ''
			};
			var redirectFn = function redirect(accountUrl) {
					scope.loading = false;
					window.location = accountUrl;
				},
				showErrorMessage = function (inputId, errorMessage) {
					angular.element("#" + inputId + " .error").html(errorMessage);
					angular.element("#" + inputId).addClass('has-error');
					angular.element("#" + inputId + " .glyphicon").addClass('glyphicon-remove');
				},
				removeErrorMessage = function (inputId) {
					angular.element("#" + inputId + " .error").html("");
					angular.element("#" + inputId).removeClass('has-error').addClass('has-success');
					angular.element("#" + inputId + " .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
				};
			scope.buttonDisabled = false;
			if (scope.component.version === 2) {
				//TODO: set true plan _id's
				scope.newAccount.plan = scope.component.productIds.ALLINONE;
				scope.newAccount.addSignupFee = true;
			} else if (scope.component.version === 3) {
				scope.newAccount.plan = scope.component.productIds.RVLVRPLAN;
			}

			scope.emailValidation = formValidations.email;
			scope.havingNetworkIssue = false;

			//scope.domainExistsAlready = false;  // needs to be undefined to begin with
			scope.emptyBusinessName = false;
			scope.emptyPostalCode = false;
			scope.validBusinessName = true;
			scope.dotComExt = false;



			UserService.getTmpAccount(function (data) {
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
					UserService.saveOrUpdateTmpAccount(tmpAccount, function () {});
				}
			});


			scope.isAdmin = function () {
				return scope.isAdmin;
			};

			scope.showExtension = '';
			scope.$watch('newAccount.phone', function (newValue) {
				if (newValue !== undefined && newValue !== '') {
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

			scope.removeAccount = function () {
				scope.newAccount.businessName = null;
				scope.newAccount.profilePhoto = null;
				scope.newAccount.tempUserId = null;
				scope.newAccount.email = null;
				scope.tmpAccount.tempUser = null;
				scope.newAccount.hidePassword = false;
			};

			scope.makeSocailAccount = function (socialType) {
				if (socialType) {
					var thisUrl = "/signup/" + socialType + "?redirectTo=/signup";
					console.log('scope.newAccount ', JSON.stringify(scope.newAccount));
					if (scope.newAccount.coupon) {
						thisUrl = thisUrl + "?coupon=" + scope.poulateCoupon;
					}
					console.log('thisUrl >>> ', thisUrl);
					window.location.href = thisUrl;
					return;
				}
			};

			scope.showFooter = function (status) {
				if (status) {
					angular.element("#footer").show();
				} else {
					angular.element("#footer").hide();
				}
			};

			scope.createAccount = function (newAccount) {
				if (scope.component.version === 1) {
					scope.createAccountVersion1(newAccount);
				} else if (scope.component.version === 2) {
					scope.createAccountVersion2(newAccount);
				} else if (scope.component.version === 3) {
					scope.createAccountV3(newAccount);
				}
			};

			scope.createAccountV3 = function (newAccount) {
				if (!scope.validateFormV3()) {
					scope.requiredFieldsFilled = false;
					return;
				}

				var tmpAccount = scope.tmpAccount;
				tmpAccount.subdomain = $.trim(newAccount.businessName).replace(/ /g, '').replace(/\./g, '_').replace(/@/g, '').replace(/_/g, ' ').replace(/\W+/g, '').toLowerCase();
				tmpAccount.business = tmpAccount.business || {};
				tmpAccount.business.name = newAccount.businessName;

				UserService.checkDomainExists(newAccount.businessName, function (err, domainAvailable) {
					if (err) {
						scope.isFormValid = false;
						scope.showFooter(true);
					}

					if (domainAvailable && domainAvailable !== 'false') {
						scope.requiredFieldsFilled = true;
						scope.showFooter(false);
						scope.loading = true;
						scope.isFormValid = true;
						var billingState = null;
						geocodeService.getAddressWithZip(newAccount.billingPostalCode, function (data, results) {
							if (data && results.length === 1) {
								var addressObj = results[0];
								if(addressObj.types && addressObj.types.length){
									if(_.contains(addressObj.types, 'postal_code')){
										var obj = _.find(addressObj.address_components, function(c){
											return _.contains( c.types, 'administrative_area_level_1')
										})
										if(obj){
											billingState = obj.short_name;
										}
									}
								}								
							}
							UserService.saveOrUpdateTmpAccount(tmpAccount, function (data) {
								var newUser = {
									username: newAccount.email,
									password: newAccount.password,
									email: newAccount.email,
									accountToken: data.token,
									coupon: newAccount.coupon,
									first: newAccount.first,
									middle: newAccount.middle,
									last: newAccount.last,
									existingUser: newAccount.existingUser,								
									orgId: 1,
									billingPostalCode: newAccount.billingPostalCode
								};
								if(billingState){
									newUser.billingState = billingState;
								}
								PaymentService.getStripeCardToken(newAccount.card, function (token, error) {
									if (error) {
										console.info(error);
										scope.$apply(function () {
											scope.isFormValid = false;
											scope.showFooter(true);
											scope.loading = false;
										});

										switch (error.param) {
											case "number":
												showErrorMessage("card_number", error.message);
												break;
											case "exp_year":
												showErrorMessage("card_expiry", error.message);
												break;
											case "cvc":
												showErrorMessage("card_cvc", error.message);
												break;
											case "exp_month":
												showErrorMessage("card_expiry", error.message);
												break;
											default:
												showErrorMessage("card_number", error.message);
												break;
										}
									} else {
										newUser.cardToken = token;
										newUser.plan = scope.newAccount.plan;
										newUser.anonymousId = window.analytics ? window.analytics.user().anonymousId() : null;
										newUser.permanent_cookie = ipCookie("permanent_cookie");
	                                    new Fingerprint2().get(function(fingerprint, components){
	                                        newUser.fingerprint = fingerprint;
	                                        newUser.setupFee = 150000; //1500.00


	                                        UserService.initializeUser(newUser, function (err, data) {
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
	                                                    window._fbq.push(['track', '6032779610613', {
	                                                        'value': '0.00',
	                                                        'currency': 'USD'
	                                                    }]);


	                                                    if (typeof _gaw === "undefined") {
	                                                        var adWordsInjectable =
	                                                            'var google_conversion_id = 941009161;' +
	                                                            'var google_conversion_language = "en";' +
	                                                            'var google_conversion_format = "3";' +
	                                                            'var google_conversion_color = "ffffff";' +
	                                                            'var google_conversion_label = "eRTgCNSRo2EQidLawAM";' +
	                                                            'var google_remarketing_only = false;',
	                                                            gaw_vars = document.createElement('script'),
	                                                            gaw_scr;
	                                                        gaw_vars.type = 'text/javascript';
	                                                        gaw_vars.innerText = adWordsInjectable;
	                                                        document.getElementsByTagName('head')[0].appendChild(gaw_vars);

	                                                        gaw_scr = document.createElement('script');
	                                                        gaw_scr.onload = function () {
	                                                            redirectFn(data.accountUrl);
	                                                        };
	                                                        gaw_scr.type = 'text/javascript';
	                                                        gaw_scr.src = '//www.googleadservices.com/pagead/conversion.js';
	                                                        document.getElementsByTagName('head')[0].appendChild(gaw_scr);

	                                                    }

	                                                } else {
	                                                    redirectFn(data.accountUrl);
	                                                }

	                                            } else {
	                                                scope.isFormValid = false;
	                                                scope.loading = false;
	                                                if (err.message === 'card_declined') {
	                                                    showErrorMessage("card_number", 'There was an error charging your card.');
	                                                } else if (err.message === 'incorrect_cvc') {
	                                                    showErrorMessage("card_cvc", "Your card's security code is incorrect");
	                                                } else {
	                                                    showErrorMessage("card_number", err.message);
	                                                }
	                                                scope.showFooter(true);
	                                            }
	                                        });
	                                    });

									}

								});

							});
						})
					} else {
						scope.isFormValid = false;
						scope.showFooter(true);
						scope.requiredFieldsFilled = false;
					}

				});
			};

			scope.validateFormV3 = function () {
				scope.isFormValid = false;
				var checkIfFormValid = true;

				if (!scope.newAccount.email) {
					scope.checkEmailExists(scope.newAccount);
					checkIfFormValid = false;
				}

				if (!scope.newAccount.billingPostalCode) {		
					scope.checkPostalCode(scope.newAccount);
					checkIfFormValid = false;
				}

				scope.checkPasswordLength(scope.newAccount);

				if (!scope.newAccount.password && !scope.newAccount.tempUserId && !scope.newAccount.hidePassword) {
					checkIfFormValid = false;
				}

				if (!scope.newAccount.hidePassword && scope.newAccount.password) {
					if (!scope.passwordIsValid) {
						checkIfFormValid = false;
					}
				}

				if (!scope.newAccount.businessName) {
					scope.checkDomainExists(scope.newAccount);
					checkIfFormValid = false;
				}

				scope.newAccount.card = {
					number: angular.element('#number').val(),
					cvc: angular.element('#cvc').val(),
					exp_month: parseInt(angular.element('#expiry').val().split('/')[0]),
					exp_year: parseInt(angular.element('#expiry').val().split('/')[1])
				};


				if (!scope.newAccount.card.number || !scope.newAccount.card.cvc || !scope.newAccount.card.exp_month || !scope.newAccount.card.exp_year) {

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

				if (checkIfFormValid) {
					return true;
				} else {
					return false;
				}
			};

			scope.createAccountVersion2 = function (newAccount) {
				if (!scope.validateFormVersion2()) {
					scope.requiredFieldsFilled = false;
					return;
				}
				scope.buttonDisabled = true;
				var tmpAccount = scope.tmpAccount;
				tmpAccount.subdomain = $.trim(newAccount.businessName).replace(/ /g, '').replace(/\./g, '_').replace(/@/g, '').replace(/_/g, ' ').replace(/\W+/g, '').toLowerCase();
				tmpAccount.business = tmpAccount.business || {};
				tmpAccount.business.name = newAccount.businessName;
				UserService.checkDomainExists(newAccount.businessName, function (err, domainAvailable) {
					if (err) {
						scope.buttonDisabled = false;
						scope.isFormValid = false;
						scope.showFooter(true);
					}

					if (domainAvailable && domainAvailable !== 'false') {
						scope.requiredFieldsFilled = true;
						scope.showFooter(false);
						scope.loading = true;
						scope.isFormValid = true;
						var billingState = null;
						geocodeService.getAddressWithZip(newAccount.billingPostalCode, function (data, results) {
							if (data && results.length === 1) {
								var addressObj = results[0];
								if(addressObj.types && addressObj.types.length){
									if(_.contains(addressObj.types, 'postal_code')){
										var obj = _.find(addressObj.address_components, function(c){
											return _.contains( c.types, 'administrative_area_level_1')
										})
										if(obj){
											billingState = obj.short_name;
										}
									}
								}								
							}
							
							UserService.saveOrUpdateTmpAccount(tmpAccount, function (data) {
								var newUser = {
									username: newAccount.email,
									password: newAccount.password,
									email: newAccount.email,
									accountToken: data.token,
									coupon: newAccount.coupon,
									first: newAccount.first,
									middle: newAccount.middle,
									last: newAccount.last,
									existingUser: newAccount.existingUser,
									billingPostalCode: newAccount.billingPostalCode
								};
								if(billingState){
									newUser.billingState = billingState;
								}
								PaymentService.getStripeCardToken(newAccount.card, function (token, error) {
									if (error) {
										scope.buttonDisabled = false;
										console.info(error);
										scope.$apply(function () {
											scope.isFormValid = false;
											scope.buttonDisabled = false;
											scope.showFooter(true);
											scope.loading = false;
										});
										switch (error.param) {
											case "number":
												showErrorMessage("card_number", error.message);
												break;
											case "exp_year":
												showErrorMessage("card_expiry", error.message);
												break;
											case "cvc":
												showErrorMessage("card_cvc", error.message);
												break;
											case "exp_month":
												showErrorMessage("card_expiry", error.message);
												break;
											default:
												showErrorMessage("card_number", error.message);
												break;
										}
									} else {
										scope.buttonDisabled = false;
										newUser.cardToken = token;
										newUser.plan = scope.newAccount.plan;
										newUser.anonymousId = window.analytics ? window.analytics.user().anonymousId() : null;
										newUser.permanent_cookie = ipCookie("permanent_cookie");
	                                    new Fingerprint2().get(function(fingerprint, components){
	                                        newUser.fingerprint = fingerprint;
	                                        newUser.setupFee = 0;
	                                        if (newAccount.addSignupFee === true) {
	                                            newUser.setupFee = 150000; //$1500.00
	                                        }

	                                        UserService.initializeUser(newUser, function (err, data) {
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
	                                                    window._fbq.push(['track', '6032779610613', {
	                                                        'value': '0.00',
	                                                        'currency': 'USD'
	                                                    }]);


	                                                    if (typeof _gaw === "undefined") {
	                                                        var adWordsInjectable =
	                                                            'var google_conversion_id = 941009161;' +
	                                                            'var google_conversion_language = "en";' +
	                                                            'var google_conversion_format = "3";' +
	                                                            'var google_conversion_color = "ffffff";' +
	                                                            'var google_conversion_label = "eRTgCNSRo2EQidLawAM";' +
	                                                            'var google_remarketing_only = false;',
	                                                            gaw_vars = document.createElement('script'),
	                                                            gaw_scr;

	                                                        gaw_vars.type = 'text/javascript';
	                                                        gaw_vars.innerText = adWordsInjectable;
	                                                        document.getElementsByTagName('head')[0].appendChild(gaw_vars);

	                                                        gaw_scr = document.createElement('script');
	                                                        gaw_scr.onload = function () {
	                                                            redirectFn(data.accountUrl);
	                                                        };
	                                                        gaw_scr.type = 'text/javascript';
	                                                        gaw_scr.src = '//www.googleadservices.com/pagead/conversion.js';
	                                                        document.getElementsByTagName('head')[0].appendChild(gaw_scr);

	                                                    }

	                                                } else {
	                                                    redirectFn(data.accountUrl);
	                                                }

	                                            } else {
	                                                scope.isFormValid = false;
	                                                scope.buttonDisabled = false;
	                                                scope.loading = false;
	                                                if (err.message === 'card_declined') {
	                                                    showErrorMessage("card_number", 'There was an error charging your card.');
	                                                } else if (err.message === 'incorrect_cvc') {
	                                                    showErrorMessage("card_cvc", "Your card's security code is incorrect");
	                                                } else {
	                                                    showErrorMessage("card_number", err.message);
	                                                }
	                                                scope.showFooter(true);
	                                            }
	                                        });
	                                    });

									}

								});

							});
						});
					} else {
						scope.isFormValid = false;
						scope.buttonDisabled = false;
						scope.showFooter(true);
						scope.requiredFieldsFilled = false;
					}

				});

			};

			scope.validateFormVersion2 = function () {

				scope.isFormValid = false;
				var checkIfFormValid = true;

				if (!scope.newAccount.email) {
					scope.checkEmailExists(scope.newAccount);
					checkIfFormValid = false;
				}

				if (!scope.newAccount.billingPostalCode) {		
					scope.checkPostalCode(scope.newAccount);
					checkIfFormValid = false;
				}

				scope.checkPasswordLength(scope.newAccount);

				if (!scope.newAccount.password && !scope.newAccount.tempUserId && !scope.newAccount.hidePassword) {
					checkIfFormValid = false;
				}

				if (!scope.newAccount.hidePassword && scope.newAccount.password) {
					if (!scope.passwordIsValid) {
						checkIfFormValid = false;
					}
				}

				if (!scope.newAccount.businessName) {
					scope.checkDomainExists(scope.newAccount);
					checkIfFormValid = false;
				}

				scope.newAccount.card = {
					number: angular.element('#number').val(),
					cvc: angular.element('#cvc').val(),
					exp_month: parseInt(angular.element('#expiry').val().split('/')[0]),
					exp_year: parseInt(angular.element('#expiry').val().split('/')[1])
				};


				if (!scope.newAccount.card.number || !scope.newAccount.card.cvc || !scope.newAccount.card.exp_month || !scope.newAccount.card.exp_year) {
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
				return checkIfFormValid;
			};

			scope.createAccountVersion1 = function (newAccount) {
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
				scope.isFormValid = true;
				scope.showFooter(false);
				var tmpAccount = scope.tmpAccount;
				tmpAccount.subdomain = $.trim(newAccount.businessName).replace(/ /g, '').replace(/\./g, '_').replace(/@/g, '').replace(/_/g, ' ').replace(/\W+/g, '').toLowerCase();
				tmpAccount.business = tmpAccount.business || {};
				tmpAccount.business.name = newAccount.businessName;

				UserService.saveOrUpdateTmpAccount(tmpAccount, function (data) {
					var newUser = {
						username: newAccount.email,
						password: newAccount.password,
						email: newAccount.email,
						accountToken: data.token,
						coupon: newAccount.coupon
					};
					newUser.anonymousId = window.analytics.user().anonymousId();
					newUser.permanent_cookie = ipCookie("permanent_cookie");
                    new Fingerprint2().get(function(fingerprint, components){
                        newUser.fingerprint = fingerprint;

                        UserService.initializeUser(newUser, function (err, data) {
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
                                    window._fbq.push(['track', '6032779610613', {
                                        'value': '0.00',
                                        'currency': 'USD'
                                    }]);


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

                                scope.showFooter(true);
                            }
                        });
                    });


				});
			};
			scope.loading = false;
			scope.createAccountWithoutCC = function (newAccount) {
				//validate
				//email
				if (scope.loading) {
					return;
				}
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
				if (!scope.validBusinessName) {
					scope.validateForm = false;
					scope.loading = false;
				}

				if (!scope.newAccount.hidePassword) {
					scope.checkPasswordLength(newAccount);
					if (!scope.passwordIsValid) {
						scope.validateForm = false;
						scope.loading = false;
					}
				}

				if (!scope.validateForm) {
					return;
				}



				scope.checkCoupon();
				if (!scope.couponIsValid) {
					return;
				}

				if (scope.promises.length) {
					$q.all(scope.promises)
						.then(function (data) {
							_.each(data, function (value, index) {
								if (index === 0)
									scope.validateEmail(value.data);
							});
							if (!scope.validateForm)
								return;
							scope.isFormValid = true;
							scope.loading = false;
							scope.showFooter(false);
							var tmpAccount = scope.tmpAccount;
							tmpAccount.subdomain = $.trim(newAccount.businessName).replace(/ /g, '').replace(/\./g, '_').replace(/@/g, '').replace(/_/g, ' ').replace(/\W+/g, '').toLowerCase();
							tmpAccount.business = tmpAccount.business || {};
							tmpAccount.business.name = newAccount.businessName;
							tmpAccount.signupPage = $location.path();
							if (scope.newAccount.phone) {
								tmpAccount.business.phones = [];
								tmpAccount.business.phones[0] = {
									_id: CommonService.generateUniqueAlphaNumericShort(),
									number: scope.newAccount.phone,
									extension: scope.newAccount.extension,
									default: true
								};
							}
							UserService.saveOrUpdateTmpAccount(tmpAccount, function (data) {
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
									existingUser: newAccount.existingUser,
									billingPostalCode: newAccount.billingPostalCode
								};

								newUser.plan = '';
								if (window.analytics && window.analytics.user) {
									newUser.anonymousId = window.analytics.user().anonymousId();
								} else {
									newUser.anonymousId = '';
								}

								newUser.permanent_cookie = ipCookie("permanent_cookie");
                                new Fingerprint2().get(function(fingerprint, components){
                                    newUser.fingerprint = fingerprint;

                                    // Add name
                                    var name = $('#card_name #name').val();
                                    if (name) {
                                        var nameAry = name.split(' ');
                                        if (nameAry.length === 3) {
                                            newUser.first = nameAry[0];
                                            newUser.middle = nameAry[1];
                                            newUser.last = nameAry[2];
                                        } else if (nameAry.length === 2) {
                                            newUser.first = nameAry[0];
                                            newUser.last = nameAry[1];
                                        } else if (nameAry.length === 1) {
                                            newUser.last = nameAry[0];
                                        }
                                    }
                                    UserService.initializeUser(newUser, function (err, data) {
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
                                                window._fbq.push(['track', '6032779610613', {
                                                    'value': '0.00',
                                                    'currency': 'USD'
                                                }]);
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


							});
						})
						.catch(function (err) {
							scope.loading = false;
							console.error(err);
						});
				}
			};

			scope.validateBusinessName = function (domainExists) {
				if (domainExists) {
					scope.validateForm = false;
					scope.loading = false;
					scope.validBusinessName = false;
				} else {
					scope.validBusinessName = true;
					scope.validateForm = true;
				}
			};

			scope.validateEmail = function (data, newAccount) {
				if (data === true) {
					//scope.validateForm = false;
					scope.loading = false;
					if (newAccount) {
						newAccount.hidePassword = true;
						newAccount.existingUser = true;
					}
					showErrorMessage("email", "You will be able to log in to this account with your existing credentials.");
					angular.element("#email").addClass('has-success');
					angular.element("#email .glyphicon").addClass('glyphicon-ok');
				} else {
					scope.validateForm = true;
					if (newAccount) {
						newAccount.hidePassword = false;
						newAccount.existingUser = false;
					}
					removeErrorMessage("email");
				}
			};

			scope.checkDomainExists = function (newAccount) {
				scope.havingNetworkIssue = false;
				if (!newAccount.businessName) {
					scope.validBusinessName = false;
					scope.emptyBusinessName = true;
				} else {
					scope.emptyBusinessName = false;

					var name = $.trim(newAccount.businessName);

					var comExtension = ".com";
					if (new RegExp("\\b" + comExtension + "\\b").test(name)) {
						scope.dotComExt = true;
					}
					name = name.replace(/ /g, '').replace(/\./g, '_').replace(/@/g, '').replace(/_/g, ' ').replace(/\W+/g, '').toLowerCase();

					newAccount.businessName = name;
					UserService.checkDomainExists(name, function (err, domainAvailable) {
						if (err) {
							scope.isFormValid = false;
							scope.showFooter(true);
						}

						if (domainAvailable) {
							scope.domainExistsAlready = domainAvailable === 'false';
							scope.validateBusinessName(scope.domainExistsAlready);
						} else {
							scope.isFormValid = false;
							scope.showFooter(true);
							scope.havingNetworkIssue = true;
						}

					});
				}
			};

			scope.checkEmailExists = function (newAccount, skip) {
				scope.newAccount.email = newAccount.email;
				if (!newAccount.email) {
					showErrorMessage("email", "Valid Email Required");
					scope.validateForm = false;
					scope.loading = false;
				} else {
					if (skip)
						scope.promises.push(UserService.checkDuplicateEmail(newAccount.email));
					else
						UserService.checkEmailExists(newAccount.email, function (data) {
							scope.validateEmail(data, newAccount);
						});
				}
			};

			scope.checkFirstName = function (newAccount) {
				scope.newAccount.first = newAccount.first;
				console.log('newAccount.first ', newAccount.first);
				if (!newAccount.first) {
					showErrorMessage("first", "First Name Required");
				} else {
					removeErrorMessage("first");
				}
			};

			scope.checkLastName = function (newAccount) {
				scope.newAccount.last = newAccount.last;
				if (!newAccount.last) {
					showErrorMessage("last", "Last Name Required");
				} else {
					removeErrorMessage("last");
				}
			};

			scope.checkPhone = function (newAccount) {
				scope.newAccount.phone = newAccount.phone;
				if (!newAccount.phone) {
					showErrorMessage("phone", "Phone Required");
				} else {
					removeErrorMessage("phone");
				}
			};

			scope.checkPasswordLength = function (newAccount) {
				if (!newAccount.password || newAccount.password.length < 6) {
					//angular.element("#password .error").html("Password must contain at least 6 characters");
					showErrorMessage("password", "");
					scope.passwordIsValid = false;
				} else {
					removeErrorMessage("password");
					scope.passwordIsValid = true;
				}
			};

			scope.checkPostalCode = function (newAccount) {
				if (!newAccount.billingPostalCode) {
					showErrorMessage("zip", "Billing Postal Code Required");
				} else {
					removeErrorMessage("zip");
				}
			};

			scope.checkPhoneExtension = function (newAccount) {
				scope.newAccount.extension = newAccount.extension;
				console.log('newAccount.extension ', newAccount.extension);
				var regex = formValidations.extension;
				var result = regex.test(newAccount.extension);
				if (result || !newAccount.extension) {
					removeErrorMessage("extension");
				} else {
					showErrorMessage("extension", "Enter a valid extension");
				}
			};

			scope.checkMembership = function (newAccount) {
				if (!newAccount.membership) {
					console.log('membership not selected');
				} else {
					console.log('membership has been selected');
				}
			};

			scope.checkCardNumber = function () {
				var card_number = angular.element('#number').val();
				if (!card_number) {
					showErrorMessage("card_number", "Card Number Required");
				} else {
					removeErrorMessage("card_number");
				}
			};

			scope.checkCardExpiry = function () {
				var expiry = angular.element('#expiry').val();
				var card_expiry = expiry.split("/");
				var exp_month = card_expiry[0].trim();
				var exp_year;
				if (card_expiry.length > 1) {
					exp_year = card_expiry[1].trim();
				}

				if (!expiry || !exp_month || !exp_year) {
					if (!expiry) {
						showErrorMessage("card_expiry", "Expiry Required");
					} else if (!exp_month) {
						showErrorMessage("card_expiry", "Expiry Month Required");
					} else if (!exp_year) {
						showErrorMessage("card_expiry", "Expiry Year Required");
					}
				} else {
					removeErrorMessage("card_expiry");
				}
			};

			scope.checkCardCvv = function () {
				var card_cvc = angular.element('#cvc').val();
				if (!card_cvc) {
					showErrorMessage("card_cvc", "CVC Required");
				} else {
					removeErrorMessage("card_cvc");
				}
			};

			scope.checkCoupon = function () {
				scope.couponChecked = true;
				scope.checkingCoupon = true;
				console.log('>> checkCoupon');
				var coupon = scope.newAccount.coupon;
				//console.dir(coupon);
				//console.log(scope.newAccount.coupon);
				if (coupon) {
					PaymentService.validateIndigenousCoupon(coupon, function (data) {
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
					removeErrorMessage("coupon-name");
				}
			};

			scope.checkCardName = function () {
				var name = $('#card_name #name').val();
				if (name) {
					removeErrorMessage("card_name");
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
