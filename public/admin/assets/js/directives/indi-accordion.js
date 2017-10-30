/*global angular  */

app.directive('indiAccordion', function ($timeout) {

	'use strict';
	return {
		restrict: 'E',		
		link: function (scope, element, attr) {
			scope.$watch(
				function () {
					return element.find(".accordion").length;
				},
				function (value) {
					var acc = element.find(".accordion");
					var i;
					
					for (i = 0; i < acc.length; i++) {
					    acc[i].onclick = function(){
					    	var el = element;
					    	if(!$(this).hasClass("active")){
					    		element.find(".accordion").removeClass("active")
					    	}					    	
					        this.classList.toggle("active");
					    }
					}
				}
			);
		}
	};
});
