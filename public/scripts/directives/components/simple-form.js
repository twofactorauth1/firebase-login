/*global app, window, Fingerprint, angular ,document */
app.directive('simpleFormComponent', ["ipCookie", '$window', '$timeout', 'userService', 'formValidations', 'campaignService', '$location', function (ipCookie, $window, $timeout, userService, formValidations, campaignService, $location) {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			console.log('scope.component ', scope.component);
			scope.elementClass = '.simple-form-' + scope.component._id + " .form-submit-button";

			var campaignObj = null;
			scope.isBusy = false;
			scope.originalData = {
				bg: {

				}
			};

			if (scope.component.campaignId) {
				campaignService.getCampaign(scope.component.campaignId, function (data) {
					campaignObj = data;
				});
			}

			scope.nthRow = 'nth-row';
			if (!angular.isDefined(scope.component.tags)) {
				scope.component.tags = [];
				if (scope.component.contact_type) {
					scope.component.tags.push(scope.component.contact_type);
				}
			}



			scope.fieldClass = function (field) {
				var classString = 'col-sm-12';

				if (scope.component.formSettings && scope.component.formSettings.fieldsPerRow > 0) {
					classString = "col-sm-" + Math.floor(12 / scope.component.formSettings.fieldsPerRow);
					if (scope.component.formSettings.spacing && scope.component.formSettings.spacing.pr) {
						scope.nthRow = 'nth-row' + scope.component.formSettings.fieldsPerRow;
					}
				}
				return classString;
			};

			scope.fieldShow = function (name) {
				var field = _.find(scope.component.fields, function (_field) {
					return _field.name === name;
				});

				if (field) {
					if (field.value) {
						return true;
					}
				}
			};

			scope.fieldStyle = function (field) {
				var styleString = ' ';
				if (field && field.spacing) {
					if (field.spacing.mb) {
						styleString += 'margin-bottom: ' + field.spacing.mb + 'px;';
					}
				}
				return styleString;
			};

			scope.inputStyle = function (field) {
				var styleString = ' ';
				if (field && field.align) {
					styleString += 'text-align: ' + field.align + ";";
				}
				if (field && field.inputTextSize) {
					styleString += 'font-size: ' + field.inputTextSize + 'px !important;';
				}
				if (field && field.inputFontFamily) {
					styleString += 'font-family: ' + field.inputFontFamily + ";";
				}
				if (field && field.inputBgColor) {
					styleString += 'background-color: ' + field.inputBgColor + "!important;";
				}
				if (field && field.inputBorderColor) {
					styleString += 'border-color: ' + field.inputBorderColor + ";";
				}
				if (field && field.inputTextColor) {
					styleString += 'color: ' + field.inputTextColor + ";";
				}
				return styleString;
			};

			scope.buttonStyle = function (btn) {
				var styleString = '';
				if (btn && btn.align) {
					if (btn.align === 'left' || btn.align === 'right') {
						styleString += 'float: ' + btn.align + ";";
					}

					if (btn.align === 'center') {
						styleString += 'margin: 0 auto;';
					}
				}
				if (btn && btn.bg && btn.bg.color) {
					styleString += ' background-color: ' + btn.bg.color + "!important;";
					styleString += ' border-color: ' + btn.bg.color + ";";

					scope.originalData.bg.color = btn.bg.color;
					scope.originalData.borderColor = btn.bg.color;
				}

				if (btn && btn.txtcolor) {
					styleString += ' color: ' + btn.txtcolor + "!important;";
					scope.originalData.txtcolor = btn.txtcolor;
				}
				if (btn && btn.border && btn.border.show) {
					if (btn.border.color) {
						styleString += ' border-color: ' + btn.border.color + '  !important;';
						scope.originalData.btn = {};
						scope.originalData.btn.border = btn.border;
					}
					if (btn.border.width) {
						styleString += ' border-width: ' + btn.border.width + 'px   !important;';
					}
					if (!btn.border.radius) {
						btn.border.radius = 0;
					}
					styleString += ' border-radius: ' + btn.border.radius + '%  !important;';

					if (btn.border.style) {
						styleString += ' border-style: ' + btn.border.style + ' !important;';
					} else {
						styleString += ' border-style: none !important;';
					}
				}
				return styleString;

			};

			scope.formStyle = function (form) {
				var styleString = '';
				if (form) {
					if (form.formFontFamily) {
						styleString += 'font-family: ' + form.formFontFamily + ";";
					}
					if (form.formTextColor) {
						styleString += 'color: ' + form.formTextColor + ";";
					}
				}
				return styleString;
			};

			function formatString(stringval) {
				return stringval.replace(/[^\w-\s]/gi, '');
			}

			function resetBoderStyle(currentComponent) {
				currentComponent.style.setProperty('border-color', "none", 'important');
				currentComponent.style.setProperty('border-width', '0px', 'important');
				currentComponent.style.setProperty('border-radius', 'none%', 'important');
				currentComponent.style.setProperty('border-style', "none", 'important');
			}


			angular.element(document).ready(function () {
				var unbindWatcher = scope.$watch(function () {
					return angular.element(scope.elementClass).length;
				}, function (newValue, oldValue) {
					if (newValue) {
						unbindWatcher();
						$timeout(function () {

							var element = angular.element(scope.elementClass),
								originalData = {
									bg: {
										color: element.css('background-color')
									},
									txtcolor: element.css('color'),
									borderColor: element.css('border-color')
								},
								btnActiveStyle = null;
							if (element) {
								// bind hover and active events to button

								element.hover(function () {
									var btnHoverStyle = null;
									if (scope.component.formSettings && scope.component.formSettings.btnStyle && scope.component.formSettings.btnStyle.hover) {
										btnHoverStyle = scope.component.formSettings.btnStyle.hover;
									}

									if (btnHoverStyle) {
										if (btnHoverStyle.bg && btnHoverStyle.bg.color) {
											this.style.setProperty('background-color', btnHoverStyle.bg.color, 'important');
											this.style.setProperty('border-color', btnHoverStyle.bg.color, 'important');
										}
										if (btnHoverStyle.border && btnHoverStyle.border.show) {
											if (btnHoverStyle.border.color) {
												this.style.setProperty('border-color', btnHoverStyle.border.color, 'important');
											}
											if (btnHoverStyle.border.width) {
												this.style.setProperty('border-width', btnHoverStyle.border.width + 'px', 'important');
											}
											if (!btnHoverStyle.border.radius) {
												btnHoverStyle.border.radius = 0;
											}
											this.style.setProperty('border-radius', btnHoverStyle.border.radius + '%', 'important');

											if (btnHoverStyle.border.style) {
												this.style.setProperty('border-style', btnHoverStyle.border.style, 'important');
											}
										} else {
											resetBoderStyle(this);
										}
									} else {
										resetBoderStyle(this);

									}
									if (btnHoverStyle && btnHoverStyle.txtcolor) {
										this.style.setProperty('color', btnHoverStyle.txtcolor, 'important');
									}

								}, function () {
									resetBoderStyle(this);
									this.style.setProperty('background-color', (scope.originalData.bg.color || originalData.bg.color), 'important');
									this.style.setProperty('color', (scope.originalData.txtcolor || originalData.txtcolor), 'important');
									this.style.setProperty('border-color',
										(scope.originalData.borderColor || originalData.borderColor), 'important');
									var btn = scope.originalData.btn  || scope.component.btn;
									if (btn && btn.border && btn.border.show) {
										if (btn.border.color) {
											this.style.setProperty('border-color', btn.border.color, 'important');
										}
										if (btn.border.width) {
											this.style.setProperty('border-width', btn.border.width + 'px', 'important');
										}
										if (!btn.border.radius) {
											btn.border.radius = 0;
										}
										this.style.setProperty('border-radius', btn.border.radius + '%', 'important');

										if (btn.border.style) {
											this.style.setProperty('border-style', btn.border.style, 'important');
										}
									}
								});

								element.on("mousedown touchstart", function () {
									if (scope.component.formSettings && scope.component.formSettings.btnStyle && scope.component.formSettings.btnStyle.pressed) {
										btnActiveStyle = scope.component.formSettings.btnStyle.pressed;
									}
									if (btnActiveStyle) {
										if (btnActiveStyle.bg && btnActiveStyle.bg.color) {
											this.style.setProperty('background-color', btnActiveStyle.bg.color, 'important');
											this.style.setProperty('border-color', btnActiveStyle.bg.color, 'important');
										}
										if (btnActiveStyle.border && btnActiveStyle.border.show) {
											if (btnActiveStyle.border.color) {
												this.style.setProperty('border-color', btnActiveStyle.border.color, 'important');
											}
											if (btnActiveStyle.border.width) {
												this.style.setProperty('border-width', btnActiveStyle.border.width + 'px', 'important');
											}
											if (!btnActiveStyle.border.radius) {
												btnActiveStyle.border.radius = 0;
											}
											this.style.setProperty('border-radius', btnActiveStyle.border.radius + '%', 'important');

											if (btnActiveStyle.border.style) {
												this.style.setProperty('border-style', btnActiveStyle.border.style, 'important');
											} else {
												this.style.setProperty('border-style', "none", 'important');
											}
										} else {
											resetBoderStyle(this);
										}
									} else {
										resetBoderStyle(this);

									}
									if (btnActiveStyle && btnActiveStyle.txtcolor) {
										this.style.setProperty('color', btnActiveStyle.txtcolor, 'important');
									}
								});

								element.on("mouseup touchend", function () {
									var elem = this;
									$timeout(function () {
										resetBoderStyle(elem);
										elem.style.setProperty('background-color', (scope.originalData.bg.color || originalData.bg.color), 'important');
										elem.style.setProperty('color', (scope.originalData.txtcolor || originalData.txtcolor), 'important');
										elem.style.setProperty('border-color', (scope.originalData.borderColor || originalData.borderColor), 'important');
										var btn = scope.originalData.btn || scope.component.btn;
										if (btn && btn.border && btn.border.show) {
											if (btn.border.color) {
												elem.style.setProperty('border-color', btn.border.color, 'important');
											}
											if (btn.border.width) {
												elem.style.setProperty('border-width', btn.border.width + 'px', 'important');
											}
											if (!btn.border.radius) {
												btn.border.radius = 0;
											}
											elem.style.setProperty('border-radius', btn.border.radius + '%', 'important');
											elem.style.setProperty('border-style', (btn.border.style || "none"), 'important');
										}
									}, 1000);
								});
							}
						}, 500);
					}
				});
			});

			scope.formValidations = formValidations;
			scope.user = {};
			scope.createUser = function (simpleForm) {

				scope.userExists = false;
				scope.isBusy = true;
				//var fingerprint = new Fingerprint().get(),
				var	sessionId = ipCookie("session_cookie") ? ipCookie("session_cookie").id : null,
					skipWelcomeEmail;

				if (scope.component.skipWelcomeEmail) {
					skipWelcomeEmail = true;
				}

				var sendEmailId = scope.component.sendEmail === "true";

				var _campaignId;
				if (!scope.component.campaignId || sendEmailId) {
					scope.component.campaignId = '';
				} else {
					_campaignId = scope.component.campaignId;
				}

				var _campaignTags = [];
				if (campaignObj && angular.isDefined(campaignObj.searchTags) && campaignObj.searchTags.tags.length) {
					_campaignTags = _.uniq(_.pluck(campaignObj.searchTags.tags, 'data'));
				}

				var extra = [],
					params = $location.$$search,
					activityFields = angular.copy(scope.user);


				if (angular.isObject(params) && Object.keys(params).length) {
					_.each(params, function (value, key) {
						extra.push({
							name: formatString(key),
							value: formatString(value)
						});
						activityFields[key] = value;
					});
				}
				new Fingerprint2().get(function(fingerprint, components){ 
					var formatted = {
						fingerprint: fingerprint,
						sessionId: sessionId,
						first: scope.user.first,
						last: scope.user.last,
						details: [
							{
								emails: [],
								phones: []
							}],
						campaignId: _campaignId,
						campaignTags: _campaignTags,
						emailId: scope.component.emailId,
						sendEmail: scope.component.sendEmail,
						skipWelcomeEmail: skipWelcomeEmail,
						fromEmail: scope.component.fromEmail,
						fromName: scope.component.fromName,
						contact_type: scope.component.tags,
						uniqueEmail: scope.component.uniqueEmail || false,
						activity: {
							activityType: 'CONTACT_FORM',
							note: scope.user.message || "Contact form data.",
							sessionId: ipCookie("session_cookie") ? ipCookie("session_cookie").id : null,
							contact: activityFields
						}
					};
					formatted.details[0].emails.push({
						email: (scope.user.email && scope.user.email !== "") ?scope.user.email.toLowerCase() :scope.user.email
	
					});
					if (scope.user.phone || scope.user.extension) {
						formatted.details[0].phones.push({
							number: scope.user.phone,
							extension: scope.user.extension,
							type: 'm'
						});
					}
					if (extra.length) {
						formatted.extra = extra;
					}
					if (scope.user._optin) {
						formatted.optIn = scope.user._optin;
					}
					//create contact
					userService.addContact(formatted, function (data, err) {
						scope.isBusy = false;
						if (err && err.code === 409) {
							scope.userExists = true;
						} else if (err && err.code !== 409) {
							scope.formError = true;
							$timeout(function () {
								scope.formError = false;
							}, 5000);
						} else if (data) {
							// This variant of the FB Tracking pixel is going away in late 2016
							// Ref: https://www.facebook.com/business/help/373979379354234
							if (scope.component.facebookConversionCode) {
								var _fbq = window._fbq || (window._fbq = []);
								if (!_fbq.loaded) {
									var fbds = document.createElement('script');
									fbds.async = true;
									fbds.src = '//connect.facebook.net/en_US/fbds.js';
									var s = document.getElementsByTagName('script')[0];
									s.parentNode.insertBefore(fbds, s);
									_fbq.loaded = true;
								}
								window._fbq = window._fbq || [];
								window._fbq.push(['track', scope.component.facebookConversionCode, {
									'value': '0.00',
									'currency': 'USD'
								}]);
							}

							if (!scope.component.redirect) {
								scope.formSuccess = true;
								scope.user = {};
								simpleForm.$setPristine(true);

								$timeout(function () {
									scope.formSuccess = false;
								}, 3000);
							} else {
								scope.formSuccess = true;
								scope.user = {};
								simpleForm.$setPristine(true);

								$timeout(function () {
									scope.formSuccess = false;
								}, 3000);
								if(scope.component.redirectUrl){
									if (scope.component.redirectType === 'page') {
										window.location.pathname = scope.component.redirectUrl;
									}
									if (scope.component.redirectType === 'external') {
										window.location.href = scope.component.redirectUrl;
									}
								}
							}

						}
					});  
				});  
			};
		}
	};
}]);
