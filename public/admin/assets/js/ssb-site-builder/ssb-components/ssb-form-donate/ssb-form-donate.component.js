(function(){

app.directive('ssbFormDonateComponent', ssbFormDonateComponent);

function ssbFormDonateComponent() {
  return {
  	// transclude: true,
  	restrict: 'A',
  	controller: 'SiteBuilderFormDonateComponentController',
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
