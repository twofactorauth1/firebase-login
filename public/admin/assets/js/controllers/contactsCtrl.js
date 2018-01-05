/*global app ,console ,angular,$, _ */
/*jslint unparam:true*/
/* eslint-disable no-console */
(function (angular) {
	"use strict";
	app.controller('ContactsCtrl', ["$scope", "$state", "toaster", "$modal", "$window", "ContactService", "SocialConfigService", "userConstant", "formValidations", "CommonService", '$timeout', 'SweetAlert', "$location", "$q", 'pagingConstant', 'ContactPagingService', 'UtilService', function ($scope, $state, toaster, $modal, $window, ContactService, SocialConfigService, userConstant, formValidations, CommonService, $timeout, SweetAlert, $location, $q, pagingConstant, ContactPagingService, UtilService) {

		$scope.tableView = 'list';
		$scope.itemPerPage = 100;
		$scope.showPages = 15;
		$scope.selectAllChecked = false;
		$scope.bulkActionChoice = {};
		$scope.tagsBulkAction = {};


		$scope.formValidations = formValidations;
		$scope.default_image_url = "/admin/assets/images/default-user.png";
		$scope.pagingConstant = pagingConstant;

		$scope.bulkActionChoices = [
			{
				data: 'tags',
				label: 'Tags'
			},
			{
				data: 'delete',
				label: 'Delete'
			}
        ];


		$scope.numberOfPages = numberOfPages;
		$scope.selectPage = selectPage;
		$scope.sortContacts = sortContacts;
		$scope.showFilteredRecords = showFilteredRecords;
		$scope.loadContactsWithDefaults = loadContactsWithDefaults;

		$scope.pagingParams = {
			limit: pagingConstant.numberOfRowsPerPage,
			skip: ContactPagingService.skip,
			curPage: ContactPagingService.page,
			showPages: pagingConstant.displayedPages,
			globalSearch: ContactPagingService.globalSearch,
			fieldSearch: ContactPagingService.fieldSearch,
			showFilter: ContactPagingService.showFilter,
			sortBy: ContactPagingService.sortBy,
			sortDir: ContactPagingService.sortDir
		};

		$scope.showFilter = showFilter;

		$scope.sortData = {
			column: '',
			details: {}
		};

		if($scope.sortData.column == '' && $scope.pagingParams.sortBy !== undefined) {
			$scope.sortData.column = $scope.pagingParams.sortBy === "created.date" ? "created" : 
			$scope.pagingParams.sortBy === "details.emails.email" ? "email" : $scope.pagingParams.sortBy;
			$scope.sortData.details[$scope.sortData.column] = {
				direction: $scope.pagingParams.sortDir,
				sortColum: $scope.sortData.column
			};
		}
		 
		 
		 
		$scope.customTagFilert = function (item) {
			return ($scope.contact.tags.length > 0 && _.filter($scope.contact.tags, function (tag) {
				return tag.label === item.label;
			}).length < 1);
		};

		/*
		 * @getContacts
		 * -
		 */

		$scope.getContacts = function () {
			ContactService.getPagedContacts($scope.pagingParams, checkIfFieldSearch(), function (response) {
				var contacts = response.results;
				$scope.contactsCount = response.total;
				//ContactPagingService.setTotalCount(response.total);
				//$scope.totalItemCount = ContactPagingService.totalCount;
				//$scope.totalItemCount = response.total;

				$scope.selectAllChecked = false;
				_.each(contacts, function (contact) {
					contact.bestEmail = $scope.checkBestEmail(contact);
					contact.hasFacebookId = $scope.checkFacebookId(contact);
					contact.hasTwitterId = $scope.checkTwitterId(contact);
					contact.hasLinkedInId = $scope.checkLinkedInId(contact);
					contact.hasGoogleId = $scope.checkGoogleId(contact);

					contact.bestAddress = $scope.displayAddressFormat(contact);
					// delete isSelected field while loading a contact
					if (contact.isSelected) {
						delete contact.isSelected;
					}
					var tempTags = [],
						tagLabel = "";
					_.each(contact.tags, function (tag) {
						tagLabel = _.findWhere($scope.contactTags, {
							data: tag
						});
						if (tagLabel) {
							tempTags.push(tagLabel.label);
						} else {
							tempTags.push(tag);
						}
					});
					if (tempTags) {
						contact.tempTags = _.uniq(tempTags);
					}
				});
				$scope.contacts = contacts;
				drawPages();
				$scope.pageLoading = false;
				// In case contact is created from simple form component.
				if ($scope.contacts.length > 0) {
					$scope.minRequirements = true;
				}
				$scope.showContacts = true;
				$scope.loadingFilter = false;
				$("html, body").animate({
					scrollTop: 0
				}, 600);

			});
		};

		$scope.getContactCount = function () {
			ContactService.getTotalContacts(function (response) {
				$scope.totalItemCount = response.count;
			});
		};

		function loadContactTags() {
			ContactService.listAllContactTags(function (tags) {
				ContactService.fomatContactTags(tags, function (tags) {
					$scope.contactTags = tags;
				});
			});
		}

		// Load Default tags
		ContactService.getContactTags(function (tags) {
			$scope.contactTags = tags;
		});
		loadContactsWithDefaults();

		/*
		 * @openModal
		 * -
		 */

		$scope.openModal = function (template, controller, _size) {
			// console.log('');
			// $scope.modalInstance = $modal.open({
			//   templateUrl: template,
			//   controller: controller,
			//   scope: $scope,
			//   backdrop: 'static',
			//   size: _size || 'md'
			// });
			// angular.element('.modal-body').editable({selector: '.editable'});
			console.log('openModal >>> ', template, controller, _size);
			var _modal = {
				templateUrl: template,
				keyboard: true,
				backdrop: 'static',
				size: 'md',
				resolve: {
					getContacts: function () {
						return $scope.loadContactsWithDefaults;
					}
				}
			};

			if (controller) {
				_modal.controller = controller;
			}

			if (_size) {
				_modal.size = _size;
			}

			$scope.modalInstance = $modal.open(_modal);
			$scope.modalInstance.result.then(null, function () {
				angular.element('.sp-container').addClass('sp-hidden');
			});
		};

		$scope.openSimpleModal = function (modal) {
			var _modal = {
				templateUrl: modal,
				scope: $scope,
				keyboard: true,
				backdrop: 'static'
			};
			$scope.modalInstance = $modal.open(_modal);
			$scope.modalInstance.result.then(null, function () {
				angular.element('.sp-container').addClass('sp-hidden');
			});
		};

		/*
		 * @closeModal
		 * -
		 */

		$scope.closeModal = function () {
			$scope.modalInstance.close();
			$scope.socailList = false;
			$scope.groupList = false;
		};

		/*
		 * @preventClick
		 * -
		 */

		$scope.preventClick = function (event) {
			event.stopPropagation();
		};

		/*
		 * @column
		 * -
		 */

		$scope.column = {
			"photo": true,
			"name": true,
			"tags": true,
			"email": true,
			"address": true,
			"social": false,
			"unsubscribed": true,
			"phone": true,
			"created": true,
			"modified": true
		};

		$scope.contactTagsFn = function (contact) {
			return ContactService.contactTags(contact);
		};

		$scope.checkBestEmail = function (contact) {
			var returnVal = ContactService.checkBestEmail(contact);
			this.email = contact.email;
			return returnVal;
		};

		$scope.checkFacebookId = function (contact) {
			var returnVal = ContactService.checkFacebookId(contact);
			this.facebookId = contact.facebookId;
			return returnVal;
		};

		$scope.checkTwitterId = function (contact) {
			var returnVal = ContactService.checkTwitterId(contact);
			this.twitterId = contact.twitterId;
			return returnVal;
		};

		$scope.checkLinkedInId = function (contact) {
			var returnVal = ContactService.checkLinkedInId(contact);
			this.linkedInUrl = contact.linkedInUrl;
			this.linkedInId = contact.linkedInId;
			return returnVal;
		};

		$scope.checkGoogleId = function (contact) {
			var returnVal = ContactService.checkGoogleId(contact);
			this.googleUrl = contact.googleUrl;
			this.googleId = contact.googleId;
			return returnVal;
		};

		$scope.checkAddress = function (contact) {
			var returnVal = ContactService.checkAddress(contact);
			this.address = contact.address;
			return returnVal;
		};

		$scope.displayAddressFormat = function (contact) {
			if (contact.details.length !== 0 && contact.details[0].addresses && contact.details[0].addresses.length !== 0) {
				var address = contact.details[0].addresses[0];
				if (address && (address.address || address.address2 || address.city || address.state || address.zip)) {
					//var address = scope.htmlToPlaintext(address);
					var separator = ' ',
						_topline = '',
						_bottomline = '';
					if (address.address || address.address2) {
						_topline = _.filter([address.address, address.address2], function (str) {
							return str !== "";
						}).join(", ");
					}

					if (address.city || address.state || address.zip) {
						_bottomline = _.filter([address.city, address.state, address.zip], function (str) {
							return str !== "";
						}).join(", ");
					}
					if (_bottomline && _topline) {
						separator = ", ";
					}
					if (_topline) {
						return _topline + separator + _bottomline;
					}
					return _bottomline;
				}
			}
		};
		$scope.viewSingle = function (contact) {
			$location.path('/contacts/' + contact._id);
		};

		/* 18-Sep Unioned set of tags in system with those needed by Indigenous
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
		 *
		 * - Dumb: This list an that in contactDetailCtrl should be managed centrally (see case 4395)
		 */

		$scope.contact = {};
		$scope.contact.tags = [];


		$scope.tagToContact = function (value) {
			return ContactService.tagToContact(value);
		};

		$scope.contactPhotoOptions = [
			{
				name: 'Photo',
				value: true
            },
			{
				name: 'No Photo',
				value: false
            }
        ];


		$scope.addContact = function () {

			$scope.saveLoading = true;
			var tempTags = [],
				matchingContact,
				tempContact;
			_.each($scope.contact.tags, function (tag) {
				tempTags.push(tag.data);
			});
			if (tempTags) {
				tempTags = _.uniq(tempTags);
			}
			matchingContact = _.find($scope.contacts, function (element) {
				return (element.bestEmail.toLowerCase() === $scope.contact.email.toLowerCase());
			});
			if (matchingContact) {
				$scope.setDuplicateUser(true);
				$scope.saveLoading = false;
				return;
			}
			tempContact = {
				first: $scope.contact.first,
				middle: $scope.contact.middle,
				last: $scope.contact.last,
				tags: tempTags
			};
			if ($scope.contact.email) {
				tempContact.details = [];
				tempContact.details.push({
					emails: [
						{
							_id: CommonService.generateUniqueAlphaNumericShort(),
							email: $scope.contact.email.toLowerCase()
                        }
                    ]
				});
			}
			ContactService.saveContact(tempContact, function (returnedContact) {
				$scope.saveLoading = false;
				$scope.fullName = '';
				$scope.contact.tags = [];
				$scope.contact.email = '';
				$scope.duplicateContact = false;
				$scope.closeModal();
				returnedContact.bestEmail = $scope.checkBestEmail(returnedContact);
				loadDefaults();
				loadContactsWithDefaults();
				toaster.pop('success', 'Contact Successfully Added');
				$scope.minRequirements = true;

			});
		};

		function loadContactsWithDefaults() {
			$scope.getContactCount();
			$scope.getContacts();
			loadContactTags();
		}

		$scope.setDuplicateUser = function (val) {
			$scope.duplicateContact = val;
		};

		$scope.$watch('fullName', function (newValue) {
			if (newValue !== undefined) {
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
			}
		}, true);
		// $scope.socialAccounts = {};
		// SocialConfigService.getAllSocialConfig(function (data) {
		//   $scope.socialAccounts = data.socialAccounts;
		// });

		$scope.importFacebookFriends = function () {
			ContactService.importFacebookFriends(function (data, success) {
				if (success) {
					$('#import-contacts-modal').modal('hide');
					toaster.pop('success', "Contacts being imported.");
				} else {
					$window.location.href = "/socialconfig/facebook?redirectTo=" + encodeURIComponent('/admin#/contact');
				}
			});
		};

		$scope.importLinkedInConnections = function () {
			var foundSocialId = false;
			$scope.socialAccounts.forEach(function (value) {
				if (value.type === userConstant.social_types.LINKEDIN) {
					foundSocialId = true;
					$scope.closeModal();
					toaster.pop('success', "Contacts import initiated.");
					SocialConfigService.importLinkedinContact(value.id, function () {
						$scope.closeModal();
						toaster.pop('success', "Contacts import complete.");
					});
				}
			});
			if (foundSocialId === false) {
				$scope.closeModal();
				toaster.pop('warning', "No linkedin account integrated.");
			}
		};

		$scope.importGmailContacts = function () {
			var foundSocialId = false;
			$scope.socialAccounts.forEach(function (value) {
				if (value.type === userConstant.social_types.GOOGLE) {
					foundSocialId = true;
					$scope.closeModal();
					toaster.pop('success', "Contacts import initiated.");
					SocialConfigService.importGoogleContact(value.id, function () {
						$scope.closeModal();
						$scope.getContacts();
						toaster.pop('success', "Contacts import complete.");
					});
				}
			});
			if (foundSocialId === false) {
				$scope.closeModal();
				toaster.pop('warning', "No google account integrated.");
			}
		};

		/*
		 * @triggerInput
		 * - trigger the hidden input to trick smart table into activating filter
		 */

		$scope.triggerInput = function (element) {
			angular.element(element).trigger('input');
		};

		/*
		 * @clearFilter
		 * - clear the filter for the status when the red X is clicked
		 */

		$scope.filterContact = {};

		$scope.clearContactFilter = function (event, input, filter) {
			$scope.filterContact[filter] = {};
			$scope.triggerInput(input);
		};


		$scope.clearSearchFilter = function (event, input, filter) {
			$timeout(function () {
				$scope.pagingParams.fieldSearch[filter] = null;
				//$('body').click(); //comment due to #8897
				clearFilter();
			}, 800);
		};

		$scope.setBulkActionChoiceFn = function (selection) {
			if (selection) {
				$scope.bulkActionChoice.action = {
					data: selection.toLowerCase()
				};
				$scope.bulkActionSelectFn();
			}
		};
		$scope.bulkActionSelectFn = function () {
			var selectedContacts = $scope.selectedContactsFn(),
				deleteMessage = "Do you want to delete the 1 contact?",
				yesconfimationtext = "Yes, delete it!",
				noconfirmationtext = "No, do not delete it!";
			if (selectedContacts.length > 1) {
				deleteMessage = "Do you want to delete the " + selectedContacts.length + " contacts?";
				yesconfimationtext = "Yes, delete them!";
				noconfirmationtext = "No, do not delete them!";
			}

			if ($scope.bulkActionChoice.action.data === 'delete') {
				SweetAlert.swal({
					title: "Are you sure?",
					text: deleteMessage,
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: yesconfimationtext,
					cancelButtonText: noconfirmationtext,
					closeOnConfirm: true,
					closeOnCancel: true
				}, function (isConfirm) {
					if (isConfirm) {
						var contactPromises = [];

						selectedContacts.forEach(function (sc) {
							contactPromises.push(ContactService.deleteContactPromise(sc._id));
						});
						$q.all(contactPromises)
							.then(function (results) {
								console.log(results);
								loadDefaults();
								loadContactsWithDefaults();
								$scope.bulkActionChoice = null;
								$scope.bulkActionChoice = {};
								$scope.clearSelectionFn();
								toaster.pop('success', 'Contacts Deleted.');
							});
					} else {
						$scope.bulkActionChoice = null;
						$scope.bulkActionChoice = {};
					}
				});
			} else if ($scope.bulkActionChoice.action && $scope.bulkActionChoice.action.data === 'tags') {
				$scope.bulkActionChoice = {};
				$scope.openSimpleModal('tags-bulk-action-modal');
			} else if ($scope.bulkActionChoice.action && $scope.bulkActionChoice.action.data === 'export') {
				ContactService.exportCsvContacts(_.pluck($scope.selectedContactsFn(), '_id'), null);
				$scope.bulkActionChoice = null;
				$scope.bulkActionChoice = {};
				$scope.clearSelectionFn();
				toaster.pop('success', 'Contact export started.');
			}
		};

		$scope.selectAllClickFn = function ($event) {
			$event.stopPropagation();
			if ($scope.selectAllChecked) {
				$scope.selectAllChecked = false;
			} else {
				$scope.selectAllChecked = true;
			}
			$scope.displayedContacts.forEach(function (contact) {
				contact.isSelected = $scope.selectAllChecked;
			});
		};

		$scope.clearSelectionFn = function () {
			$scope.selectAllChecked = false;
			$scope.displayedContacts.forEach(function (contact) {
				contact.isSelected = $scope.selectAllChecked;
			});
		};

		$scope.contactSelectClickFn = function ($event, contact) {
			$event.stopPropagation();
			if (contact.isSelected) {
				contact.isSelected = false;
			} else {
				contact.isSelected = true;
			}
		};

		$scope.selectedContactsFn = function () {
			var exportContacts = _.filter($scope.displayedContacts, function (contact) {
				return contact.isSelected;
			});
			$scope.exportText = exportContacts.length ? "Export Selected " + exportContacts.length : "Export";
			return exportContacts;
		};

		$scope.tagsBulkActionClickFn = function (operation) {
			var tags = _.uniq(_.pluck($scope.tagsBulkAction.tags, 'data'));
			if (operation === 'add' && tags.length < 1 && $scope.tagsBulkAction.toReplace) {
				SweetAlert.swal({
					title: "Are you sure?",
					text: "This will remove all tags from selected contacts. Do you want to continue ? ",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Yes",
					cancelButtonText: "No",
					closeOnConfirm: true,
					closeOnCancel: true
				},function (isConfirm) {
					if (isConfirm) {
						$scope.bulkUpdate(operation, tags);
					}
				});
			} else {
				$scope.bulkUpdate(operation, tags);
			}
		};
		$scope.bulkUpdate = function (operation, tags) {
			var contactPromises = [],
				selectedContacts = $scope.selectedContactsFn();
			selectedContacts.forEach(function (contact) {
				if (operation === 'add') {
					if ($scope.tagsBulkAction.toReplace) {
						contact.tags = tags;
					} else {
						if (contact.tags) {
							contact.tags = contact.tags.concat(tags);
						} else {
							contact.tags = tags;
						}
					}
				} else if (operation == 'remove') {
					contact.tags = _.difference(contact.tags, tags);
				}

				contact.tags = _.uniq(contact.tags);
				// delete isSelected field while saving a contact
				delete contact.isSelected;
				contactPromises.push(ContactService.putContactPromise(contact));
			});

			$q.all(contactPromises)
				.then(function (results) {
					console.log(results);
					$scope.tagsBulkAction = {};
					$scope.clearSelectionFn();
					$scope.closeModal();
					toaster.pop('success', 'Contacts tags updated.');
				});
		};

		$scope.exportContactsFn = function () {
			if ($scope.selectedContactsFn().length > 0) {
				ContactService.exportCsvContacts(_.pluck($scope.selectedContactsFn(), '_id'), null);
			} else {
				ContactService.exportCsvContacts(null, $scope.pagingParams);
			}
			$scope.clearSelectionFn();
			toaster.pop('success', 'Contact export started.');
		};

		// Paging Related

		function drawPages() {
			var start = 1,
				end,
				i,
				//var prevPage = $scope.pagingParams.curPage;
				currentPage = $scope.pagingParams.curPage,
				numPages = numberOfPages();

			start = Math.max(start, currentPage - Math.abs(Math.floor($scope.pagingParams.showPages / 2)));
			end = start + $scope.pagingParams.showPages;

			if (end > numPages) {
				end = numPages + 1;
				start = Math.max(1, end - $scope.pagingParams.showPages);
			}

			$scope.pages = [];


			for (i = start; i < end; i++) {
				$scope.pages.push(i);
			}
		}


		function numberOfPages() {
			if ($scope.contacts) {
				return Math.ceil($scope.contactsCount / $scope.pagingParams.limit);
			}
			return 0;
		}

		function selectPage(page) {
			if (page != $scope.pagingParams.curPage) {
				$scope.pagingParams.curPage = page;
				$scope.pagingParams.skip = (page - 1) * $scope.pagingParams.limit;
				$scope.pageLoading = true;
				setDefaults();
				$scope.getContacts();
			}
		}


		function setDefaults() {
			ContactPagingService.skip = $scope.pagingParams.skip;
			ContactPagingService.page = $scope.pagingParams.curPage;
			ContactPagingService.globalSearch = angular.copy($scope.pagingParams.globalSearch);
			ContactPagingService.fieldSearch = angular.copy($scope.pagingParams.fieldSearch);
			ContactPagingService.showFilter = $scope.pagingParams.showFilter;
			ContactPagingService.sortBy = $scope.pagingParams.sortBy;
			ContactPagingService.sortDir = $scope.pagingParams.sortDir;

		}


		function loadDefaults() {
			$scope.pagingParams.curPage = 1;
			$scope.pagingParams.skip = 0;
			ContactPagingService.skip = $scope.pagingParams.skip;
			ContactPagingService.page = $scope.pagingParams.curPage;
			$scope.pageLoading = true;
		}

		/********** SORTING RELATED **********/

		function sortContacts(col, name) {
			if ($scope.sortData.column !== name) {
				$scope.sortData.details = {};
			}
			$scope.sortData.column = name;
			if ($scope.sortData.details[name]) {
				if ($scope.sortData.details[name].direction === 1) {
					$scope.sortData.details[name].direction = -1;
				} else {
					$scope.sortData.details[name].direction = 1;
				}
			} else {
				$scope.sortData.details[name] = {
					direction: 1,
					sortColum: col
				};
			}
			$scope.pagingParams.sortBy = col;
			$scope.pagingParams.sortDir = $scope.sortData.details[name].direction;
			loadDefaults();
			setDefaults();
			$scope.getContacts();
		}

		/********** GLOBAL SEARCH RELATED **********/

		$scope.$watch('pagingParams.globalSearch', function (term) {
			if (angular.isDefined(term)) {
				if (!angular.equals(term, ContactPagingService.fieldSearch)) {
					$scope.loadingFilter = true;
					loadDefaults();
					setDefaults();
					$scope.getContacts();
				}
			}
		}, true);

		/********** FILTER RELATED **********/

		$scope.$watch('pagingParams.fieldSearch', function (search) {
			if (angular.isDefined(search)) {
				if (!angular.equals(search, ContactPagingService.fieldSearch)) {
					$scope.loadingFilter = true;
					loadDefaults();
					setDefaults();
					$scope.getContacts();
				}
			}
		}, true);


		function showFilter() {
			$scope.pagingParams.showFilter = !$scope.pagingParams.showFilter;
			setDefaults();
			if (!$scope.pagingParams.showFilter){
				clearFilter();
			}
		}


		function clearFilter() {
			$scope.pagingParams.fieldSearch = {};
		}


		function checkIfFieldSearch() {
			var isFieldSearch = false,
				fieldSearch = $scope.pagingParams.fieldSearch;
			if (!_.isEmpty(fieldSearch)) {
				for (var i = 0; i <= Object.keys(fieldSearch).length - 1; i++) {
					var key = Object.keys(fieldSearch)[i],
						value = fieldSearch[key];

					if (value) {
						isFieldSearch = true;
					}
				}
			}
			return isFieldSearch;
		}

		function showFilteredRecords() {
			return !$scope.loadingFilter && UtilService.showFilteredRecords($scope.pagingParams.globalSearch, $scope.pagingParams.fieldSearch);
		}

    }]);
}(angular));
