'use strict';
/*global app, moment, angular, $$*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('CustomerDetailCtrl', ["$scope", "$rootScope", "$location", "$modal", "toaster", "$stateParams", "CustomerService", 'ContactService', 'SweetAlert', '$state', '$window', '$timeout', function ($scope, $rootScope, $location, $modal, toaster, $stateParams, customerService, contactService, SweetAlert, $state, $window, $timeout) {

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
                    console.log('primaryUser:', $scope.primaryUser);
                }
            });

        };

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
                            //$scope.contactSaveFn(true);

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
            console.log('$scope.location:', $scope.location);
            console.log('$scope.loadingMap', $scope.loadingMap);
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
        };

        $scope.calculateExpiration = function(days) {
            console.log('days:', days);
            return 'never';
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
        $scope.getCustomer();


    }]);
}(angular));
