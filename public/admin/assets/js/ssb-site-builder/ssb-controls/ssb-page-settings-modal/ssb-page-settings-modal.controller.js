'use strict';
/*global app*/
app.controller('SiteBuilderPageSettingsModalController', ['$timeout', 'parentVm', 'pageId', 'toaster', 'SimpleSiteBuilderService', 'SweetAlert', '$location', function ($timeout, parentVm, pageId, toaster, SimpleSiteBuilderService, SweetAlert, $location) {

	var sectionLabel;
	var vm = this;

	vm.parentVm = parentVm;
	vm.pageId = pageId;
	vm.saveSettings = saveSettings;
	vm.deletePage = deletePage;
	function saveSettings() {
    	SimpleSiteBuilderService.savePage(vm.page).then(function(page) {
  			toaster.pop('success', 'Setting Saved', 'The page settings saved successfully.');
  		})
    }
    function deletePage(page) {
      angular.element('.modal.in').hide();
      var _deleteText = "Do you want to delete this page";
      if(page.handle === 'index')
      {
        var _deleteText = "This is home page of the website. Do you want to delete this page";
      }
      SweetAlert.swal({
        title: "Are you sure?",
        text: _deleteText,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete page!",
        cancelButtonText: "No, do not delete page!",
        closeOnConfirm: false,
        closeOnCancel: true
      }, function (isConfirm) {
        if (isConfirm) {
            SimpleSiteBuilderService.deletePage(page).then(function(response){
                console.log('page deleted');
                SweetAlert.swal("Saved!", "Page is deleted.", "success");
                angular.element('.modal.in').show();
                vm.parentVm.closeModal();
                if(vm.parentVm.uiState.selectedPage._id === page._id){                	
                	$timeout(function () {
              			$location.path('/website/site-builder/pages/');
            		}, 0);
                }
            })  
        } else {
          angular.element('.modal.in').show();
        }
      });
    };
	SimpleSiteBuilderService.getPage(vm.pageId).then(function(page) {
  		vm.page = page.data;
  	})

}]);
