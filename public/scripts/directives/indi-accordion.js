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
					        /* Toggle between adding and removing the "active" class,
					        to highlight the button that controls the panel */
					        this.classList.toggle("active");

					        /* Toggle between hiding and showing the active panel */
					        var panel = this.nextElementSibling;
					        if (panel.style.display === "block") {
					            panel.style.display = "none";
					        } else {
					            panel.style.display = "block";
					        }
					    }
					}
				}
			);
		}
	};
});
