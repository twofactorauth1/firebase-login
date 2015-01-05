define(['app', 'customerService', 'stateNavDirective', 'ngProgress', 'toasterService', 'leaflet-directive', 'keenService', 'timeAgoFilter','activityDirective', 'formatText'], function(app) {
    app.register.controller('CustomerDetailCtrl', ['$scope', 'CustomerService', '$stateParams', '$state', 'ngProgress', 'ToasterService', 'keenService',
        function($scope, CustomerService, $stateParams, $state, ngProgress, ToasterService, keenService) {
            ngProgress.start();
            $scope.lat = 51;
            $scope.lng = 0;
            $scope.$back = function() {
                console.log('$scope.lastState.state ', $scope.lastState.state);
                console.log('$scope.lastState.params ', $scope.lastState.params);
                if ($scope.lastState === undefined || $scope.lastState.state === '' || $state.is($scope.lastState.state, $scope.lastState.params)) {
                    $state.go('customer');
                } else {
                    $state.go($scope.lastState.state, $scope.lastState.params);
                }
            };
            $scope.customerId = $stateParams.id;

            $scope.ip_geo_address = '';
            CustomerService.getCustomer($scope.customerId, function(customer) {
                $scope.customer = customer;
                console.log(customer.fingerprint);
                if (customer.fingerprint !== undefined) {
                    var keenParams = {
                        event_collection: 'session_data',
                        filters: [{
                            "property_name": "fingerprint",
                            "operator": "eq",
                            "property_value": customer.fingerprint
                        }]
                    };
                    keenService.singleExtraction(keenParams, function(data) {
                       console.log('keen extraction ', data);
                       var keepGoing =  true;
                       data.result.forEach(function(value, index) {
                        if (keepGoing && value.ip_geo_info && value.ip_geo_info.country) {
                            $scope.ip_geo_address = _.filter([value.ip_geo_info.city, value.ip_geo_info.province, value.ip_geo_info.country, value.ip_geo_info.continent, value.ip_geo_info.postal_code], function(str) {
                            $scope.city = value.ip_geo_info_gen.city;
                            return (str !== "" || str !== undefined || str !== null);
                            }).join(",");
                            keepGoing = false;
                        } else if (keepGoing && value.ip_geo_info_gen && value.ip_geo_info_gen.country){
                            console.log('value.ip_geo_info_gen.city ', value.ip_geo_info_gen.city);
                            $scope.ip_geo_address = _.filter([value.ip_geo_info_gen.city, value.ip_geo_info_gen.province, value.ip_geo_info_gen.postal_code], function(str) {
                            $scope.city = value.ip_geo_info_gen.city;
                            return (str !== "" || str !== undefined || str !== null);
                         }).join(",");
                            keepGoing = false;
                        }

                       });

                        console.log('$scope.ip_geo_address ', $scope.ip_geo_address);

                        $scope.localtime = moment().format('h:mm a');

                        CustomerService.getGeoSearchAddress($scope.ip_geo_address, function(data) {
                            console.log('latlong data ', data);
                            if (data.error === undefined) {
                                $scope.london.lat = parseFloat(data.lat);
                                $scope.london.lng = parseFloat(data.lon);
                                $scope.markers.mainMarker.lat = parseFloat(data.lat);
                                $scope.markers.mainMarker.lng = parseFloat(data.lon);
                            }
                        });
                    });
                } else {
                    if ($scope.customer.details.length !== 0 && $scope.customer.details[0].addresses && $scope.customer.details[0].addresses.length !== 0) {
                        $scope.ip_geo_address = $scope.displayAddressFormat($scope.customer.details[0].addresses[0]);
                        $scope.city = $scope.customer.details[0].addresses[0].city;
                    }
                    CustomerService.getGeoSearchAddress($scope.ip_geo_address, function(data) {
                        if (data.error === undefined) {
                            $scope.london.lat = parseFloat(data.lat);
                            $scope.london.lng = parseFloat(data.lon);
                            $scope.markers.mainMarker.lat = parseFloat(data.lat);
                            $scope.markers.mainMarker.lng = parseFloat(data.lon);
                        }
                    });
                }

                $scope.fullName = [$scope.customer.first, $scope.customer.middle, $scope.customer.last].join(' ');
                $scope.contactLabel = CustomerService.contactLabel(customer);
                $scope.checkBestEmail = CustomerService.checkBestEmail(customer);
            });
            angular.extend($scope, {
                london: {
                    lat: 51,
                    lng: 0,
                    zoom: 10
                },
                markers: {
                    mainMarker: {
                        lat: 51,
                        lng: 0,
                        focus: true,
                        //message: "Here",
                        draggable: false
                    }
                }
            });


            $scope.moreToggleFn = function(type) {
                var id = '.li-' + type + '.more';
                if ($(id).hasClass('hidden')) {
                    $(id).removeClass('hidden');
                } else {
                    $(id).addClass('hidden');
                }
            };
            $scope.importContactFn = function() {
                CustomerService.postFullContact($scope.customerId, function(data) {
                    console.info(data);
                });
            };
            $scope.displayAddressFormat = function(address) {
                return _.filter([address.address, address.address2, address.city, address.state, address.country, address.zip], function(str) {
                    return str !== "";
                }).join(",")
            };
            $scope.showAddress = function(address) {
                arrAddress = _.filter([address.address, address.address2, address.city, address.state, address.country, address.zip, address.lat, address.lon], function(str) {
                    return str !== "";
                })
                return arrAddress.length > 0;
            };


            $scope.setImportantContact = function(customer, value) {
                customer.starred = value;
                CustomerService.saveCustomer(customer, function(customers) {
                    ToasterService.show('success', "Contact updated succesfully.");
                });
            };
        }
    ]);
});
