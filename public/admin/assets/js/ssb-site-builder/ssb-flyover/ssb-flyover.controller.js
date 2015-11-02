(function(){

app.controller('SiteBuilderFlyoverController', ssbSiteBuilderFlyoverController);

ssbSiteBuilderFlyoverController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService'];
/* @ngInject */
function ssbSiteBuilderFlyoverController($scope, $attrs, $filter, SimpleSiteBuilderService) {
	
    console.info('site-build flyover directive init...')

    var vm = this;

    vm.somethingFlyover = 'something flyover';
    vm.init = init;
    vm.uiState = {
        componentEditing: undefined,
    	components: {},
    	cards: [new Card(), new Card()]
    };
    vm.savePage = savePage;
    vm.cancelPendingEdits = cancelPendingEdits;
    vm.setActiveSection = setActiveSection;
    vm.showCard = showCard;
    vm.hideCard = hideCard;
    vm.getTopCardIndex = getTopCardIndex;
    vm.uiState.topCard = 1;
    vm.uiState.showCardActionButtons = false;


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

	$scope.$watch(function() { return SimpleSiteBuilderService.activeSection; }, function(activeSection){
        vm.uiState.components = {};
        if (activeSection !== undefined) {
        	vm.uiState.components[activeSection] = true;
        	vm.uiState.components.isOpen = true;
            vm.uiState.componentEditing = vm.state.page.components[vm.state.activeSection];
        }
    });

 //    $scope.$watch('vm.state.page', function(page) {
 //    	if (!angular.equals(page, vm.state.originalPage)) {
 //    		vm.state.pendingChanges = true;
 //    	} else {
 //    		vm.state.pendingChanges = false;
 //    	}
	// }, true);

	function savePage() {
		return (
			SimpleSiteBuilderService.savePage(vm.state.page).then(function(data){
				console.log('saved');
			})
		)
	}

	//TODO: sweet alert to confirm
	//TODO: use versioning
	function cancelPendingEdits() {
		vm.state.page = angular.copy(vm.state.originalPage);
		var index = vm.getTopCardIndex();
		vm.hideCard(index);
	}

	function setActiveSection(index) {
		var activeSection = index;
		SimpleSiteBuilderService.setActiveSection(activeSection);
    }

    function showCard(level, title, template) {
    	vm.uiState.cards[level].title = title;
    	vm.uiState.cards[level].template = template;
    	vm.uiState.topCard = vm.getTopCardIndex();
    }

    function hideCard(level) {
    	delete vm.uiState.cards[level].title;
    	delete vm.uiState.cards[level].template;
    	vm.uiState.topCard--;
    }

    function getTopCardIndex() {
		var index = 0;
		for (var i = 0; i < vm.uiState.cards.length; i++) {
			if (vm.uiState.cards[i].title) {
				index = i;
			}
		}
    	return index;
    }

    function Card() {
    	return {
    		title: undefined,
    		template: undefined
    	}
    }

    function init(element) {
    	vm.element = element;
    }

}

})();