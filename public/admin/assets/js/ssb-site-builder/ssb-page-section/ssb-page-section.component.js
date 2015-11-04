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
    	components: '=',
    	layout: '='
    },
    replace: true,
	link: function (scope, element, attrs, ctrl) {
		ctrl.init(element);
	}
  }

}

})();