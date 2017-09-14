/*global app , console */
/*jslint unparam:true*/
/* eslint-disable no-console */
app.directive('topBarComponent', function () {
	'use strict';
	return {
		scope: {
			component: '=',
			ssbEditor: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			scope.isEditing = true;
			scope.sortableConfig = {
				animation: 150,
				onSort: function (evt) {
					console.log(evt);

				},
				onStart: function (evt) {
					console.log(evt);
					if (scope.$parent.vm) {
						scope.$parent.vm.uiState.sortableListPageContentConfig.disabled = true;
					}
				},
				onEnd: function (evt) {
					console.log(evt);
				}
			};
		}
	};
});
