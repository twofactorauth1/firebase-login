(function(){

app.directive('ssbComponentLoader', ssbComponentLoader);

ssbComponentLoader.$inject = ['$compile', '$timeout'];
/* @ngInject */
function ssbComponentLoader($compile, $timeout) {
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
        componentStyle: '&',
        componentControl: '=',
        componentMedia: '=',
        index: '=',
        sectionIndex: '='
      },
    replace: true,
  	link: function (scope, element, attrs, ctrl) {
        var newEl;
  		var template = '<div ' + ctrl.component.type + '-component ' +
                        'id="component_' + ctrl.component._id + '" ' +
                        'component="vm.component" ' +
                        'website="vm.website" ' +
                        'state="vm.state" ' +
                        'ui-state="vm.uiState" ' +
                        'ssb-editor="true" ' +
                        'class="ssb-component ssb-{{vm.component.type}} {{vm.componentClass(vm.component)}}" ' +
                        'ng-attr-style="{{vm.componentStyle(vm.component)}}" ' +
                        'control="vm.componentControl"' +
                        'media="vm.componentMedia(componentId, index, update)" ' +
                        'ng-mouseenter="vm.hover($event);">' +
                      '</div>';

        //if edit mode
        if (ctrl.uiState) {
            template = '<ssb-edit-control ' +
                            'ng-if="vm.uiState.hoveredSectionIndex === vm.sectionIndex && vm.uiState.hoveredComponentIndex === vm.index" ' +
                            'class="ssb-edit-control ssb-edit-control-component" ' +
                            'component="vm.component" ' +
                            'state="vm.state" ' +
                            'ui-state="vm.uiState" ' +
                            'index="vm.index" ' +
                            'section-index="vm.sectionIndex">' +
                        '</ssb-edit-control>\n' +
                        template;
        }

  		var compiled = $compile(template)(scope)
        element.replaceWith(compiled);

        $timeout(function() {
            newEl = angular.element('#component_' + ctrl.component._id);
            ctrl.init(newEl);
        });

  	}
  }

}

})();
