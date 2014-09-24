define(['app', 'constants', 'customerService', 'stateNavDirective'], function(app) {
    app.register.controller('CustomerCtrl', ['$scope', 'CustomerService', function ($scope, CustomerService) {
        $scope.customerFilter = {};
        $scope.customerOrder = 'first';
        $scope.customerSortReverse = false;

        CustomerService.getCustomers(function (customers) {
            $scope.customers = customers;
            
            $scope.$watch('searchBar', function (newValue, oldValue) {
                if (newValue) {
                    var searchBarSplit = newValue.split(' ');
                    if (searchBarSplit.length >= 3) {
                        $scope.customerFilter.first = searchBarSplit[0];
                        $scope.customerFilter.middle = searchBarSplit[1];
                        $scope.customerFilter.last = searchBarSplit[2];
                    } else if (searchBarSplit.length == 2) {
                        $scope.customerFilter.first = searchBarSplit[0];
                        $scope.customerFilter.last = searchBarSplit[1];
                    } else if (searchBarSplit.length == 1) {
                        $scope.customerFilter.first = searchBarSplit[0];
                    }
                }
            });

            $scope.alphaFilter = function (alpha) {
                if (alpha) {
                    $scope.customerFilter.first = alpha;
                } else {
                    $scope.customerFilter = {};
                }
            };
            
            $scope.contactLabel = function(contact) {
				var contactTypes = $$.constants.contact.contact_types.dp;	
				var type = _.find(contactTypes, function(type) {
					return type.data === contact.type
				});
				return type == null ? "" : type.label;
			}; 
			
			
			$scope.getBestEmail = function(contact) {
				if (contact.details != null && contact.details.length > 0) {
					//see if we have a google contact, that's the best source of email
					var details = _.findWhere(contact.details, {
						type : $$.constants.social.types.GOOGLE
					});
					if (details != null && details.emails != null && details.emails.length > 0) {
						this.$email = details.emails[0];
						return true;
					}
					for (var i = 0; i < contact.details.length; i++) {
						var details = contact.details[0];
						if (details != null && details.emails != null && details.emails.length > 0) {
							this.$email = details.emails[0];
							return true;
						}
					}
					return false;
				}
			};
			
			$scope.getFacebookId = function(contact) {
				if (contact.details != null && contact.details.length > 0) {
					//see if we have a google contact, that's the best source of email
					var details = _.findWhere(contact.details, {
						type : $$.constants.social.types.FACEBOOK
					});
					if (details != null) {
						this.$facebookId = details.socialId;
						return true;
					}
					return false;
				}
			}
			
			
			$scope.getTwitterId = function(contact) {
				if (contact.details != null && contact.details.length > 0) {
					//see if we have a google contact, that's the best source of email
					var details = _.findWhere(contact.details, {
						type : $$.constants.social.types.TWITTER
					});
					if (details != null) {
						this.$twitterId = details.socialId;
						return true;
					}
					return false;
				}
			}
			
			$scope.getLinkedInId = function(contact) {
				if (contact.details != null && contact.details.length > 0) {
					//see if we have a google contact, that's the best source of email
					var details = _.findWhere(contact.details, {
						type : $$.constants.social.types.LINKEDIN
					});
					if (details != null) {
						if (details.websites != null && details.websites.length > 0) {
							for (var i = 0; i < details.websites.length; i++) {
								if (details.websites[i] != null) {
									this.$linkedInUrl = details.websites[i];
									return true;
								}
							}
						}
						this.$linkedInId = details.socialId;
						return true;
					}
					return false;
				}
			}
			
			
			$scope.getAddress = function(contact) {
				var _address = null;
				if (contact.details != null && contact.details.length > 0) {
					for (var i = 0; i < contact.details.length; i++) {
						var details = contact.details[i];
						if (details.addresses != null && details.addresses.length > 0) {
							for (var j = 0; j < details.addresses.length; j++) {
								var address = details.addresses[j];
								if (address) {
									if (address.displayName != null) {
										this.$address = encodeURIComponent(address.displayName);
										return true;
									} else {
										if (_address == null) {
											_address = address;
										} else {
											if (address.address != null && address.city != null) {
												_address = address;
											}
										}
									}
								}
							}
						}
					}
				}

				if (_address != null) {
					var addressStr = "";
					if (String.isNullOrEmpty(_address.address)) {
						addressStr += _address.address;
					}

					if (String.isNullOrEmpty(_address.city)) {
						addressStr += ", " + address.city;
					}

					if (String.isNullOrEmpty(_address.state)) {
						addressStr += ", " + address.state;
					}

					if (String.isNullOrEmpty(_address.zip)) {
						addressStr += ", " + _address.zip;
					}

					this.$address = encodeURIComponent(addressStr);
					return true;
				}

				return false;
			}


			
            $scope.$watch('sortOrder', function (newValue, oldValue) {
                if (newValue) {
                    newValue = parseInt(newValue);
                    if (newValue === 0) {
                        $scope.customerOrder = 'first';
                        $scope.customerSortReverse = false;
                    } else if (newValue == 1) {
                        $scope.customerOrder = 'first';
                        $scope.customerSortReverse = false;
                    } else if (newValue == 2) {
                        $scope.customerOrder = 'first';
                        $scope.customerSortReverse = true;
                    } else if (newValue == 3) {
                        $scope.customerOrder = 'created.date';
                        $scope.customerSortReverse = false;
                    }
                }
            });
        });
    }]);
});
