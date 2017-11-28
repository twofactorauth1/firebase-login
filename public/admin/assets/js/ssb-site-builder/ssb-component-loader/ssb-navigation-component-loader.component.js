/*global app*/
(function () {
	"use strict";
	app.directive('ssbNavigationComponentLoader', function () {
		return {
			restrict: 'E',
			scope: {
				link: "=",
				isSubLink: '=',
				currentpagehandle: '='
			},
			templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/shared/link_2.html',
			replace: true,
			controller: ['$scope', '$injector', function ($scope, $injector) {
				var SsbPageSectionService = {};
				if ($injector.has("SsbPageSectionService")) {
					SsbPageSectionService = $injector.get("SsbPageSectionService");
				}				
				$scope.toggleNavClass = function (ele) {
					var li = $(ele.target).parents("li");
					if (li) {
						var subnavul = $(li).find(".nav-sub-menu");
						if (!li.hasClass("nav-active")) {
							li.parents("section").addClass("overflow_visible");
							li.siblings().removeClass("nav-active");
							li.addClass("nav-active");
						} else {
							li.removeClass("nav-active");
							li.parents("section").removeClass("overflow_visible");
						}

						if(subnavul){
							subnavul.css("top", "");
							var offset = subnavul.offset();
							var height = subnavul.height();
							var screenHeight = $(".wrap-content").height() || $("body").innerHeight();
							if(offset.top + height >= screenHeight){
								subnavul.css("top", -height +"px");
							}
						}
					}
				};
				$scope.checkIfReloadPage = function (link) {
					if (link && link.data) {
						if (link.data === 'blog') {
							return true;
						}
					}
					return false;
				};
				$scope.$watchCollection(function () {
					return SsbPageSectionService.offset;
				}, function (offset) {
					$scope.scrollOffsetTop = offset;
				});
			}]
		};
	});
}());
