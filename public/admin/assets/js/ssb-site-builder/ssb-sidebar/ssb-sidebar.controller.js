(function(){

app.config(['$provide', function ($provide){
	$provide.decorator('accordionDirective', function($delegate) { 
		var directive = $delegate[0];
		directive.replace = true;
		return $delegate;
	});
}]);

app.controller('SiteBuilderSidebarController', ssbSiteBuilderSidebarController);

ssbSiteBuilderSidebarController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService'];
/* @ngInject */
function ssbSiteBuilderSidebarController($scope, $attrs, $filter, SimpleSiteBuilderService) {
	
    console.info('site-build sidebar directive init...')

    var vm = this;

    vm.somethingSidebar = 'something sidebar';
    vm.init = init;
  //   vm.uiState.accordion: {
		// site: {},
		// page: {},
		// sections: {},
  //   };
    vm.savePage = savePage;
    vm.cancelPendingEdits = cancelPendingEdits;
    vm.togglePageSectionAccordion = togglePageSectionAccordion;
    
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

	// $scope.$watch(function() { return vm.uiState }, function(activeElements){
 //        vm.uiState.accordion.sections = {};
 //        if (activeElements.section !== undefined) {
 //        	vm.uiState.accordion.sections[activeElements.section] = true;
 //        	vm.uiState.accordion.sections.isOpen = true;
 //        	vm.uiState.accordion.sections[activeElements.section].comonents[activeElements.component] = true;
 //        	vm.uiState.accordion.sections[activeElements.section].components.isOpen = true;
 //        }
 //    });

	function savePage() {
		return (
			SimpleSiteBuilderService.savePage(vm.state.page).then(function(data){
				console.log('saved');
			})
		)
	}

	function cancelPendingEdits() {
		console.log('reset pending stuff');
		return true;
	}

	function togglePageSectionAccordion(index) {
		// var activeSection = vm.uiState.accordion.sections[index].isOpen ? undefined : index;
		// vm.uiState.accordion.sections[index].isOpen = !vm.uiState.accordion.sections[index].isOpen;
		if (vm.uiState.accordion.sections[index].isOpen) {
			SimpleSiteBuilderService.setActiveSection(index);
		}
    }

    function setActiveComponent(index) {
    	var activeComponent = vm.uiState.accordion.sections[vm.uiState.activeComponentIndex].components[index] ? undefined : index;
		SimpleSiteBuilderService.setActiveComponent(activeComponent);
    }

    function init(element) {
    	vm.element = element;
    }

}

})();