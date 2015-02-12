define(['angularAMD'], function(angularAMD) {'use strict';
	angularAMD.directive('indigewebValidateFormFields', function() {
		return {
			restrict : 'A',
			require : 'ngModel',
			scope : {
				validationType: '@'
			},
			link : function(scope, el, attrs, ctrl) {				
				var parent_div = el.closest('div.form-group');				
				scope.$watch(function() {
					var type = scope.validationType;
					switch(type) {
						case "email":
							if (ctrl.$error.email) {
								parent_div.addClass('has-error');
								parent_div.find('span.error').remove();
								parent_div.append("<span class='error help-block'>Please enter a valid email</span>");
							} else {
								parent_div.removeClass('has-error');
								parent_div.find('span.error').remove();
							}
							break;
						case "phone":
							var regex = /^(\+?1-?\s?)*(\([0-9]{3}\)\s*|[0-9]{3}-)[0-9]{3}-[0-9]{4}|[0-9]{10}|[0-9]{3}-[0-9]{4}$/;
							var result = regex.test(el.val());
							if (!result) {
								parent_div.addClass('has-error');
								parent_div.find('span.error').remove();
								parent_div.append("<span class='error help-block'>Please enter a valid number</span>");
								ctrl.$setValidity('phoneError', false);
							} else {
								parent_div.removeClass('has-error');
								parent_div.find('span.error').remove();
								ctrl.$setValidity('phoneError', true);
							}
							break;
						case "zip":
						var regex = /(^\s*$|^\d{5}$)|(^\d{5}-\d{4}$)/;
						var result = regex.test(el.val());
						if (!result) {
							parent_div.addClass('has-error');
							parent_div.find('span.error').remove();
							parent_div.append("<span class='error help-block'>Please enter a valid Zip code</span>");
							ctrl.$setValidity('zipError', false);
						} else {
							parent_div.removeClass('has-error');
							parent_div.find('span.error').remove();
							ctrl.$setValidity('zipError', true);
						}
						break;
					}
				});
			}
		}
	});

})