/*global app, $, angular */
app.directive('textOnlyComponent', ['$timeout', function ($timeout) {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html',
		controller: function ($scope, SsbPageSectionService, $compile) {

			$scope.$watchCollection(function () {
				return SsbPageSectionService.offset;
			}, function (offset) {
				$timeout(function () {
					var anchors = $("#" + $scope.component._id + " [du-smooth-scroll]"),
						stickyParent = $("#" + $scope.component._id).parent("#sticky-wrapper");
					if (anchors && stickyParent) {
						angular.forEach(anchors, function (value) {
							$(value).attr("offset", offset);
							$compile($(value))($scope);
						});
					}
				}, 100);
			});
		}
	};
}]);
