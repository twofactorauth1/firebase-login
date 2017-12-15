/*global app, angular,document */
/*jslint unparam:true*/
app.directive('simpleFormComponent', ["formValidations", "$timeout", function (formValidations, $timeout) {
	'use strict';
	return {
		scope: {
			component: '=',
			ssbEditor: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			scope.isEditing = true;
			scope.nthRow = 'nth-row';
			scope.formValidations = formValidations;
			scope.elementClass = '.simple-form-' + scope.component._id + " .form-submit-button";
			scope.originalData = {
				bg: {

				}
			};
			var removeBorderStyle = function (currentComponent) {
					currentComponent.style.setProperty('border-color', "none", 'important');
					currentComponent.style.setProperty('border-width', '0px', 'important');
					currentComponent.style.setProperty('border-radius', 'none%', 'important');
					currentComponent.style.setProperty('border-style', "none", 'important');
				},
				setBorderStyle = function (currentElement, btnStyle) {
					removeBorderStyle(currentElement);
					if (btnStyle && btnStyle.border && btnStyle.border.show) {
						if (btnStyle.border.color) {
							currentElement.style.setProperty('border-color', btnStyle.border.color, 'important');
						}
						if (btnStyle.border.width) {
							currentElement.style.setProperty('border-width', btnStyle.border.width + 'px', 'important');
						}
						if (!btnStyle.border.radius) {
							btnStyle.border.radius = 0;
						}
						currentElement.style.setProperty('border-radius', btnStyle.border.radius + '%', 'important');

						if (btnStyle.border.style) {
							currentElement.style.setProperty('border-style', btnStyle.border.style, 'important');
						}
					}
				},
				nameExists;
			if (!angular.isDefined(scope.component.tags)) {
				scope.component.tags = [];
				if (scope.component.contact_type) {
					scope.component.tags.push(scope.component.contact_type);
				}
			}
			nameExists = _.find(scope.component.fields, function (_field) {
				return _field.name === 'extension';
			});
			if (!nameExists) {
				scope.component.fields.push({
					"display": "Phone Extension",
					"value": false,
					"name": "extension"
				});
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
				if (field && field.spacing && field.spacing.mb) {
					styleString += 'margin-bottom: ' + field.spacing.mb + 'px;';
				}
				return styleString;
			};

			scope.inputStyle = function (field) {
				var styleString = ' ';
				if (field) {
					if (field.align) {
						styleString += 'text-align: ' + field.align + ";";
					}
					if (field.inputTextSize) {
						styleString += 'font-size: ' + field.inputTextSize + 'px !important;';
					}
					if (field.inputFontFamily) {
						styleString += 'font-family: ' + field.inputFontFamily + ";";
					}
					if (field.inputBgColor) {
						styleString += 'background-color: ' + field.inputBgColor + "!important;";
					}
					if (field.inputBorderColor) {
						styleString += 'border-color: ' + field.inputBorderColor + ";";
					}
					if (field.inputTextColor) {
						styleString += 'color: ' + field.inputTextColor + ";";
					}
				}
				return styleString;
			};

			scope.buttonStyle = function (btn) {
				var styleString = '';
				if (btn) {
					if (btn.align) {
						if (btn.align === 'left' || btn.align === 'right') {
							styleString += 'float: ' + btn.align + ";";
						} else if (btn.align === 'center') {
							styleString += 'margin: 0 auto;';
						}
					}
					if (btn.bg && btn.bg.color) {
						styleString += ' background-color: ' + btn.bg.color + "!important;";
						styleString += ' border-color: ' + btn.bg.color + ";";

						scope.originalData.bg.color = btn.bg.color;
						scope.originalData.borderColor = btn.bg.color;
					}

					if (btn.txtcolor) {
						styleString += ' color: ' + btn.txtcolor + "!important;";
						scope.originalData.txtcolor = btn.txtcolor;
					}
					if (btn.border && btn.border.show) {
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
				}
				return styleString;
			};

			scope.formStyle = function (form) {
				var styleString = '';
				if (form) {					
					if (form.formTextColor) {
						styleString += 'color: ' + form.formTextColor + ";";
					}
				}
				return styleString;
			};
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
										setBorderStyle(this, btnHoverStyle);
									}
									if (btnHoverStyle && btnHoverStyle.txtcolor) {
										this.style.setProperty('color', btnHoverStyle.txtcolor, 'important');
									}

								}, function () {
									this.style.setProperty('background-color', (scope.originalData.bg.color || originalData.bg.color), 'important');
									this.style.setProperty('color', (scope.originalData.txtcolor || originalData.txtcolor), 'important');
									this.style.setProperty('border-color', (scope.originalData.borderColor || originalData.borderColor), 'important');
									setBorderStyle(this, (scope.originalData.btn || scope.component.btn));

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
										setBorderStyle(this, btnActiveStyle);
									}
									if (btnActiveStyle && btnActiveStyle.txtcolor) {
										this.style.setProperty('color', btnActiveStyle.txtcolor, 'important');
									}
								});


								element.on("mouseup touchend", function () {
									var elem = this;
									$timeout(function () {
										elem.style.setProperty('background-color', (scope.originalData.bg.color || originalData.bg.color), 'important');
										elem.style.setProperty('color', (scope.originalData.txtcolor || originalData.txtcolor), 'important');
										elem.style.setProperty('border-color', (scope.originalData.borderColor || originalData.borderColor), 'important');
										setBorderStyle(elem, (scope.originalData.btn || scope.component.btn));
									}, 1000);
								});


							}
						}, 500);
					}
				});
			});

		}
	};
}]);
