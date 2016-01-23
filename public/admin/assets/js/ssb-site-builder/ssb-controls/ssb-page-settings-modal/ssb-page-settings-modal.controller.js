'use strict';
/*global app*/
app.controller('SiteBuilderPageSettingsModalController', ['$timeout', 'parentVm', 'pageId', 'toaster', 'SimpleSiteBuilderService', 'SweetAlert', '$location', function ($timeout, parentVm, pageId, toaster, SimpleSiteBuilderService, SweetAlert, $location) {

	var sectionLabel;
	var vm = this;

	vm.parentVm = parentVm;
	vm.pageId = pageId;
	vm.saveSettings = saveSettings;
	vm.deletePage = deletePage;
  vm.setAsHomePage = setAsHomePage;
  vm.duplicatePage = duplicatePage;
  function duplicatePage(){
    SimpleSiteBuilderService.createDuplicatePage(vm.page).then(function(page) {
        vm.parentVm.closeModal();
        vm.parentVm.uiState.navigation.loadPage(page.data._id);
    })
  }
  function saveSettings() {
  	SimpleSiteBuilderService.savePage(vm.page, true).then(function(page) {
			toaster.pop('success', 'Setting Saved', 'The page settings saved successfully.');
		})
  }
  function setAsHomePage(status) {    
    if(status){
      if(vm.parentVm.state.pages["index"]){
        console.log("Homepage already exists");
        SweetAlert.swal({
            title: "Are you sure?",
            text: "CAUTION: Home page already exists. Do you want to set this page as 'Homepage'?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes — I'll set this page as 'Homepage'",
            cancelButtonText: "No — I will use existing 'Homepage' for now.",
            closeOnConfirm: true,
            closeOnCancel: true
          }, function (isConfirm) {
          if (isConfirm) {
            //to do
              //vm.page.handle = "index";
          } else {
            angular.element('.modal.in').show();
            vm.homePage = false;
          }
        })
      }
      else{
        vm.page.handle = 'index';
      }
    }
    else{
      vm.page = angular.copy(vm.originalPage);
    }
    
  }
  function deletePage() {
    angular.element('.modal.in').hide();
    var _deleteText = "Do you want to delete this page";
    if(vm.page.handle === 'index')
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
          SimpleSiteBuilderService.deletePage(vm.page).then(function(response){
              console.log('page deleted');
              SweetAlert.swal("Saved!", "Page is deleted.", "success");
              angular.element('.modal.in').show();
              vm.parentVm.closeModal();
              if(vm.parentVm.state.page._id === vm.page._id){                	
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

  SimpleSiteBuilderService.getPage(vm.pageId, true).then(function(page) {
    vm.page = page.data;
    vm.originalPage = angular.copy(vm.page);
    // Special case if selected page is current page
    if(vm.parentVm.state.page && vm.parentVm.state.page._id === vm.pageId){
      vm.page.title = vm.parentVm.state.page.title;
      vm.page.handle = vm.parentVm.state.page.handle;
    }
  })

}]);
