'use strict';
/**
 * controller for customer details
 */
(function(angular) {
    app.controller('CustomerDetailCtrl', ["$scope", "$modal", "$timeout", "toaster", "$stateParams", "contactConstant", "CustomerService", "KeenService", "CommonService", "UserService", function($scope, $modal, $timeout, toaster, $stateParams, contactConstant, CustomerService, KeenService, CommonService, UserService) {


        /*
         * @openModal
         * -
         */

        $scope.openModal = function(modal) {
            $scope.modalInstance = $modal.open({
                templateUrl: modal,
                scope: $scope
            });
        };

        /*
         * @closeModal
         * -
         */

        $scope.closeModal = function() {
            $scope.modalInstance.close();
        };

        $scope.ip_geo_address = '';
        $scope.location = {};
        $scope.loadingMap = true;
        $scope.fullName = '';

        CustomerService.getCustomer($stateParams.contactId, function(customer) {
            $scope.customer = customer;
            $scope.setDefaults();
            if (customer.fingerprint !== undefined) {
                var keenParams = {
                    event_collection: 'session_data',
                    filters: [{
                        "property_name": "fingerprint",
                        "operator": "eq",
                        "property_value": customer.fingerprint
                    }]
                };
                KeenService.singleExtraction(keenParams, function(data) {
                    var keepGoing = true;
                    data.result.forEach(function(value, index) {
                        if (keepGoing && value.ip_geo_info && value.ip_geo_info.city) {
                            $scope.ip_geo_address = _.filter([value.ip_geo_info.city, value.ip_geo_info.province, value.ip_geo_info.postal_code], function(str) {
                                $scope.city = value.ip_geo_info.city;
                                return (str !== "" || str !== undefined || str !== null);
                            }).join(",");
                            keepGoing = false;
                            $scope.loadingMap = false;
                        } else if (keepGoing && value.ip_geo_info_gen && value.ip_geo_info_gen.country) {
                            console.log('value.ip_geo_info_gen.city ', value.ip_geo_info_gen.city);
                            $scope.ip_geo_address = _.filter([value.ip_geo_info_gen.city, value.ip_geo_info_gen.province, value.ip_geo_info_gen.postal_code], function(str) {
                                $scope.city = value.ip_geo_info_gen.city;
                                return (str !== "" || str !== undefined || str !== null);
                            }).join(",");
                            keepGoing = false;
                            $scope.loadingMap = false;
                        }

                    });

                    $scope.localtime = moment().format('h:mm a');
                    if ($scope.ip_geo_address) {
                        CustomerService.getGeoSearchAddress($scope.ip_geo_address, function(data) {
                            if (data.error === undefined) {
                                $scope.location.lat = parseFloat(data.lat);
                                $scope.location.lng = parseFloat(data.lon);
                                $scope.loadingMap = false;
                            } else
                                $scope.loadingMap = false;

                        });
                    } else {
                        $scope.loadingMap = false;
                    }
                });
            } else {
                if ($scope.customer.details.length !== 0 && $scope.customer.details[0].addresses && $scope.customer.details[0].addresses.length !== 0) {
                    $scope.ip_geo_address = $scope.displayAddressFormat($scope.customer.details[0].addresses[0]);
                    $scope.city = $scope.customer.details[0].addresses[0].city;
                    $scope.loadingMap = false;
                }
                if ($scope.ip_geo_address) {
                    CustomerService.getGeoSearchAddress($scope.ip_geo_address, function(data) {
                        if (data.error === undefined) {
                            $scope.location.lat = parseFloat(data.lat);
                            $scope.location.lng = parseFloat(data.lon);
                            $scope.markers.mainMarker.lat = parseFloat(data.lat);
                            $scope.markers.mainMarker.lng = parseFloat(data.lon);
                            $scope.loadingMap = false;
                        } else
                            $scope.loadingMap = false;
                    });
                }
            }

            $scope.fullName = [$scope.customer.first, $scope.customer.middle, $scope.customer.last].join(' ').trim();
            // $scope.contactLabel = CustomerService.contactLabel(customer);
            // $scope.checkBestEmail = CustomerService.checkBestEmail(customer);
        });

        $scope.displayAddressFormat = function(address) {
            return _.filter([address.address, address.address2, address.city, address.state, address.country, address.zip], function(str) {
                return str !== "";
            }).join(",")
        };

        $scope.refreshMap = function() {
            if ($scope.customer.details.length !== 0 && $scope.customer.details[0].addresses && $scope.customer.details[0].addresses.length !== 0) {
                $scope.ip_geo_address = $scope.displayAddressFormat($scope.customer.details[0].addresses[0]);
                $scope.city = $scope.customer.details[0].addresses[0].city;
                $scope.loadingMap = false;
            }
            if ($scope.ip_geo_address) {
                CustomerService.getGeoSearchAddress($scope.ip_geo_address, function(data) {
                    if (data.error === undefined) {
                        $scope.location.lat = parseFloat(data.lat);
                        $scope.location.lng = parseFloat(data.lon);
                        $scope.markers.mainMarker.lat = parseFloat(data.lat);
                        $scope.markers.mainMarker.lng = parseFloat(data.lon);
                        $scope.loadingMap = false;
                    } else
                        $scope.loadingMap = false;
                });
            }
        }

        //header map
        var marker, map;
        $scope.$on('mapInitialized', function(evt, evtMap) {
            map = evtMap;
            marker = map.markers[0];
        });

        var displayAddressCharLimit = 2;
        $scope.customerId = $stateParams.contactId;
        $scope.modifyAddress = {};
        $scope.saveLoading = false;
        $scope.countries = contactConstant.country_codes;
        $scope.saveContactDisabled = true;
        $scope.customer = {
            _id: null,
            accountId: $$.server.accountId,
            devices: [{
                _id: CommonService.generateUniqueAlphaNumericShort(),
                serial: ''
            }],
            details: [{
                _id: CommonService.generateUniqueAlphaNumericShort(),
                type: 'lo',
                emails: [{
                    _id: CommonService.generateUniqueAlphaNumericShort(),
                    email: ''
                }],
                phones: [{
                    _id: CommonService.generateUniqueAlphaNumericShort(),
                    type: 'm',
                    number: '',
                    default: false
                }],
                addresses: [{
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
                }]

            }],
        };

        $scope.twoNetSubscribeFn = function() {
            CustomerService.postTwoNetSubscribe($scope.customer._id, function(data) {});
        };


        $scope.checkAddressLatLng = function(addresses, fn) {
            var self = this;

            // var _addresses = [];
            // for (var i = 0; i < addresses.length; i++) {
            //   console.log('addresses ', addresses[i]);
            //   if (addresses[i].lat == '' || addresses[i].lon == '') {
            //     console.log('latlng empty', addresses[i].address);
            //     var formatedAddress = addresses[i].address+' '+addresses[i].city+' '+addresses[i].state+' '+addresses[i].zip;
            //     console.log('formatted ', formatedAddress);
            //     GeocodeService.geocodeAddress(formatedAddress, function(latlng) {
            //       console.log('latlng ', latlng);
            //       self.addresses[i]['lat'] = latlng.results[0].geometry.location.B;
            //       self.addresses[i]['lon'] = latlng.results[0].geometry.location.k;
            //       _addresses.push(addresses[i]);
            //     });

            //   } else {
            //     _addresses.push(addresses[i]);
            //   }
            // };

            fn(addresses);
        };

        $scope.customerSaveFn = function() {

            $scope.saveLoading = true;
            if ($scope.customer.details[0].phones) {
                $scope.customer.details[0].phones = _.filter($scope.customer.details[0].phones, function(num) {
                    return num.number !== "";
                });
            }

            $scope.checkAddressLatLng($scope.customer.details[0].addresses, function(addresses) {
                $scope.customer.details[0].addresses = addresses;
                if ($scope.checkContactValidity()) {
                    CustomerService.saveCustomer($scope.customer, function(customer) {
                        $scope.customer = customer;
                        $scope.saveLoading = false;
                        $scope.refreshMap();
                        if ($scope.currentState == 'customerAdd') {
                            toaster.pop('success', 'Contact Created.');
                        } else {
                            toaster.pop('success', 'Contact Saved.');
                        }
                    });
                } else {
                    $scope.saveLoading = false;
                    toaster.pop('warning', 'Contact Name OR Email is required');
                }

            });

        };
        $scope.checkContactValidity = function() {
            var fullName = $scope.fullName;
            var emails = $scope.customer.details[0].emails;
            var email = _.filter($scope.customer.details[0].emails, function(mail) {
                return mail.email !== "";
            });
            if ((angular.isDefined(fullName) && fullName !== "") || email.length > 0)
                return true;
            else
                return false;
        }

        $scope.addDeviceFn = function() {
            $scope.customer.devices.push({
                _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                serial: ''
            });
        };
        $scope.removeItem = function(index, obj) {
            obj.splice(index, 1);
        };
        $scope.customerPhoneTypeSaveFn = function(index, type) {
            var typeLabel = null;
            if (type == 'm')
                typeLabel = 'mobile';
            if (type == 'h')
                typeLabel = 'home';
            if (type == 'w')
                typeLabel = 'work';
            $('#customer-phone-type-' + index).html(typeLabel);
            $scope.customer.details[0].phones[index].type = type;
        };

        // $scope.customerAddressWatchFn = function(index) {
        //     $scope.$watch('customer.details[0].addresses[' + index + '].displayName', function(newValue, oldValue) {
        //         if (newValue && (newValue.length % displayAddressCharLimit === 0)) {
        //             CustomerService.getGeoSearchAddress(newValue, function(data) {
        //                 if (data.error === undefined) {
        //                     $scope.customer.details[0].addresses[index].address = data.address;
        //                     $scope.customer.details[0].addresses[index].address2 = data.address2;
        //                     $scope.customer.details[0].addresses[index].state = data.state;
        //                     $scope.customer.details[0].addresses[index].country = data.country;
        //                     $scope.customer.details[0].addresses[index].countryCode = data.countryCode;
        //                     $scope.customer.details[0].addresses[index].lat = data.lat;
        //                     $scope.customer.details[0].addresses[index].lon = data.lon;
        //                 }
        //             });
        //         }
        //     });
        // };
        $scope.getModifyAddressFn = function(index) {
            return $scope.modifyAddress[index];
        };

        $scope.setModifyAddressFn = function(index, state) {
            $scope.modifyAddress[index] = state;
        };

        $scope.customerDeleteFn = function() {
            CustomerService.deleteCustomer($scope.customerId, function(customer) {});
            toaster.pop('warning', 'Contact Deleted.');
        };

        $scope.restoreFn = function() {
            if ($scope.customerId) {
                if ($scope.customer.type === undefined) {
                    $scope.customer.type = $scope.userPreferences.default_customer_type;
                }
                if ($scope.customer.details[0].addresses.length === 0) {
                    //$scope.customer.details[0].addresses.push({});
                    $scope.customer.details[0].addresses[0].city = $scope.userPreferences.default_customer_city;
                    $scope.customer.details[0].addresses[0].state = $scope.userPreferences.default_customer_state;
                    $scope.customer.details[0].addresses[0].country = $scope.userPreferences.default_customer_country;
                    $scope.customer.details[0].addresses[0].zip = $scope.userPreferences.default_customer_zip;
                }
            } else {
                $scope.customer.type = $scope.userPreferences.default_customer_type;
                //$scope.customer.details[0].addresses.push({});
                $scope.customer.details[0].addresses[0].city = $scope.userPreferences.default_customer_city;
                $scope.customer.details[0].addresses[0].state = $scope.userPreferences.default_customer_state;
                $scope.customer.details[0].addresses[0].country = $scope.userPreferences.default_customer_country;
                $scope.customer.details[0].addresses[0].zip = $scope.userPreferences.default_customer_zip;
            }
        };

        $scope.savePreferencesFnWait = false;

        $scope.savePreferencesFn = function() {
            if ($scope.savePreferencesFnWait) {
                return;
            }
            $scope.savePreferencesFnWait = true;
            setTimeout(function() {
                UserService.updateUserPreferences($scope.userPreferences, true, function(preferences) {});
                $scope.restoreFn();
                $scope.savePreferencesFnWait = false;
            }, 1500);
        };

        // if ($scope.customerId) {
        //     CustomerService.getCustomer($scope.customerId, function(customer) {
        //         $scope.customer = customer;
        //         if (!$scope.customer.details[0].phones) {
        //             $scope.customer.details[0].phones = [];
        //         }
        //         if ($scope.customer.details[0].phones.length == 0) {
        //             $scope.addCustomerContactFn();
        //         }
        //         if (!$scope.customer.details[0].emails) {
        //             $scope.customer.details[0].emails = [];
        //         }
        //         if ($scope.customer.details[0].emails.length == 0) {
        //             $scope.customerAddEmailFn();
        //         }
        //         UserService.getUserPreferences(function(preferences) {
        //             $scope.userPreferences = preferences;
        //             $scope.restoreFn();
        //         });

        //         $scope.fullName = [$scope.customer.first, $scope.customer.middle, $scope.customer.last].join(' ');
        //         if (!$scope.customer.details[0].addresses) {
        //             $scope.customer.details[0].addresses = [];
        //         }
        //         if ($scope.customer.details[0].addresses.length) {
        //             $scope.customer.details[0].addresses.forEach(function(value, index) {
        //                 $scope.customerAddressWatchFn(index);
        //             });
        //         } else {
        //             $scope.customerAddAddressFn();
        //         }

        //     });
        // } else {
        //     $scope.customerAddressWatchFn(0);
        //     UserService.getUserPreferences(function(preferences) {
        //         $scope.userPreferences = preferences;
        //         $scope.restoreFn();
        //     });
        // }

        $scope.$watch('fullName', function(newValue, oldValue) {
            console.log('new value >>> ', newValue);
            console.log('oldValue >>> ', oldValue);
            if (newValue !== undefined) {
                var nameSplit = newValue.match(/\S+/g);
                if (nameSplit) {
                    if (nameSplit.length >= 3) {
                        $scope.customer.first = nameSplit[0];
                        $scope.customer.middle = nameSplit[1];
                        $scope.customer.last = nameSplit[2];
                    } else if (nameSplit.length == 2) {
                        $scope.customer.first = nameSplit[0];
                        $scope.customer.middle = '';
                        $scope.customer.last = nameSplit[1];
                    } else if (nameSplit.length == 1) {
                        $scope.customer.first = nameSplit[0];
                        $scope.customer.middle = '';
                        $scope.customer.last = '';
                    }
                } else {
                    $scope.customer.first = '';
                    $scope.customer.middle = '';
                    $scope.customer.last = '';
                }
            }
        }, true);

        $scope.insertPhoto = function(asset) {
            $scope.customer.photo = asset.url;
        };

        $scope.removePhoto = function(asset) {
            $scope.customer.photo = null;
        };

        $scope.enableSaveBtnFn = function() {
            $scope.saveContactDisabled = false;
        };

        $scope.contactLabel = function(customer) {
            return CustomerService.contactLabel(customer);
        };

        $scope.checkBestEmail = function(contact) {
            var returnVal = CustomerService.checkBestEmail(contact);
            this.email = contact.email;
            return returnVal;
        };

        $scope.checkFacebookId = function(contact) {
            var returnVal = CustomerService.checkFacebookId(contact);
            this.facebookId = contact.facebookId;
            return returnVal;
        };

        $scope.checkTwitterId = function(contact) {
            var returnVal = CustomerService.checkTwitterId(contact);
            this.twitterId = contact.twitterId;
            return returnVal;
        };

        $scope.checkLinkedInId = function(contact) {
            var returnVal = CustomerService.checkLinkedInId(contact);
            this.linkedInUrl = contact.linkedInUrl;
            this.linkedInId = contact.linkedInId;
            return returnVal;
        };

        $scope.checkAddress = function(contact) {
            var returnVal = CustomerService.checkAddress(contact);
            this.address = contact.address;
            return returnVal;
        };

        // Add/Remove email adresses
        $scope.customerAddEmailFn = function() {
            $scope.customer.details[0].emails.push({
                _id: CommonService.generateUniqueAlphaNumericShort(),
                email: ''
            });
        };
        $scope.removeEmail = function(index) {
            $scope.customer.details[0].emails.splice(index, 1);
        };

        $scope.showAddEmail = function(email) {
            return email._id === $scope.customer.details[0].emails[0]._id;
        };

        // Add/Remove phone numbers        
        $scope.addCustomerContactFn = function() {
            $scope.customer.details[0].phones.push({
                _id: CommonService.generateUniqueAlphaNumericShort(),
                number: ''
            });
        };
        $scope.removePhone = function(index) {
            $scope.customer.details[0].phones.splice(index, 1);
        };

        $scope.showAddPhone = function(phone) {
            return phone._id === $scope.customer.details[0].phones[0]._id;
        };

        // Add/Remove phone numbers
        $scope.removeAddress = function(index) {
            $scope.customer.details[0].addresses.splice(index, 1);
        };

        $scope.showAddAddress = function(address) {
            return address._id === $scope.customer.details[0].addresses[0]._id;
        };

        $scope.customerAddAddressFn = function() {
            $scope.customer.details[0].addresses.push({
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
            //$scope.customerAddressWatchFn($scope.customer.details[0].addresses.length - 1);
        };

        $scope.setDefaults = function() {
            if ($scope.customer.details.length) {
                if (!$scope.customer.details[0].emails.length)
                    $scope.customerAddEmailFn();
                if (!$scope.customer.details[0].phones.length)
                    $scope.addCustomerContactFn();
                if (!$scope.customer.details[0].addresses.length)
                    $scope.customerAddAddressFn();
            }
        }
        if (!$scope.customer.tags)
            $scope.customer.tags = {};
        $scope.customerTags = [{
            label: "Customer",
            data: "cu"
        }, {
            label: "Colleague",
            data: "co"
        }, {
            label: "Friend",
            data: "fr"
        }, {
            label: "Member",
            data: "mb"
        }, {
            label: "Family",
            data: "fa"
        }, {
            label: "Admin",
            data: "ad"
        }, {
            label: 'Lead',
            data: 'ld'
        }, {
            label: "Other",
            data: "ot"
        }];

        $scope.displayCustomerTags = function() {
            var tags = "";
            if ($scope.customer.tags && $scope.customer.tags.length) {
                $scope.customer.tags.forEach(function(value, index) {
                    if (index == 0) {
                        tags = value.label;
                    } else {
                        if (tags) {
                            tags = tags.concat(", ", value.label);
                        }
                    }
                });
            }
            return tags;
        };
    }]);
})(angular);
