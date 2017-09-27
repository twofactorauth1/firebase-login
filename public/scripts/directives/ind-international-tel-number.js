/*global app,$ ,angular  */
app.directive('indInternationalTelNumber', function ($timeout, $window) {
	'use strict';
	return {
		restrict: 'A',
		require: 'ngModel',
		scope: {
			form: '@form'
		},
		link: function (scope, element, attrs, ngModel) {
			$timeout(function () {
				if(attrs.name === 'phone'){
					$(element).removeAttr("placeholder");
					$(element).intlTelInput({
						nationalMode: false,
						utilsScript: "/js/libs_misc/intl-tel-input/build/js/utils.js"
					});

					if(scope.form){

						$(element).on("open:countrydropdown", function(e) {
  							$(element).parents("section").addClass("overflow_visible-without-index");
						});

						$(element).on("close:countrydropdown", function(e) {
	  						$(element).parents("section").removeClass("overflow_visible-without-index");
						});

						scope.$watch(function () {
		              		return ngModel.$modelValue;
		            	}, function(newValue) {
			            	if(newValue){
			            		scope.$parent[scope.form][attrs.name].$setValidity(attrs.name, $(element).intlTelInput("isValidNumber"));
			            	}
			            	else{
			            		scope.$parent[scope.form][attrs.name].$setValidity(attrs.name, true);
			            	}
		           		});
					}
					
				}			
			}, 0);
		}
	};
});
