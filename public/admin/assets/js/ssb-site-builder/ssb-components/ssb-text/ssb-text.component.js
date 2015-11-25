(function(){

app.directive('ssbTextComponent', ssbTextComponent);

function ssbTextComponent($compile) {
  return {
  	// transclude: true,
  	restrict: 'A',
  	controller: 'SiteBuilderTextComponentController',
  	controllerAs: 'vm',
  	bindToController: true,
    scope: {
      ssbEditor: '=',
      componentClass: '&',
      component: '='
    },
    templateUrl: 'assets/js/ssb-site-builder/ssb-components/ssb-text/ssb-text.component.html',
    replace: true,
  	link: function (scope, element, attrs, ctrl) {
  		ctrl.init(element);
  	}
  }

}

})();
