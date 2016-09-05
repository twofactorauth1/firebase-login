'use strict';
/*global app*/
app.controller('SiteBuilderContactUsModalController', ['$scope', '$timeout', 'parentVm', 'toaster', 'SimpleSiteBuilderService', 'GeocodeService', 'hoursConstant', function ($scope, $timeout, parentVm, toaster, SimpleSiteBuilderService, GeocodeService, hoursConstant) {

    var vm = this;

    vm.parentVm = parentVm;

    vm.component = parentVm.state.page.sections[parentVm.uiState.activeSectionIndex].components[parentVm.uiState.activeComponentIndex];
    vm.originalContactMap = angular.copy(vm.component.location);
    vm.place = {};
    vm.place.address = null;
    vm.errorMapData = false;
    vm.showAddress = false;
    vm.hours = hoursConstant;

    vm.saveComponent = saveComponent;
    vm.updateContactUsAddress = updateContactUsAddress;
    vm.setLatLon = setLatLon;
    vm.validateGeoAddress = validateGeoAddress;
    vm.validateHours = validateHours;
    vm.setContactShowInfo = setContactShowInfo;


    function updateContactUsAddress() {
        if (!angular.equals(vm.originalContactMap, vm.component.location)) {
            vm.locationAddress = null;
            vm.setLatLon();
            vm.validateGeoAddress();
        }
    }

    function setLatLon(lat, lon) {
        vm.component.location.lat = lat;
        vm.component.location.lon = lon;
    }

    function validateGeoAddress(fn) {
        GeocodeService.validateAddress(vm.component.location, vm.locationAddress, function (data, results) {
            if (data && results.length === 1) {
                $timeout(function () {
                    $scope.$apply(function () {
                        vm.setLatLon(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                        vm.errorMapData = false;
                        angular.copy(vm.component.location, vm.originalContactMap);
                        vm.parentVm.uiState.componentControl.refreshMap();
                    });
                }, 0);
            } else {
                $timeout(function () {
                    $scope.$apply(function () {
                        vm.errorMapData = true;
                        //angular.copy(vm.originalContactMap,vm.component.location);
                    });
                }, 0);
            }
            if (fn) {
                fn();
            }
        });
    };

    function saveComponent(is_address) {
        if (is_address) {
            vm.parentVm.uiState.componentControl.refreshMap();
            vm.place.address = GeocodeService.stringifyAddress(vm.component.location);
        } else {
            vm.parentVm.uiState.componentControl.refreshHours();
        }
    };

    vm.contactHoursInvalid = false;
    vm.contactHours = [];
    var i = 0;
    for (i; i <= 6; i++) {
      vm.contactHours.push({
        "valid": true
      });
    }

    function validateHours(hours, index) {
        vm.contactHours[index].valid = true;
        if (!hours.closed) {
            var startTime = hours.start;
            var endTime = hours.end;

            if (startTime && endTime) {
                startTime = startTime.split(" ")[1] === 'pm' && startTime.split(":")[0] !== '12' ? parseInt(startTime.split(":")[0], 10) + 12 : parseInt(startTime.split(":")[0], 10);
                endTime = endTime.split(" ")[1] === 'pm' && endTime.split(":")[0] !== '12' ? parseInt(endTime.split(":")[0], 10) + 12 : parseInt(endTime.split(":")[0], 10);
                startTime = parseInt(hours.start.split(":")[1], 10) === 30 ? startTime + 0.5 : startTime;
                endTime = parseInt(hours.end.split(":")[1], 10) === 30 ? endTime + 0.5 : endTime;
            }

            if (hours.split && vm.component.splitHours) {
                angular.element("#business_hours_start_" + index).removeClass('has-error');
                angular.element("#business_hours_start2_" + index).removeClass('has-error');
                angular.element("#business_hours_end_" + index).removeClass('has-error');
                var startTime2 = hours.start2;
                var endTime2 = hours.end2;

                if (startTime2 && endTime2) {
                    startTime2 = startTime2.split(" ")[1] === 'pm' && startTime2.split(":")[0] !== '12' ? parseInt(startTime2.split(":")[0], 10) + 12 : parseInt(startTime2.split(":")[0], 10);
                    endTime2 = endTime2.split(" ")[1] === 'pm' && endTime2.split(":")[0] !== '12' ? parseInt(endTime2.split(":")[0], 10) + 12 : parseInt(endTime2.split(":")[0], 10);
                    startTime2 = parseInt(hours.start2.split(":")[1], 10) === 30 ? startTime2 + 0.5 : startTime2;
                    endTime2 = parseInt(hours.end2.split(":")[1], 10) === 30 ? endTime2 + 0.5 : endTime2;
                }

                if (startTime > endTime || startTime > startTime2 || startTime > endTime2) {
                    if (startTime > endTime) {
                        angular.element("#business_hours_start_" + index).addClass('has-error');
                    } else if (startTime > startTime2) {
                        angular.element("#business_hours_start_" + index).addClass('has-error');
                    } else if (startTime > endTime2) {
                        angular.element("#business_hours_start_" + index).addClass('has-error');
                    }
                    vm.contactHours[index].valid = false;
                }

                if (endTime > startTime2 || endTime > endTime2) {
                    if (endTime > startTime2) {
                        angular.element("#business_hours_end_" + index).addClass('has-error');
                    } else if (endTime > endTime2) {
                        angular.element("#business_hours_end_" + index).addClass('has-error');
                    }
                    vm.contactHours[index].valid = false;
                }

                if (startTime2 > endTime2) {
                    angular.element("#business_hours_start2_" + index).addClass('has-error');
                    vm.contactHours[index].valid = false;
                }

            } else if (!hours.wholeday) {
                angular.element("#business_hours_start_" + index).removeClass('has-error');
                if (startTime > endTime) {
                    angular.element("#business_hours_start_" + index).addClass('has-error');
                    vm.contactHours[index].valid = false;
                }
            }
        }

        var validate = _.where(vm.contactHours, {
            valid: false
        });
        if (validate && validate.length) {
            vm.contactHoursInvalid = true;
        } else {
            vm.contactHoursInvalid = false;
        }
    };

    var componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        postal_code: 'short_name',
        country: 'short_name'
    };

    var fillInAddress = function (place) {
        // Get each component of the address from the place details
        // and fill the corresponding field on the form.
        setDefaultAddress();
        var i = 0;
        var addressType, val;
        for (i; i < place.address_components.length; i++) {
          addressType = place.address_components[i].types[0];
          if (componentForm[addressType]) {
            val = place.address_components[i][componentForm[addressType]];
            if (addressType === 'street_number') {
              vm.component.location.address = val;
            } else if (addressType === 'route') {
              vm.component.location.address2 = val;
            } else if (addressType === 'locality') {
              vm.component.location.city = val;
            } else if (addressType === 'administrative_area_level_1') {
              vm.component.location.state = val;
            } else if (addressType === 'postal_code') {
              vm.component.location.zip = val;
            } else if (addressType === 'country') {
              vm.component.location.country = val;
            }
          }
        }
        vm.component.location.lat = place.geometry.location.lat();
        vm.component.location.lon = place.geometry.location.lng();
    };

    var setDefaultAddress = function () {
        vm.component.location.address = "";
        vm.component.location.address2 = "";
        vm.component.location.city = "";
        vm.component.location.state = "";
        vm.component.location.zip = "";
        vm.component.location.country = "";
    };

    vm.place.address = GeocodeService.stringifyAddress(vm.component.location);
    $scope.$watch('vm.place.address', function (newValue) {
        if (newValue) {
          if (angular.isObject(newValue)) {
            fillInAddress(newValue);
            vm.locationAddress = newValue;
            vm.setLatLon();
            vm.validateGeoAddress();
          }
        }
    });

    function setContactShowInfo(component, value){       
        component.hideBusinessInfo = value ? false : true;
    }


    (function init() {

        console.debug('ContactUsModalController')

    })();

}]);
