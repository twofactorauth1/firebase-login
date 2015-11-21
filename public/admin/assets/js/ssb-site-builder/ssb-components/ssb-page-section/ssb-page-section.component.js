(function(){

app.directive('ssbPageSection', ssbPageSection);

function ssbPageSection($compile) {
  return {
  	// transclude: true,
  	restrict: 'E',
  	controller: 'SiteBuilderPageSectionController',
  	controllerAs: 'vm',
  	bindToController: true,
    scope: {
    	section: '=',
      index: '=',
      state: '=',
      uiState: '='
    },
    templateUrl: 'assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.edit.html',
    replace: true,
  	link: function (scope, element, attrs, ctrl) {
  		ctrl.init(element);
  	}
  }

}

})();
