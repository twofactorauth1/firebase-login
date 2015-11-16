/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('featureListComponent',['$window', function ($window) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
		scope.resizeFeatureTiles = function (argument) {
			var parent_id = scope.component.anchor || scope.component._id;
			var element = angular.element("#"+parent_id + " div.feature-height");
			if (element && element.length) {
			  var maxFeatureHeight = Math.max.apply(null, element.map(function () {
			    return this.offsetHeight;
			  }).get());
			  scope.maxFeatureHeight = maxFeatureHeight;
			  element.css("min-height", maxFeatureHeight + 1);
			}
		};
		function resetHeight(){
			var parent_id = scope.component.anchor || scope.component._id;
			var element = angular.element("#"+parent_id + " div.feature-height");
			element.css("min-height", scope.maxFeatureHeight);
		}
		angular.element($window).bind('resize', function () {	
			resetHeight();		
			scope.resizeFeatureTiles();
		});
		angular.element(document).ready(function () {
			setTimeout(function () {
			  scope.resizeFeatureTiles();
			}, 2000)
		});
    }
  };
}]);
