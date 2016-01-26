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
  vm.hideFromMenu = hideFromMenu;
  function duplicatePage(){
    vm.loading = true;
    SimpleSiteBuilderService.createDuplicatePage(vm.page).then(function(page) {
        vm.parentVm.closeModal();
        vm.loading = false;
        vm.parentVm.uiState.navigation.loadPage(page.data._id);
    })
  }
  function hideFromMenu(){
    vm.loading = true;
    angular.element('.modal.in').hide();
    SweetAlert.swal({
      title: "Are you sure?",
      text: "Do you want to hide this page from main menu",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, hide page!",
      cancelButtonText: "No, do not hide page!",
      closeOnConfirm: false,
      closeOnCancel: true
    }, function (isConfirm) {
      if (isConfirm) {
          var originalPage = angular.copy(vm.originalPage);
          originalPage.mainmenu = false;
          SimpleSiteBuilderService.savePage(originalPage, true).then(function(page) {
            vm.page.mainmenu = false;
            SweetAlert.swal("Saved!", "Page settings saved.", "success");
            angular.element('.modal.in').show();
            vm.loading = false;
          })
      } else {
        angular.element('.modal.in').show();
        vm.loading = false;
      }
    });
  }

  function saveSettings() {
    vm.loading = true;
  	SimpleSiteBuilderService.savePage(vm.page, true).then(function(page) {
        vm.originalPage = angular.copy(vm.page);
        toaster.pop('success', 'Setting Saved', 'The page settings saved successfully.');
        vm.loading = false;

        vm.parentVm.closeModal();

        if (vm.page.homePage) {
            vm.parentVm.uiState.navigation.loadPage(vm.page._id);
        }
	});
  }

  function setAsHomePage(status) {
    if(status){
      if(vm.parentVm.state.pages["index"] && vm.page.handle !== 'index'){
        console.log("Homepage already exists");
          SweetAlert.swal({
            title: "Are you sure?",
            text: "CAUTION: Home page already exists. Do you want to set this page as your new home page?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
          }, function (isConfirm) {
          if (isConfirm) {
            vm.page.homePage = true;
            angular.element('.modal.in').show();
          } else {
            angular.element('.modal.in').show();
            vm.page.homePage = false;
          }
        })
      }
      else{
        vm.page.homePage = true;
      }
    }
    else{
      vm.page.homePage = false;
      vm.page = angular.copy(vm.originalPage);
    }

  }
  function deletePage() {
    vm.loading = true;
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
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      closeOnConfirm: false,
      closeOnCancel: true
    }, function (isConfirm) {
      if (isConfirm) {
          SimpleSiteBuilderService.deletePage(vm.page).then(function(response){
              console.log('page deleted');
              SweetAlert.swal("Saved!", "Page is deleted.", "success");
              angular.element('.modal.in').show();
              vm.parentVm.closeModal();
              vm.loading = false;
              if(vm.parentVm.state.page._id === vm.page._id){
              	$timeout(function () {
            			$location.path('/website/site-builder/pages/');
          		}, 0);
              }
          })
      } else {
        angular.element('.modal.in').show();
        vm.loading = false;
      }
    });
  };
  vm.loading = true;
  SimpleSiteBuilderService.getPage(vm.pageId, true).then(function(page) {
    vm.page = page.data;
    vm.originalPage = angular.copy(vm.page);
    // Special case if selected page is current page
    if(vm.parentVm.state.page && vm.parentVm.state.page._id === vm.pageId){
      vm.page.title = vm.parentVm.state.page.title;
      vm.page.handle = vm.parentVm.state.page.handle;
    }
    vm.loading = false;

  })

}]);
