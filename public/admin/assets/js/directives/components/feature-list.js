/*global app, angular, $*/
/*jslint unparam:true*/
app.directive('featureListComponent', ["$window", "$timeout", function ($window, $timeout) {
	'use strict';
	return {
		scope: {
			component: '=',
			ssbEditor: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {

			scope.isEditing = true;
			scope.listStyles = listStyles;
			scope.features = {
				featureIndex: 0
			};
			scope.loading = true;
			scope.addFeatureList = function (index) {
				if (!index) {
					index = 0;
				}
				var newFeature = {
					"top": "<div style='text-align:center'><span class=\"fa fa-arrow-right\" style=\"font-size:96px;\">&zwnj;</span></div>",
					"content": "<div style=\"text-align: center;\"><br><span style=\"font-size:24px;\">Feature Title</span></div><div style=\"text-align: center;\"><br>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</div><div style=\"text-align: center;\"><br><a class=\"btn ssb-theme-btn\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></div>"
				};
				scope.component.features.splice(index + 1, 0, newFeature);
			};

			scope.addFeatureService = function (index) {
				if (!index) {
					index = 0;
				}
				var newFeature = {
					"top": "<div style='text-align:center'><span class=\"fa fa-desktop\" style=\"font-size:48px;\">&zwnj;</span></div>",
					"heading": "<div style='text-align:center'><span style=\"font-size:20px;\">TITLE</span></div>",
					"content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.",
					"media": ""
				};
				scope.component.features.splice(index + 1, 0, newFeature);
			};

			scope.deleteFeatureList = function (index) {
				scope.component.features.splice(index, 1);
			};

			scope.featureStyle = function (component) {
				var styleString = " ";

				if (component && component.blockBorder && component.blockBorder.show && component.blockBorder.color) {
					styleString += 'border-color: ' + component.blockBorder.color + ';';
					styleString += 'border-width: ' + component.blockBorder.width + 'px;';
					styleString += 'border-style: ' + component.blockBorder.style + ';';
					styleString += 'border-radius: ' + component.blockBorder.radius + '%;';
				}

				if (component.blockbgcolor) {
					styleString += 'background: ' + component.blockbgcolor;
				}

				return styleString;
			};

			scope.featureClass = function () {
				var parent_id = scope.component.anchor || scope.component._id,
					element = angular.element("#" + parent_id + " div.features-wrap");
				if (element.width() < 768) {
					return "feature-xs-width";
				} else if (element.width() < 992) {
					return "feature-sm-width";
				} else {
					return "";
				}
			};

			scope.setSelectedFeatureIndex = function (index) {
				scope.loading = true;
				scope.features.featureIndex = index;
				$timeout(function () {
					scope.loading = false;
				}, 0);
			};

			scope.setStyles = function (field) {
				var styleString = ' ';
				if (field) {
					if (field.align === 'left' || field.align === 'right') {
						styleString += 'float: ' + field.align + " !important;";
					} else if (field.align === 'center') {
						styleString += 'margin: 0 auto !important; float:none !important;';
					}
				}
				return styleString;
			};

			function listStyles(component, isActive) {

				var styleString = ' ';
				if (isActive) {
					var color = $(".list-features-" + component._id + " li.active .fr-view span:not('.fr-marker'):not('.fr-placeholder'):not(:empty):last").css("color");
					if (!color) {
						color = $(".list-features-" + component._id + " li.active").css("color");
					}
					styleString += 'border-bottom: 1px solid ' + color + ';';
				}
				return styleString;
			}
		}
	};
}]);
