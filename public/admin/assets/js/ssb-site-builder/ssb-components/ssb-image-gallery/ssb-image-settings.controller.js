/*global app,  console ,angular */
/*jslint unparam:true*/
/* eslint-disable no-console */
(function () {
	app.controller('SiteBuilderImageSettingsController', ssbImageSettingsController);
	ssbImageSettingsController.$inject = ['$rootScope', '$scope', '$attrs', '$filter', '$timeout', '$compile', '$window'];
	/* @ngInject */
	function ssbImageSettingsController($rootScope, $scope, $attrs, $filter, $timeout, $compile, $window) {
		var vm = this,
			pvm = null,
			limit = 10,
			pScope = $scope.$parent;
		vm.init = function (ele,imageIndex ,id) { 
			vm.element=ele; 
			vm.imageIndex=angular.copy(imageIndex);
			vm.elementData.id= angular.copy("image-element" + id);
			vm.elementData._id= angular.copy("image-element" + id);
			setupActiveElementWatch();
			vm.elementData.imageOverlay = 
				angular.extend(vm.elementData.imageOverlay, getStylesForModel());
			vm.elementDataOriginal=angular.copy(vm.elementData);  
		};
		vm.element = null;
		vm.imageIndex = null;
		vm.elementDataOriginal;
		vm.elementData = { 
			'name': 'Image Element',
			'type': 'ssb-element-image',
			'title': 'Image Element',
			'version': null,
			'imageOverlay': {
				'active': false,
				'heading': "Heading",
				'description': 'description',
				'font': {
					'fontFamily': '',
					'fontSize': 12,
				},
				'backgroundcolor': '',
				'color': '',
				'onMouseOver': true,
			}
		};
		function setupActiveElementWatch() {
			//get functions from parent text component
			while ((!pScope.vm || pScope.vm && !pScope.vm.uiState) && limit > 0) {
				pScope = pScope.$parent;
				limit--;
			}
			pvm = pScope.vm;
			$scope.pvm = pvm;

			if (pvm) {
				$scope.$watch('pvm.uiState.activeElement', function (activeElement) {
					if (activeElement) {
						if (activeElement.id === vm.elementData.id) {
							if (!angular.equals(vm.elementDataOriginal, activeElement)) {
								console.log('changed activeElement.id:', activeElement.id);
								vm.elementData = activeElement;
								updateSettingsForModel();
							}
						}
					}
				}, true);
			}

			return pvm;

		}
		function updateSettingsForModel() {  
			pvm.component.images[vm.imageIndex].imageOverlay=vm.elementData.imageOverlay;
			console.warn('After setStyles:', vm.elementData);
		}
		function setupElementForEditing(){
			updateSettingsForModel();

		}
		function getStylesForModel() { 
				var data = {};
				if (pvm && pvm.component &&  pvm.component.images && pvm.component.images[vm.imageIndex]) {
					data = angular.copy(pvm.component.images[vm.imageIndex].imageOverlay )||{}	;
				} 
				return data;
			}
	} 
})();
