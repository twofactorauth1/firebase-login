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
    templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-form-donate/ssb-form-donate.component.html',
    replace: true,
  	link: function (scope, element, attrs, ctrl) {
  		ctrl.init(element);
  	}
  }

}

})();
