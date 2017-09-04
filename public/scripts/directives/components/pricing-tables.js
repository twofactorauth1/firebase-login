/*global app */
/*jslint unparam:true*/
app.directive('pricingTablesComponent', function () {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html'
	};
});
