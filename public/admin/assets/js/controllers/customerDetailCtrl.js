'use strict';
/*global app, moment, angular, $$*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('CustomerDetailCtrl', ["$scope", "$rootScope", "$location", "$modal", "toaster", "$stateParams", "contactConstant", "CustomerService", "KeenService", "CommonService", "UserService", 'SweetAlert', '$state', 'OrderService', 'formValidations', 'orderConstant', function ($scope, $rootScope, $location, $modal, toaster, $stateParams, contactConstant, CustomerService, KeenService, CommonService, UserService, SweetAlert, $state, OrderService, formValidations, orderConstant) {

    /*
     * @openModal
     * -
     */

    $scope.openModal = function (modal) {
      $scope.modalInstance = $modal.open({
        templateUrl: modal,
        keyboard: false,
        backdrop: 'static',
        scope: $scope
      });
    };

    /*
     * @openMediaModal
     * -
     */

    $scope.openMediaModal = function () {
      $scope.showInsert = true;
      $scope.modalInstance = $modal.open({
        templateUrl: 'media-modal',
        controller: 'MediaModalCtrl',
        keyboard: false,
        backdrop: 'static',
        size: 'lg',
        resolve: {
          showInsert: function () {
            return $scope.showInsert;
          },
          insertMedia: function () {
            return $scope.insertPhoto;
          }
        }
      });
    };

    /*
     * @closeModal
     * -
     */

    $scope.closeModal = function () {
      $scope.modalInstance.close();
    };

    $scope.formValidations = formValidations;
    $scope.orderConstant = orderConstant;

    $scope.ip_geo_address = '';
    $scope.location = {};
    $scope.loadingMap = true;

    $scope.data = {
      fullName: ''
    };

    if ($location.search().order) {
      $scope.redirectToOrder = true;   
      $scope.orderId=$location.search().id;
      $stateParams.orderId=$scope.orderId;
      //alert("orderId: "+$scope.orderId);   
    }

    $scope.backToOrder = function()
    {
      if($stateParams.orderId)
      {
        window.location = '/admin/#/commerce/orders/' + $stateParams.orderId;
      }
      else
      {
        window.history.back();
      }
      
    };
    /*
     * @addNote
     * add a note to an order
     */

    $scope.newNote = {};

    $scope.addNote = function (_note) {
      var date = moment();
      var _noteToPush = {
        note: _note,
        user_id: $scope.currentUser._id,
        date: date.toISOString()
      };
      if (!$scope.customer.notes)
        $scope.customer.notes = [];
      $scope.customer.notes.push(_noteToPush);
      $scope.matchUsers($scope.customer);

      $scope.newNote.text = '';

      $scope.customer_data = $scope.customer_data || {};
      $scope.customer_data.tags = $scope.unsetTags();
      console.log('customer_data:', $scope.customer_data);
      CustomerService.saveCustomer($scope.customer_data, function (customer) {
        $scope.customer = customer;        
        $scope.setTags();
        $scope.originalCustomer = angular.copy($scope.customer);
        toaster.pop('success', 'Notes Added.');
      });
    };

    /*
     * @getUsers
     * get all users for this account
     */

    UserService.getUsers(function (users) {
      $scope.users = users;
      $scope.getCustomer();
    });

    /*
     * @matchUsers
     * match users to the order notes
     */
    $scope.matchUsers = function (customer) {
      var notes = customer.notes;
      if (notes && notes.length > 0) {

        _.each(notes, function (_note) {
          var matchingUser = _.find($scope.users, function (_user) {
            return _user._id === _note.user_id;
          });
          /*
          * I'm not sure why we are doing this.  removing for now.
          if (matchingUser) {
            _note.user = matchingUser;
          }
          */
        });

        return notes;
      }
    };

    /*
     * @pushLocalNote
     * push a recently created note to the ui
     */

    $scope.pushLocalNote = function (customer) {
      customer.notes = $scope.matchUsers(customer);
      var noteToPush = customer.notes[customer.notes.length - 1];
      $scope.customer.notes.push(noteToPush);
    };

    /*
     * @getCustomer
     * -
     */

    $scope.getCustomer = function () {
      console.log('getCustomer >>>');
      CustomerService.getCustomer($stateParams.contactId, function (customer) {
        customer.notes = $scope.matchUsers(customer);
        $scope.customer = customer;
        $scope.setTags();
        $scope.setDefaults();
        $scope.data.fullName = [$scope.customer.first, $scope.customer.middle, $scope.customer.last].join(' ').trim();
        $scope.getMapData();
        // $scope.contactLabel = CustomerService.contactLabel(customer);
        // $scope.checkBestEmail = CustomerService.checkBestEmail(customer);
      });
    };

    $scope.resizeMap = function () {
      $scope.loadingMap = true;
      setTimeout(function () {
        $scope.loadingMap = false;
      }, 500);
    };

    /*
     * @displayAddressFormat
     * -
     */

    $scope.displayAddressFormat = function (address) {
      return _.filter([address.address, address.address2, address.city, address.state, address.zip], function (str) {
        return str !== "";
      }).join(",");
    };

    /*
     * @refreshMap
     * -
     */

    $scope.refreshMap = function (fn) {
      if ($scope.customer.details.length !== 0 && $scope.customer.details[0].addresses && $scope.customer.details[0].addresses.length !== 0) {
        var formattedAddress = angular.copy($scope.customer.details[0].addresses[0]);
        formattedAddress.address2 = '';
        $scope.ip_geo_address = $scope.displayAddressFormat(formattedAddress);
        $scope.city = $scope.customer.details[0].addresses[0].city;
        $scope.loadingMap = false;
      }
      var validMapData = false;
      if ($scope.ip_geo_address) {
        CustomerService.getGeoSearchAddress($scope.ip_geo_address, function (data) {
          if (data.error === undefined) {
            $scope.location.lat = parseFloat(data.lat);
            $scope.location.lon = parseFloat(data.lon);
            $scope.customer_data.details[0].addresses[0].lat = $scope.location.lat;
            $scope.customer_data.details[0].addresses[0].lon = $scope.location.lon;
            if ($scope.markers && $scope.markers.mainMarker) {
              $scope.markers.mainMarker.lat = parseFloat(data.lat);
              $scope.markers.mainMarker.lon = parseFloat(data.lon);
            }
            $scope.loadingMap = false;
            validMapData = true;
          } else {
            $scope.loadingMap = false;
          }

          if (fn) {
            fn(validMapData);
          }
        });
      } else {
        if (fn) {
          fn(true);
        }
      }
    };

    $scope.getMapData = function () {
      var _firstAddress;

      if ($scope.customer.details[0].addresses.length > -1) {
        _firstAddress = $scope.customer.details[0].addresses[0];
      }

      //customer has no address
      if (!_firstAddress) {
        $scope.loadingMap = false;
        $scope.originalCustomer = angular.copy($scope.customer);
      } else {
        //customer has address and lat/lon
        if (_firstAddress.lat && _firstAddress.lon) {
          $scope.originalCustomer = angular.copy($scope.customer);
          $scope.showMap(_firstAddress.lat, _firstAddress.lon);
        } else {
          //customer has address but no lat/lon
          //if customer has a session id get data from keen
          if ($scope.customer.sessionId !== undefined) {
            var keenParams = {
              event_collection: 'session_data',
              filters: [{
                "property_name": "sessionId",
                "operator": "eq",
                "property_value": $scope.customer.sessionId
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
                    $scope.location.lon = parseFloat(data.lon);
                    $scope.loadingMap = false;
                    $scope.showMap(data.lat, data.lon);
                  } else {
                    $scope.loadingMap = false;
                  }
                  $scope.originalCustomer = angular.copy($scope.customer);
                });
              } else {
                $scope.loadingMap = false;
                $scope.originalCustomer = angular.copy($scope.customer);
              }
            });
          } else {
            //get lat/lon from address
            _firstAddress.address2 = '';
            $scope.convertAddressToLatLon(_firstAddress, function (data) {
              if (data) {
                //save updated lat/lon
                _firstAddress.lat = parseFloat(data.lat);
                _firstAddress.lon = parseFloat(data.lon);
                $scope.customerSaveFn(true);

                $scope.showMap(data.lat, data.lon);
              }
              $scope.originalCustomer = angular.copy($scope.customer);
              $scope.loadingMap = false;
            });
            $scope.originalCustomer = angular.copy($scope.customer);
          }

        }
      }
    };

    $scope.convertAddressToLatLon = function (_address, fn) {
      CustomerService.getGeoSearchAddress($scope.displayAddressFormat(_address), function (data) {
        if (data.error === undefined) {
          fn(data);
        } else {
          console.warn(data.error);
          fn();
        }
      });
    };

    $scope.showMap = function (_lat, _lon) {
      $scope.loadingMap = false;
      $scope.location.lat = parseFloat(_lat);
      $scope.location.lon = parseFloat(_lon);
      if ($scope.markers && $scope.markers.mainMarker) {
        $scope.markers.mainMarker.lat = parseFloat(_lat);
        $scope.markers.mainMarker.lon = parseFloat(_lon);
      }
    };

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
          extension: '',
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

    $scope.inValidateTags = function()
    {
      var status = false;
      if(!$scope.customer_data.tags)
        status = true;
      else if(!$scope.customer_data.tags.length)
        status = true;
      return status;
    }

    $scope.customerSaveFn = function (hideToaster, showAlert, newUrl) {

      $scope.saveLoading = true;

      if ($scope.checkContactValidity()) {

        $scope.unsetTags();

        if(!hideToaster && $scope.inValidateTags())
        {
          $scope.saveLoading = false;          
          if(showAlert)            
            SweetAlert.swal("Warning", "Your edits were NOT saved.", "error");
          toaster.pop('warning', 'Please add at least one tag.');
          return;
        }

        // if ($scope.customer_data.details[0].addresses.length > -1) {
        //   _.each($scope.customer_data.details[0].addresses, function(_address) {
        //     $scope.convertAddressToLatLon(_address, function (data) {
        //       _address.lat = parseFloat(data.lat);
        //       _address.lon = parseFloat(data.lon);
        //     });
        //   });
        // }
        $scope.refreshMap(function (validMapData) {
          if (!validMapData) {
            if (!hideToaster) {
              $scope.errorMapData = true;
              // $scope.saveLoading = false;
              toaster.pop('warning', 'Address could not be found.');
            }
          }

          $scope.errorMapData = false;
          CustomerService.checkDuplicateEmail($scope.customer_data.details[0].emails[0].email, !hideToaster, function (data) {
            if(data && data.length && (data.length > 1 || data[0]._id != $scope.customer_data._id))
            {
              console.log("duplicate email");
              if(!hideToaster)
              {
                $scope.saveLoading = false;
                toaster.pop('warning', 'Email already exists.');
                if(showAlert)                    
                    SweetAlert.swal("Warning", "Your edits were NOT saved.", "error");
              }
            }
            else
            {
              CustomerService.saveCustomer($scope.customer_data, function (customer) {
              $scope.customer = customer;
              $scope.setDefaults();
              $scope.setTags();
              $scope.saveLoading = false;
              $scope.originalCustomer = angular.copy($scope.customer);
              if (!hideToaster) {
                if ($scope.currentState === 'customerAdd') {
                  toaster.pop('success', 'Contact Created.');
                } else {
                  toaster.pop('success', 'Contact Saved.');
                }
              }
              if(showAlert){
                SweetAlert.swal("Saved!", "Your edits were saved to the page.", "success");                
                window.location = newUrl;
              }
            });
            }
          })
        });
      } else {
        $scope.saveLoading = false;
        if (!hideToaster) {
          toaster.pop('warning', 'Contact Name OR Email is required');
        }
        if(showAlert)
          SweetAlert.swal("warning", "Your edits were NOT saved.", "error");
      }

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

    $scope.setFullName = function () {
      var newValue = $scope.data.fullName;
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
    };

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
        number: '',
        extension: ''
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
     * 18-Sep Unioned set of tags in system with those needed by Indigenous
     *
     * Retained (part of Ind. flow)
     *   - Lead (ld)
     *   - Customer (cu)
     *
     * New:
     *   - Cheatsheet Lead (cs)
     *   - Trial Customer (tc)
     *   - Expired Trial Customer (ex)
     *   - Cancelled Trial Customer (ct)
     *   - Cancelled Customer (cc)
     *
     * - Old. Keeping for our clients:
     *   - Colleague (co)
     *   - Friend (fr)
     *   - Member (mb)
     *   - Family (fa)
     *   - Admin (ad)
     *   - Other (ot)
     */

    if (!$scope.customer.tags) {
      $scope.customer.tags = {};
    };

    CustomerService.getCustomerTags(function(tags){
      $scope.customerTags = tags;
    });

    /*
     * @setTags
     * -
     */

    $scope.setTags = function () {
      console.log('setTags >>>');
      var tempTags = [];
      var cutomerTags = [];
      _.each($scope.customer.tags, function (tag , index) {
        var matchingTag = _.findWhere($scope.customerTags, {
          data: tag
        });
        if(matchingTag)
        {
          cutomerTags.push(matchingTag.label);
          tempTags.push(matchingTag);
        }        
      });
      $scope.myCustomerTags = cutomerTags.join(",");
      $scope.customer.tags = tempTags;
      console.log('$scope.customer.tags >>>', $scope.customer.tags);
    };

    $scope.unsetTags = function() {
      var tempTags = [];
        $scope.customer_data = angular.copy($scope.customer);
        _.each($scope.customer_data.tags, function (tag) {
          tempTags.push(tag.data);
        });
        if (tempTags) {
          $scope.customer_data.tags = tempTags;
        }
    };

    /*
     * @getOrders
     * - get all the orders for this customer and create line_items_total
     *   and add decimal point to total then create scope
     */
    console.log('$stateParams.contactId ', $stateParams.contactId);
    OrderService.getCustomerOrders($stateParams.contactId, function (orders) {
      console.log('orders ', orders);
      if (orders.length > 0) {
        _.each(orders, function (order) {
          if (order.line_items) {
            order.line_items_total = order.line_items.length;
          } else {
            order.line_items_total = 0;
          }
        });
        $scope.orders = orders;
      }
    });

    /*
     * @updateFullName
     * -
     */

    $scope.updateFullName = function () {
      $scope.data.fullName = [$scope.customer.first, $scope.customer.middle, $scope.customer.last].join(' ').trim();
    };

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
            $scope.originalCustomer = angular.copy($scope.customer);
            $state.go('app.customers');
          });
        }
      });
    };


    $scope.$back = function() {
        window.history.back();
    };

    $scope.formatOrderStatus = function (status) {
      return OrderService.formatOrderStatus(status);
    };


    $scope.checkIfDirty = function(){
      var isDirty = false;
      if($scope.newNote && $scope.newNote.text)
        isDirty = true;
      if($scope.originalCustomer && !angular.equals($scope.originalCustomer, $scope.customer))
        isDirty = true;
      return isDirty;
    }
    $scope.resetDirty = function(){
      $scope.originalCustomer = null;
      $scope.customer = null;
    }

  }]);
}(angular));
