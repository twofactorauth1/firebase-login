/*global app*/
/*jslint unparam:true*/
app.directive('imageGalleryComponent', function () {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			scope.touchMove = true;
			scope.draggable = true;
			scope.autoplay = true;
			scope.dataLoaded = true;
		}
	};
});
