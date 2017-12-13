(function(){

app.controller('ContactDetailsController', contactDetailsController);

contactDetailsController.$inject = ['$scope', '$state', '$stateParams', '$attrs', '$filter', '$document', '$timeout', 'toaster', 'ContactService', 'CommonService'];
/* @ngInject */
function contactDetailsController($scope, $state, $stateParams, $attrs, $filter, $document, $timeout, toaster, ContactService, CommonService) {

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
    vm.tagToContact = tagToContact;
    vm.showAddEmail = showAddEmail;
    vm.removeEmail = removeEmail;
    vm.contactAddEmailFn = contactAddEmailFn;
    vm.showAddPhone = showAddPhone;
    vm.removePhone = removePhone;
    vm.contactAddPhoneFn = contactAddPhoneFn;
    vm.showAddWebsite = showAddWebsite;
    vm.removeWebsite = removeWebsite;
    vm.contactAddWebsiteFn = contactAddWebsiteFn;
    vm.showAddAddress = showAddAddress;
    vm.removeAddress = removeAddress;
    vm.contactAddAddressFn = contactAddAddressFn;
    function loadContactDetails(){
    	ContactService.getContact(vm.state.contactId, function (contact, error) {
    		vm.state.contact = contact;
    		vm.state.fullName = [vm.state.contact.first, vm.state.contact.middle, vm.state.contact.last].join(' ').trim();
    		setTags();
    		setDefaults();
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

	function tagToContact(value) {
		return ContactService.tagToContact(value);
	};

	// Add/Remove email adresses
	function contactAddEmailFn() {
		vm.state.contact.details[0].emails.push({
			_id: CommonService.generateUniqueAlphaNumericShort(),
			email: ''
		});
	};

	/*
	 * @removeEmail
	 * -
	 */

	function removeEmail(index) {
		vm.state.contact.details[0].emails.splice(index, 1);
	};

	/*
	 * @showAddEmail
	 * -
	 */

	function showAddEmail(email) {
		if(email)
			return email._id === vm.state.contact.details[0].emails[0]._id;
	};

	/*
	 * @showAddPhone
	 * -
	 */

	function showAddPhone(phone) {
		if(phone)
			return phone._id === vm.state.contact.details[0].phones[0]._id;
	};


	// Add/Remove phone
	function contactAddPhoneFn() {
		vm.state.contact.details[0].phones.push({
			_id: CommonService.generateUniqueAlphaNumericShort(),
			number: '',
			extension: ''
		});
	};

	/*
	 * @removePhone
	 * -
	 */

	function removePhone(index) {
		vm.state.contact.details[0].phones.splice(index, 1);
	};


	/*
	 * @showAddWebsite
	 * -
	 */

	function showAddWebsite(website) {
		if(website)
			return website._id === vm.state.contact.details[0].websites[0]._id;
	};


	// Add/Remove website
	function contactAddWebsiteFn() {
		vm.state.contact.details[0].websites.push({
			_id: CommonService.generateUniqueAlphaNumericShort(),
			website: ''
		});
	};

	/*
	 * @removeWebsite
	 * -
	 */

	function removeWebsite(index) {
		vm.state.contact.details[0].websites.splice(index, 1);
	};


	/*
	 * @removeAddress
	 * - Add/Remove phone numbers
	 */

	function removeAddress(index) {
		vm.state.contact.details[0].addresses.splice(index, 1);
	};

	/*
	 * @showAddAddress
	 * -
	 */

	function showAddAddress(address) {
		return address._id === vm.state.contact.details[0].addresses[0]._id;
	};

	/*
	 * @contactAddAddressFn
	 * -
	 */

	function contactAddAddressFn() {
		vm.state.contact.details[0].addresses.push({
			_id: CommonService.generateUniqueAlphaNumericShort(),
			address: '',
			address2: '',
			state: '',
			zip: '',
			country: '',
			defaultShipping: false,
			defaultBilling: false,
			city: '',
			countryCode: '',
			displayName: '',
			lat: '',
			lon: ''
		});
	};

	function setDefaults() {
		// New contact
		if (vm.state.contact.details.length === 0) {
			vm.state.contact.details[0] = {};
		}
		if (!vm.state.contact.details[0].emails) {
			vm.state.contact.details[0].emails = [];
		}
		if (!vm.state.contact.details[0].phones) {
			vm.state.contact.details[0].phones = [];
		}
		if (!vm.state.contact.details[0].addresses) {
			vm.state.contact.details[0].addresses = [];
		}

		if (!vm.state.contact.details[0].websites) {
			vm.state.contact.details[0].websites = [];
		}

		if (vm.state.contact.details.length) {
			if (!vm.state.contact.details[0].emails.length) {
				vm.contactAddEmailFn();
			}
			if (!vm.state.contact.details[0].phones.length) {
				vm.contactAddPhoneFn();
			}
			if (!vm.state.contact.details[0].addresses.length) {
				vm.contactAddAddressFn();
			}
			if (!vm.state.contact.details[0].websites.length) {
				vm.contactAddWebsiteFn();
			}
		}
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
