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

ssbSiteBuilderSidebarController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'SimpleSiteBuilderService', '$modal', 'editableOptions', '$location', 'SweetAlert'];
/* @ngInject */
function ssbSiteBuilderSidebarController($scope, $attrs, $filter, $document, $timeout, SimpleSiteBuilderService, $modal, editableOptions, $location, SweetAlert) {

    console.info('site-build sidebar directive init...')

    var vm = this;

    vm.init = init;
    vm.savePage = savePage;
    vm.saveWebsite = saveWebsite;
    vm.cancelPendingEdits = cancelPendingEdits;
    vm.togglePageSectionAccordion = togglePageSectionAccordion;
    vm.togglePageSectionComponentAccordion = togglePageSectionComponentAccordion;
    vm.setActiveSection = setActiveSection;
    vm.getPlatformSections = getPlatformSections;
    vm.getPlatformComponents = getPlatformComponents;
    vm.addSectionToPage = addSectionToPage;
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

    editableOptions.theme = 'bs3';

    // $scope.$watch('vm.uiState.activeSectionIndex', function(index) {
    //     console.log('activeSectionIndex changed: ', index);
    //     vm.navigation.loadPage();
    // }, true);

    vm.navigation = {
    	back: function() {
    		vm.navigation.index = 0;
    		vm.navigation.indexClass = 'ssb-sidebar-position-0';
    	},
    	loadPage: function(pageId) {
            if (pageId && pageId !== vm.state.page._id) {
                vm.state.page = null;
                vm.uiState = {
                    loading: 0,
                    activeSectionIndex: undefined,
                    activeComponentIndex: undefined,
                    show: {
                        flyover: true,
                        sidebar: true
                    },
                    accordion: {
                        site: {},
                        page: {},
                        sections: {}
                    }
                };
                $location.path('/website/site-builder/pages/' + pageId);
            } else {
                vm.navigation.index = 1;
                vm.navigation.indexClass = 'ssb-sidebar-position-1';
            }
    	},
    	goToPagesListPage: function() {
    		$location.url('/website/site-builder/pages/');
    	},
    	index: 0,
    	indexClass: 'ssb-sidebar-position-1'
    };

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
  	  options: {
  	    showPalette: true,
  	    clickoutFiresChange: true,
  	    showInput: true,
  	    showButtons: true,
  	    allowEmpty: true,
  	    hideAfterPaletteSelect: false,
  	    showPaletteOnly: false,
  	    togglePaletteOnly: true,
  	    togglePaletteMoreText: 'more',
  	    togglePaletteLessText: 'less',
  	    preferredFormat: 'hex',
  	    appendTo: 'body',
  	    palette: [
  	      ["#C91F37", "#DC3023", "#9D2933", "#CF000F", "#E68364", "#F22613", "#CF3A24", "#C3272B", "#8F1D21", "#D24D57"],
  	      ["#F08F907", "#F47983", "#DB5A6B", "#C93756", "#FCC9B9", "#FFB3A7", "#F62459", "#F58F84", "#875F9A", "#5D3F6A"],
  	      ["#89729E", "#763568", "#8D608C", "#A87CA0", "#5B3256", "#BF55EC", "#8E44AD", "#9B59B6", "#BE90D4", "#4D8FAC"],
  	      ["#5D8CAE", "#22A7F0", "#19B5FE", "#59ABE3", "#48929B", "#317589", "#89C4F4", "#4B77BE", "#1F4788", "#003171"],
  	      ["#044F67", "#264348", "#7A942E", "#8DB255", "#5B8930", "#6B9362", "#407A52", "#006442", "#87D37C", "#26A65B"],
  	      ["#26C281", "#049372", "#2ABB9B", "#16A085", "#36D7B7", "#03A678", "#4DAF7C", "#D9B611", "#F3C13A", "#F7CA18"],
  	      ["#E2B13C", "#A17917", "#F5D76E", "#F4D03F", "#FFA400", "#E08A1E", "#FFB61E", "#FAA945", "#FFA631", "#FFB94E"],
  	      ["#E29C45", "#F9690E", "#CA6924", "#F5AB35", "#BFBFBF", "#F2F1EF", "#BDC3C7", "#ECF0F1", "#D2D7D3", "#757D75"],
  	      ["#EEEEEE", "#ABB7B7", "#6C7A89", "#95A5A6", "#9ACCCB", "#E8E7E7", "#000000", "#FFFFFF", "#50c7e8"]
  	    ]
  	  }
  	};

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
      SimpleSiteBuilderService.addSectionToPage(section, version, vm.modalInstance);
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
      vm.state.website = vm.state.originalWebsite;
      vm.state.page = vm.state.originalPage;
    }

  	function togglePageSectionAccordion(index) {
  		if (vm.uiState.accordion.sections[index].isOpen) {
  			SimpleSiteBuilderService.setActiveSection(index);
  		}
    }

    function togglePageSectionComponentAccordion(index) {
  		//TODO: this fires on all clicks anywhere within the component panel... so all settings, etc.
  		SimpleSiteBuilderService.setActiveComponent(index);
    }

    function setActiveSection(index) {
        SimpleSiteBuilderService.setActiveSection(index);

        //TODO: not working...
        $timeout(function () {
            var elementId = vm.state.page.sections[index]._id;
            var element = angular.element(document.getElementById(elementId));
            if (element) {
              $document.scrollToElement(element, 175, 1000);
            }
        }, 0);
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
        if (componentIndex) {
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
                vm.navigation.loadPage(data.data._id);
            })
        )

    };

    function getTemplateById(id) {
        SimpleSiteBuilderService.getTemplateById(id);
    };

    function setupSectionContent() {

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
        vm.sectionFilters.unshift({
            'capitalized': 'Featured',
            'lowercase': 'featured'
        });

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

    }

    function init(element) {
    	vm.element = element;
      if(!vm.state.platformSections){          
        SimpleSiteBuilderService.getPlatformSections().then(function(sections) {
          vm.state.platformSections = sections.data;
          setupSectionContent();
        })
      }
      else{
        setupSectionContent();
      }
    }

}

})();
