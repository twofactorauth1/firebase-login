/*global app*/
/*jslint unparam:true*/
app.directive('featureBlockComponent', function () {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html'
	};
});
