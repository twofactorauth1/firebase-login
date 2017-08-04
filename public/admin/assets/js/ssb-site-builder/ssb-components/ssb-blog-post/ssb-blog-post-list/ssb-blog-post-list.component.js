(function(){

app.directive('ssbBlogPostListComponent', ssbBlogPostListComponent);

function ssbBlogPostListComponent() {
  return {
  	// transclude: true,
  	restrict: 'A',
  	controller: 'SiteBuilderBlogPostListComponentController',
  	controllerAs: 'vm',
  	bindToController: true,
    scope: {
        ssbEditor: '=',
        componentClass: '&',
        component: '=',
        blog: '=?'
    },
    templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-blog-post/ssb-blog-post-list/ssb-blog-post-list.component.html',
    replace: true,
  	link: function (scope, element, attrs, ctrl) {
  		ctrl.init(element);
  	}
  }

}

})();
