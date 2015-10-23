app.directive('ssbComponentLoader', ssbComponentLoader);

function ssbComponentLoader($compile) {
  return {
  	restrict: 'E',
	controller: 'SiteBuilderComponentLoaderController',
	controllerAs: 'vm',
	bindToController: true,
    scope: { 
    	component: "="
    },
    replace: true,
	link: function (scope, element, attrs, ctrl) {
		var template = '<div ' + ctrl.component.type + '-component component="vm.component"></div>';
		element.append($compile(template)(scope));
	}
  }

}

// scope: {
//     page: '='
// },
// templateUrl: 'assets/js/ssb-site-builder/ssb-flyover/ssb-flyover.component.html',
// controller: 'SiteBuilderFlyoverController',
// controllerAs: 'vm',
// bindToController: true,
// link: function(scope, element, attrs, ctrl) {
//     ctrl.init(element);
// }