'use strict';
/*global app, moment, angular, $$*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('CustomerDetailCtrl', ["$scope", "$rootScope", "$location", "$modal", "toaster", "$stateParams", "CustomerService", 'ContactService', 'SweetAlert', '$state', '$window', '$timeout', 'UserService', function ($scope, $rootScope, $location, $modal, toaster, $stateParams, customerService, contactService, SweetAlert, $state, $window, $timeout, UserService) {



        $scope.isDomainChanged = false;
        /*
         * @getCustomer
         * -
         */

        $scope.getCustomer = function () {

            customerService.getCustomer($stateParams.customerId, function(err, customer){
                if (err) {
                    toaster.pop('warning', err.message);
                    if (err.code === 404)
                        $location.path('/customers');
                    return;
                }
                $scope.customer = customer;
                $scope.data.subdomain = customer.subdomain;
                $scope.getMapData();
                if(customer.ownerUser) {
                    $scope.primaryUser = _.find(customer.users, function(user){return user._id === customer.ownerUser});
                    //console.log('primaryUser:', $scope.primaryUser);
                }
                if(!customer.trialDaysRemaining) {
                    var endDate = moment(customer.billing.signupDate).add(customer.billing.trialLength, 'days');
                    customer.trialDaysRemaining =  endDate.diff(moment(), 'days');
                }

                $scope.matchUsers(customer);

                $scope.originalCustomer = angular.copy($scope.customer);

            });

        };

        $scope.checkNameServerChanged = function(){
            $scope.isDomainChanged = $scope.originalCustomer && $scope.customer && !angular.equals($scope.originalCustomer.customDomain, $scope.customer.customDomain);           
        }

        $scope.getMapData = function () {
            var _firstAddress;

            if ($scope.customer.business && $scope.customer.business.addresses && $scope.customer.business.addresses[0]) {
                _firstAddress = $scope.customer.business.addresses[0];
            }

            //contact has no address
            if (!_firstAddress) {
                $scope.loadingMap = false;
                console.log('Customer has no address:', _firstAddress);
            } else {
                //contact has address and lat/lon
                if (_firstAddress.lat && _firstAddress.lon && checkIfAddressExists(_firstAddress)) {
                    $scope.showMap(_firstAddress.lat, _firstAddress.lon);
                } else {
                    //contact has address but no lat/lon
                    //if contact has a session id get data from Analytics
                    _firstAddress.address2 = '';
                    $scope.convertAddressToLatLon(_firstAddress, function (data) {
                        if (data) {
                            //save updated lat/lon
                            _firstAddress.lat = parseFloat(data.lat);
                            _firstAddress.lon = parseFloat(data.lon);
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

        $scope.displayAddressFormat = function (address) {
            return _.filter([address.address, address.address2, address.city, address.state, address.zip], function (str) {
                return str !== "";
            }).join(",");
        };

        $scope.queryAddressFormat = function(address) {
            var str = "";
            /*
            if(address.address) {
                str += 'street=' + address.address + '&';
            }
            */
            if(address.city) {
                str += 'city=' +address.city + '&';
            }
            if(address.state) {
                str += 'state=' + address.state + '&';
            }
            if(address.zip && !address.city && !address.state) {
                str += 'postalcode=' + address.zip + '&';
            }
            if(address.country && address.country !== 'United States') {
                str += 'country=' + address.country;
            } else {
                str += 'country=us';
            }
            return str;
        };

        $scope.showMap = function (_lat, _lon) {
            console.log('>> showMap(' + _lat + ',' + _lon + ')');

            $scope.location.lat = parseFloat(_lat);
            $scope.location.lon = parseFloat(_lon);
            $scope.loadingMap = false;
            //console.log('$scope.location:', $scope.location);
            //console.log('$scope.loadingMap', $scope.loadingMap);
            if ($scope.markers && $scope.markers.mainMarker) {
                $scope.markers.mainMarker.lat = parseFloat(_lat);
                $scope.markers.mainMarker.lon = parseFloat(_lon);
            }
        };

        function checkIfAddressExists(address){
            var _exists = false;
            if(address.address || address.address2 || address.city || address.state || address.zip || address.country) {
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

        $scope.editTrialDays = function() {
            console.log('setting trial length to ', $scope.newTrialLength);
            customerService.extendTrial($scope.customer._id, $scope.newTrialLength, function(err, customer){
                if(err) {
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

        $scope.addNewUser = function() {
            console.log('Adding the following:', $scope.newuser);
            customerService.addNewUser($scope.customer._id, $scope.newuser.username, $scope.newuser.password, function(err, newuser){
                if(err) {
                    toaster.pop('warning', err.message);
                } else {
                    $scope.customer.users.push(newuser);
                    $scope.closeModal();
                }
            });
        };

        $scope.removeUserFromAccount = function(userId) {
            customerService.removeUserFromAccount($scope.customer._id, userId, function(err, data){
                if(err) {
                    toaster.pop('warning', err.message);
                } else {
                    $scope.customer.users = _.filter($scope.customer.users, function(user){
                        if(user._id !== userId) {
                            return true;
                        }
                    });
                }
            });
        };

        $scope.openEditUserModal = function(userId) {
            $scope.currentUserId = userId;
            $scope.openSimpleModal('edit-password-modal');
        };
        $scope.closeEditUserModal = function() {
            $scope.currentUserId = null;
            $scope.closeModal();
        };

        $scope.setUserPassword = function(userId) {
            customerService.setUserPassword(userId, $scope.edituser.password1, function(err, data){
                if(err) {
                    toaster.pop('warning', err.message);
                } else {
                    toaster.pop('info', 'Successfully changed password');
                    $scope.closeEditUserModal();
                }
            });
        };

        $scope.getNameServers = function(domain) {
            $scope.showNameServer = true;
            if(!domain) {
                toaster.pop('info', 'No custom domain to lookup.');
            } else {
                customerService.viewNameServers(domain, function(err, data){
                    if(err) {
                        toaster.pop('warning', err.message);
                    } else {
                        $scope.nameservers = data;
                    }
                });
            }

        };

        $scope.addCustomDomain = function() {
            var domain = $scope.customer.customDomain;
            var accountId = $scope.customer._id;
            customerService.addDomainToAccount(domain, accountId, function(err, data){
                if(err) {
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
                keyboard: false,
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

        $scope.$watch('customer.billing.trialLength', function(newValue){
            if($scope.customer && $scope.customer.billing) {
                $scope.currentTrialExpiration = moment($scope.customer.billing.signupDate).add(newValue, 'days').format('MM/DD/YYYY');
            }
        });

        $scope.$watch('newTrialLength', function(newValue){
            if($scope.customer && $scope.customer.billing) {
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

        $scope.addNote = function (_note) {
            
            customerService.addCustomerNotes($scope.customer._id, _note, function (customer) {
                if(customer && customer._id){
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

                _.each(notes, function (_note) {
                    var matchingUser = _.find($scope.users, function (_user) {
                        return _user._id === _note.user_id;
                    });

                    // This code is used to show related user profile image in notes

                    if (matchingUser) {
                        _note.user = matchingUser;
                        if (matchingUser.profilePhotos && matchingUser.profilePhotos[0])
                            _note.user_profile_photo = matchingUser.profilePhotos[0];
                    }
                });
                $scope.customerNotes = notes;
            }
        };


        $scope.resizeAnalytics = function(){
            $timeout(function() {
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
                    if ($scope.planInterval == 'week') {
                        formattedDate = formattedDate.add(7, options.addType);
                    }
                    else if ($scope.planInterval == 'month') {
                        formattedDate = formattedDate.add(1, 'months');
                    }
                    else if ($scope.planInterval == 'year') {
                        formattedDate = formattedDate.add(1, 'years');
                    }
                    else {
                        formattedDate = formattedDate.add(options.addNum, options.addType);
                    }
                    console.log("Formatted date: ")
                    console.log(formattedDate);
                }
            }
            return formattedDate.format("M/D/YY");
        };

        (function init() {

            UserService.getUsers(function (users) {
                $scope.users = users;
                $scope.getCustomer();
            });

        })();


    }]);
}(angular));
