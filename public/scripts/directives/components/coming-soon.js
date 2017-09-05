/*global app,*/
/*jslint unparam:true*/
app.directive('comingSoonComponent', function () {

	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html'
	};
});
