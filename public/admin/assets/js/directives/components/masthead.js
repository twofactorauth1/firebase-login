/*global app, angular, window ,console ,$ */
/*jslint unparam:true*/
/* eslint-disable no-console */
app.directive('mastheadComponent', ['$window', '$timeout', 'SimpleSiteBuilderService', function ($window, $timeout, SimpleSiteBuilderService) {
	'use strict';
	return {
		scope: {
			component: '=',
			ssbEditor: '='
		},
		templateUrl: '/components/component-wrap.html',

		link: function (scope) {

			scope.addUndernavImages = function () {
				scope.addUndernavClasses = (scope.component.bg && scope.component.bg.img && scope.component.bg.img.url && scope.component.bg.img.show && scope.component.bg.img.undernav);
			};

			angular.element('body').on("click", ".navbar-toggle", function () {
				scope.setUnderbnavMargin();
			});

			angular.element($window).bind('resize', function () {
				console.log("resize");
				scope.setUnderbnavMargin();
			});

			scope.setUnderbnavMargin = function () {

				scope.allowUndernav = false;
				scope.addBgImage = true;

				SimpleSiteBuilderService.addUnderNavSetting(scope.component._id, function (data) {
					scope.allowUndernav = data.allowUndernav;
					scope.navComponent = data.navComponent;
				});

				scope.addUndernavImages();

				$timeout(function () {

					var mastheadElement = angular.element(".component_wrap_" + scope.component._id + ".undernav200"),
						mastheadUnderNavElement = angular.element(".masthead_" + scope.component._id + ".mastHeadUndernav");

					if (scope.addUndernavClasses && scope.allowUndernav) {

						var navHeight = angular.element(".undernav").height(),
							margin,
							impmargin,
							addNavBg = true;
						if (scope.navComponent) {
							navHeight = angular.element(".component_wrap_" + scope.navComponent._id + ".undernav").height();
						}
						margin = navHeight;
						impmargin = "margin-top: -" + margin + 'px !important';


						if (mastheadElement) {
							mastheadElement.attr('style', impmargin);
							//mastheadElement.addClass("masthead-undernav");
						}



						angular.element(".undernav").addClass("nav-undernav");

						addNavBg = !(scope.navComponent && scope.navComponent.bg && scope.navComponent.bg.img && !scope.navComponent.bg.img.show && scope.navComponent.bg.color);
						if (addNavBg) {
							angular.element(".nav-undernav .bg").addClass("bg-nav-undernav");
						} else {
							angular.element(".nav-undernav .bg").removeClass("bg-nav-undernav");
							angular.element(".undernav").closest('li.fragment').addClass("li-nav-undernav");
						}

						if (mastheadUnderNavElement) {
							mastheadUnderNavElement.css("height", margin);
						}

						if (angular.element(".masthead-actions")) {
							angular.element(".masthead-actions").addClass("hover-action");
						}


					} else {

						if (mastheadElement) {
							mastheadElement.attr('style', "margin-top:0px");
						}
						if (angular.element(".masthead-actions")) {
							angular.element(".masthead-actions").removeClass("hover-action");
						}

						angular.element(".nav-undernav .bg").removeClass("bg-nav-undernav");
						angular.element(".undernav").removeClass("nav-undernav");

						//mastheadElement.removeClass("masthead-undernav");
						angular.element(".undernav").closest('li.fragment').removeClass("li-nav-undernav");
					}

					$(window).trigger('scroll');

				}, 2000);
			};

			scope.$watch('component.bg.img', function (newValue, oldValue) {
				if (angular.isDefined(newValue)) {
					console.log("Watch performed");
					scope.setUnderbnavMargin();
				}
			}, true);

			scope.isEditing = true;

		}
	};

}]);
