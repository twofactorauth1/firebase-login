(function(){

app.directive('ssbRecentPostSectionComponent', ssbBolgRecentPostComponent);

function ssbBolgRecentPostComponent() {
  return {
  	restrict: 'A',
  	controller: 'SiteBuilderBolgRecentPostComponentController',
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
