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

ssbSiteBuilderSidebarController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'SimpleSiteBuilderService', '$modal', 'editableOptions', '$location', 'SweetAlert', 'CustomerService', 'toaster'];
/* @ngInject */
function ssbSiteBuilderSidebarController($scope, $attrs, $filter, $document, $timeout, SimpleSiteBuilderService, $modal, editableOptions, $location, SweetAlert, CustomerService, toaster) {

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
    vm.scrollToActiveSection = scrollToActiveSection;
    vm.removeSectionFromPage = removeSectionFromPage;
    vm.removeComponentFromSection = removeComponentFromSection;
    vm.addComponentToSection = addComponentToSection;
    vm.addBackground = addBackground;
    vm.addImage = addImage;
    vm.openModal = openModal;
    vm.openPageSettingsModal = openPageSettingsModal;
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
    vm.moveSection = moveSection;
    vm.validateDuplicatePage = validateDuplicatePage;
    editableOptions.theme = 'bs3';

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

    function addSectionToPage(section, version, replaceAtIndex, oldSection) {
      SimpleSiteBuilderService.addSectionToPage(section, version, replaceAtIndex, vm.state.page.sections[vm.uiState.activeSectionIndex]).then(function() {
        vm.scrollToActiveSection();
      });
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
                text: "Do you want to hide this section from page?",
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
                    setActiveSection(index);
                }
            });

        } else {
            section.visibility = true;
            setActiveSection(index);
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

    function removeSectionFromPage(index) {
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
          vm.state.page.sections.splice(index, 1);
          vm.uiState.activeSectionIndex = undefined;
          vm.uiState.activeComponentIndex = undefined;
        }
      });
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
      vm.state.website = angular.copy(vm.state.originalWebsite);
      vm.state.page = angular.copy(vm.state.originalPage);
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
      SimpleSiteBuilderService.setActiveSection(index);
      if (vm.state.page.sections[index].visibility) {
        vm.uiState.showSectionPanel = true;
        vm.scrollToActiveSection();
      }

    }

    function addBackground(sectionIndex, componentIndex) {
    	vm.openMediaModal('media-modal', 'MediaModalCtrl', null, 'lg');

      vm.insertMediaCallback = function(asset) {
        if (componentIndex !== undefined && componentIndex !== null) {
          vm.state.page.sections[vm.uiState.activeSectionIndex].components[vm.uiState.activeComponentIndex].bg.img.url = asset.url;
        } else {
          vm.state.page.sections[vm.uiState.activeSectionIndex].bg.img.url = asset.url;
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
        keyboard: false,
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


    function openPageSettingsModal(modal, controller, index, size, pageId) {
      console.log('openModal >>> ', modal, controller, index);
      var _modal = {
        templateUrl: modal,
        keyboard: false,
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

      _modal.resolve.pageId = function () {
        return pageId;
      };

      vm.modalInstance = $modal.open(_modal);

      vm.modalInstance.result.then(null, function () {
        angular.element('.sp-container').addClass('sp-hidden');
      });

    }

    function openMediaModal(modal, controller, index, size) {
      console.log('openModal >>> ', modal, controller, index);
      var _modal = {
        templateUrl: modal,
        keyboard: false,
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
  		// 	vm.uiState.duplicateUrl = dup;
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
                  vm.closeModal();
                  vm.state.saveLoading = false;
                  vm.uiState.navigation.loadPage(data.data._id);
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
                _.each(vm.sectionFilters, function (element, index) {
                    sectionLabel = element.charAt(0).toUpperCase() + element.substring(1).toLowerCase();
                    vm.sectionFilters[index] = {
                      'capitalized': sectionLabel,
                      'lowercase': element
                    };
                    sectionLabel = null;
                });

                // Manually add the Misc section back on to the end of the list
                vm.sectionFilters.push({
                  'capitalized': 'Misc',
                  'lowercase': 'misc'
                });

                // Manually add the All option to the end of the list
                vm.sectionFilters.push({
                    'capitalized': 'All',
                    'lowercase': 'all'
                });

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
        }
        else{
          vm.state.page.mainmenu = true;
        }
      });
    }

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
              SimpleSiteBuilderService.getPages().then(function(pages) {
                vm.state.saveLoading = false;
                console.log('page deleted');
                toaster.pop('success', 'Page deleted', 'The page deleted successfully.');
                  $timeout(function () {
                    if(pages["index"])
                        vm.uiState.navigation.loadPage(pages["index"]._id);
                      else
                        $location.path('/website/site-builder/pages/');
                }, 0);

              });
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
              vm.state.saveLoading = false;
              vm.uiState.navigation.loadPage(page.data._id);
            })
          })
        }
      });
    }

    function validateDuplicatePage(pageHandle) {
      var _page = vm.state.originalPages[pageHandle];      
      if(_page && _page._id !== vm.state.page._id){
        return "Page url should be unique";
      }
    }

    function init(element) {

        vm.element = element;

        setupSectionContent();
        CustomerService.getCustomers(function(customers){
          CustomerService.getAllCustomerTags(customers,function(tags){
            vm.customerTags = tags;
          });
        })
    }
}

})();
