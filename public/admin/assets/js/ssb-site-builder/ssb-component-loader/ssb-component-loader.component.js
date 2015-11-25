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
      	website: "=",
      	state: '=',
      	uiState: '=',
        componentClass: '&',
        componentStyle: '&'
      },
    replace: true,
  	link: function (scope, element, attrs, ctrl) {
  		var template = '<div ' + ctrl.component.type + '-component ' +
                        'component="vm.component" ' +
                        'website="vm.website" ' +
                        'state="vm.state" ' +
                        'ui-state="vm.uiState" ' +
                        'ssb-editor="true" ' +
                        'class="ssb-component ssb-{{vm.component.type}} {{vm.componentClass(vm.component)}}" ' +
                        'ng-attr-style="{{vm.componentStyle(vm.component)}}">' +
                      '</div>';
  		var compiled = $compile(template)(scope)
      element.replaceWith(compiled);
  	}
  }

}

})();
