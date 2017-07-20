(function(){

app.directive('ssbRecentCategoryComponent', ssbRecentCategoryComponent);

function ssbRecentCategoryComponent() {
  return {
  	restrict: 'A',
  	controller: 'ssbBolgRecentCategoryComponentController',
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
