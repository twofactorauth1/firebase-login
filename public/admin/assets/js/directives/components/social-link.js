/*global app ,console */
/*jslint unparam:true*/
/* eslint-disable no-console */
app.directive('socialLinkComponent', ["$modal", "$timeout", function ($modal, $timeout) {
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
					console.log('onSort', evt);
				},
				onStart: function (evt) {
					console.log('onStart', evt);
				},
				onEnd: function (evt) {
					console.log('end', evt);
				}
			};


			$timeout(function () {
				scope.loadSocialLinks = true;
			}, 500);
		}
	};
}]);
