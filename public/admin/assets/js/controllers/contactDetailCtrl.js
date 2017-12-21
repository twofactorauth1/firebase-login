/*global app ,console ,angular , moment, $$ ,$, _ */
/*jslint unparam:true*/
/* eslint-disable no-console */
(function (angular) {
	"use strict";
	app.controller('ContactDetailCtrl', ["$scope", "$rootScope", "$location", "$modal", "toaster", "$stateParams", "contactConstant", "ContactService", "CommonService", "UserService", 'SweetAlert', '$state', 'OrderService', 'formValidations', 'orderConstant', '$window', '$timeout', function ($scope, $rootScope, $location, $modal, toaster, $stateParams, contactConstant, ContactService, CommonService, UserService, SweetAlert, $state, OrderService, formValidations, orderConstant, $window, $timeout) {

		/*
		 * @openModal
		 * -
		 */

		$scope.notesEmail = {
			enable: false
		};
        $scope.isPhoneDirty = false;
		$scope.openModal = function (modal) {
			$scope.modalInstance = $modal.open({
				templateUrl: modal,
				keyboard: true,
				backdrop: 'static',
				scope: $scope
			});
		};

		/*
		 * @openMediaModal
		 * -
		 */

        $scope.isFormValid = function(error, dirty){
        $scope.validationFailed = false;

         for (var property in error) {
            if (error.hasOwnProperty(property)) {
                property = property.toString();
                if(property.indexOf('phone') === -1){
                     $scope.validationFailed = true;
                }
                else{
                    if(error[property][0] !== undefined && error[property][0].$dirty && error[property][0].$invalid){
                       $scope.validationFailed = true;
                    }
                }

            }
        }
           return $scope.validationFailed;

        };
		$scope.openMediaModal = function () {
			$scope.showInsert = true;
			$scope.modalInstance = $modal.open({
				templateUrl: 'media-modal',
				controller: 'MediaModalCtrl',
				keyboard: true,
				backdrop: 'static',
				size: 'lg',
				resolve: {
					showInsert: function () {
						return $scope.showInsert;
					},
					insertMedia: function () {
						return $scope.insertPhoto;
					},
					isSingleSelect: function () {
						return true;
					}
				}
			});
		};

		/*
		 * @closeModal
		 * -
		 */

		$scope.closeModal = function () {
			$scope.modalInstance.close();
		};
        $scope.getPhoneStatus = function(){
          $scope.isPhoneDirty = true;
        };
		$scope.formValidations = formValidations;
		$scope.orderConstant = orderConstant;

		$scope.ip_geo_address = '';
		$scope.location = {};
		$scope.loadingMap = true;

		$scope.data = {
			fullName: '',
			loaded: false
		};

		if ($location.search().order) {
			$scope.redirectToOrder = true;
			$scope.orderId = $location.search().id;
			$stateParams.orderId = $scope.orderId;
			//alert("orderId: "+$scope.orderId);
		}

		$scope.backToOrder = function () {
			if ($stateParams.orderId) {
				$location.path('/commerce/orders/' + $stateParams.orderId);
			} else {
				$window.history.back();
			}

		};
		$scope.backToContacts = function () {
			$location.url('/contacts');
		};
		/*
		 * @addNote
		 * add a note to an order
		 */

		$scope.newNote = {};

		function getUserName() {
			var _userName = $scope.$parent.currentUser.email;
			if ($scope.$parent.currentUser.first || $scope.$parent.currentUser.last) {
				_userName = $scope.$parent.currentUser.first + " " + $scope.$parent.currentUser.last;
			}
			return _userName.trim();
		}

		$scope.addNote = function (_note) {
			var date = moment(),
				_noteToPush = {
					note: _note,
					user_id: $scope.currentUser._id,
					date: date.toISOString()
				},
				contactData = {};
			if (!$scope.contact.notes) {
				$scope.contact.notes = [];
			}
			$scope.contact.notes.push(_noteToPush);
			$scope.matchUsers($scope.contact);

			$scope.newNote.text = '';

			$scope.contact_data = $scope.contact_data || {};
			$scope.contact_data.tags = $scope.unsetTags();
			var sendEmail = {};
			if ($scope.notesEmail.enable) {
				sendEmail = {
					sendTo: $scope.contact.details[0].emails[0].email,
					fromEmail: $scope.$parent.currentUser.email,
					fromName: getUserName(),
					note_value: _note,
					enable_note: $scope.notesEmail.enable
				};
			}
			contactData = {
				data_contact: $scope.contact_data._id,
				email_send: sendEmail
			};
			console.log('contact_data:', $scope.contact_data);
			ContactService.saveContact($scope.contact_data, function (contact) {
				$scope.contact = contact;
				$scope.setTags();
				$scope.originalContact = angular.copy($scope.contact);
				toaster.pop('success', 'Notes Added.');
				$scope.notesEmail = {
					enable: false
				};
			});
			if ($scope.notesEmail.enable) {
				ContactService.addContactNote(contactData, function (response) {
					console.log('Email sent on note creation.', response);
					$scope.notesEmail = {
						enable: false
					};
				});
			}
		};

		/*
		 * @getUsers
		 * get all users for this account
		 */

		UserService.getUsers(function (users) {
			$scope.users = users;
			$scope.getContact();
		});

		/*
		 * @matchUsers
		 * match users to the order notes
		 */
		$scope.matchUsers = function (contact) {
			var notes = contact.notes;
			if (notes && notes.length > 0) {

				_.each(notes, function (_note) {
					var matchingUser = _.find($scope.users, function (_user) {
						return _user._id === _note.user_id;
					});

					// This code is used to show related user profile image in notes

					if (matchingUser) {
						if (matchingUser.profilePhotos && matchingUser.profilePhotos[0])
							_note.user_profile_photo = matchingUser.profilePhotos[0];
					}
				});

				return notes;
			}
		};

		/*
		 * @pushLocalNote
		 * push a recently created note to the ui
		 */

		$scope.pushLocalNote = function (contact) {
			contact.notes = $scope.matchUsers(contact);
			var noteToPush = contact.notes[contact.notes.length - 1];
			$scope.contact.notes.push(noteToPush);
		};

		/*
		 * @getContact
		 * -
		 */

		$scope.getContact = function () {
			console.log('getContact >>>');
			ContactService.getContact($stateParams.contactId, function (contact, error) {
				if (error) {
					toaster.pop('warning', error.message);
					if (error.code === 404) {
						$location.path('/contacts');
					}
					return;
				}
				contact.notes = $scope.matchUsers(contact);
				$scope.contact = contact;
				$scope.setTags();
				$scope.setDefaults();
				$scope.data.fullName = [$scope.contact.first, $scope.contact.middle, $scope.contact.last].join(' ').trim();
				$scope.data.loaded = true;
				$scope.getMapData();
				// $scope.contactLabel = ContactService.contactLabel(contact);
				// $scope.checkBestEmail = ContactService.checkBestEmail(contact);
			});
		};

		$scope.resizeMap = function () {
			$scope.loadingMap = true;
			$timeout(function () {
				$scope.loadingMap = false;
			}, 500);
		};

		/*
		 * @displayAddressFormat
		 * -
		 */

		$scope.displayAddressFormat = function (address) {
			return _.filter([address.address, address.address2, address.city, address.state, address.zip], function (str) {
				return str !== "";
			}).join(",");
		};

		$scope.queryAddressFormat = function (address) {
			var str = "";
			if (address.address) {
				str += 'street=' + address.address + '&';
			}
			if (address.city) {
				str += 'city=' + address.city + '&';
			}
			if (address.state) {
				str += 'state=' + address.state + '&';
			}
			if (address.zip) {
				str += 'postalcode=' + address.zip + '&';
			}
			if (address.country) {
				str += 'country=' + address.country;
			} else {
				str += 'country=us';
			}
			return str;
		};


		function checkIfAddressExists(address) {
			var _exists = false;
			if (address.address || address.address2 || address.city || address.state || address.zip || address.country) {
				_exists = true;
			}
			return _exists;
		}

		/*
		 * @refreshMap
		 * -
		 */

		$scope.refreshMap = function (fn) {
			if ($scope.contact.details.length !== 0 && $scope.contact.details[0].addresses && $scope.contact.details[0].addresses.length !== 0) {
				var formattedAddress = angular.copy($scope.contact.details[0].addresses[0]);
				formattedAddress.address2 = '';
				$scope.ip_geo_address = $scope.displayAddressFormat(formattedAddress);

				$scope.city = $scope.contact.details[0].addresses[0].city;
				$scope.loadingMap = false;
			}
			var validMapData = false;
			if ($scope.ip_geo_address && !angular.equals($scope.originalContact.details[0].addresses[0], $scope.contact.details[0].addresses[0])) {
				ContactService.getGeoSearchAddress($scope.ip_geo_address, function (data) {
					if (data.error === undefined) {
						$scope.location.lat = parseFloat(data.lat);
						$scope.location.lon = parseFloat(data.lon);
						$scope.contact_data.details[0].addresses[0].lat = $scope.location.lat;
						$scope.contact_data.details[0].addresses[0].lon = $scope.location.lon;
						if ($scope.markers && $scope.markers.mainMarker) {
							$scope.markers.mainMarker.lat = parseFloat(data.lat);
							$scope.markers.mainMarker.lon = parseFloat(data.lon);
						}
						$scope.loadingMap = false;
						validMapData = true;
					} else {
						$scope.loadingMap = false;
						$scope.location.lat = "";
						$scope.location.lon = "";
						$scope.contact_data.details[0].addresses[0].lat = "";
						$scope.contact_data.details[0].addresses[0].lon = "";
						if ($scope.markers && $scope.markers.mainMarker) {
							$scope.markers.mainMarker.lat = "";
							$scope.markers.mainMarker.lon = "";
						}
					}

					if (fn) {
						fn(validMapData);
					}
				});
			} else {
				if (!$scope.ip_geo_address.length && $scope.contact_data) {
					$scope.location.lat = "";
					$scope.location.lon = "";
					$scope.contact_data.details[0].addresses[0].lat = "";
					$scope.contact_data.details[0].addresses[0].lon = "";
					if ($scope.markers && $scope.markers.mainMarker) {
						$scope.markers.mainMarker.lat = "";
						$scope.markers.mainMarker.lon = "";
					}
				}
				if (fn) {
					fn(true);
				}
			}
		};

		$scope.getMapData = function () {
			var _firstAddress;

			if ($scope.contact.details[0].addresses.length > -1) {
				_firstAddress = angular.copy($scope.contact.details[0].addresses[0]);
			}

			//contact has no address
			if (!_firstAddress) {
				$scope.loadingMap = false;
				$scope.originalContact = angular.copy($scope.contact);
				//TODO: use contact.fingerprint to get address from session_events.maxmind
			} else {
				//contact has address and lat/lon
				if (_firstAddress.lat && _firstAddress.lon && checkIfAddressExists(_firstAddress)) {
					$scope.originalContact = angular.copy($scope.contact);
					$scope.showMap(_firstAddress.lat, _firstAddress.lon);
				} else if (checkIfAddressExists(_firstAddress) && (!_firstAddress.lat || !_firstAddress.lon)) {
					//contact has address but no lat/lon
					//if contact has a session id get data from Analytics
					_firstAddress.address2 = '';
					$scope.convertAddressToLatLon(_firstAddress, function (data) {
						if (data) {
							_firstAddress.lat = parseFloat(data.lat);
							_firstAddress.lon = parseFloat(data.lon);
							$scope.showMap(data.lat, data.lon);
						}
						$scope.originalContact = angular.copy($scope.contact);
						$scope.loadingMap = false;
					});
					$scope.originalContact = angular.copy($scope.contact);

				} else {
					$scope.originalContact = angular.copy($scope.contact);
				}
			}
		};

		$scope.convertAddressToLatLon = function (_address, fn) {
			if ($scope.displayAddressFormat(_address)) {
				ContactService.getGeoSearchAddress($scope.displayAddressFormat(_address), function (data) {
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

		$scope.showMap = function (_lat, _lon) {
			$scope.loadingMap = false;
			$scope.location.lat = parseFloat(_lat);
			$scope.location.lon = parseFloat(_lon);
			if ($scope.markers && $scope.markers.mainMarker) {
				$scope.markers.mainMarker.lat = parseFloat(_lat);
				$scope.markers.mainMarker.lon = parseFloat(_lon);
			}
		};

		/*
		 * @contact defaults
		 * -
		 */

		$scope.contactId = $stateParams.contactId;
		$scope.modifyAddress = {};
		$scope.saveLoading = false;
		$scope.countries = contactConstant.country_codes;
		$scope.saveContactDisabled = true;
		$scope.contact = {
			_id: null,
			accountId: $$.server.accountId,
			devices: [
				{
					_id: CommonService.generateUniqueAlphaNumericShort(),
					serial: ''
                }
            ],
			details: [
				{
					_id: CommonService.generateUniqueAlphaNumericShort(),
					type: 'lo',
					emails: [
						{
							_id: CommonService.generateUniqueAlphaNumericShort(),
							email: ''
                        }
                    ],
					phones: [
						{
							_id: CommonService.generateUniqueAlphaNumericShort(),
							type: 'm',
							number: '',
							extension: '',
							default: false
                        }
                    ],
					addresses: [
						{
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
                        }
                    ]

                }
            ],
		};

		$scope.inValidateTags = function () {
			var status = false;
			if (!$scope.contact_data.tags)
				status = true;
			else if (!$scope.contact_data.tags.length)
				status = true;
			return status;
		};

		$scope.contactSaveFn = function (hideToaster, showAlert, newUrl) {
			$scope.pageSaving = true;
			$scope.saveLoading = true;

			if ($scope.checkContactValidity()) {

				$scope.unsetTags();

				if (!hideToaster && $scope.inValidateTags()) {
					$scope.saveLoading = false;
					if (showAlert)
						SweetAlert.swal("Warning", "Your edits were NOT saved.", "error");
					toaster.pop('warning', 'Please add at least one tag.');
					return;
				}

				// if ($scope.contact_data.details[0].addresses.length > -1) {
				//   _.each($scope.contact_data.details[0].addresses, function(_address) {
				//     $scope.convertAddressToLatLon(_address, function (data) {
				//       _address.lat = parseFloat(data.lat);
				//       _address.lon = parseFloat(data.lon);
				//     });
				//   });
				// }
				$scope.refreshMap(function (validMapData) {
					if (!validMapData) {
						if (!hideToaster) {
							$scope.errorMapData = true;
							// $scope.saveLoading = false;
							toaster.pop('warning', 'Address could not be found.');
						}
					}

					$scope.errorMapData = false;
					if ($scope.contact_data.details) {
						for (var i = 0; i < $scope.contact_data.details.length; i++) {
							if ($scope.contact_data.details[i].emails) {
								for (var j = 0; j < $scope.contact_data.details[i].emails.length; j++) {
									$scope.contact_data.details[i].emails[j].email = $scope.contact_data.details[i].emails[j].email.toLowerCase();
								}
							}
						}
					}
					ContactService.checkDuplicateEmail($scope.contact_data.details[0].emails[0].email, !hideToaster, function (data) {
						if ($scope.originalContact && !angular.equals($scope.contact_data.details[0].emails[0].email, $scope.originalContact.details[0].emails[0].email) && data && data.length && (data.length > 1 || data[0]._id != $scope.contact_data._id)) {
							console.log("duplicate email");
							if (!hideToaster) {
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
										$scope.saveContactChanges(hideToaster, showAlert, newUrl);
									} else {
										$scope.saveLoading = false;
									}
								});
								if (showAlert)
									SweetAlert.swal("Warning", "Your edits were NOT saved.", "error");
							}
						} else {
							$scope.saveContactChanges(hideToaster, showAlert, newUrl);
						}
					});
				});
			} else {
				$scope.saveLoading = false;
				if (!hideToaster) {
					toaster.pop('warning', 'Contact Name OR Email is required');
				}
				if (showAlert)
					SweetAlert.swal("warning", "Your edits were NOT saved.", "error");
			}

		};

		// Save contact

		$scope.saveContactChanges = function (hideToaster, showAlert, newUrl) {
			ContactService.saveContact($scope.contact_data, function (contact) {
				$scope.contact = contact;
				$scope.setDefaults();
				$scope.setTags();
				$scope.saveLoading = false;
				$scope.originalContact = angular.copy($scope.contact);
				if (!hideToaster) {
					if ($scope.currentState === 'customerAdd') {
						toaster.pop('success', 'Contact Created.');
					} else {
						toaster.pop('success', 'Contact Saved.');
					}
				}
				$scope.pageSaving = false;
				if (showAlert) {
					SweetAlert.swal("Saved!", "Your edits were saved to the page.", "success");
					$window.location = newUrl;
				}
			});
		};

		/*
		 * @checkContactValidity
		 * -
		 */

		$scope.checkContactValidity = function () {
			var fullName = $scope.data.fullName;
			var email = _.filter($scope.contact.details[0].emails, function (mail) {
				return mail.email !== "";
			});
			if ((angular.isDefined(fullName) && fullName !== "") || email.length > 0) {
				return true;
			}
		};

		/*
		 * @addDeviceFn
		 * -
		 */

		$scope.addDeviceFn = function () {
			$scope.contact.devices.push({
				_id: $$.u.idutils.generateUniqueAlphaNumericShort(),
				serial: ''
			});
		};

		/*
		 * @removeItem
		 * -
		 */

		$scope.removeItem = function (index, obj) {
			obj.splice(index, 1);
		};

		/*
		 * @contactPhoneTypeSaveFn
		 * -
		 */

		$scope.contactPhoneTypeSaveFn = function (index, type) {
			var typeLabel = null;
			if (type === 'm') {
				typeLabel = 'mobile';
			}
			if (type === 'h') {
				typeLabel = 'home';
			}
			if (type === 'w') {
				typeLabel = 'work';
			}
			$('#contact-phone-type-' + index).html(typeLabel);
			$scope.contact.details[0].phones[index].type = type;
		};

		/*
		 * @getModifyAddressFn
		 * -
		 */

		$scope.getModifyAddressFn = function (index) {
			return $scope.modifyAddress[index];
		};

		/*
		 * @setModifyAddressFn
		 * -
		 */

		$scope.setModifyAddressFn = function (index, state) {
			$scope.modifyAddress[index] = state;
		};

		/*
		 * @contactDeleteFn
		 * -
		 */

		$scope.contactDeleteFn = function () {
			ContactService.deleteContact($scope.contactId, function (contact) {
				toaster.pop('success', 'Contact Deleted.', contact);
			});
		};

		/*
		 * @restoreFn
		 * -
		 */

		$scope.restoreFn = function () {
			if ($scope.contactId) {
				if ($scope.contact.type === undefined) {
					$scope.contact.type = $scope.userPreferences.default_customer_type;
				}
				if ($scope.contact.details[0].addresses.length === 0) {
					//$scope.contact.details[0].addresses.push({});
					$scope.contact.details[0].addresses[0].city = $scope.userPreferences.default_customer_city;
					$scope.contact.details[0].addresses[0].state = $scope.userPreferences.default_customer_state;
					$scope.contact.details[0].addresses[0].country = $scope.userPreferences.default_customer_country;
					$scope.contact.details[0].addresses[0].zip = $scope.userPreferences.default_customer_zip;
				}
			} else {
				$scope.contact.type = $scope.userPreferences.default_customer_type;
				//$scope.contact.details[0].addresses.push({});
				$scope.contact.details[0].addresses[0].city = $scope.userPreferences.default_customer_city;
				$scope.contact.details[0].addresses[0].state = $scope.userPreferences.default_customer_state;
				$scope.contact.details[0].addresses[0].country = $scope.userPreferences.default_customer_country;
				$scope.contact.details[0].addresses[0].zip = $scope.userPreferences.default_customer_zip;
			}
		};

		/*
		 * @savePreferencesFn
		 * -
		 */

		$scope.savePreferencesFnWait = false;

		$scope.savePreferencesFn = function () {
			if ($scope.savePreferencesFnWait) {
				return;
			}
			$scope.savePreferencesFnWait = true;
			$timeout(function () {
				UserService.updateUserPreferences($scope.userPreferences, true, function (preferences) {
					console.log('preferences ', preferences);
				});
				$scope.restoreFn();
				$scope.savePreferencesFnWait = false;
			}, 1500);
		};

		/*
		 * @watch: fullName
		 * -
		 */

		$scope.setFullName = function () {
			var newValue = $scope.data.fullName;
			var nameSplit = newValue.match(/\S+/g);
			if (nameSplit) {
				if (nameSplit.length >= 3) {
					$scope.contact.first = nameSplit[0];
					$scope.contact.middle = nameSplit[1];
					$scope.contact.last = nameSplit[2];
				} else if (nameSplit.length === 2) {
					$scope.contact.first = nameSplit[0];
					$scope.contact.middle = '';
					$scope.contact.last = nameSplit[1];
				} else if (nameSplit.length === 1) {
					$scope.contact.first = nameSplit[0];
					$scope.contact.middle = '';
					$scope.contact.last = '';
				}
			} else {
				$scope.contact.first = '';
				$scope.contact.middle = '';
				$scope.contact.last = '';
			}
		};

		/*
		 * @insertPhoto
		 * -
		 */

		$scope.insertPhoto = function (asset) {
			$scope.contact.photo = asset.url;
		};

		/*
		 * @removePhoto
		 * -
		 */

		$scope.removePhoto = function (asset) {
			console.log(asset);
			$scope.contact.photo = null;
		};

		/*
		 * @enableSaveBtnFn
		 * -
		 */

		$scope.enableSaveBtnFn = function () {
			$scope.saveContactDisabled = false;
		};

		/*
		 * @contactLabel
		 * -
		 */

		$scope.contactLabel = function (contact) {
			return ContactService.contactLabel(contact);
		};

		/*
		 * @checkBestEmail
		 * -
		 */

		$scope.checkBestEmail = function (contact) {
			var returnVal = ContactService.checkBestEmail(contact);
			this.email = contact.email;
			return returnVal;
		};

		/*
		 * @checkFacebookId
		 * -
		 */

		$scope.checkFacebookId = function (contact) {
			var returnVal = ContactService.checkFacebookId(contact);
			this.facebookId = contact.facebookId;
			return returnVal;
		};

		/*
		 * @checkTwitterId
		 * -
		 */

		$scope.checkTwitterId = function (contact) {
			var returnVal = ContactService.checkTwitterId(contact);
			this.twitterId = contact.twitterId;
			return returnVal;
		};

		/*
		 * @checkLinkedInId
		 * -
		 */

		$scope.checkLinkedInId = function (contact) {
			var returnVal = ContactService.checkLinkedInId(contact);
			this.linkedInUrl = contact.linkedInUrl;
			this.linkedInId = contact.linkedInId;
			return returnVal;
		};

		/*
		 * @checkAddress
		 * -
		 */

		$scope.checkAddress = function (contact) {
			var returnVal = ContactService.checkAddress(contact);
			this.address = contact.address;
			return returnVal;
		};

		/*
		 * @contactAddEmailFn
		 * -
		 */

		// Add/Remove email adresses
		$scope.contactAddEmailFn = function () {
			$scope.contact.details[0].emails.push({
				_id: CommonService.generateUniqueAlphaNumericShort(),
				email: ''
			});
		};

		/*
		 * @removeEmail
		 * -
		 */

		$scope.removeEmail = function (index) {
			$scope.contact.details[0].emails.splice(index, 1);
		};

		/*
		 * @showAddEmail
		 * -
		 */

		$scope.showAddEmail = function (email) {
			return email._id === $scope.contact.details[0].emails[0]._id;
		};

		/*
		 * @addContactPhoneFn
		 * - Add/Remove phone numbers
		 */

		$scope.addContactPhoneFn = function () {
			$scope.contact.details[0].phones.push({
				_id: CommonService.generateUniqueAlphaNumericShort(),
				number: '',
				extension: ''
			});
		};

		/*
		 * @removePhone
		 * -
		 */

		$scope.removePhone = function (index) {
			$scope.contact.details[0].phones.splice(index, 1);
		};

		/*
		 * @showAddPhone
		 * -
		 */

		$scope.showAddPhone = function (phone) {
			return phone._id === $scope.contact.details[0].phones[0]._id;
		};

		/*
		 * @removeAddress
		 * - Add/Remove phone numbers
		 */

		$scope.removeAddress = function (index) {
			$scope.contact.details[0].addresses.splice(index, 1);
		};

		/*
		 * @showAddAddress
		 * -
		 */

		$scope.showAddAddress = function (address) {
			return address._id === $scope.contact.details[0].addresses[0]._id;
		};

		/*
		 * @contactAddAddressFn
		 * -
		 */

		$scope.contactAddAddressFn = function () {
			$scope.contact.details[0].addresses.push({
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
			//$scope.contactAddressWatchFn($scope.contact.details[0].addresses.length - 1);
		};

		/*
		 * @setDefaults
		 * -
		 */

		$scope.setDefaults = function () {
			// New contact
			if ($scope.contact.details.length === 0) {
				$scope.contact.details[0] = {};
			}
			if (!$scope.contact.details[0].emails) {
				$scope.contact.details[0].emails = [];
			}
			if (!$scope.contact.details[0].phones) {
				$scope.contact.details[0].phones = [];
			}
			if (!$scope.contact.details[0].addresses) {
				$scope.contact.details[0].addresses = [];
			}

			if ($scope.contact.details.length) {
				if (!$scope.contact.details[0].emails.length) {
					$scope.contactAddEmailFn();
				}
				if (!$scope.contact.details[0].phones.length) {
					$scope.addContactPhoneFn();
				}
				if (!$scope.contact.details[0].addresses.length) {
					$scope.contactAddAddressFn();
				}
			}
		};

		/*
		 * @customerTags
		 * 18-Sep Unioned set of tags in system with those needed by Indigenous
		 *
		 * Retained (part of Ind. flow)
		 *   - Lead (ld)
		 *   - Customer (cu)
		 *
		 * New:
		 *   - Cheatsheet Lead (cs)
		 *   - Trial Customer (tc)
		 *   - Expired Trial Customer (ex)
		 *   - Cancelled Trial Customer (ct)
		 *   - Cancelled Customer (cc)
		 *
		 * - Old. Keeping for our clients:
		 *   - Colleague (co)
		 *   - Friend (fr)
		 *   - Member (mb)
		 *   - Family (fa)
		 *   - Admin (ad)
		 *   - Other (ot)
		 */

		if (!$scope.contact.tags) {
			$scope.contact.tags = {};
		}

		// Load Default tags
		ContactService.getContactTags(function (tags) {
			$scope.contactTags = tags;
		});

		ContactService.listAllContactTags(function (tags) {
			ContactService.fomatContactTags(tags, function (tags) {
				$scope.contactTags = tags;
			});
		});

		/*
		 * @setTags
		 * -
		 */

		$scope.setTags = function () {
			console.log('setTags >>>');
			var tempTags = [];
			var cutomerTags = [];
			_.each($scope.contact.tags, function (tag) {
				var matchingTag = _.findWhere($scope.contactTags, {
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
			$scope.myContactTags = cutomerTags.join(", ");
			$scope.contact.tags = tempTags;
			console.log('$scope.contact.tags >>>', $scope.contact.tags);
		};

		$scope.unsetTags = function () {
			var tempTags = [];
			$scope.contact_data = angular.copy($scope.contact);
			_.each($scope.contact_data.tags, function (tag) {
				tempTags.push(tag.data);
			});
			if (tempTags) {
				$scope.contact_data.tags = _.uniq(tempTags);
			}
		};

		/*
		 * @getOrders
		 * - get all the orders for this customer and create line_items_total
		 *   and add decimal point to total then create scope
		 */
		console.log('$stateParams.contactId ', $stateParams.contactId);
		OrderService.getCustomerOrders($stateParams.contactId, function (orders) {
			console.log('orders ', orders);
			$scope.orders = _.filter(orders, function (order) {
				return order.line_items[0].type !== 'DONATION';
			});
			$scope.donations = _.filter(orders, function (order) {
				return order.line_items[0].type == 'DONATION';
			});
			//   if (orders.length > 0) {
			//     _.each(orders, function (order) {
			//       if (order.line_items) {
			//         order.line_items_total = order.line_items.length;
			//       } else {
			//         order.line_items_total = 0;
			//       }
			//     });
			//   }
		});

		/*
		 * @updateFullName
		 * -
		 */

		$scope.updateFullName = function () {
			$scope.data.fullName = [$scope.contact.first, $scope.contact.middle, $scope.contact.last].join(' ').trim();
		};

		/*
		 * @deleteContactFn
		 * -
		 */

		$scope.deleteContactFn = function (contact) {
			SweetAlert.swal({
				title: "Are you sure?",
				text: "Do you want to delete this contact?",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Yes, delete it!",
				cancelButtonText: "No, do not delete it!",
				closeOnConfirm: true,
				closeOnCancel: true
			}, function (isConfirm) {
				if (isConfirm) {
					ContactService.deleteContact(contact._id, function () {
						toaster.pop('warning', 'Contact Deleted.');
						$scope.originalContact = angular.copy($scope.contact);
						$state.go('app.contacts');
					});
				}
			});
		};


		$scope.$back = function () {
			$window.history.back();
		};

		$scope.formatOrderStatus = function (status) {
			return OrderService.formatOrderStatus(status);
		};


		$scope.checkIfDirty = function () {
			var isDirty = false;
			// if ($scope.newNote && $scope.newNote.text)
			// if ($scope.newNote)	isDirty = true;
			if ($scope.originalContact && !angular.equals($scope.originalContact, $scope.contact))
				isDirty = true;
			return isDirty;
		};
		$scope.resetDirty = function () {
			$scope.originalContact = null;
			$scope.contact = null;
		};

		$scope.tagToContact = function (value) {
			return ContactService.tagToContact(value);
		};

		$scope.viewSingleOrder = function (orderId) {
			$state.go('app.commerce.orderdetail', {
				orderId: orderId
			});
		};

		$scope.undoContacts = function () {
			$scope.contact = angular.copy($scope.originalContact);
			$scope.getContact();
			$timeout(function () {
				toaster.pop('success', 'Changes undo');
			}, 2000);
		};

		$scope.getters = {
			total: function (value) {
				return parseFloat(value.total) || 0.00;
			},
			items: function (value) {
				return value.line_items ? value.line_items.length : 0;
			}
		};

    }]);
}(angular));
