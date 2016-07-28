'use strict';
/*global app*/
app.controller('SiteBuilderPageSettingsModalController', ['$scope', '$timeout', 'parentVm', 'pageId', 'toaster', 'SimpleSiteBuilderService', 'SweetAlert', '$location', '$filter', 'WebsiteService', function ($scope, $timeout, parentVm, pageId, toaster, SimpleSiteBuilderService, SweetAlert, $location, $filter, WebsiteService) {

    var sectionLabel;
    var vm = this;

    vm.parentVm = parentVm;
    vm.pageId = pageId;
    vm.saveSettings = saveSettings;
    vm.deletePage = deletePage;
    vm.setAsHomePage = setAsHomePage;
    vm.duplicatePage = duplicatePage;
    vm.hideFromMenu = hideFromMenu;
    vm.isBlogPage = false;

    function duplicatePage(){
        vm.saveLoading = true;
        saveWebsite().then(function(){
            SimpleSiteBuilderService.createDuplicatePage(vm.page).then(function(page) {
                SimpleSiteBuilderService.getSite(vm.page.websiteId).then(function() {
                    vm.parentVm.closeModal();
                    vm.saveLoading = false;
                    vm.parentVm.uiState.navigation.loadPage(page.data._id);
                })
               
            });
        })
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
                vm.page.mainmenu = false;
                angular.element('.modal.in').show();
                saveSettings();
            } else {
                vm.saveLoading = false;
                angular.element('.modal.in').show();
            }
        });
    }

    function saveSettings() {
        savePage(vm.page, false);
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
              saveWebsite().then(function(){
                SimpleSiteBuilderService.deletePage(vm.page).then(function(response){
                    console.log('page deleted');
                    SimpleSiteBuilderService.getSite(vm.page.websiteId).then(function() {
                      SimpleSiteBuilderService.getPages().then(function() {
                       toaster.pop('success', 'Page deleted', 'The page deleted successfully.');
                        vm.parentVm.closeModal();
                        vm.saveLoading = false;
                        if(vm.parentVm.state.page._id === vm.page._id){
                          vm.parentVm.state.pendingPageChanges = false;
                          vm.parentVm.state.pendingWebsiteChanges = false;
                        	$timeout(function () {
                      			$location.path('/website/site-builder/pages/');
                    		}, 0);
                        }
                      });
                    })
                })
              })
          } else {
            vm.saveLoading = false;
            angular.element('.modal.in').show();
          }
        });
    };

    function savePage(page, hide){
        vm.saveLoading = true;
        return(
            saveWebsite().then(function(){
                SimpleSiteBuilderService.savePage(page, true).then(function(data) {
                    SimpleSiteBuilderService.getSite(page.websiteId).then(function() {
                        SimpleSiteBuilderService.getPages().then(function(pages) {
                            vm.saveLoading = false;
                            toaster.pop('success', 'Setting Saved', 'The page settings saved successfully.');
                            if(hide){
                                vm.page.mainmenu = false;
                                angular.element('.modal.in').show();
                            }
                            else{
                            if(vm.page._id === vm.parentVm.state.page._id){

                                SimpleSiteBuilderService.page = data.data;
                                $timeout(function() {
                                    vm.parentVm.state.pendingPageChanges = false;
                                    if (vm.parentVm.uiState && vm.parentVm.uiState.selectedPage) {
                                        vm.parentVm.uiState.selectedPage = vm.parentVm.state.page;
                                    }
                                }, 0);
                            }
                            vm.parentVm.closeModal();
                        }
                    })
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
            SimpleSiteBuilderService.saveWebsite(vm.parentVm.state.website).then(function(response){
                console.log('website saved');
                if (vm.parentVm.state.account.showhide.userScripts && vm.parentVm.state.website.resources.toggles.userScripts) {
                    SimpleSiteBuilderService.updateScriptResource(vm.parentVm.state.website).then(function(response) {
                        vm.parentVm.state.website = response.data;
                    });
                }
            })
        )
    }

    function validateDuplicatePage(pageHandle, old_handle) {

        var _page = vm.parentVm.state.originalPages.filter(function(page){return page.handle.toLowerCase() === pageHandle.toLowerCase()})[0]

        if(_page && _page._id !== vm.page._id) {
            return "Page handles must be unique.";
        } else if (!vm.isBlogPage && SimpleSiteBuilderService.inValidPageHandles[pageHandle.toLowerCase()]) {
            return "Page handle cannot be a system route.";
        }
        // update hiddenOnPages object for updated handle
        else{
            if(old_handle && old_handle !== pageHandle){
                _.each(vm.page.sections, function (section, index) {
                    if(section.hiddenOnPages && section.hiddenOnPages[old_handle]){
                        delete section.hiddenOnPages[old_handle];
                        section.hiddenOnPages[pageHandle] = true;
                    }
                })
            }

        }
    }

    $scope.$watch('vm.page.handle', function(handle, old_handle){
      if(handle){
        vm.page.handle = $filter('slugify')(handle);
        vm.inValidPageHandle = validateDuplicatePage(handle, old_handle);
      }
      else{
        vm.inValidPageHandle = null;
      }
    });

    $scope.$watch('vm.originalPage', function(page){
      if(page){
        vm.isBlogPage = vm.parentVm.uiState.checkIfBlogPage(vm.originalPage);
        vm.inValidPageHandle = validateDuplicatePage(vm.page.handle);
      }
    });

    vm.loading = true;
    if(vm.pageId === vm.parentVm.state.page._id){
        vm.page = angular.copy(vm.parentVm.state.page);
        vm.originalPage = angular.copy(vm.page);
        vm.loading = false;
    }
    else{
        SimpleSiteBuilderService.getPage(vm.pageId, true).then(function(page) {
            vm.page = page.data;
            vm.originalPage = angular.copy(vm.page);
            vm.loading = false;
        })
    }



}]);
