'use strict';
/*global app, moment, angular, $$*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('CustomerDetailCtrl', ["$scope", "$modal", "toaster", "$stateParams", "contactConstant", "CustomerService", "KeenService", "CommonService", "UserService", 'SweetAlert', '$state', 'OrderService', function ($scope, $modal, toaster, $stateParams, contactConstant, CustomerService, KeenService, CommonService, UserService, SweetAlert, $state, OrderService) {

    /*
     * @openModal
     * -
     */

    $scope.openModal = function (modal) {
      $scope.modalInstance = $modal.open({
        templateUrl: modal,
        scope: $scope
      });
    };

    /*
     * @closeModal
     * -
     */

    $scope.closeModal = function () {
      $scope.modalInstance.close();
    };

    $scope.ip_geo_address = '';
    $scope.location = {};
    $scope.loadingMap = true;
    $scope.data = {
      fullName: ''
    };
    /*
     * @getCustomer
     * -
     */

    CustomerService.getCustomer($stateParams.contactId, function (customer) {
      $scope.customer = customer;
      $scope.setTags();
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
        KeenService.singleExtraction(keenParams, function (data) {
          var keepGoing = true;
          data.result.forEach(function (value, index) {
            if (keepGoing && value.ip_geo_info && value.ip_geo_info.city) {
              $scope.ip_geo_address = _.filter([value.ip_geo_info.city, value.ip_geo_info.province, value.ip_geo_info.postal_code], function (str) {
                $scope.city = value.ip_geo_info.city;
                return (str !== "" || str !== undefined || str !== null);
              }).join(",");
              keepGoing = false;
              $scope.loadingMap = false;
            } else if (keepGoing && value.ip_geo_info_gen && value.ip_geo_info_gen.country) {
              $scope.ip_geo_address = _.filter([value.ip_geo_info_gen.city, value.ip_geo_info_gen.province, value.ip_geo_info_gen.postal_code], function (str) {
                $scope.city = value.ip_geo_info_gen.city;
                return (str !== "" || str !== undefined || str !== null);
              }).join(",");
              keepGoing = false;
              $scope.loadingMap = false;
            }

          });

          $scope.localtime = moment().format('h:mm a');
          if ($scope.ip_geo_address) {
            CustomerService.getGeoSearchAddress($scope.ip_geo_address, function (data) {
              if (data.error === undefined) {
                $scope.location.lat = parseFloat(data.lat);
                $scope.location.lng = parseFloat(data.lon);
                $scope.loadingMap = false;
              } else {
                $scope.loadingMap = false;
              }

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
          CustomerService.getGeoSearchAddress($scope.ip_geo_address, function (data) {
            if (data.error === undefined) {
              $scope.location.lat = parseFloat(data.lat);
              $scope.location.lng = parseFloat(data.lon);
              if ($scope.markers && $scope.markers.mainMarker) {
                $scope.markers.mainMarker.lat = parseFloat(data.lat);
                $scope.markers.mainMarker.lng = parseFloat(data.lon);
              }

              $scope.loadingMap = false;
            } else {
              $scope.loadingMap = false;
            }
          });
        }
      }

      $scope.data.fullName = [$scope.customer.first, $scope.customer.middle, $scope.customer.last].join(' ').trim();
      // $scope.contactLabel = CustomerService.contactLabel(customer);
      // $scope.checkBestEmail = CustomerService.checkBestEmail(customer);
    });

    /*
     * @displayAddressFormat
     * -
     */

    $scope.displayAddressFormat = function (address) {
      return _.filter([address.address, address.address2, address.city, address.state, address.country, address.zip], function (str) {
        return str !== "";
      }).join(",");
    };

    /*
     * @refreshMap
     * -
     */

    $scope.refreshMap = function () {
      if ($scope.customer.details.length !== 0 && $scope.customer.details[0].addresses && $scope.customer.details[0].addresses.length !== 0) {
        $scope.ip_geo_address = $scope.displayAddressFormat($scope.customer.details[0].addresses[0]);
        $scope.city = $scope.customer.details[0].addresses[0].city;
        $scope.loadingMap = false;
      }
      if ($scope.ip_geo_address && !$scope.location.lng && !$scope.location.lng) {
        CustomerService.getGeoSearchAddress($scope.ip_geo_address, function (data) {
          if (data.error === undefined) {
            $scope.location.lat = parseFloat(data.lat);
            $scope.location.lng = parseFloat(data.lon);
            if ($scope.markers && $scope.markers.mainMarker) {
              $scope.markers.mainMarker.lat = parseFloat(data.lat);
              $scope.markers.mainMarker.lng = parseFloat(data.lon);
            }
            $scope.loadingMap = false;
          } else {
            $scope.loadingMap = false;
          }
        });
      }
    };

    //header map
    $scope.$on('mapInitialized', function (evt, evtMap) {
      console.log('map initialized');
      // var map = evtMap;
      // var marker = map.markers[0];
    });

    /*
     * @customer defaults
     * -
     */

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

    /*
     * @twoNetSubscribeFn
     * -
     */

    $scope.twoNetSubscribeFn = function () {
      CustomerService.postTwoNetSubscribe($scope.customer._id, function (data) {
        console.log('data ', data);
      });
    };

    /*
     * @checkAddressLatLng
     * -
     */

    $scope.checkAddressLatLng = function (addresses, fn) {
      // var self = this;

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

    /*
     * @checkAddressLatLng
     * -
     */

    $scope.customerSaveFn = function () {

      $scope.saveLoading = true;
      // if ($scope.customer.details[0].phones) {
      //     $scope.customer.details[0].phones = _.filter($scope.customer.details[0].phones, function(num) {
      //         return num.number !== "";
      //     });
      // }

      $scope.checkAddressLatLng($scope.customer.details[0].addresses, function (addresses) {
        $scope.customer.details[0].addresses = addresses;
        if ($scope.checkContactValidity()) {
          var tempTags = [];
          $scope.customer_data = angular.copy($scope.customer);
          _.each($scope.customer_data.tags, function (tag) {
            tempTags.push(tag.data);
          });
          $scope.customer_data.tags = tempTags;
          CustomerService.saveCustomer($scope.customer_data, function (customer) {
            $scope.customer = customer;
            $scope.setDefaults();
            $scope.setTags();
            $scope.saveLoading = false;
            $scope.refreshMap();
            if ($scope.currentState === 'customerAdd') {
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

    /*
     * @checkContactValidity
     * -
     */

    $scope.checkContactValidity = function () {
      var fullName = $scope.data.fullName;
      var email = _.filter($scope.customer.details[0].emails, function (mail) {
        return mail.email !== "";
      });
      if ((angular.isDefined(fullName) && fullName !== "") || email.length > 0) {
        return true;
      }
    };

    /*
     * @addDeviceFn
     * -
     */

    $scope.addDeviceFn = function () {
      $scope.customer.devices.push({
        _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
        serial: ''
      });
    };

    /*
     * @removeItem
     * -
     */

    $scope.removeItem = function (index, obj) {
      obj.splice(index, 1);
    };

    /*
     * @customerPhoneTypeSaveFn
     * -
     */

    $scope.customerPhoneTypeSaveFn = function (index, type) {
      var typeLabel = null;
      if (type === 'm') {
        typeLabel = 'mobile';
      }
      if (type === 'h') {
        typeLabel = 'home';
      }
      if (type === 'w') {
        typeLabel = 'work';
      }
      $('#customer-phone-type-' + index).html(typeLabel);
      $scope.customer.details[0].phones[index].type = type;
    };

    /*
     * @getModifyAddressFn
     * -
     */

    $scope.getModifyAddressFn = function (index) {
      return $scope.modifyAddress[index];
    };

    /*
     * @setModifyAddressFn
     * -
     */

    $scope.setModifyAddressFn = function (index, state) {
      $scope.modifyAddress[index] = state;
    };

    /*
     * @customerDeleteFn
     * -
     */

    $scope.customerDeleteFn = function () {
      CustomerService.deleteCustomer($scope.customerId, function (customer) {
        toaster.pop('warning', 'Contact Deleted.');
      });
    };

    /*
     * @restoreFn
     * -
     */

    $scope.restoreFn = function () {
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

    /*
     * @savePreferencesFn
     * -
     */

    $scope.savePreferencesFnWait = false;

    $scope.savePreferencesFn = function () {
      if ($scope.savePreferencesFnWait) {
        return;
      }
      $scope.savePreferencesFnWait = true;
      setTimeout(function () {
        UserService.updateUserPreferences($scope.userPreferences, true, function (preferences) {
          console.log('preferences ', preferences);
        });
        $scope.restoreFn();
        $scope.savePreferencesFnWait = false;
      }, 1500);
    };

    /*
     * @watch: fullName
     * -
     */

    $scope.$watch('data.fullName', function (newValue, oldValue) {
      if (newValue !== undefined) {
        var nameSplit = newValue.match(/\S+/g);
        if (nameSplit) {
          if (nameSplit.length >= 3) {
            $scope.customer.first = nameSplit[0];
            $scope.customer.middle = nameSplit[1];
            $scope.customer.last = nameSplit[2];
          } else if (nameSplit.length === 2) {
            $scope.customer.first = nameSplit[0];
            $scope.customer.middle = '';
            $scope.customer.last = nameSplit[1];
          } else if (nameSplit.length === 1) {
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

    /*
     * @insertPhoto
     * -
     */

    $scope.insertPhoto = function (asset) {
      $scope.customer.photo = asset.url;
    };

    /*
     * @removePhoto
     * -
     */

    $scope.removePhoto = function (asset) {
      $scope.customer.photo = null;
    };

    /*
     * @enableSaveBtnFn
     * -
     */

    $scope.enableSaveBtnFn = function () {
      $scope.saveContactDisabled = false;
    };

    /*
     * @contactLabel
     * -
     */

    $scope.contactLabel = function (customer) {
      return CustomerService.contactLabel(customer);
    };

    /*
     * @checkBestEmail
     * -
     */

    $scope.checkBestEmail = function (contact) {
      var returnVal = CustomerService.checkBestEmail(contact);
      this.email = contact.email;
      return returnVal;
    };

    /*
     * @checkFacebookId
     * -
     */

    $scope.checkFacebookId = function (contact) {
      var returnVal = CustomerService.checkFacebookId(contact);
      this.facebookId = contact.facebookId;
      return returnVal;
    };

    /*
     * @checkTwitterId
     * -
     */

    $scope.checkTwitterId = function (contact) {
      var returnVal = CustomerService.checkTwitterId(contact);
      this.twitterId = contact.twitterId;
      return returnVal;
    };

    /*
     * @checkLinkedInId
     * -
     */

    $scope.checkLinkedInId = function (contact) {
      var returnVal = CustomerService.checkLinkedInId(contact);
      this.linkedInUrl = contact.linkedInUrl;
      this.linkedInId = contact.linkedInId;
      return returnVal;
    };

    /*
     * @checkAddress
     * -
     */

    $scope.checkAddress = function (contact) {
      var returnVal = CustomerService.checkAddress(contact);
      this.address = contact.address;
      return returnVal;
    };

    /*
     * @customerAddEmailFn
     * -
     */

    // Add/Remove email adresses
    $scope.customerAddEmailFn = function () {
      $scope.customer.details[0].emails.push({
        _id: CommonService.generateUniqueAlphaNumericShort(),
        email: ''
      });
    };

    /*
     * @removeEmail
     * -
     */

    $scope.removeEmail = function (index) {
      $scope.customer.details[0].emails.splice(index, 1);
    };

    /*
     * @showAddEmail
     * -
     */

    $scope.showAddEmail = function (email) {
      return email._id === $scope.customer.details[0].emails[0]._id;
    };

    /*
     * @addCustomerContactFn
     * - Add/Remove phone numbers
     */

    $scope.addCustomerContactFn = function () {
      $scope.customer.details[0].phones.push({
        _id: CommonService.generateUniqueAlphaNumericShort(),
        number: ''
      });
    };

    /*
     * @removePhone
     * -
     */

    $scope.removePhone = function (index) {
      $scope.customer.details[0].phones.splice(index, 1);
    };

    /*
     * @showAddPhone
     * -
     */

    $scope.showAddPhone = function (phone) {
      return phone._id === $scope.customer.details[0].phones[0]._id;
    };

    /*
     * @removeAddress
     * - Add/Remove phone numbers
     */

    $scope.removeAddress = function (index) {
      $scope.customer.details[0].addresses.splice(index, 1);
    };

    /*
     * @showAddAddress
     * -
     */

    $scope.showAddAddress = function (address) {
      return address._id === $scope.customer.details[0].addresses[0]._id;
    };

    /*
     * @customerAddAddressFn
     * -
     */

    $scope.customerAddAddressFn = function () {
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

    /*
     * @setDefaults
     * -
     */

    $scope.setDefaults = function () {
      // New customer
      if ($scope.customer.details.length === 0) {
        $scope.customer.details[0] = {};
      }
      if (!$scope.customer.details[0].emails) {
        $scope.customer.details[0].emails = [];
      }
      if (!$scope.customer.details[0].phones) {
        $scope.customer.details[0].phones = [];
      }
      if (!$scope.customer.details[0].addresses) {
        $scope.customer.details[0].addresses = [];
      }

      if ($scope.customer.details.length) {
        if (!$scope.customer.details[0].emails.length) {
          $scope.customerAddEmailFn();
        }
        if (!$scope.customer.details[0].phones.length) {
          $scope.addCustomerContactFn();
        }
        if (!$scope.customer.details[0].addresses.length) {
          $scope.customerAddAddressFn();
        }
      }
    };

    /*
     * @customerTags
     * -
     */

    if (!$scope.customer.tags) {
      $scope.customer.tags = {};
    }
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

    /*
     * @setTags
     * -
     */

    $scope.setTags = function () {
      var tempTags = [];
      _.each($scope.customer.tags, function (tag) {
        var matchingTag = _.findWhere($scope.customerTags, {
          data: tag
        });
        tempTags.push(matchingTag);
      });
      $scope.customer.tags = tempTags;
    };

    /*
     * @displayCustomerTags
     * -
     */

    $scope.displayCustomerTags = function () {
      var tags = "";
      if ($scope.customer.tags && $scope.customer.tags.length) {
        $scope.customer.tags.forEach(function (value, index) {
          if (index === 0) {
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

    /*
     * @getOrders
     * - get all the orders for this customer and create line_items_total
     *   and add decimal point to total then create scope
     */

    OrderService.getCustomerOrders($stateParams.contactId, function (orders) {
      if (orders) {
        _.each(orders, function (order) {
          if (order.line_items) {
            order.line_items_total = order.line_items.length;
          } else {
            order.line_items_total = 0;
          }

          order.total = order.total;
        });
        $scope.orders = orders;
      }
    });

    /*
     * @deleteCustomerFn
     * -
     */

    $scope.deleteCustomerFn = function (customer) {
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Do you want to delete this customer?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, do not delete it!",
        closeOnConfirm: true,
        closeOnCancel: true
      }, function (isConfirm) {
        if (isConfirm) {
          CustomerService.deleteCustomer(customer._id, function () {
            toaster.pop('warning', 'Customer Deleted.');
            $state.go('app.customers');
          });
        }
      });
    };

  }]);
}(angular));
