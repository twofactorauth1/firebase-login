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
				$(element).removeAttr("placeholder");
				$(element).intlTelInput({utilsScript: "/js/libs/intl-tel-input/lib/libphonenumber/build/utils.js"});				
			}, 0);

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
	};
});
