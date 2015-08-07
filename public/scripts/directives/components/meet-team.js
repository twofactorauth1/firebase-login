app.directive('meetTeamComponent',["$window", function ($window) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
		scope.resizeTeamTiles = function (argument) {
		    var element = angular.element("#"+scope.component._id + " div.meet-team-height")
		    if (element && element.length) {
		      var maxTeamHeight = Math.max.apply(null, element.map(function () {
		        return this.offsetHeight;
		      }).get());
		      element.css("min-height", maxTeamHeight);
		    }
		};			
		angular.element($window).bind('resize', function () {
			scope.resizeTeamTiles();
		});
		angular.element(document).ready(function () {
			setTimeout(function () {
			  scope.resizeTeamTiles();
			}, 500)
		});
    }
  }
}]);