/*global app  */
/*jslint unparam:true*/
/* eslint-disable no-console */
app.directive('textOnlyComponent', function () {
	"use strict";
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
