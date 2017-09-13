/*global app */
/*jslint unparam:true*/
app.directive('imageTextComponent', function () {
	'use strict';
	return {
		scope: {
			component: '=',
			ssbEditor: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			scope.isEditing = true;
		}
	};
});
