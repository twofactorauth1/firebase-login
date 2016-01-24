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

ssbSiteBuilderSidebarController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'SimpleSiteBuilderService', '$modal', 'editableOptions', '$location', 'SweetAlert', 'CustomerService' ];
/* @ngInject */
function ssbSiteBuilderSidebarController($scope, $attrs, $filter, $document, $timeout, SimpleSiteBuilderService, $modal, editableOptions, $location, SweetAlert, CustomerService) {

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
    vm.getNumberOfPages = getNumberOfPages;
    vm.getTemplateById = getTemplateById;
    vm.tagToCustomer = tagToCustomer;
    vm.editSectionName = editSectionName;
    vm.hideSectionFromPage = hideSectionFromPage;
    //vm.customerTags = [];
    editableOptions.theme = 'bs3';

    vm.sortableOptions = {
    	handle: '.ssb-sidebar-move-handle',
		onSort: function (evt) {
			console.log(evt);
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
        alert('used!')
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

    function addSectionToPage(section, version) {
      SimpleSiteBuilderService.addSectionToPage(section, version, vm.modalInstance).then(function() {
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
      }
      else{
        section.visibility = true;
        setActiveSection(index);
      }

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
  		vm.state.pendingChanges = false;
  		return (
  			SimpleSiteBuilderService.saveWebsite(vm.state.website).then(function(response){
  				console.log('website saved');
  			})
  		)
  	}

  	function savePage() {
  		SweetAlert.swal({
        title: "Are you sure?",
        text: "CAUTION: For testing purposes only! Do not save your edits here unless you're OK with your pages breaking. This editor is under active development. Pages saved in Simple Site Builder will not render and will not be editable in the legacy editor.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes — I'll use Simple Site Builder going forward.",
        cancelButtonText: "No — I will use the legacy editor for now.",
        closeOnConfirm: true,
        closeOnCancel: true
      },
      function (isConfirm) {
        if (isConfirm) {

          vm.state.pendingChanges = false;

          saveWebsite();

          return (
            SimpleSiteBuilderService.savePage(vm.state.page).then(function(response){
              console.log('page saved');
            })
          )

        }
      });
  	}

  	function cancelPendingEdits() {
      vm.state.pendingChanges = false;
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
        if (componentIndex) {
          vm.state.page.sections[vm.uiState.activeSectionIndex].components[vm.uiState.activeComponentIndex].bg.img.url = asset.url;
        } else {
          vm.state.page.sections[vm.uiState.activeSectionIndex].bg.img.url = asset.url;
        }
      }

      if (sectionIndex) {
        SimpleSiteBuilderService.setActiveSection(sectionIndex);
        SimpleSiteBuilderService.setActiveComponent(undefined);
      } else {
        SimpleSiteBuilderService.setActiveSection(sectionIndex);
        SimpleSiteBuilderService.setActiveComponent(componentIndex);
      }

    }

    function addImage(sectionIndex, componentIndex) {
      vm.openMediaModal('media-modal', 'MediaModalCtrl', null, 'lg');

      vm.insertMediaCallback = function(asset) {
        if (componentIndex !== undefined) {
          vm.state.page.sections[vm.uiState.activeSectionIndex].components[vm.uiState.activeComponentIndex].src = asset.url;
        } else {
          vm.state.page.sections[vm.uiState.activeSectionIndex].src = asset.url;
        }
      }

      if (sectionIndex) {
        SimpleSiteBuilderService.setActiveSection(sectionIndex);
        SimpleSiteBuilderService.setActiveComponent(undefined);
      } else {
        SimpleSiteBuilderService.setActiveSection(sectionIndex);
        SimpleSiteBuilderService.setActiveComponent(componentIndex);
      }

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

        return (
            SimpleSiteBuilderService.createPage(template._id).then(function(data) {
                vm.closeModal();
                vm.uiState.navigation.loadPage(data.data._id);
            })
        )

    };

    function getNumberOfPages() {
        return Object.keys(vm.state.pages).length;
    }

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

                var featured = ['header', 'hero image', 'feature block', 'meet team', 'testimonials'];

                /*
                * @platformSections
                * - an array of section types and icons for the add section modal
                */
                vm.enabledPlatformSections = _.where(vm.state.platformSections, {
                    enabled: true
                });

                _.each(vm.enabledPlatformSections, function (element, index) {
                    if (featured.indexOf(element.title.toLowerCase()) !== -1) {
                        element.featured = true;
                    }
                });

                /*
                * @userSections
                * - an array of sections created by current user
                */
                vm.enabledUserSections = _.where(vm.state.userSections, {
                    enabled: true
                });

                //initially show platform sections
                vm.sections = vm.enabledPlatformSections;
                vm.sectionType = 'enabledPlatformSections';

                /************************************************************************************************************
                * Takes the platformSections object and gets the value for the filter property from any that are enabled.
                * It then makes that list unique, sorts the results alphabetically, and and removes the misc value if
                * it exists. (The misc value is added back on to the end of the list later)
                ************************************************************************************************************/
                vm.sectionFilters = _.without(_.uniq(_.pluck(_.sortBy(vm.enabledPlatformSections, 'filter'), 'filter')), 'misc');

                // Iterates through the array of filters and replaces each one with an object containing an
                // upper and lowercase version
                _.each(vm.sectionFilters, function (element, index) {
                    sectionLabel = element.charAt(0).toUpperCase() + element.substring(1).toLowerCase();
                    vm.sectionFilters[index] = {
                      'capitalized': sectionLabel,
                      'lowercase': element
                    };
                    sectionLabel = null;
                });

                // Manually add the FEATURED option to the beginning of the list
                // vm.sectionFilters.unshift({
                //     'capitalized': 'Featured',
                //     'lowercase': 'featured'
                // });

                // Manually add the Misc section back on to the end of the list
                // Exclude 'Misc' filter for emails
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

                // type is 'enabledPlatformSections' or 'enabledUserSections'
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

    function tagToCustomer(value) {
      return CustomerService.tagToCustomer(value);
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
