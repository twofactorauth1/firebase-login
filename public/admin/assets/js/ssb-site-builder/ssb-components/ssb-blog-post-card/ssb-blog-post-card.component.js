(function(){

app.directive('ssbBlogPostCardComponent', ssbBlogPostCardComponent);

function ssbBlogPostCardComponent() {
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
        post: '=?'
    },
    templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-blog-post-card/ssb-blog-post-card.component.html',
    replace: true,
  	link: function (scope, element, attrs, ctrl) {
  		ctrl.init(element);
  	}
  }

}

})();
