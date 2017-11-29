(function(){

/*
 * this allows us to use sortable + accordion
 */
app.config(['$provide', function ($provide){
    $provide.decorator('accordionDirective', function($delegate) {
        var directive = $delegate[0];
        directive.replace = true;
        return $delegate;
    });
}]);

app.controller('EmailBuilderSidebarController', ssbEmailBuilderSidebarController);

ssbEmailBuilderSidebarController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'SimpleSiteBuilderService', '$modal', 'editableOptions', '$location', 'SweetAlert', 'ContactService', 'toaster', 'ProductService'];
/* @ngInject */
function ssbEmailBuilderSidebarController($scope, $attrs, $filter, $document, $timeout, SimpleSiteBuilderService, $modal, editableOptions, $location, SweetAlert, ContactService, toaster, ProductService) {

    console.info('email-build sidebar directive init...',$scope.$parent)

    var vm = this;

    vm.init = init;
    vm.savePage = savePage;
    vm.saveWebsite = saveWebsite;
    vm.cancelPendingEdits = cancelPendingEdits;
    vm.togglePageSectionAccordion = togglePageSectionAccordion;
    vm.setActiveComponent = setActiveComponent;
    vm.setActive = setActive;
    vm.getSectionTitle = getSectionTitle;
    vm.getPlatformSections = getPlatformSections;
    vm.getPlatformComponents = getPlatformComponents;
    vm.addSectionToPage = addSectionToPage;
    vm.scrollToActiveSection = scrollToActiveSection;
    vm.removeSectionFromPage = removeSectionFromPage;
    vm.removeComponentFromSection = removeComponentFromSection;
    vm.addComponentToSection = addComponentToSection;
    vm.addBackground = addBackground;
    vm.addBackgroundVideo = addBackgroundVideo;
    vm.addImage = addImage;
    vm.openModal = openModal;
    vm.closeModal = closeModal;
    vm.openMediaModal = openMediaModal;
    vm.insertMedia = insertMedia;
    vm.addToMainMenu = addToMainMenu;
    vm.showInsert = true;
    vm.applyThemeToSite = SimpleSiteBuilderService.applyThemeToSite;
    vm.insertMediaCallback = insertMediaCallback;
    vm.removeBackgroundImage = removeBackgroundImage;
    vm.removeImage = removeImage;
    vm.createPage = createPage;
    vm.getTemplateById = getTemplateById;
    vm.editSectionName = editSectionName;
    vm.hideSectionFromPage = hideSectionFromPage;
    vm.deletePage = deletePage;
    vm.duplicatePage = duplicatePage;
    vm.hideFromMenu = hideFromMenu;
    vm.setActiveComponentSidebar = setActiveComponentSidebar;
    vm.showPageOnMenu = showPageOnMenu;
    vm.moveSection = moveSection;
    vm.duplicateSection = duplicateSection;
    vm.validateDuplicatePage = validateDuplicatePage;
    vm.constructVideoUrl = constructVideoUrl;
    vm.closeSectionPanel = closeSectionPanel;
    vm.initializeMapSlider = initializeMapSlider;
    vm.addCustomField = addCustomField;
    vm.checkDuplicateField = checkDuplicateField;
    vm.showSection = showSection;

    editableOptions.theme = 'bs3';


    vm.sortableOptions = {
        handle: '.ssb-sidebar-move-handle',
        onSort: function (evt) {
            console.log(evt);
            vm.setActive(evt.newIndex);
        },
        onStart: function (evt) {
            vm.dragging = true;
        },
        onEnd: function (evt) {
            vm.dragging = false;
        }
    };

    //TODO: move into config services
    vm.spectrum = {
      options: SimpleSiteBuilderService.getSpectrumColorOptions()
    };

    //TODO: move into config services
    vm.social_links = [{
        name: "adn",
        icon: "adn",
        tooltip: "Adn",
        url: "http://www.adn.com"
      }, {
        name: "bitbucket",
        icon: "bitbucket",
        tooltip: "BitBucket",
        url: "https://bitbucket.org"
      }, {
        name: "dropbox",
        icon: "dropbox",
        tooltip: "Dropbox",
        url: "https://www.dropbox.com"
      }, {
        name: "facebook",
        icon: "facebook",
        tooltip: "Facebook",
        url: "https://www.facebook.com"
      }, {
        name: "flickr",
        icon: "flickr",
        tooltip: "Flickr",
        url: "https://www.flickr.com"
      }, {
        name: "foursquare",
        icon: "foursquare",
        tooltip: "Four Square",
        url: "https://foursquare.com"
      }, {
        name: "github",
        icon: "github",
        tooltip: "Github",
        url: "https://github.com"
      }, {
        name: "google-plus",
        icon: "google-plus",
        tooltip: "Google Plus",
        url: "https://www.gmail.com"
      }, {
        name: "instagram",
        icon: "instagram",
        tooltip: "Instagram",
        url: "https://instagram.com"
      }, {
        name: "linkedin",
        icon: "linkedin",
        tooltip: "Linkedin",
        url: "https://www.linkedin.com"
      }, {
        name: "microsoft",
        icon: "windows",
        tooltip: "Microsoft",
        url: "http://www.microsoft.com"
      }, {
        name: "openid",
        icon: "openid",
        tooltip: "Open Id",
        url: "http://openid.com"
      }, {
        name: "pinterest",
        icon: "pinterest",
        tooltip: "Pinterest",
        url: "https://www.pinterest.com"
      }, {
        name: "reddit",
        icon: "reddit",
        tooltip: "Reddit",
        url: "http://www.reddit.com"
      }, {
        name: "comment-o",
        icon: "comment-o",
        tooltip: "Snapchat",
        url: "https://www.snapchat.com"
      }, {
        name: "soundcloud",
        icon: "soundcloud",
        tooltip: "Sound Cloud",
        url: "https://soundcloud.com"
      }, {
        name: "tumblr",
        icon: "tumblr",
        tooltip: "Tumblr",
        url: "https://www.tumblr.com"
      }, {
        name: "twitter",
        icon: "twitter",
        tooltip: "Twitter",
        url: "https://twitter.com"
      }, {
        name: "vimeo",
        icon: "vimeo-square",
        tooltip: "Vimeo",
        url: "https://vimeo.com"
      }, {
        name: "vine",
        icon: "vine",
        tooltip: "Vine",
        url: "http://www.vinemarket.com"
      }, {
        name: "vk",
        icon: "vk",
        tooltip: "Vk",
        url: "http://vk.com"
      }, {
        name: "desktop",
        icon: "desktop",
        tooltip: "Website",
        url: "http://www.website.com"
      }, {
        name: "yahoo",
        icon: "yahoo",
        tooltip: "Yahoo",
        url: "https://yahoo.com"
      }, {
        name: "youtube",
        icon: "youtube",
        tooltip: "Youtube",
        url: "https://www.youtube.com"
      }, {
        name: "yelp",
        icon: "yelp",
        tooltip: "Yelp",
        url: "http://www.yelp.com"
      }];


    function insertMedia(asset) {
      vm.insertMediaCallback(asset);

      vm.insertMediaCallback = function() {};

      return true;
    };

    function removeBackgroundImage(container) {
        container.bg.img.url = null;
    }

    function removeImage(container) {
        container.src = null;
    }

    function getPlatformSections() {
        // alert('used!')
        // SimpleSiteBuilderService.getPlatformSections().then(function(data) {
    //     vm.platformSections = data;
      // });
    }

    function getPlatformComponents() {
      SimpleSiteBuilderService.getPlatformComponents();
    }

    //TODO: handle versions
    function addComponentToSection(component, sectionIndex) {
        return (
            SimpleSiteBuilderService.getComponent(component, 1).then(function(response) {
                vm.state.page.sections[sectionIndex].components.push(response.data);
            })
        )
    }

    function addSectionToPage(section, version, replaceAtIndex, oldSection, copyAtIndex) {
        vm.uiState.showSectionPanel = false;
        return (
            SimpleSiteBuilderService.addSectionToPage(section, version, replaceAtIndex, vm.state.page.sections[vm.uiState.activeSectionIndex], copyAtIndex).then(function() {
                vm.scrollToActiveSection();
            }, function(error) {
                console.error('section panel -> SimpleSiteBuilderService.addSectionToPage', JSON.stringify(error));
            })
        )
    }

    function scrollToActiveSection() {
        $timeout(function () {
            var scrollContainerEl = document.querySelector('.ssb-site-builder-container');
            var activeSection = document.querySelector('.ssb-active-section');
            if (activeSection) {
              scrollContainerEl.scrollTop = activeSection.offsetTop;
            }
        }, 500);
    }

    function editSectionName(id) {
        console.log('this is id ----------',id);
      $timeout(function () {
        angular.element(document.getElementById(id)).click();
      },0);
    }

    function hideSectionFromPage(section, index) {

        if(section.visibility){

            SweetAlert.swal({
                title: "Are you sure?",
                text: "Do you want to hide this section from the email?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, hide it!",
                cancelButtonText: "No, do not hide it!",
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function (isConfirm) {
                if (isConfirm) {
                    section.visibility = false;
                    vm.uiState.activeSectionIndex = undefined;
                    vm.uiState.activeComponentIndex = undefined;
                    vm.uiState.showSectionPanel = false;
                    vm.uiState.toggleSection(section);
                }
            });

        } else {
            section.visibility = true;
            vm.uiState.toggleSection(section);
        }

    }

    function moveSection(direction, section, index) {

        var sectionsArray = vm.state.page.sections;
        var toIndex;
        var fromIndex = index;

        if (direction === 'up') {
            toIndex = fromIndex - 1;
        }

        if (direction === 'down') {
            toIndex = fromIndex + 1;
        }

        sectionsArray.splice(toIndex, 0, sectionsArray.splice(fromIndex, 1)[0] );

        vm.setActiveSection(toIndex);

    }


    function duplicateSection(section, index) {

        var insertAtIndex = (index > 0) ? (index + 1) : index;

        section = SimpleSiteBuilderService.setTempUUIDForSection(section);

        section.accountId = 0;

        vm.addSectionToPage(section, null, null, null, index).then(function() {
            vm.setActiveSection(insertAtIndex);
        });

    }

    function removeSectionFromPage(index) {
        if(vm.state.email.components[index].global){
            SweetAlert.swal({
                title: "Are you sure?",
                text: "You are removing a global section. Changes made to global sections on this page will be reflected on all other pages. Consider removing from this page only.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Remove from all pages",
                cancelButtonText: "Hide on this page",
                showNoActionButton: true,
                noActionButtonText: 'Cancel',
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function (isConfirm) {
                //Remove from all pages
                if (isConfirm) {
                    SimpleSiteBuilderService.removeSectionFromPage(index);
                }
                //Hide on this page
                else if(angular.isDefined(isConfirm) && isConfirm === false){
                    vm.state.email.components[index].visibility = false;
                    vm.uiState.toggleSection(vm.state.email.components[index]);
                }
            });
        }
        else{
            SweetAlert.swal({
                title: "Are you sure?",
                text: "Do you want to delete this section?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, do not delete it!",
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function (isConfirm) {
            if (isConfirm) {
                SimpleSiteBuilderService.removeSectionFromPage(index);
            }
            });
        }
    }

    function removeComponentFromSection(index) {
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Do you want to delete this component?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, do not delete it!",
        closeOnConfirm: true,
        closeOnCancel: true
      },
      function (isConfirm) {
        if (isConfirm) {
          console.log(vm.state.email.components[vm.uiState.activeComponentIndex]);
          vm.state.email.components.splice(index, 1);
          vm.uiState.activeComponentIndex = undefined;
          vm.uiState.showSectionPanel = false;
        }
      });
    }

    function saveWebsite() {
        vm.state.pendingWebsiteChanges = false;
        return (
            SimpleSiteBuilderService.saveWebsite(vm.state.website).then(function(response){
                console.log('website saved');
            })
        )
    }

    //TODO: refactor, this function exists in multiple controllers :)
    function savePage() {
        vm.state.saveLoading = true;
        var isLegacyPage = !vm.state.page.ssb;
        console.log(isLegacyPage);

        if (!vm.uiState.hasSeenWarning && isLegacyPage) {

            SweetAlert.swal({
              title: "Are you sure?",
              text: "CAUTION: This editor is under active development. Pages saved in Site Builder will not render or be editable in the legacy Pages editor.",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes — Use Site Builder editor.",
              cancelButtonText: "No — Use the legacy editor.",
              closeOnConfirm: true,
              closeOnCancel: true
            },
            function (isConfirm) {
                if (isConfirm) {

                    vm.uiState.hasSeenWarning = true;

                    vm.state.pendingPageChanges = false;

                    //hide section panel
                    vm.uiState.showSectionPanel = false;

                    //reset section panel
                    vm.uiState.navigation.sectionPanel.reset();

                    saveWebsite().then(function(){
                        return (
                            SimpleSiteBuilderService.savePage(vm.state.page).then(function(response){
                                SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){
                                    console.log('page saved');
                                    toaster.pop('success', 'Page Saved', 'The page was saved successfully.');
                                    vm.state.saveLoading = false;
                                })
                            }).catch(function(err) {
                                vm.state.saveLoading = false;
                                toaster.pop('error', 'Error', 'The page was not saved. Please try again.');
                            })
                        )
                    })
                }
                else{
                    vm.state.saveLoading = false;
                }
            });

        } else {
            vm.state.pendingPageChanges = false;

            //hide section panel
            vm.uiState.showSectionPanel = false;

            //reset section panel
            vm.uiState.navigation.sectionPanel.reset();

            saveWebsite().then(function(){
                return (
                    SimpleSiteBuilderService.savePage(vm.state.page).then(function(response){
                        SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){
                            console.log('page saved');
                            toaster.pop('success', 'Page Saved', 'The page was saved successfully.');
                            vm.state.saveLoading = false;
                        })
                    }).catch(function(err) {
                        toaster.pop('error', 'Error', 'The page was not saved. Please try again.');
                        vm.state.saveLoading = false;
                    })
                )
            })
        }

    }

    function cancelPendingEdits() {
      vm.state.pendingPageChanges = false;
      vm.state.pendingWebsiteChanges = false;
      SimpleSiteBuilderService.website = angular.copy(vm.state.originalWebsite);
      SimpleSiteBuilderService.page = angular.copy(vm.state.originalPage);
    }

    function togglePageSectionAccordion(index) {
        if (vm.uiState.accordion.sections[index].isOpen) {
            SimpleSiteBuilderService.setActiveSection(index);
        }
    }

    function setActiveComponent(index) {
        //TODO: this fires on all clicks anywhere within the component panel... so all settings, etc.
        SimpleSiteBuilderService.setActiveComponent(index);
    }

    function getSectionTitle(type){
        var email_titles = {
                "email-header" : "Header",
                "email-1-col"  : "Content 1",
                "email-2-col"  : "Content 2",
                "email-3-col"  : "Content 3",
                "email-footer"  : "Footer",
                "email-social"  : "Social links",
                "email-hr"  : "Horizontal Rule",
        };
        return email_titles[type] || type;
     };

 function setActive(componentIndex, compiled) {
        vm.uiState.showSectionPanel = true;
        vm.uiState.navigation.sectionPanel.reset();
        vm.uiState.activeComponentIndex = undefined;

        if (compiled || (componentIndex === null && sectionIndex === null)) {
            setActiveElement();
        } else if (componentIndex !== undefined) {
            setActiveComponentSidebar(componentIndex);
            vm.uiState.activeComponentIndex = componentIndex;
            vm.uiState.activeSectionIndex = componentIndex;
        } else {
            vm.uiState.navigation.sectionPanel.reset();
            vm.uiState.showSectionPanel = false;
            vm.uiState.activeComponentIndex = null;
            vm.uiState.showSectionPanel = true;
        }

    }
  function setActiveComponentSidebar(componentIndex) {

        var component = vm.state.email.components[componentIndex];
        var name = $filter('cleanType')(component.type).toLowerCase().trim().replace(' ', '-');
        var sectionPanelLoadConfig = {
            name: name,
            id: component._id,
            componentId: component._id
        };

        $timeout(function() {

            vm.uiState.activeComponentIndex = componentIndex;

            vm.uiState.navigation.sectionPanel.loadPanel(sectionPanelLoadConfig);

            if (componentIndex !== undefined) {
                vm.uiState.showSectionPanel = true;
            }

        });
    }


    function addBackground(sectionIndex, componentIndex) {
        vm.openMediaModal('media-modal', 'MediaModalCtrl', null, 'lg');

        vm.insertMediaCallback = function(asset) {
            if(vm.state.page){
                if (componentIndex !== undefined && componentIndex !== null) {
                    vm.state.page.sections[vm.uiState.activeSectionIndex].components[vm.uiState.activeComponentIndex].bg.img.url = asset.url;
                } else if (!angular.isDefined(sectionIndex) && vm.uiState.activeElement  && vm.uiState.activeElement.hasOwnProperty("bg")) {
                    vm.uiState.activeElement.bg.img.url = asset.url;
                } else {
                    vm.state.page.sections[vm.uiState.activeSectionIndex].bg.img.url = asset.url;
                }
            }else{
                vm.state.email.components[vm.uiState.activeComponentIndex].bg.img.url = asset.url;
            }
        }

        SimpleSiteBuilderService.setActiveSection(sectionIndex);
        SimpleSiteBuilderService.setActiveComponent(componentIndex);
    }

    function addBackgroundVideo(sectionIndex, componentIndex) {
        vm.openMediaModal('media-modal', 'MediaModalCtrl', null, 'lg');

        vm.insertMediaCallback = function(asset) {
            if (componentIndex !== undefined && componentIndex !== null) {
                vm.state.page.sections[vm.uiState.activeSectionIndex].components[vm.uiState.activeComponentIndex].bg.video.url = asset.url;
            } else {
                vm.state.page.sections[vm.uiState.activeSectionIndex].bg.video.url = asset.url;
            }
        }

        SimpleSiteBuilderService.setActiveSection(sectionIndex);
        SimpleSiteBuilderService.setActiveComponent(componentIndex);
    }

    function addImage(sectionIndex, componentIndex) {
      vm.openMediaModal('media-modal', 'MediaModalCtrl', null, 'lg');

      vm.insertMediaCallback = function(asset) {
        if (componentIndex !== undefined && componentIndex !== null) {
          vm.state.page.sections[vm.uiState.activeSectionIndex].components[vm.uiState.activeComponentIndex].src = asset.url;
        } else {
          vm.state.page.sections[vm.uiState.activeSectionIndex].src = asset.url;
        }
      }

      // if (sectionIndex !== undefined) {
      //   SimpleSiteBuilderService.setActiveSection(sectionIndex);
      //   SimpleSiteBuilderService.setActiveComponent(undefined);
      // } else {
        SimpleSiteBuilderService.setActiveSection(sectionIndex);
        SimpleSiteBuilderService.setActiveComponent(componentIndex);
      // }

    }

    function insertMediaCallback(asset) {}

    function closeModal() {
      vm.modalInstance.close();
    }

    function openModal(modal, controller, index, size) {
      console.log('openModal >>> ', modal, controller, index);
      var _modal = {
        templateUrl: modal,
        keyboard: true,
        backdrop: 'static',
        size: 'md',
        scope: $scope,
        resolve: {
            parentVm: function () {
                return vm;
            }
        }
      };

      if (controller) {
        _modal.controller = controller + ' as vm';
      }

      if (size) {
        _modal.size = 'lg';
      }

      vm.modalInstance = $modal.open(_modal);

      vm.modalInstance.result.then(null, function () {
        angular.element('.sp-container').addClass('sp-hidden');
      });

    }

    function openMediaModal(modal, controller, index, size) {
      console.log('openModal >>> ', modal, controller, index);
      var _modal = {
        templateUrl: modal,
        keyboard: true,
        backdrop: 'static',
        size: 'md',
        resolve: {
          vm: function() {
            return vm;
          }
        }
      };

      if (controller) {
        _modal.controller = controller;

        _modal.resolve.showInsert = function () {
          return vm.showInsert;
        };

        _modal.resolve.insertMedia = function () {
          return vm.insertMedia;
        };

        _modal.resolve.isSingleSelect = function () {
            return true;
        };
      }

      if (size) {
        _modal.size = 'lg';
      }

      vm.modalInstance = $modal.open(_modal);

      vm.modalInstance.result.then(null, function () {
        angular.element('.sp-container').addClass('sp-hidden');
      });

    }

    function checkForDuplicatePage(pageHandle) {
        SimpleSiteBuilderService.checkForDuplicatePage(pageHandle).then(function(dup) {
            vm.uiState.duplicateUrl = dup;
        })
    }

    function addToMainMenu(id) {
        console.log('add page to main menu: ' + id);
        // SimpleSiteBuilderService.checkForDuplicatePage(pageHandle).then(function(dup) {
        //  vm.uiState.duplicateUrl = dup;
        // })
    }

    function createPage(template) {
        if (vm.state.saveLoading) {
            return;
        }
        vm.state.saveLoading = true;
        vm.saveWebsite().then(function(){
          return (
            SimpleSiteBuilderService.createPage(template._id).then(function(data) {
                SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){
                    vm.closeModal();
                    vm.state.saveLoading = false;
                    vm.uiState.navigation.loadPage(data.data._id);
                })
            })
          )
        })
    };


    function getTemplateById(id) {
        SimpleSiteBuilderService.getTemplateById(id);
    };

    /*
     * Transforms the content data to be used in the tabset UI
     *
     */
    function setupSectionContent() {

        var componentLabel = '';
        vm.enabledComponentTypes = _.where(vm.uiState.componentTypes, {
            enabled: true
        });

        vm.componentFilters = _.without(_.uniq(_.pluck(_.sortBy(vm.enabledComponentTypes, 'filter'), 'filter')), 'misc');

        // Iterates through the array of filters and replaces each one with an object containing an
        // upper and lowercase version
        _.each(vm.componentFilters, function(element, index) {
            componentLabel = element.charAt(0).toUpperCase() + element.substring(1).toLowerCase();
            vm.componentFilters[index] = {
                'capitalized': componentLabel,
                'lowercase': element
            };
            componentLabel = null;
        });

        // Manually add the All option to the begining of the list
        vm.componentFilters.unshift({
            'capitalized': 'All',
            'lowercase': 'all'
        });

    }

    function hideFromMenu(){
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
            vm.state.page.mainmenu = false;
            updateLinkList(false);
        }
      });
    }


    function showPageOnMenu(){
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Do you want to show this page on main menu",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, show page!",
        cancelButtonText: "No, do not show page!",
        closeOnConfirm: true,
        closeOnCancel: true
      }, function (isConfirm) {
        if (isConfirm) {
            vm.state.page.mainmenu = true;
            updateLinkList(true);
        }
      });
    }


    function updateLinkList(state){
        _.each(vm.state.website.linkLists, function (value, index) {
            if (value.handle === "head-menu") {
                if(!state){
                    var _list = _.reject(value.links, function(link){
                        return link.linkTo.data === vm.state.page.handle &&
                        (link.linkTo.type === "page" || link.linkTo.type === "home")
                    });
                    if(_list){
                        value.links = _list;
                    }
                }
                else{
                    value.links.push({
                        label: vm.state.page.menuTitle || vm.state.page.title,
                        type: "link",
                        linkTo: {
                            data: vm.state.page.handle,
                            type: 'page'
                        }
                    });
                }
            }
        });
    };

    function deletePage() {
      var _deleteText = "Do you want to delete this page";
      if(vm.state.page.handle === 'index')
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
          vm.state.saveLoading = true;
          vm.state.pendingPageChanges = false;
          vm.state.pendingWebsiteChanges = false;
          SimpleSiteBuilderService.deletePage(vm.state.page).then(function(response){
            SimpleSiteBuilderService.getSite(vm.state.page.websiteId).then(function() {
                vm.state.saveLoading = false;
                console.log('page deleted');
                toaster.pop('success', 'Page deleted', 'The page deleted successfully.');
                  $timeout(function () {
                    var pages = _.reject(vm.state.pages, function(page){ return page.handle === vm.state.page.handle});
                    if(pages.length)
                        vm.uiState.navigation.loadPage(pages[0]._id);
                      else
                        SimpleSiteBuilderService.getPages().then(function(pages) {
                            $location.path('/website/site-builder/pages/');
                        })
                }, 0);
            });
          })
        }
      });
    };

    function duplicatePage(){
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Do you want to create a duplicate page?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        closeOnConfirm: true,
        closeOnCancel: true
      }, function (isConfirm) {
        if (isConfirm) {
          vm.state.saveLoading = true;
          saveWebsite().then(function(){
            SimpleSiteBuilderService.createDuplicatePage(vm.state.page).then(function(page) {
               SimpleSiteBuilderService.getSite(vm.state.website._id).then(function() {
                  vm.state.saveLoading = false;
                  vm.uiState.navigation.loadPage(page.data._id);
               });
            })
          })
        }
      });
    }

    function validateDuplicatePage(pageHandle) {

        var _page = vm.state.pages.filter(function(page){return page.handle.toLowerCase() === pageHandle.toLowerCase()})[0]

        if (_page && _page._id !== vm.state.page._id) {
            return "Page handles must be unique.";
        } else if (SimpleSiteBuilderService.inValidPageHandles[pageHandle.toLowerCase()]) {
            return "Page handle cannot be a system route.";
        }
        // update hiddenOnPages object for updated handle
        else{
            _.each(vm.state.page.sections, function (section, index) {
                if(section.hiddenOnPages && section.hiddenOnPages[vm.state.page.handle]){
                    delete section.hiddenOnPages[vm.state.page.handle];
                    section.hiddenOnPages[pageHandle] = true;
                }
            })
        }
    }

    $scope.$watch('vm.state.page.handle', function(handle, oldHandle){
        if(handle && !angular.equals(oldHandle, handle)){
            vm.state.page.handle = $filter('slugify')(handle);
        }
    });

    function getYoutubeVideoUrl(videoIdReplaceToken, url) {
        var returnUrl;
        var id;
        var defaultUrl = '//www.youtube.com/embed/#VIDEO_ID#?playlist=#VIDEO_ID#&autoplay=1&controls=0&loop=1&rel=0&showinfo=0&autohide=1&wmode=transparent&hd=1';
        var regex = /^(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?.*?(?:v|list)=(.*?)(?:&|$)|^(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?(?:(?!=).)*\/(.*)$/;

        if (url) {
            var match = url.match(regex);

            if (match.length) {
                match = _.filter(match, function(val) { return val !== undefined });
            }

            var id = match && match[1] ? match[1] : null;

            returnUrl = defaultUrl.replace(videoIdReplaceToken, id).replace(videoIdReplaceToken, id);
        }

        return {
            url: returnUrl,
            id: id
        }
    }

    function getVimeoVideoUrl(videoIdReplaceToken, url) {
        var returnUrl;
        var id;
        var defaultUrl = '//vimeo.com/#VIDEO_ID#?autopause=0&autoplay=1&badge=0&byline=0&color=&loop=0&player_id=0&portrait=0&title=0';
        var regex = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;

        if (url) {
            var match = url.match(regex);
            var id = match && match[4] ? match[4] : null;

            returnUrl = defaultUrl.replace(videoIdReplaceToken, id);
        }

        return {
            url: returnUrl,
            id: id
        }
    }

    function constructVideoUrl(section) {
        var videoData = {};
        var videoIdReplaceToken = '#VIDEO_ID#';

        if (section.bg.video.type === 'youtube') {
            videoData = getYoutubeVideoUrl(videoIdReplaceToken, section.bg.video.url);
        } else if (section.bg.video.type === 'vimeo') {
            videoData = getVimeoVideoUrl(videoIdReplaceToken, section.bg.video.url);
        }

        section.bg.video.urlProcessed = videoData.url;
        section.bg.video.id = videoData.id;

        console.log(videoData);

        return videoData;
    }

    function closeSectionPanel() {
        vm.uiState.activeElement = {};
        vm.uiState.showSectionPanel = false;
        vm.uiState.openSidebarSectionPanel = { name: '', id: '' };
    }

    function initializeMapSlider(){
        console.log('refresh slider');
        $timeout(function () {
          $scope.$broadcast('rzSliderForceRender');
        }, 0);
    }

    function addCustomField(type){
        var cleanType = type.replace(' ','');
        var newInfo = {
            name: cleanType,
            type: type,
            label: type,
            custom: true,
            optional:true,
            visible: true
        }
        vm.state.page.sections[vm.uiState.activeSectionIndex].components[vm.uiState.activeComponentIndex].contactInfo.push(newInfo);
        vm.contactInfo = {};
    }

    function checkDuplicateField(_type){
        var activeComponent = vm.state.page.sections[vm.uiState.activeSectionIndex].components[vm.uiState.activeComponentIndex];
        return _.filter(activeComponent.contactInfo, function(info){
            return info.type.toLowerCase() === _type.toLowerCase();
        }).length;
    }

    function showSection(section){
        var _showSection = false;
        if(section)
        {
            _showSection = section.visibility || section.visibility === undefined;
            if(section.global && section.hiddenOnPages){
                var _pageHandle = _pageHandle = vm.state.page.handle;
                _showSection = !section.hiddenOnPages[_pageHandle];
                section.visibility =  _showSection;
            }
        }
        return _showSection;
    }

    function init(element) {

        vm.element = element;
        setupSectionContent();
        ContactService.getContacts(function(customers){
            ContactService.getAllContactTags(customers,function(tags){
            vm.contactTags = tags;
            });
        })

        vm.donationProductTags = [];
        ProductService.getProducts(function(products) {
            products.forEach(function(product, index) {
                if (product.type === 'DONATION' && product.status.toLowerCase() === 'active') {
                    vm.donationProductTags.push({data: product._id, label: product.name});
                }

            });
        });
    }
}

})();
