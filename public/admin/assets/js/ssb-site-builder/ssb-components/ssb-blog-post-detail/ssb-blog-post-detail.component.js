(function(){

app.directive('ssbBlogPostDetailComponent', ssbBlogPostDetailComponent);

function ssbBlogPostDetailComponent() {
  return {
  	// transclude: true,
  	restrict: 'A',
  	controller: 'SiteBuilderBlogPostDetailComponentController',
  	controllerAs: 'vm',
  	bindToController: true,
    scope: {
      ssbEditor: '=',
      componentClass: '&',
      component: '='
    },
    templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-blog-post-detail/ssb-blog-post-detail.component.html',
    replace: true,
  	link: function (scope, element, attrs, ctrl) {
  		ctrl.init(element);
  	}
  }

}

})();
