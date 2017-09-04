/*global app*/
/*jslint unparam:true*/
app.directive('imageTextComponent', function () {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html'
	};
});
