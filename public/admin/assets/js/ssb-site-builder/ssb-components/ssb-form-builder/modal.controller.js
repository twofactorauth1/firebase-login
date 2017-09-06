/*global app,console*/
/* eslint-disable no-console*/
app.controller('SiteBuilderFormBuilderModalController', ['$scope', function ($scope) {
	'use strict';
	var vm = this,
		pVm = $scope.$parent.vm;

	vm.addCustomField = pVm.addCustomField;
	vm.checkDuplicateField = pVm.checkDuplicateField;
	vm.closeModal = pVm.closeModal;
	vm.component = pVm.state.page.sections[pVm.uiState.activeSectionIndex].components[pVm.uiState.activeComponentIndex];

	(function init() {

		console.debug('init form-builder contact modal');

	}());

}]);
