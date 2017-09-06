/*global app*/
(function () {
	"use strict";
	app.directive('ssbBlogPostCardComponent', function () {
		return {
			// transclude: true,
			restrict: 'A',
			controller: 'SiteBuilderBlogPostCardComponentController',
			controllerAs: 'vm',
			bindToController: true,
			scope: {
				ssbEditor: '=',
				componentClass: '&',
				component: '=',
				post: '=?',
				compactView: '=?',
				filteredPostView: '=?'
			},
			templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-blog-post/ssb-blog-post-card/ssb-blog-post-card.component.html',
			replace: true,
			link: function (scope, element, attrs, ctrl) {
				ctrl.init(element);
			}
		};

	});

}());
