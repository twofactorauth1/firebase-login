/*global app, angular */
/*jslint unparam:true*/
(function () {
	'use strict';
	/* @ngInject */
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
				componentStyle: '&',
				componentControl: '=',
				componentMedia: '=',
				sectionIndex: '=',
				componentIndex: '=',
				showComponent: '='
			},
			replace: true,
			link: function (scope, element, attrs, ctrl) {
				var newEl, compiled, template = '<div ' + ctrl.component.type + '-component ' +
					'id="component_' + ctrl.component._id + '" component="vm.component" ' +
					'class="ssb-component ssb-{{vm.component.type}} {{vm.component.componentClass}} {{vm.componentClass(vm.component)}}" ' +
					'ng-attr-style="{{vm.component.componentStyle}}"  ng-if="vm.showComponent">' +
					'</div>';
				//if edit mode
				if (ctrl.uiState) {
					var cmpTemplate = '<div ' + ctrl.component.type + '-component ' +
						'id="component_' + ctrl.component._id + '" ' +
						'component="vm.component" website="vm.website" ' +
						'state="vm.state" ui-state="vm.uiState" ssb-editor="true" ' +
						'class="ssb-component ssb-{{vm.component.type}} {{vm.componentClass(vm.component)}}" ' +
						'ng-attr-style="{{vm.componentStyle(vm.component)}}" ' +
						'control="vm.componentControl"' +
						'media="vm.componentMedia(componentId, index, update, fields)" ' +
						'ng-mouseenter="vm.hover($event);" ng-if="vm.showComponent"></div>';
					template = '<ssb-edit-control class="ssb-edit-control ssb-edit-control-component" ' +
						'component="vm.component" state="vm.state" ui-state="vm.uiState" ' +
						'section-index="vm.sectionIndex" component-index="vm.componentIndex">' +
						'</ssb-edit-control>\n' +
						cmpTemplate;
				}
				compiled = $compile(template)(scope);
				element.replaceWith(compiled);
				
				newEl = angular.element('#component_' + ctrl.component._id);
				ctrl.init(newEl);
			}
		};
	}
	app.directive('ssbComponentLoader', ssbComponentLoader);
	ssbComponentLoader.$inject = ['$compile'];

}());
