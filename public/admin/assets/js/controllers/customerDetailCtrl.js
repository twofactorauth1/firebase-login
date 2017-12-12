/*global app, moment, angular, console,location  ,_*/
/*jslint unparam:true*/
/* eslint-disable no-console */
(function (angular) {
	"use strict";
	app.controller('CustomerDetailCtrl', ["$scope", "$rootScope", "$location", "$modal", "toaster", "$stateParams", "CustomerService", 'ContactService', 'SweetAlert', '$state', '$window', '$timeout', 'formValidations', 'UserService', function ($scope, $rootScope, $location, $modal, toaster, $stateParams, customerService, contactService, SweetAlert, $state, $window, $timeout, formValidations, UserService) {
		$scope.isDomainChanged = false;
		$scope.cancelaccount = {
			cancelNow: false
		};
		$scope.dataloaded = false;
		$scope.searchUsers = [];
		$scope.isAdmin = true;
		$scope.itemPerPage = 20;
    	$scope.showPages = 10;
        $scope.analytics = true;
		$scope.updateUsers = function (typed) {
			$scope.searchUsers = [];
			var getUsers = UserService.getUsersForAutocomplete(typed),
				username;
			getUsers.then(function (data) {
				$scope.searchUsers = [];
				data.forEach(function (value) {
					$scope.searchUsers.push(value.username + "," + (value.first + " " + value.last));
				});
			});
			username = typed.split(',');
			$scope.newuser.username = username[0];
		};

		$scope.selectUser = function (selected) {
			var username = selected.split(',');
			$scope.newuser.username = username[0];

		};
		/*
		 * @getCustomer
		 * -
		 */

		$scope.getCustomer = function () {

			customerService.getCustomer($stateParams.customerId, function (err, customer) {
				if (err) {
					toaster.pop('warning', err.message);
					if (err.code === 404) {
						$location.path('/customers');
					}
					return;
				}
				$scope.customer = customer;
				$scope.data.subdomain = customer.subdomain;
				$scope.getMapData();
				if (customer.ownerUser) {
					$scope.primaryUser = _.find(customer.users, function (user) {
						return user._id === customer.ownerUser;
					});
					//console.log('primaryUser:', $scope.primaryUser);
				}
				if (!customer.trialDaysRemaining) {
					var endDate = moment(customer.billing.signupDate).add(customer.billing.trialLength, 'days');
					customer.trialDaysRemaining = endDate.diff(moment(), 'days');
				}

				$scope.matchUsers(customer);
				$scope.originalCustomer = angular.copy($scope.customer);
				$scope.subdomainURL = $scope.generateSubdomainURL($scope.data.subdomain);
				$scope.dataloaded = true;
			});

		};

		$scope.checkNameServerChanged = function () {
			$scope.isDomainChanged = $scope.originalCustomer && $scope.customer && !angular.equals($scope.originalCustomer.customDomain, $scope.customer.customDomain);
		};

		$scope.getMapData = function () {
			var firstAddress;

			if ($scope.customer.business && $scope.customer.business.addresses && $scope.customer.business.addresses[0]) {
				firstAddress = $scope.customer.business.addresses[0];
			}

			//contact has no address
			if (!firstAddress) {
				$scope.loadingMap = false;
				console.log('Customer has no address:', firstAddress);
			} else {
				//contact has address and lat/lon
				if (firstAddress.lat && firstAddress.lon && checkIfAddressExists(firstAddress)) {
					$scope.showMap(firstAddress.lat, firstAddress.lon);
				} else {
					//contact has address but no lat/lon
					//if contact has a session id get data from Analytics
					firstAddress.address2 = '';
					$scope.convertAddressToLatLon(firstAddress, function (data) {
						if (data) {
							//save updated lat/lon
							firstAddress.lat = parseFloat(data.lat);
							firstAddress.lon = parseFloat(data.lon);
							//$scope.customerSaveFn(true);

							$scope.showMap(data.lat, data.lon);
						}
						$scope.loadingMap = false;
					});
				}
			}
		};

		$scope.convertAddressToLatLon = function (_address, fn) {
			if ($scope.displayAddressFormat(_address)) {
				contactService.getGeoSearchAddress($scope.queryAddressFormat(_address), function (data) {
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

		$scope.generateSubdomainURL = function (subdomain) {
			var _subdomain = location.host.split(".")[0];
			var url = $location.protocol() + '://' + location.host.replace(_subdomain, subdomain);
			return url;
		};

		$scope.displayAddressFormat = function (address) {
			return _.filter([address.address, address.address2, address.city, address.state, address.zip], function (str) {
				return str !== "";
			}).join(",");
		};

		$scope.queryAddressFormat = function (address) {
			var str = "";
			/*
			if(address.address) {
			    str += 'street=' + address.address + '&';
			}
			*/
			if (address.city) {
				str += 'city=' + address.city + '&';
			}
			if (address.state) {
				str += 'state=' + address.state + '&';
			}
			if (address.zip && !address.city && !address.state) {
				str += 'postalcode=' + address.zip + '&';
			}
			if (address.country && address.country !== 'United States') {
				str += 'country=' + address.country;
			} else {
				str += 'country=us';
			}
			return str;
		};

		$scope.showMap = function (map_lat, map_lon) {
			console.log('>> showMap(' + map_lat + ',' + map_lon + ')');

			$scope.location.lat = parseFloat(map_lat);
			$scope.location.lon = parseFloat(map_lon);
			$scope.loadingMap = false;
			//console.log('$scope.location:', $scope.location);
			//console.log('$scope.loadingMap', $scope.loadingMap);
			if ($scope.markers && $scope.markers.mainMarker) {
				$scope.markers.mainMarker.lat = parseFloat(map_lat);
				$scope.markers.mainMarker.lon = parseFloat(map_lon);
			}
		};

		function checkIfAddressExists(address) {
			var _exists = false;
			if (address.address || address.address2 || address.city || address.state || address.zip || address.country) {
				_exists = true;
			}
			return _exists;
		}

		$scope.$back = function () {
			$window.history.back();
		};

		$scope.backToCustomers = function () {
			$location.path('/customers');
			//$window.history.back();
		};

		$scope.editTrialDays = function () {
			console.log('setting trial length to ', $scope.newTrialLength);
			customerService.extendTrial($scope.customer._id, $scope.newTrialLength, function (err, customer) {
				if (err) {
					toaster.pop('warning', err.message);
				} else {
					var endDate = moment(customer.billing.signupDate).add(customer.billing.trialLength, 'days');
					$scope.customer.trialDaysRemaining = endDate.diff(moment(), 'days');
					$scope.customer.locked_sub = customer.locked_sub;
					$scope.customer.billing.trialLength = customer.billing.trialLength;
					$scope.closeModal();
				}
			});
		};

		$scope.generateInsightReport = function () {
			customerService.generateInsightReport($scope.customer._id, function (err, data) {
				if (err) {
					console.log(data);
					toaster.pop('warning', err.message);
				} else {
					toaster.pop('info', 'Report Sent');
				}
			});
		};

		$scope.openCancelAccountModal = function () {
			$scope.openSimpleModal('cancel-account-modal');
		};
		$scope.cancelAccountSub = function () {
			SweetAlert.swal({
				title: "Are you sure?",
				text: "Cancel this account's subscription",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Yes",
				cancelButtonText: "No",
				noActionButtonText: 'Cancel',
				closeOnConfirm: true,
				closeOnCancel: true
			}, function (isConfirm) {
					//Update template account flag
				if (isConfirm) {
					customerService.cancelAccountSubscription($scope.customer._id, $scope.cancelaccount.reason, $scope.cancelaccount.cancelNow, function (err, data) {
						$scope.closeModal();
						if (err) {
							toaster.pop('warning', err.message);
						} else {
							toaster.pop('success', 'Account subscription cancelled.');
						}
					});
				} else {
					$scope.closeModal();
				}
			});

		};

		$scope.makeEvergreen = function () {
			customerService.makeEvergreen($scope.customer._id, function (err, value) {
				if (err) {
					toaster.pop('warning', err.message);
				} else {
					toaster.pop('success', 'Account converted to Evergreen.  If there is currently a Stripe Subscription, please manually cancel.');
				}
			});
		};

        $scope.updateCustomerOEMAccount = function(oem) {
            var text = oem ? "Set this customer as OEM account" : "Unset this customer as OEM account";
            SweetAlert.swal({
                title: "Are you sure?",
                text: text,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                noActionButtonText: 'Cancel',
                closeOnConfirm: true,
                closeOnCancel: true
            }, function (isConfirm) {
                //Update template account flag
                if (isConfirm) {
                    updateCustomerOEM(oem);
                } else {
                    $scope.customer.oem = !oem;
                }
            });
        };

		$scope.updateCustomerTemplateAccount = function (isTemplateAccount) {
			var text = isTemplateAccount ? "Set this customer as template account" : "Unset this customer as template account";
			SweetAlert.swal({
				title: "Are you sure?",
				text: text,
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Yes",
				cancelButtonText: "No",
				noActionButtonText: 'Cancel',
				closeOnConfirm: true,
				closeOnCancel: true
			}, function (isConfirm) {
					//Update template account flag
				if (isConfirm) {
					updateCustomerDetails(isTemplateAccount);
				} else {
					$scope.customer.isTemplateAccount = !isTemplateAccount;
				}
			});
		};

		$scope.updateCustomerReceiveInsights = function (isReceiveInsights) {
			customerService.updateCustomerReceiveInsights($scope.customer, isReceiveInsights, function (err, customer) {
				if (err) {
					toaster.pop('warning', err.message);
				} else {
					toaster.pop('success', 'Insights preferences saved.');
				}
			});
		};

		$scope.updateCustomerUserScripts = function (isEnabled) {
			$scope.customer.showhide.userScripts = isEnabled;
			customerService.updateCustomerShowHide($scope.customer, function (err, customer) {
				if (err) {
					toaster.pop('warning', err.message);
				} else {
					toaster.pop('success', 'UserScripts updated.');
				}
			});
		};

		$scope.updateCustomerHTML = function (isEnabled) {
			$scope.customer.showhide.editHTML = isEnabled;
			customerService.updateCustomerShowHide($scope.customer, function (err, customer) {
				if (err) {
					toaster.pop('warning', err.message);
				} else {
					toaster.pop('success', 'Edit HTML updated.');
				}
			});
		};

		$scope.updateCustomCssEnabled = function (isEnabled) {
			$scope.customer.showhide.customCss = isEnabled;
			customerService.updateCustomerShowHide($scope.customer, function (err, customer) {
				if (err) {
					toaster.pop('warning', err.message);
				} else {
					toaster.pop('success', 'Edit HTML updated.');
				}
			});
		};
        $scope.updateNewAnalytics = function(isEnabled){
            console.log('isEnabled',isEnabled   );
        };
		$scope.saveTemplateAccount = function () {
			updateCustomerDetails(false);
		};

		$scope.refreshTemplateImage = function () {
			customerService.refreshTemplateImage($scope.customer, function (err, customer) {
				if (err) {
					toaster.pop('warning', err.message);
				} else {
					toaster.pop('success', 'Template image updated.');
				}
			});
		};

		function updateCustomerDetails(isTemplateAccount) {
			customerService.updateCustomerTemplateAccount($scope.customer, isTemplateAccount, function (err, customer) {
				if (err) {
					toaster.pop('warning', err.message);
				} else {
					if(isTemplateAccount){
						customerService.makeEvergreen($scope.customer._id, function (err, value) {
							if (err) {
								toaster.pop('warning', err.message);
							} else {
								toaster.pop('success', 'Account template updated.');
							}
						});
					}
					else{
						toaster.pop('success', 'Account template updated.');
					}
				}
			});
		}

        function updateCustomerOEM(oem) {
            customerService.updateCustomerOEM($scope.customer, oem, function(err, customer){
                if (err) {
                    toaster.pop('warning', err.message);
                } else {
                    toaster.pop('success', 'Account oem updated.');
                }
            });
        }

        function updateCustomCssEnabled(customCss) {
            customerService.updateCustomCssEnabled($scope.customer, customCss, function(err, customer){
                if (err) {
                    toaster.pop('warning', err.message);
                } else {
                    toaster.pop('success', 'Account custom css enabled updated.');
                }
            });
        }

		$scope.addNewUser = function () {
			console.log('Adding the following:', $scope.newuser);
			UserService.findUserByUsername($scope.newuser.username,
				function (err, exitinguser) {
					if (err) {
						toaster.pop('warning', err.message);
					} else if (exitinguser) {
						//copy exiting
						customerService.addUserToAccountTo($scope.customer._id, exitinguser._id, function (err, newuser) {
							if (err) {
								toaster.pop('warning', err.message);
							} else {
								$scope.customer.users.push(newuser);
								$scope.closeModal();
							}
						});
					} else {
						//add new
						customerService.addNewUser($scope.customer._id, $scope.newuser.username,
							$scope.newuser.password,
							function (err, newuser) {
								if (err) {
									toaster.pop('warning', err.message);
								} else {
									$scope.customer.users.push(newuser);
									$scope.closeModal();
								}
							});
					}
				});
		};

		$scope.removeUserFromAccount = function (userId) {
			customerService.removeUserFromAccount($scope.customer._id, userId, function (err, data) {
				if (err) {
					toaster.pop('warning', err.message);
				} else {
					$scope.customer.users = _.filter($scope.customer.users, function (user) {
						if (user._id !== userId) {
							return true;
						}
					});
				}
			});
		};

		$scope.excludeUserFromCustomerView = function (userId, exclude, user) {

			if (exclude) {
				SweetAlert.swal({
					title: "Are you sure?",
					text: "Exclude user from customer view",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Yes",
					cancelButtonText: "No",
					closeOnConfirm: true,
					closeOnCancel: true
				}, function (isConfirm) {
					if (isConfirm) {
						$scope.saveUser = true;
						customerService.excludeUserFromCustomerView(userId, exclude, function (err, data) {
							if (err) {
								toaster.pop('warning', err.message);
							} else {
								toaster.pop('success', 'User excluded from customer view.');
							}
							$scope.saveUser = false;
						});
					} else {
						user.excludeFromCustomerView = false;
					}
				});
			} else {
				$scope.saveUser = true;
				customerService.excludeUserFromCustomerView(userId, exclude, function (err, data) {
					if (err) {
						toaster.pop('warning', err.message);
					} else {
						toaster.pop('success', 'User included to customer view.');
					}
					$scope.saveUser = false;
				});
			}

		};

		$scope.openEditUserModal = function (userId) {
			$scope.currentUserId = userId;
			$scope.openSimpleModal('edit-password-modal');
		};
		$scope.closeEditUserModal = function () {
			$scope.currentUserId = null;
			$scope.closeModal();
		};

		$scope.checkPasswordLength = function () {
			$scope.passwordInValid = false;
			if ($scope.edituser && $scope.edituser.password1 && $scope.edituser.password1.length < 6) {
				$scope.passwordInValid = true;
			} else {
				$scope.passwordInValid = false;
			}
		};

		$scope.setUserPassword = function (userId) {
			$scope.checkPasswordLength();
			if ($scope.passwordInValid) {
				return;
			}
			customerService.setUserPassword(userId, $scope.edituser.password1, function (err, data) {
				if (err) {
					toaster.pop('warning', err.message);
				} else {
					toaster.pop('info', 'Successfully changed password');
					$scope.closeEditUserModal();
				}
			});
		};

		$scope.getNameServers = function (domain) {
			$scope.showNameServer = true;
			if (!domain) {
				toaster.pop('info', 'No custom domain to lookup.');
			} else {
				customerService.viewNameServers(domain, function (err, data) {
					if (err) {
						toaster.pop('warning', err.message);
					} else {
						$scope.nameservers = data;
					}
				});
			}

		};

		$scope.addCustomDomain = function () {
			var domain = $scope.customer.customDomain,
				accountId = $scope.customer._id;
			customerService.addDomainToAccount(domain, accountId, function (err, data) {
				if (err) {
					toaster.pop('warning', err.message);
				} else {
					console.log('Response:', data);
					$scope.nameservers = data.nameServers;
				}
				$scope.originalCustomer = angular.copy($scope.customer);
				$scope.checkNameServerChanged();
				$scope.closeModal();
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

		$scope.$watch('customer.billing.trialLength', function (newValue) {
			if ($scope.customer && $scope.customer.billing) {
				$scope.currentTrialExpiration = moment($scope.customer.billing.signupDate).add(newValue, 'days').format('MM/DD/YYYY');
			}
		});

		$scope.$watch('newTrialLength', function (newValue) {
			if ($scope.customer && $scope.customer.billing) {
				$scope.newTrialExpiration = moment($scope.customer.billing.signupDate).add(newValue, 'days').format('MM/DD/YYYY');
			}
		});

		$scope.ip_geo_address = '';
		$scope.location = {};
		$scope.loadingMap = true;
		$scope.data = {
			subdomain: ''
		};





		/*
		 * @addNote
		 * add a note to an order
		 */

		$scope.newNote = {};

		$scope.addNote = function (thisNote) {

			customerService.addCustomerNotes($scope.customer._id, thisNote, function (customer) {
				if (customer && customer._id) {
					toaster.pop('success', 'Notes Added.');
					$scope.matchUsers(customer);
					$scope.newNote = {};
				}
			});
		};

		/*
		 * @matchUsers
		 * match users to the notes
		 */
		$scope.matchUsers = function (customer) {
			var notes = customer.notes;
			if (notes && notes.length > 0 && $scope.users && $scope.users.length) {

				_.each(notes, function (thisNote) {
					var matchingUser = _.find($scope.users, function (_user) {
						return _user._id === thisNote.user_id;
					});

					// This code is used to show related user profile image in notes

					if (matchingUser) {
						thisNote.user = matchingUser;
						if (matchingUser.profilePhotos && matchingUser.profilePhotos[0]) {
							thisNote.user_profile_photo = matchingUser.profilePhotos[0];
						}
					}
				});
				$scope.customerNotes = notes;
			}
		};


		$scope.resizeAnalytics = function () {
			$timeout(function () {
				$scope.$broadcast('$renderSingleCustomerAnalytics');
			}, 0);
		};


		$scope._moment = function (invoice, _date, options) {
			$scope.planInterval = "";
			if (invoice.lines.data.length) {
				$scope.planInterval = _.last(invoice.lines.data).plan.interval;
			}
			if (_date.toString().length === 10) {
				_date = _date * 1000;
			}
			var formattedDate = moment(_date);

			if (options) {
				if (options.subtractNum && options.subtractType) {
					formattedDate = formattedDate.subtract(options.subtractNum, options.subtractType);
				}
				if (options.addNum && options.addType) {
					if ($scope.planInterval === 'week') {
						formattedDate = formattedDate.add(7, options.addType);
					} else if ($scope.planInterval === 'month') {
						formattedDate = formattedDate.add(1, 'months');
					} else if ($scope.planInterval === 'year') {
						formattedDate = formattedDate.add(1, 'years');
					} else {
						formattedDate = formattedDate.add(options.addNum, options.addType);
					}
					console.log("Formatted date: ");
					console.log(formattedDate);
				}
			}
			return formattedDate.format("M/D/YY");
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
						return $scope.updateImage;
					},
					isSingleSelect: function () {
						return true;
					}
				}
			});
		};


		/*
		 * @insertPhoto
		 * -
		 */

		$scope.updateImage = function (asset) {
			$scope.customer.templateImageUrl = asset.url;
		};

		/*
		 * @insertPhoto
		 * -
		 */

		$scope.removeTemplateImage = function () {
			$scope.customer.templateImageUrl = null;
		};

		$scope.checkIfValidUserName = function (userName) {
			var regex = formValidations.email;
			return regex.test(userName);
		};

		(function init() {

			UserService.getUsers(function (users) {
				$scope.users = users;
				$scope.getCustomer();
			});

		}());


    }]);
}(angular));
