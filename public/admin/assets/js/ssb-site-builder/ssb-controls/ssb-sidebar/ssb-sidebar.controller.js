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

app.controller('SiteBuilderSidebarController', ssbSiteBuilderSidebarController);

ssbSiteBuilderSidebarController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'SimpleSiteBuilderService', '$modal', 'editableOptions', '$location', 'SweetAlert', 'ContactService', 'toaster', 'ProductService'];
/* @ngInject */
function ssbSiteBuilderSidebarController($scope, $attrs, $filter, $document, $timeout, SimpleSiteBuilderService, $modal, editableOptions, $location, SweetAlert, ContactService, toaster, ProductService) {

    console.info('site-build sidebar directive init...')

    var vm = this;

    vm.init = init;
    vm.savePage = savePage;
    vm.saveWebsite = saveWebsite;
    vm.cancelPendingEdits = cancelPendingEdits;
    vm.togglePageSectionAccordion = togglePageSectionAccordion;
    vm.setActiveComponent = setActiveComponent;
    vm.setActiveSection = setActiveSection;
    vm.getPlatformSections = getPlatformSections;
    vm.getPlatformComponents = getPlatformComponents;
    vm.addSectionToPage = addSectionToPage;
    vm.addSectionToPageToIndex = addSectionToPageToIndex;
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
    vm.showPageOnMenu = showPageOnMenu;
    vm.moveSection = moveSection;
    vm.duplicateSection = duplicateSection;
    vm.validateDuplicatePage = validateDuplicatePage;
    vm.constructVideoUrl = constructVideoUrl;
    vm.closeSectionPanel = closeSectionPanel;
    vm.initializeMapSlider = initializeMapSlider;
    vm.addCustomField = addRemoveCustomField;
   
    vm.checkDuplicateField = checkDuplicateField;
    vm.showSection = showSection;

    editableOptions.theme = 'bs3';

    vm.fontFamilyOptions = SimpleSiteBuilderService.getFontFamilyOptions();
    vm.fontWeightOptions = SimpleSiteBuilderService.getFontWeightOptions();
    vm.bodyFontWeightOptions = SimpleSiteBuilderService.bodyFontWeightOptions();
    vm.checkIfSelected = checkIfSelected;
    function checkIfSelected(value, newValue){
        if(value && newValue)
            return value.replace(/'/g, "").replace(/, /g, ",") == newValue.replace(/"/g, "").replace(/, /g, ",");
    }
    vm.sortableOptions = {
        handle: '.ssb-sidebar-move-handle',
        onSort: function (evt) {
            console.log(evt);
            vm.setActiveSection(evt.newIndex);
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
        url: "http://plus.google.com"
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

    function addSectionToPageToIndex(section) {

        var el = angular.element(".ssb-page-section.ssb-active-edit-control");
        
        var insertAtIndex = undefined;
        if(el.length){
            var index = el.attr("clicked-index");
            index = parseInt(index);
            insertAtIndex = index + 1;
        }
        
        vm.uiState.showSectionPanel = false;
        return (
            SimpleSiteBuilderService.addSectionToPageToIndex(section, insertAtIndex).then(function() {
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
      $timeout(function () {
        angular.element(document.getElementById(id)).click();
      },0);
    }

    function hideSectionFromPage(section, index) {

        if(section.visibility){

            SweetAlert.swal({
                title: "Are you sure?",
                text: "Do you want to hide this section from the page?",
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
        if(vm.state.page.sections[index].global){
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
                    vm.state.page.sections[index].visibility = false;
                    vm.uiState.toggleSection(vm.state.page.sections[index]);
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
          vm.state.page.sections[vm.uiState.activeSectionIndex].components.splice(index, 1);
          vm.uiState.activeComponentIndex = undefined;
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
                                    SimpleSiteBuilderService.saveOtherPageLinks();
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
                            SimpleSiteBuilderService.saveOtherPageLinks();
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

    function setActiveSection(index) {
        vm.uiState.showSectionPanel = false;
        $timeout(function() {
          SimpleSiteBuilderService.setActiveSection(index);
          if (vm.state.page.sections[index].visibility) {
            vm.uiState.navigation.sectionPanel.reset();
            var section = vm.state.page.sections[index];
            var name = $filter('cleanType')(section.title || section.name).toLowerCase().trim().replace(' ', '-') + ' Section';
            vm.uiState.navigation.sectionPanel.loadPanel({ id: '', name: name });
            vm.uiState.showSectionPanel = true;
            vm.scrollToActiveSection();
          }
          else{
            vm.uiState.activeSectionIndex = index;
          }
        })
    }

    function addBackground(sectionIndex, componentIndex) {
        vm.openMediaModal('media-modal', 'MediaModalCtrl', null, 'lg');

        vm.insertMediaCallback = function(asset) {
            if (componentIndex !== undefined && componentIndex !== null) {
                vm.state.page.sections[vm.uiState.activeSectionIndex].components[vm.uiState.activeComponentIndex].bg.img.url = asset.url;
            } else if ((!angular.isDefined(sectionIndex) || sectionIndex === null) && vm.uiState.activeElement  && vm.uiState.activeElement.hasOwnProperty("bg")) {
                vm.uiState.activeElement.bg.img.url = asset.url;
            } else {
                vm.state.page.sections[vm.uiState.activeSectionIndex].bg.img.url = asset.url;
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

        var unbindWatcher = $scope.$watch(function() {
            return SimpleSiteBuilderService.platformSections
        }, function(newValue, oldValue) {

            if (newValue) {

                var sectionLabel;

                /*
                * @platformSections
                * - an array of sections to add to a page, sorted and filtered
                */
                vm.uiState.contentSectionDisplayOrder = _.invert(_.object(_.pairs(SimpleSiteBuilderService.contentSectionDisplayOrder)));
                if(SimpleSiteBuilderService.orgId == 5)
                    vm.uiState.contentSectionDisplayOrder = _.invert(_.object(_.pairs(SimpleSiteBuilderService.contentSectionDisplayOrderLeadSource)));
                vm.enabledPlatformSections = _(vm.state.platformSections).chain() // allow chaining underscore methods

                                                .sortBy(function(x) { // sort by predetermined order
                                                    return vm.uiState.contentSectionDisplayOrder[x.filter]
                                                })

                                                .filter(function(x) { //filter out any not enabled
                                                    return x.enabled;
                                                })

                                                .value(); //return the new array



                /*
                * @userSections
                * - an array of sections created by current user
                */
                vm.enabledUserSections = _.where(vm.state.userSections, {
                    enabled: true
                });


                /*
                 * The unique filter values of all the enabled components, sorted
                 */
                vm.sectionFilters = _(vm.enabledPlatformSections).chain()

                                        .pluck('filter') // get just the filter values

                                        .uniq() // get just unique values

                                        .without('misc') // remove misc, put at end of array later

                                        .sortBy(function(x) { // sort by predetermined order
                                            return vm.uiState.contentSectionDisplayOrder[x] && parseInt(vm.uiState.contentSectionDisplayOrder[x], 10)
                                        })

                                        .value(); // return the new array



                // Iterates through the array of filters and replaces each one with an object containing an
                // upper and lowercase version
                // Note: not sure why this was done, could be handled in CSS? - Jack

                // List the section icons
                var sectionIcons = SimpleSiteBuilderService.contentSectionIcons;

                _.each(vm.sectionFilters, function (element, index) {
                    sectionLabel = element.charAt(0).toUpperCase() + element.substring(1).toLowerCase();
                    vm.sectionFilters[index] = {
                      'capitalized': sectionLabel,
                      'lowercase': element,
                      'icon': sectionIcons[element] ? sectionIcons[element].icon : 'fa-adjust'
                    };
                    sectionLabel = null;
                });

                // Manually add the Misc section back on to the end of the list
                vm.sectionFilters.push({
                  'capitalized': 'Misc',
                  'lowercase': 'misc',
                  'icon': sectionIcons['misc'].icon
                });

                // Manually add the All option to the end of the list
                vm.sectionFilters.push({
                    'capitalized': 'All',
                    'lowercase': 'all',
                    'icon': sectionIcons['all'].icon
                });

                // Special case for LeadSource

                if(SimpleSiteBuilderService.orgId == 5){
                    vm.sectionFilters = _.filter(vm.sectionFilters, function(section){
                        return _.contains(SimpleSiteBuilderService.contentSectionDisplayOrderLeadSource, section.lowercase)
                    })
                }

                vm.setFilterType = function (label) {
                    vm.typefilter = label;
                };

                //initially show platform sections
                //TODO: when we implement section reuse
                vm.sections = vm.enabledPlatformSections;
                vm.sectionType = 'enabledPlatformSections';

                // type is 'enabledPlatformSections' or 'enabledUserSections'
                // TODO: when we implement section reuse
                vm.setSectionType = function (type) {
                    SimpleSiteBuilderService.getUserSections().then(function() {
                        vm.sectionType = type;
                        vm.sections = vm[type];
                    })
                };


                unbindWatcher();

            }
        }, true);

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
                    var _list =[];
                    _.each(value.links, function(link,idx){
                        if(!(link.linkTo.data === vm.state.page.handle &&
                           (link.linkTo.type === "page" ||
                            link.linkTo.type === "home")) || link.linkTo.type ==="sub-nav"){
                             if( link.linkTo.type ==="sub-nav"){
                                  var _sublist = _.reject(link.links,
                                                          function(sublink){
                                      return sublink.linkTo.data === vm.state.page.handle &&
                                          (sublink.linkTo.type === "page" || sublink.linkTo.type === "home")
                                  })
                                 link.links= _sublist;
                             }
                            _list.push(link);
                        }

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

        pageHandle = customSlugify(pageHandle); // in case $watch hasn't cleaned-up the handle.
        var _page = vm.state.pages.filter(function(page){return page.handle.toLowerCase() === pageHandle.toLowerCase()})[0]

        if (pageHandle === "") {
            return "Page handle is invalid.";
        } else if (_page && _page._id !== vm.state.page._id) {
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
            vm.state.page.handle = customSlugify(handle);
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
       // vm.uiState.activeElement = {};
        vm.uiState.showSectionPanel = false;
       /// vm.uiState.openSidebarSectionPanel = { name: '', id: '' };
    }

    function initializeMapSlider(){
        console.log('refresh slider');
        $timeout(function () {
          $scope.$broadcast('rzSliderForceRender');
        }, 0);
    }

    function addRemoveCustomField(type, index){
        if(type){  
            var cleanType = type.replace(/[^\w\s]/gi, '').replace(/ /g, '');
            var newInfo = {
                name: cleanType,
                type: type,
                label: type,
                custom: true,
                optional:true,
                visible: true
            }
            if(cleanType)
                vm.state.page.sections[vm.uiState.activeSectionIndex].components[vm.uiState.activeComponentIndex].contactInfo.push(newInfo);
            vm.contactInfo = {};
        }
        else{
            vm.state.page.sections[vm.uiState.activeSectionIndex].components[vm.uiState.activeComponentIndex].contactInfo.splice(index, 1);
        }
        
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
    function customSlugify(s) {
        if (!s) return "";
        s = s.replace(/[^\w\s-\/]/g, "").trim().toLowerCase();
        s =s.replace("//","/")
        return s.replace(/[-\s]+/g, "-");
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
