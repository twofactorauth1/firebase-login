/*global app ,console */
/*jslint unparam:true*/
/* eslint-disable no-console */
app.directive('pricingTablesComponent', function () {
	'use strict';
	return {
		scope: {
			component: '=',
			ssbEditor: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			scope.isEditing = true;
			scope.addPricingTableFeature = function (componentId, index) {
				console.log('add feature');
			};
			scope.deletePricingTableFeature = function (componentId, index) {
				console.log('delete feature');
			};
			scope.addPricingTable = function (componentId, index) {
				console.log('add table');
			};
			scope.deletePricingTable = function (componentId, index) {
				console.log('delete table');
			};
		}
	};
});
