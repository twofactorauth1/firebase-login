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

    function loadContactDetails(){
    	ContactService.getContact(vm.state.contactId, function (contact, error) {
    		vm.state.contact = contact;
    		vm.state.fullName = [vm.state.contact.first, vm.state.contact.middle, vm.state.contact.last].join(' ').trim();
    		setTags();
    		vm.uiState.loading = false;
    	})
    	
    }

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
