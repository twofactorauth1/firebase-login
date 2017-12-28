(function(){

app.controller('ContactDetailsController', contactDetailsController);

contactDetailsController.$inject = ['$scope', '$state', '$window', '$modal', '$stateParams', '$attrs', '$filter', '$document', '$timeout', 'toaster', 'ContactService', 'CommonService', 'OrganizationService'];
/* @ngInject */
function contactDetailsController($scope, $state, $window, $modal, $stateParams, $attrs, $filter, $document, $timeout, toaster, ContactService, CommonService, OrganizationService) {

    console.info('contact-details directive init...')

    var vm = this;

    vm.init = init;    
    vm.state ={
    	contactId: $stateParams.contactId,
    	location: {},
    	ip_geo_address: ''
    }
    vm.uiState = {
        loading: true,
        loadingMap: true,
        errorMapData: false
    }

    vm.renderAddressFormat = renderAddressFormat;
    vm.editContactDetails = editContactDetails;
    vm.cancelContactDetails = cancelContactDetails;
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
    vm.saveContactDetails = saveContactDetails;
    vm.openMediaModal = openMediaModal;
    vm.insertPhoto = insertPhoto;
    
    vm.state.orgId = $window.indigenous.orgId;
    vm.editContactMode = editContactMode;
    vm.resizeMap = resizeMap;
    function loadContactDetails(){
    	ContactService.getContact(vm.state.contactId, function (contact, error) {
    		vm.state.contact = contact;    		
    		vm.state.fullName = [vm.state.contact.first, vm.state.contact.middle, vm.state.contact.last].join(' ').trim();
    		setTags();
    		setDefaults();
    		vm.state.originalContact = angular.copy(vm.state.contact);
    		vm.uiState.loading = false;
    		getMapData();
    	})    	
    }

	function getMapData() {
		var _firstAddress;

		if (vm.state.contact.details[0].addresses.length > -1) {
			_firstAddress = angular.copy(vm.state.contact.details[0].addresses[0]);
		}

		//contact has no address
		if (!_firstAddress) {
			vm.uiState.loadingMap = false;
			vm.state.originalContact = angular.copy(vm.state.contact);
			//TODO: use contact.fingerprint to get address from session_events.maxmind
		} else {
			//contact has address and lat/lon
			if (_firstAddress.lat && _firstAddress.lon && checkIfAddressExists(_firstAddress)) {
				vm.state.originalContact = angular.copy(vm.state.contact);
				showMap(_firstAddress.lat, _firstAddress.lon);
			} else if (checkIfAddressExists(_firstAddress) && (!_firstAddress.lat || !_firstAddress.lon)) {
				//contact has address but no lat/lon
				//if contact has a session id get data from Analytics
				_firstAddress.address2 = '';
				convertAddressToLatLon(_firstAddress, function (data) {
					if (data) {
						_firstAddress.lat = parseFloat(data.lat);
						_firstAddress.lon = parseFloat(data.lon);
						showMap(data.lat, data.lon);
					}
					vm.state.originalContact = angular.copy(vm.state.contact);
					vm.uiState.loadingMap = false;
				});
				vm.state.originalContact = angular.copy(vm.state.contact);

			} else {
				vm.state.originalContact = angular.copy(vm.state.contact);
			}
		}
	};

	function refreshMap(fn) {
		if (vm.state.contact.details.length !== 0 && vm.state.contact.details[0].addresses && vm.state.contact.details[0].addresses.length !== 0) {
			var formattedAddress = angular.copy(vm.state.contact.details[0].addresses[0]);
			formattedAddress.address2 = '';
			vm.state.ip_geo_address = displayAddressFormat(formattedAddress);			
			vm.uiState.loadingMap = false;
		}
		var validMapData = false;
		if (vm.state.ip_geo_address && !angular.equals(vm.state.originalContact.details[0].addresses[0], vm.state.contact.details[0].addresses[0])) {
			ContactService.getGeoSearchAddress(vm.state.ip_geo_address, function (data) {
				if (data.error === undefined) {
					vm.state.location.lat = parseFloat(data.lat);
					vm.state.location.lon = parseFloat(data.lon);
					vm.state.contact_data.details[0].addresses[0].lat = vm.state.location.lat;
					vm.state.contact_data.details[0].addresses[0].lon = vm.state.location.lon;
					if (vm.state.markers && vm.state.markers.mainMarker) {
						vm.state.markers.mainMarker.lat = parseFloat(data.lat);
						vm.state.markers.mainMarker.lon = parseFloat(data.lon);
					}
					vm.uiState.loadingMap = false;
					validMapData = true;
				} else {
					vm.uiState.loadingMap = false;
					vm.state.location.lat = "";
					vm.state.location.lon = "";
					vm.state.contact_data.details[0].addresses[0].lat = "";
					vm.state.contact_data.details[0].addresses[0].lon = "";
					if (vm.state.markers && vm.state.markers.mainMarker) {
						vm.state.markers.mainMarker.lat = "";
						vm.state.markers.mainMarker.lon = "";
					}
				}

				if (fn) {
					fn(validMapData);
				}
			});
		} else {
			if (!vm.state.ip_geo_address.length && vm.state.contact_data) {
				vm.state.location.lat = "";
				vm.state.location.lon = "";
				vm.state.contact_data.details[0].addresses[0].lat = "";
				vm.state.contact_data.details[0].addresses[0].lon = "";
				if (vm.state.markers && vm.state.markers.mainMarker) {
					vm.state.markers.mainMarker.lat = "";
					vm.state.markers.mainMarker.lon = "";
				}
			}
			if (fn) {
				fn(true);
			}
		}
	};

	function checkIfAddressExists(address) {
		var _exists = false;
		if (address.address || address.address2 || address.city || address.state || address.zip || address.country) {
			_exists = true;
		}
		return _exists;
	};

	function convertAddressToLatLon(_address, fn) {
		if (displayAddressFormat(_address)) {
			ContactService.getGeoSearchAddress(displayAddressFormat(_address), function (data) {
				if (data.error === undefined) {
					fn(data);
				} else {
					console.warn(data.error);
					fn();
				}
			});
		} else {
			fn();
		}
	};

	function showMap(_lat, _lon) {
		vm.uiState.loadingMap = false;
		vm.state.location.lat = parseFloat(_lat);
		vm.state.location.lon = parseFloat(_lon);
		if (vm.state.markers && vm.state.markers.mainMarker) {
			vm.state.markers.mainMarker.lat = parseFloat(_lat);
			vm.state.markers.mainMarker.lon = parseFloat(_lon);
		}
	};

	function renderAddressFormat(details) {
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

	function displayAddressFormat(address) {
		return _.filter([address.address, address.address2, address.city, address.state, address.zip], function (str) {
			return str !== "";
		}).join(",");
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

	function unsetTags() {
		var tempTags = [];
		vm.state.contact_data = angular.copy(vm.state.contact);
		_.each(vm.state.contact_data.tags, function (tag) {
			tempTags.push(tag.data);
		});
		if (tempTags) {
			vm.state.contact_data.tags = _.uniq(tempTags);
		}
	};

	function editContactDetails(){
		vm.uiState.isEditMode = true;
	}

	function cancelContactDetails(){
		vm.uiState.isEditMode = false;	
	}

	/*
	 * @checkContactValidity
	 * -
	 */

	function checkContactValidity() {
		var fullName = [vm.state.contact.first, vm.state.contact.middle, vm.state.contact.last].join(' ').trim();
		var email = _.filter(vm.state.contact.details[0].emails, function (mail) {
			return mail.email !== "";
		});
		if ((angular.isDefined(fullName) && fullName !== "") || email.length > 0) {
			return true;
		}
	};

	function inValidateTags () {
		var status = false;
		if (!vm.state.contact_data.tags)
			status = true;
		else if (!vm.state.contact_data.tags.length)
			status = true;
		return status;
	};


	function openMediaModal () {
		vm.showInsert = true;
		vm.modalInstance = $modal.open({
			templateUrl: 'media-modal',
			controller: 'MediaModalCtrl',
			keyboard: true,
			backdrop: 'static',
			size: 'lg',
			resolve: {
				showInsert: function () {
					return vm.showInsert;
				},
				insertMedia: function () {
					return vm.insertPhoto;
				},
				isSingleSelect: function () {
					return true;
				}
			}
		});
	};

	function insertPhoto(asset) {
		vm.state.contact.photo = asset.url;
		updateContactPhoto(asset.url);
	};

	function updateContactPhoto(url){
		ContactService.updateContactPhoto(vm.state.contactId, url, function(data){
			if(data){
				vm.state.contact.photo = data.url;
				vm.state.originalContact.photo = data.url;
				toaster.pop('success', 'Image updated.');
			}
		})
	}

	function saveContactDetails(){
		vm.uiState.saveLoading = true;

		if (checkContactValidity()) {

			unsetTags();

			if (inValidateTags()) {
				vm.uiState.saveLoading = false;
				toaster.pop('warning', 'Please add at least one tag.');
				return;
			}

			refreshMap(function (validMapData) {
				if (!validMapData) {					
					vm.uiState.errorMapData = true;
					// $scope.saveLoading = false;
					toaster.pop('warning', 'Address could not be found.');
				}

				vm.uiState.errorMapData = false;

				if (vm.state.contact_data.details) {
					for (var i = 0; i < vm.state.contact_data.details.length; i++) {
						if (vm.state.contact_data.details[i].emails) {
							for (var j = 0; j < vm.state.contact_data.details[i].emails.length; j++) {
								vm.state.contact_data.details[i].emails[j].email = vm.state.contact_data.details[i].emails[j].email.toLowerCase();
							}
						}
					}
				}
				ContactService.checkDuplicateEmail(vm.state.contact_data.details[0].emails[0].email, true, function (data) {
					if (vm.state.originalContact && !angular.equals(vm.state.contact_data.details[0].emails[0].email, vm.state.originalContact.details[0].emails[0].email) && data && data.length && (data.length > 1 || data[0]._id != vm.state.contact_data._id)) {
						console.log("duplicate email");
						SweetAlert.swal({
							title: "Duplicate Email",
							text: "Email Already exists, Do you want to continue with changes?",
							type: "warning",
							showCancelButton: true,
							confirmButtonColor: "#DD6B55",
							confirmButtonText: "Yes, save the changes!",
							cancelButtonText: "No, do not save the changes!",
							closeOnConfirm: true,
							closeOnCancel: true
						}, function (isConfirm) {
							if (isConfirm) {
								saveContactChanges();
							} else {
								vm.uiState.saveLoading = false;
							}
						});
					} else {
						saveContactChanges();
					}
				});
			})	
			
		} else {
			vm.uiState.saveLoading = false;
			toaster.pop('warning', 'Contact Name OR Email is required');				
		}
	}


	function saveContactChanges() {
		ContactService.saveContact(vm.state.contact_data, function (contact) {
			vm.state.contact = contact;
			setDefaults();
			setTags();
			vm.uiState.saveLoading = false;
			vm.state.originalContact = angular.copy(vm.state.contact);
			toaster.pop('success', 'Contact Saved.');
		});
	};

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

	function editContactMode(field){
		editContactDetails();
		$timeout(function() {
			$("#"+field+"_0").focus();	
		}, 0);
		
	}

	function resizeMap () {
		vm.uiState.loadingMap = true;
		$timeout(function () {
			vm.uiState.loadingMap = false;
		}, 500);
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
		
		loadContactDetails()

		OrganizationService.getOrganizationById(vm.state.orgId, function(data){
			vm.state.organization = data;
		})
    }

}

})();
