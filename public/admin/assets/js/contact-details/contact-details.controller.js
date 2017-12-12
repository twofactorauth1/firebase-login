(function(){

app.controller('ContactDetailsController', contactDetailsController);

contactDetailsController.$inject = ['$scope', '$state', '$stateParams', '$attrs', '$filter', '$document', '$timeout', 'toaster', 'ContactService'];
/* @ngInject */
function contactDetailsController($scope, $state, $stateParams, $attrs, $filter, $document, $timeout, toaster, ContactService) {

    console.info('contact-details directive init...')

    var vm = this;

    vm.init = init;    
    vm.state ={
    	contactId: $stateParams.contactId
    }
    vm.uiState = {
        loading: true
    }

    vm.displayAddressFormat = displayAddressFormat;
    vm.editContactDetails = editContactDetails;
    function loadContactDetails(){
    	ContactService.getContact(vm.state.contactId, function (contact, error) {
    		vm.state.contact = contact;
    		vm.state.fullName = [vm.state.contact.first, vm.state.contact.middle, vm.state.contact.last].join(' ').trim();
    		setTags();
    		vm.uiState.loading = false;
    	})    	
    }

	function displayAddressFormat(details) {
      	var _firstRow = "";
        var _middleRow = "";
        var _bottomRow = "";
        separator = "<br>";
        
        if (details) {            
            if(details.address || details.address2)
            {
                if(details.address){
                    _firstRow +=  details.address + " ";     
                }
                if(details.address2){
                    _firstRow += details.address2;    
                }
                if(_firstRow.length){
                    _firstRow += separator;
                }
            }
            if(details.city || details.state || details.zip)
            {
                if(details.city){
                    _middleRow +=  details.city + ", ";     
                }
                if(details.state){
                    _middleRow +=  details.state + " ";  
                }
                if(details.zip){
                    _middleRow +=  details.zip;  
                }
                if(_middleRow.length && details.country){
                    _middleRow += separator;
                }
            }
            if(details.country){
            	_bottomRow += details.country;
            }
        }
        return _firstRow + _middleRow + _bottomRow;
	};

	function setTags() {
		console.log('setTags >>>');
		var tempTags = [];
		var cutomerTags = [];
		_.each(vm.state.contact.tags, function (tag) {
			var matchingTag = _.findWhere(vm.contactTags, {
				data: tag
			});
			if (matchingTag) {
				cutomerTags.push(matchingTag.label);
				tempTags.push(matchingTag);
			} else {
				cutomerTags.push(tag);
				tempTags.push({
					data: tag,
					label: tag
				});
			}
		});		
		vm.state.contact.tags = tempTags;
	};

	function editContactDetails(){
		vm.uiState.isEditMode = true;
	}

    function init(element) {
        vm.element = element;
        ContactService.getContactTags(function (tags) {
			vm.contactTags = tags;
		});

		ContactService.listAllContactTags(function (tags) {
			ContactService.fomatContactTags(tags, function (tags) {
				vm.contactTags = tags;
			});
		});
        loadContactDetails();
    }

}

})();
