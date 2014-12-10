define(['app', 'customerService', 'stateNavDirective', 'ngProgress', 'toasterService', 'leaflet-directive'], function(app) {
  app.register.controller('CustomerDetailCtrl', ['$scope', 'CustomerService', '$stateParams', '$state', 'ngProgress', 'ToasterService', function($scope, CustomerService, $stateParams, $state, ngProgress, ToasterService) {
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
    CustomerService.getCustomer($scope.customerId, function(customer) {
      $scope.customer = customer;
      $scope.fullName = [$scope.customer.first, $scope.customer.middle, $scope.customer.last].join(' ');
      $scope.contactLabel = CustomerService.contactLabel(customer);
    CustomerService.getGeoSearchAddress($scope.displayAddressFormat($scope.customer.details[0].addresses[0]), function(data) {
            if (data.error === undefined) {
              $scope.london.lat = parseFloat(data.lat);
              $scope.london.lng = parseFloat(data.lon);
              $scope.markers.mainMarker.lat = parseFloat(data.lat);
              $scope.markers.mainMarker.lng = parseFloat(data.lon);
            }
      });
    });
   
    CustomerService.getCustomerActivities($scope.customerId, function(activities) {
       for (var i = 0; i < activities.length; i++) {
            activities[i]['customer'] = $scope.customer;
            activities[i]['activityType'] = activities[i]['activityType'];
        };
        $scope.activities = _.sortBy(activities, function(o) {
            return o.start;
        }).reverse();
      // $scope.activities.push(
      // {
      //     "contactId": $scope.customerId,
      //     "activityType": "EMAIL",
      //     "note": "Email Received.",
      //     "detail": "by abc",
      //     "start": "2014-10-28T18:51:52.938Z"
      // },
      // {
      //     "contactId": $scope.customerId,
      //     "activityType": "TWEET",
      //     "note": "Tweet Received.",
      //     "detail": "by xyz",
      //     "start": "2014-10-28T18:51:52.938Z"
      // }
      // )
      //$scope.activities = activities;
      ngProgress.complete();
      ToasterService.processPending();
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

    CustomerService.getActivityTypes(function(activity_types) {
      $scope.activity_types = activity_types;
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
  }]);
});
