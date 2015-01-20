define(['app',
  'customerService',
  'stateNavDirective',
  'underscore',
  'commonutils',
  'adminValidationDirective',
  'ngProgress',
  'confirmClick2',
  'toasterService',
  'mediaDirective',
  'userService',
  'geocodeService',
], function(app) {
  app.register.controller('CustomerEditCtrl', ['$scope',
    'CustomerService',
    '$stateParams',
    '$state',
    'ngProgress',
    'ToasterService',
    'UserService',
    'GeocodeService',
    function($scope, CustomerService, $stateParams, $state, ngProgress, ToasterService, UserService, GeocodeService) {
      ngProgress.start();
      var displayAddressCharLimit = 2;
      $scope.currentState = $state.current.name;
      $scope.customerId = $stateParams.id;
      $scope.modifyAddress = {};
      $scope.saveLoading = false ; 
      $scope.customer = {
        _id: null,
        accountId: $$.server.accountId,
        devices: [{
          _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
          serial: ''
        }],
        details: [{
          _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
          type: 'lo',
          emails: [{
            _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
            email: ''
          }],
          phones: [{
            _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
            type: 'm',
            number: '',
            default: false
          }],
          addresses: [{
            _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
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
            if($scope.checkContactValidity())
            {
              CustomerService.saveCustomer($scope.customer, function(customer) {
              $scope.customer = customer;
              $scope.saveLoading = false; 
              if ($scope.currentState == 'customerAdd') {
                ToasterService.setPending('success', 'Contact Created.');
                $state.go('customerDetail', {
                  id: $scope.customer._id
                });
              } else {
                ToasterService.setPending('success', 'Contact Saved.');
                $state.go('customerDetail', {
                  id: $scope.customerId
                });
              }
            });
            }
            else {
              $scope.saveLoading = false; 
              ToasterService.show("warning", "Contact Name OR Email is required");
            }
              
        });

      };
      $scope.checkContactValidity = function()
      {
        var fullName =  $scope.fullName;
        var emails = $scope.customer.details[0].emails;
         var email = _.filter($scope.customer.details[0].emails, function(mail) {
            return mail.email !== "";
          });
         if((angular.isDefined(fullName) && fullName !== "") ||  email.length > 0)
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

      $scope.addCustomerContactFn = function() {
        $scope.customer.details[0].phones.push({
          _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
          number: '',
          default: false,
          type: 'm'
        });
      };

      $scope.customerAddressWatchFn = function(index) {
        $scope.$watch('customer.details[0].addresses[' + index + '].displayName', function(newValue, oldValue) {
          if (newValue && (newValue.length % displayAddressCharLimit === 0)) {
            CustomerService.getGeoSearchAddress(newValue, function(data) {
              if (data.error === undefined) {
                $scope.customer.details[0].addresses[index].address = data.address;
                $scope.customer.details[0].addresses[index].address2 = data.address2;
                $scope.customer.details[0].addresses[index].state = data.state;
                $scope.customer.details[0].addresses[index].country = data.country;
                $scope.customer.details[0].addresses[index].countryCode = data.countryCode;
                $scope.customer.details[0].addresses[index].lat = data.lat;
                $scope.customer.details[0].addresses[index].lon = data.lon;
              }
            });
          }
        });
      };

      $scope.customerAddAddressFn = function() {
        $scope.customer.details[0].addresses.push({
          _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
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
        $scope.customerAddressWatchFn($scope.customer.details[0].addresses.length - 1);
      };

      $scope.getModifyAddressFn = function(index) {
        return $scope.modifyAddress[index];
      };

      $scope.setModifyAddressFn = function(index, state) {
        $scope.modifyAddress[index] = state;
      };

      $scope.customerAddEmailFn = function() {
        $scope.customer.details[0].emails.push({
          _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
          email: ''
        });
      };

      $scope.customerDeleteFn = function() {
        CustomerService.deleteCustomer($scope.customerId, function(customer) {});
        ToasterService.setPending('warning', 'Contact Deleted.');
        $state.go('customer');
      };

      $scope.restoreFn = function() {
        if ($scope.customerId) {
          if ($scope.customer.type === undefined) {
            $scope.customer.type = $scope.userPreferences.default_customer_type;
          }
          if ($scope.customer.details[0].addresses.length === 0) {
            $scope.customer.details[0].addresses.push({});
            $scope.customer.details[0].addresses[0].city = $scope.userPreferences.default_customer_city;
            $scope.customer.details[0].addresses[0].state = $scope.userPreferences.default_customer_state;
            $scope.customer.details[0].addresses[0].country = $scope.userPreferences.default_customer_country;
            $scope.customer.details[0].addresses[0].zip = $scope.userPreferences.default_customer_zip;
          }
        } else {
          $scope.customer.type = $scope.userPreferences.default_customer_type;
          $scope.customer.details[0].addresses.push({});
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

      if ($scope.customerId) {
        CustomerService.getCustomer($scope.customerId, function(customer) {
          $scope.customer = customer;
          if(!$scope.customer.details[0].phones)
          {
            $scope.customer.details[0].phones = [];
          }
          if ($scope.customer.details[0].phones.length == 0)
          {
            $scope.addCustomerContactFn();
          }
          if(!$scope.customer.details[0].emails)
          {
            $scope.customer.details[0].emails = [];
          }
          if ($scope.customer.details[0].emails.length == 0)
          {
            $scope.customerAddEmailFn();
          }
          UserService.getUserPreferences(function(preferences) {
            $scope.userPreferences = preferences;
            $scope.restoreFn();
          });

          ngProgress.complete();
          $scope.fullName = [$scope.customer.first, $scope.customer.middle, $scope.customer.last].join(' ');
          if(!$scope.customer.details[0].addresses)
          {
            $scope.customer.details[0].addresses = [];
          }
          if ($scope.customer.details[0].addresses.length) {
            $scope.customer.details[0].addresses.forEach(function(value, index) {
              $scope.customerAddressWatchFn(index);
            });
          } else {
            $scope.customerAddAddressFn();
          }

        });
      } else {
        ngProgress.complete();
        $scope.customerAddressWatchFn(0);
        UserService.getUserPreferences(function(preferences) {
          $scope.userPreferences = preferences;
          $scope.restoreFn();
        });
      }

      $scope.$watch('fullName', function(newValue, oldValue) {
        if (newValue) {
          var nameSplit = newValue.split(' ');
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
          } else {
            $scope.customer.first = '';
            $scope.customer.middle = '';
            $scope.customer.last = '';
          }
        }
      });

      $scope.insertPhoto = function(asset) {
        $scope.customer.photo = asset.url;
      };

      $scope.enableSaveBtnFn = function () {
        $('.btn-save-contact').removeClass('disabled');
      };
    }
  ]);
});
