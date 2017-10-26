/*global app, angular, $*/
/*jslint unparam:true*/
app.directive('featureListComponent', [function () {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			function listStyles(component, isActive) {

				var styleString = ' ',
					color;
				if (isActive && !component.hideActiveFeautureUnderline) {
					color = $(".list-features-" + component._id + " li.active .fr-view span:not('.fr-marker'):not('.fr-placeholder'):not(:empty):last").css("color");
					if (!color) {
						color = $(".list-features-" + component._id + " li.active").css("color");
					}
					styleString += 'border-bottom: 1px solid ' + color + ';';
				}
				return styleString;
			}
			scope.features = {
				featureIndex: 0
			};
			scope.loading = true;
			scope.listStyles = listStyles;
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
			scope.setSelectedFeatureIndex = function (index) {
				scope.loading = true;
				scope.features.featureIndex = index;
				scope.loading = false;
				var featureImges = angular.element("#" + scope.component._id + " .feature-tab-content .col-md-5 img");
				angular.forEach(featureImges, function (el) {
					var srcFeatureImage = angular.element(el).attr("src");
					if (srcFeatureImage) {
						angular.element(el).wrap('<a href="' + srcFeatureImage + '" title="Project A" data-gallery=""></a>');
					}
				});
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
			scope.updateFeatureClass=function(styles,index){ 
				debugger
				var visibility=true;
				if(styles && styles['features[features/featureIndex]/media'] && styles['features[features/featureIndex]/media'][index] && styles['features[features/featureIndex]/media'][index].visibility===false ){
					visibility=false;
				}
				return visibility && scope.component.features[index].media && scope.component.features[index].media.indexOf('width: 0px')===-1 ;
			}
		}
	};
}]);