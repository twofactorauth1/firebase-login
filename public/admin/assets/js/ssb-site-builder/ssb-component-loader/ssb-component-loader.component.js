(function(){

app.directive('ssbComponentLoader', ssbComponentLoader);

function ssbComponentLoader($compile) {
  return {
  	restrict: 'E',
	controller: 'SiteBuilderComponentLoaderController',
	controllerAs: 'vm',
	bindToController: true,
    scope: { 
    	component: "=",
    	state: '=',
    	uiState: '='
    },
    replace: true,
	link: function (scope, element, attrs, ctrl) {
		var template = '<div ' + ctrl.component.type + '-component component="vm.component"></div>';
		element.append($compile(template)(scope));
	}
  }

}

})();