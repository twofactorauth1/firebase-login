app.directive('meetTeamComponent',["$window", function ($window) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
		scope.resizeTeamTiles = function (argument) {
			var parent_id = scope.component.anchor || scope.component._id;
		    var element = angular.element("#"+parent_id + " div.meet-team-height")
		    if (element && element.length) {
		      var maxTeamHeight = Math.max.apply(null, element.map(function () {
		        return this.offsetHeight;
		      }).get());
		      scope.maxTeamHeight = maxTeamHeight;
		      element.css("min-height", maxTeamHeight + 1);
		    }
		};
		function resetHeight(){
			var parent_id = scope.component.anchor || scope.component._id;
		    var element = angular.element("#"+parent_id + " div.meet-team-height")
			element.css("min-height", scope.maxTeamHeight);
		}			
		angular.element($window).bind('resize', function () {
			resetHeight();
			scope.resizeTeamTiles();
		});
		angular.element(document).ready(function () {
			setTimeout(function () {
			  scope.resizeTeamTiles();
			}, 2000)
		});
    }
  }
}]);