/*global app*/
app.directive('videoGalleryComponent', function () {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html'
	};
});
