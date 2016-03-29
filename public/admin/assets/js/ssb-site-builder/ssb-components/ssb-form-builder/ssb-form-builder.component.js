(function(){

app.directive('ssbFormBuilderComponent', ssbFormBuilderComponent);

function ssbFormBuilderComponent() {
  return {
  	// transclude: true,
  	restrict: 'A',
  	controller: 'SiteBuilderFormBuilderComponentController',
  	controllerAs: 'vm',
  	bindToController: true,
    scope: {
      ssbEditor: '=',
      componentClass: '&',
      component: '='
    },
    templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-form-builder/ssb-form-builder.component.html',
    replace: true,
  	link: function (scope, element, attrs, ctrl) {
  		ctrl.init(element);      
  	}
  }

}

})();
