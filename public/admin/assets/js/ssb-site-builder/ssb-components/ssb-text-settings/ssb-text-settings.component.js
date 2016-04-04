(function(){

app.directive('ssbTextSettings', ssbTextSettings);

ssbTextSettings.$inject = ['$compile'];
/* @ngInject */
function ssbTextSettings($compile) {
  return {
  	// transclude: true,
    // require: '^ssbComponentLoader',
  	restrict: 'C',
  	controller: 'SiteBuilderTextSettingsController',
  	controllerAs: 'vm',
  	bindToController: true,
    // scope: true,
  	link: function (scope, element, attrs, ctrl) {
        ctrl.init(element);
  	}
  }

}

})();
