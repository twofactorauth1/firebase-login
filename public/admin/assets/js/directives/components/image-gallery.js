/*global app,  angular */
/*jslint unparam:true*/
app.directive('imageGalleryComponent', function ($timeout) {
	'use strict';
	return {
		scope: {
			component: '=',
			media: '&',
			ssbEditor: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			scope.isEditing = true;
			scope.$parent.$watch('vm.uiState.loaded', function (newValue, oldValue) {
				if (newValue) {
					scope.dataLoaded = true;
				}
			});
			/*
			 * @addImageFromMedia
			 * -
			 */

			scope.addImageFromMedia = function (componentId, index, update) {
				scope.media({
					componentId: componentId,
					index: index,
					update: update,
					fields: {
						title: '<span style="font-size: 30px;" class="c'+index+'">Service Title Here</span>'
					}
				});
			};

			/*
			 * @deleteImageFromGallery
			 * -
			 */

			scope.deleteImageFromGallery = function (index) {
				scope.$broadcast('$refreshSlickSlider', index);
				var images = angular.copy(scope.component.images);
				if (scope.component.elementStyles) {
					var imagesCollectionSize = scope.component.images.length;
					var data = { "details": {} };
					for (var t = 0; t < imagesCollectionSize; t++) {
						if (t == index) {
							if (scope.component.elementStyles["image/details"] &&
								scope.component.elementStyles["image/details"][t]) {
								data["details"][index] = {}; 
							}
						} else {
							var newIndex = t;
							if (t > index) {
								newIndex -= 1;
							}
							if (scope.component.elementStyles["image/details"] &&
								scope.component.elementStyles["image/details"][t]) {
								data["details"][newIndex] = scope.component.elementStyles["image/details"][t];
								if (t !== newIndex) {
									delete data["details"][newIndex]["_id"];
									delete data["details"][newIndex]["id"];
									delete data["details"][newIndex]["anchor"];
								}
							}
						}
					}
					scope.component.elementStyles["image/details"] = data["details"];
					console.log(scope.component)
				}
				images.splice(index, 1); 
				scope.component.images = images;
				
			};

			scope.touchMove = false;
			scope.draggable = false;
			scope.autoplay = false;
		}
	};
});
