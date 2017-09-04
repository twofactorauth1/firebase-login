/*global app*/
app.directive('socialLinkComponent', ["$timeout", function ($timeout) {
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

			$timeout(function () {
				scope.loadSocialLinks = true;
			}, 500);

		}
	};
}]);
