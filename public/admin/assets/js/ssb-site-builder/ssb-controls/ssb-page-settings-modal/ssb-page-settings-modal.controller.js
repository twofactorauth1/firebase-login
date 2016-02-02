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
    vm.saveLoading = true;
    saveWebsite();
    SimpleSiteBuilderService.createDuplicatePage(vm.page).then(function(page) {
        vm.parentVm.closeModal();
        vm.saveLoading = false;
        vm.parentVm.uiState.navigation.loadPage(page.data._id);
    });
  }
  function hideFromMenu(){
    angular.element('.modal.in').hide();
    SweetAlert.swal({
      title: "Are you sure?",
      text: "Do you want to hide this page from main menu",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, hide page!",
      cancelButtonText: "No, do not hide page!",
      closeOnConfirm: true,
      closeOnCancel: true
    }, function (isConfirm) {
      if (isConfirm) {
        var originalPage = angular.copy(vm.originalPage);
        originalPage.mainmenu = false;
        angular.element('.modal.in').show();
        savePage(originalPage).then(function(){
          vm.page.mainmenu = false;
          angular.element('.modal.in').show();
        })
      } else {
        vm.saveLoading = false;
        angular.element('.modal.in').show();
      }
    });
  }

  function saveSettings() {
    savePage(vm.page).then(function(){
      vm.parentVm.closeModal();
    });
  }

  function setAsHomePage() {
    if(vm.page.homePage){
      if(vm.parentVm.state.pages["index"] && vm.page.handle !== 'index'){
        angular.element('.modal.in').hide();
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
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      closeOnConfirm: true,
      closeOnCancel: true
    }, function (isConfirm) {
      if (isConfirm) {

          vm.saveLoading = true;
          angular.element('.modal.in').show();
          saveWebsite();
          SimpleSiteBuilderService.deletePage(vm.page).then(function(response){
              console.log('page deleted');
              SimpleSiteBuilderService.getSite(vm.page.websiteId).then(function() {
                SimpleSiteBuilderService.getPages().then(function() {
                 toaster.pop('success', 'Page deleted', 'The page deleted successfully.');                  
                  vm.parentVm.closeModal();
                  vm.saveLoading = false;
                  if(vm.parentVm.state.page._id === vm.page._id){
                  	$timeout(function () {
                			$location.path('/website/site-builder/pages/');
              		}, 0);
                  }
                });
              })  
          })
      } else {
        vm.saveLoading = false;
        angular.element('.modal.in').show();        
      }
    });
  };

  function savePage(page){
    vm.saveLoading = true;
    saveWebsite();
    return(
      SimpleSiteBuilderService.savePage(page, true).then(function() {      
        SimpleSiteBuilderService.getSite(page.websiteId).then(function() {
          SimpleSiteBuilderService.getPages().then(function() {
              vm.saveLoading = false;              
              toaster.pop('success', 'Setting Saved', 'The page settings saved successfully.');              
          })
        })
      }).catch(function(err) {
          vm.saveLoading = false;
          if(err.message)
             toaster.pop('error', error.message);   
          else
            toaster.pop('error', "Setting not saved", "Error while saving page settings");                  
      })
    )
  }

  function saveWebsite() {
      return (
          SimpleSiteBuilderService.saveWebsite(vm.state.website).then(function(response){
              console.log('website saved');
          })
      )
  }  
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
