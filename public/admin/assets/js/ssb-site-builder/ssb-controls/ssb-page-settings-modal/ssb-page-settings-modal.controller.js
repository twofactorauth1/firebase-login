'use strict';
/*global app*/
app.controller('SiteBuilderPageSettingsModalController', ['$timeout', 'parentVm', 'pageId', 'toaster', 'SimpleSiteBuilderService', function ($timeout, parentVm, pageId, toaster, SimpleSiteBuilderService) {

	var sectionLabel;
	var vm = this;

	vm.parentVm = parentVm;
	vm.pageId = pageId;
	vm.saveSettings = saveSettings;
	function saveSettings() {
    	SimpleSiteBuilderService.savePage(vm.page).then(function(page) {
  			toaster.pop('success', 'Setting Saved', 'The page settings saved successfully.');
  		})
    }
	SimpleSiteBuilderService.getPage(vm.pageId).then(function(page) {
  		vm.page = page.data;
  	})

}]);
