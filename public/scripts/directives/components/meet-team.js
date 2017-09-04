/*global app, angular,window  */
/*jslint unparam:true*/
app.directive('meetTeamComponent', [function () {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {

			scope.teamClass = function () {
				var parent_id = scope.component.anchor || scope.component._id,
					element = angular.element("#" + parent_id + " div.team-member-wrap");
				if (element.width() < 768) {
					return "team-xs-width";
				} else if (element.width() < 992) {
					return "team-sm-width";
				} else {
					return "";
				}
			};

			// Special case for our join our team page.
			scope.gotoPage = function (team) {
				if (team.joinOurTeam) {
					var url = "https://indigenous.io/careers";
					window.location = url;
				}
			};
		}
	};
}]);
