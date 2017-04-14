(function(){

app.directive('ssbRecentTagSectionComponent', ssbBolgRecentTagComponent);

function ssbBolgRecentTagComponent() {
  return {
  	restrict: 'A',
  	controller: 'SiteBuilderBolgRecentTagComponentController',
  	controllerAs: 'vm',
  	bindToController: true,
     scope: {
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
