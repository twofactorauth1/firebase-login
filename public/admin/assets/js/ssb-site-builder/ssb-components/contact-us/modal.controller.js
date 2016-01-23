'use strict';
/*global app*/
app.controller('SiteBuilderContactUsModalController', ['$timeout', 'parentVm', 'toaster', 'SimpleSiteBuilderService', 'GeocodeService', function ($timeout, parentVm, toaster, SimpleSiteBuilderService, GeocodeService) {

    var vm = this;

    vm.parentVm = parentVm;

    vm.component = parentVm.state.page.sections[parentVm.uiState.activeSectionIndex].components[parentVm.uiState.activeComponentIndex];
    vm.originalContactMap = angular.copy(vm.component.location);
    vm.place = {};
    vm.place.address = null;
    vm.errorMapData = false;
    vm.showAddress = false;

    vm.saveComponent = saveComponent;
    vm.updateContactUsAddress = updateContactUsAddress;
    vm.setLatLon = setLatLon;
    vm.validateGeoAddress = validateGeoAddress;
    vm.validateHours = validateHours;

    function saveComponent(is_address) {

        if(is_address){
            vm.uiState.componentControl.refreshMap();
            vm.place.address = GeocodeService.stringifyAddress(vm.component.location);
        } else {
            vm.uiState.componentControl.refreshHours();
        }

    }

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
                        vm.contactMap.refreshMap();
                    });
                }, 0);
            } else {
                $timeout(function () {
                    vm.$apply(function () {
                        vm.errorMapData = true;
                        angular.copy(vm.component.location, vm.originalContactMap);
                    });
                }, 0);
            }

            if (fn) {
                fn();
            }

        });

    };

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
    }

    (function init() {

        console.debug('ContactUsModalController')

    })();

}]);
