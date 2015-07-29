/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('featureListComponent',['$window', function ($window) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
		scope.resizeFeatureTiles = function (argument) {
			var element = angular.element("#"+scope.component._id + " div.feature-height")
			if (element && element.length) {
			  var maxFeatureHeight = Math.max.apply(null, element.map(function () {
			    return this.offsetHeight;
			  }).get());
			  element.css("min-height", maxFeatureHeight);
			}
		};
		angular.element($window).bind('resize', function () {
			scope.resizeFeatureTiles();
		});
		angular.element(document).ready(function () {
			setTimeout(function () {
			  scope.resizeFeatureTiles();
			}, 500)
		});
    }
  };
}]);
