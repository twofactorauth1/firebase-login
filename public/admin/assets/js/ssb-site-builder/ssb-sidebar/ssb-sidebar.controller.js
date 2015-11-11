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

ssbSiteBuilderSidebarController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$modal'];
/* @ngInject */
function ssbSiteBuilderSidebarController($scope, $attrs, $filter, SimpleSiteBuilderService, $modal) {
	
    console.info('site-build sidebar directive init...')

    var vm = this;

    vm.somethingSidebar = 'something sidebar';
    vm.init = init;
    vm.savePage = savePage;
    vm.cancelPendingEdits = cancelPendingEdits;
    vm.togglePageSectionAccordion = togglePageSectionAccordion;
    vm.togglePageSectionComponentAccordion = togglePageSectionComponentAccordion;
    vm.getSystemComponents = getSystemComponents;
    vm.addComponentToSection = addComponentToSection;
    vm.addBackground = addBackground;
    vm.openMediaModal = openMediaModal;
    vm.insertMedia = insertMedia;
    vm.showInsert = true;
    

    vm.navigation = {
    	back: function() {
    		// vm.navigation.slide = 'fade-out-left';
    		vm.navigation.index = 0;
    		vm.navigation.indexClass = 'ssb-sidebar-position-0';
    	},
    	loadPage: function(pageId) {
    		//TODO: load new page if not currently editing that page
    		vm.navigation.index = 1;
    		vm.navigation.indexClass = 'ssb-sidebar-position-1';
    	},
    	// slide: 'fade-in-right',
    	index: 0,
    	indexClass: 'ssb-sidebar-position-1'
    };

    vm.sortableOptions = {
    	handle: '.ssb-sidebar-handle',
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
	      ["#EEEEEE", "#ABB7B7", "#6C7A89", "#95A5A6"]
	    ]
	  }
	};


	function insertMedia(asset) {
		var component = vm.state.page.sections[vm.uiState.activeSectionIndex].components[vm.uiState.activeComponentIndex];
		component.bg.img.url = asset.url;
		return true;
	};

	function getSystemComponents() {
		vm.systemComponents = SimpleSiteBuilderService.getSystemComponents();
	}

	//TODO: handle versions
	function addComponentToSection(component, sectionIndex) {
		return (
			SimpleSiteBuilderService.getComponent(component, 1).then(function(response) {
				vm.state.page.sections[sectionIndex].components.push(response.data);
			})
		)
	}

	function savePage() {
		vm.state.pendingChanges = false;
		return (
			SimpleSiteBuilderService.savePage(vm.state.page).then(function(response){
				console.log('saved');
			})
		)
	}

	function cancelPendingEdits() {
		alert('TODO: reset pending changes.');
		vm.state.pendingChanges = false;
		return true;
	}

	function togglePageSectionAccordion(index) {
		if (vm.uiState.accordion.sections[index].isOpen) {
			SimpleSiteBuilderService.setActiveSection(index);
		}
    }

    function togglePageSectionComponentAccordion(index) {
		if (vm.uiState.accordion.sections[vm.uiState.activeSectionIndex].components &&
			vm.uiState.accordion.sections[vm.uiState.activeSectionIndex].components[index].isOpen) {
			SimpleSiteBuilderService.setActiveComponent(index);
		}
    }

    function addBackground() {
    	vm.openMediaModal('media-modal', 'MediaModalCtrl', null, 'lg');
    }

    function openMediaModal(modal, controller, index, size) {
        console.log('openModal >>> ', modal, controller, index);
        var _modal = {
            templateUrl: modal,
            keyboard: false,
            backdrop: 'static',
            size: 'md',
            resolve: {}
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

        if (angular.isDefined(index) && index !== null && index >= 0) {
            $scope.setEditingComponent(index);
            _modal.resolve.clickedIndex = function () {
              return index;
            };
            if ($scope.page) {
              _modal.resolve.pageHandle = function () {
                return $scope.page.handle;
              };
            }
        }

        if (size) {
            _modal.size = 'lg';
        }

        $scope.modalInstance = $modal.open(_modal);
        
        $scope.modalInstance.result.then(null, function () {
            angular.element('.sp-container').addClass('sp-hidden');
        });

    }

    function init(element) {
    	vm.element = element;
    }

}

})();