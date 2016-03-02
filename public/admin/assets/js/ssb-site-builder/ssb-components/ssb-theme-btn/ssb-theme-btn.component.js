(function(){

app.directive('ssbThemeBtn', ssbThemeBtn);

ssbThemeBtn.$inject = ['$compile'];
/* @ngInject */
function ssbThemeBtn($compile) {
  return {
  	// transclude: true,
  	restrict: 'C',
  	controller: 'SiteBuilderThemeBtnController',
  	controllerAs: 'vm',
  	bindToController: true,
    // scope: {
    //     section: '=',
    //     index: '=',
    //     state: '=',
    //     uiState: '='
    // },
    // replace: true,
  	link: function (scope, element, attrs, ctrl) {
  		ctrl.init(element);
  	}
  }

}

})();
