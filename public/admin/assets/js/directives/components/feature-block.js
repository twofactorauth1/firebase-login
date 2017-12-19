/*global app */
/*jslint unparam:true*/
app.directive('featureBlockComponent', ['$timeout', function ($timeout) {
	'use strict';
	return {
		scope: {
			component: '=',
			ssbEditor: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			$timeout(function(){
				scope.isEditing = true;
			},0);
		}
	};
}]);
