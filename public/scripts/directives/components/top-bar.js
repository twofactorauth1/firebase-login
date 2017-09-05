/*global app*/
app.directive('topBarComponent', function () {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			scope.getUrl = function (value) {
				if (value && !/http[s]?/.test(value)) {
					value = 'http://' + value;
				}
				return value;
			};
		}
	};
});
