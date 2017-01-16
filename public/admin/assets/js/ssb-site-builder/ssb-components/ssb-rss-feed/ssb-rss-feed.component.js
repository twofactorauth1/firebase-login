(function(){

app.directive('ssbRssFeedComponent', ssbRssFeedComponent);

function ssbRssFeedComponent() {
  return {
  	// transclude: true,
  	restrict: 'A',
  	controller: 'SiteBuilderRssFeedComponentController',
  	controllerAs: 'vm',
  	bindToController: true,
    scope: {
      ssbEditor: '=',
      componentClass: '&',
      component: '='
    },
    templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/shared/ssb-component-wrap.html',
    replace: true,
  	link: function (scope, element, attrs, ctrl) {
  		ctrl.init(element);
  	}
  }

}

})();