define(['app', 'customerService', 'stateNavDirective', 'truncateDirective', 'ngProgress', 'headroom', 'ngHeadroom', 'toasterService', 'iStartsWithFilter', 'ngInfiniteScroll', 'scrollerDirective', 'userService'], function(app) {
  app.register.controller('CustomerCtrl', ['$scope', 'CustomerService', 'ngProgress', 'ToasterService', '$window', '$filter', 'UserService', function($scope, CustomerService, ngProgress, ToasterService, $window, $filter, UserService) {
    ngProgress.start();
    $scope.customerFilter = {};
    $scope.customerOrder = 'first';
    $scope.customerSortReverse = false;

    $scope.customerScrollBusy = false;
    $scope.customerScrollLimit = 20;
    $scope.customerScrollOffset = 0;
    $scope.renderedCustomers = [];
    //$scope.gridViewDisplay = "true";

    $scope.customerScrollFn = function() {
      if ($scope.fetchedCustomers) {
        $scope.customerScrollBusy = true;
        var pushCustomers = $scope.fetchedCustomers.slice($scope.customerScrollOffset, $scope.customerScrollLimit + $scope.customerScrollOffset);
        for (var i = 0; i < pushCustomers.length; i++) {
          $scope.renderedCustomers.push(pushCustomers[i]);
        }
        $scope.customerScrollOffset += $scope.customerScrollLimit;
        $scope.customerScrollBusy = false;
      }
    };

    $scope.contactLabel = function(contact) {
      return CustomerService.contactLabel(contact);
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

    $scope.orderByFn = function() {
      $scope.fetchedCustomers = $filter('orderBy')($scope.fetchedCustomers, $scope.customerOrder, $scope.customerSortReverse);
      $scope.renderedCustomers = $filter('orderBy')($scope.renderedCustomers, $scope.customerOrder, $scope.customerSortReverse);
    };

    $scope.alphaList = [];

    $scope.alphaFilterStatus = {};

    $scope.alphaFilterStatusFn = function() {
      var a = 97;
      $scope.alphaList = [];
      for (var i = 0; i < 26; i++) {
        $scope.alphaList.push(String.fromCharCode(a + i));
        $scope.alphaFilterStatus[String.fromCharCode(a + i)] = false;
      }

      $scope.fetchedCustomers.forEach(function(value, index) {
        var field = null;
        if ($scope.customerOrder === 'created.date') {
          field = 'first';
        } else {
          field = $scope.customerOrder;
        }

        if (value && (field in value) && value[field] && (value[field].substring(0, 1).toLowerCase() in $scope.alphaFilterStatus)) {
          $scope.alphaFilterStatus[value[field].substring(0, 1).toLowerCase()] = true;
        }
      });
    };

    $scope.$watch('customerOrder', function(newValue, oldValue) {
      $scope.orderByFn();
      if ($scope.fetchedCustomers !== undefined) {
        $scope.alphaFilterStatusFn();
      }
    });

    $scope.$watch('customerSortReverse', function(newValue, oldValue) {
      $scope.orderByFn();
    });

    var fetchFields = ['_id', 'first', 'middle', 'last', 'starred', 'photo', 'type', 'details'];
    CustomerService.getCustomersShortForm(fetchFields, function(customers) {
      console.log('customers >>> ', customers);
      $scope.fetchedCustomers = customers;
      $scope.orderByFn();
      $scope.customerScrollFn();
      $scope.alphaFilterStatusFn();
      ngProgress.complete();
      ToasterService.processPending();
      $scope.$watch('searchBar', function(newValue, oldValue) {
        if (newValue) {
          var searchBarSplit = newValue.split(' ');
          if (searchBarSplit.length >= 3) {
            $scope.customerFilter.first = searchBarSplit[0];
            $scope.customerFilter.middle = searchBarSplit[1];
            $scope.customerFilter.last = searchBarSplit[2];
          } else if (searchBarSplit.length == 2) {
            $scope.customerFilter.first = searchBarSplit[0];
            $scope.customerFilter.last = searchBarSplit[1];
          } else if (searchBarSplit.length == 1) {
            $scope.customerFilter.first = searchBarSplit[0];
          }
        } else {
          $scope.customerFilter = {};
        }
      });

      $scope.alphaFilter = function(alpha) {
        if (alpha) {
          $scope.customerFilter.first = alpha;
          $(".contentpanel").scrollTop(0);
        } else {
          $scope.customerFilter = {};
        }
      };


      $scope.$watch('changeDisplayFormat', function(newValue, oldValue) {

        if (newValue) {
          newValue = parseInt(newValue);
          if (newValue == 1) {
            $scope.userPreferences.customerSettings.customerDisplayFormat = 'first';
          } else if (newValue == 2) {
            $scope.userPreferences.customerSettings.customerDisplayFormat = 'last';
          }
          // Save user preferences
          $scope.savePreferencesFn();
        }
      });




      $scope.$watch('sortOrder', function(newValue, oldValue) {
        newValue = parseInt(newValue);
        if (newValue === 0) {
          $scope.customerOrder = 'first';
          $scope.customerSortReverse = false;
        } else if (newValue == 1) {
          $scope.customerOrder = 'first';
          $scope.customerSortReverse = false;
        } else if (newValue == 2) {
          $scope.customerOrder = 'first';
          $scope.customerSortReverse = true;
        } else if (newValue == 3) {
          $scope.customerOrder = 'created.date';
          $scope.customerSortReverse = false;
        } else if (newValue == 4) {
          $scope.customerOrder = 'last';
          $scope.customerSortReverse = false;
        } else if (newValue == 5) {
          $scope.customerOrder = 'lastActivity';
          $scope.customerSortReverse = true;
        }
        // Save user preferences
        if (newValue && $scope.userPreferences && $scope.userPreferences.customerSettings) {
          $scope.userPreferences.customerSettings.customerOrder = $scope.customerOrder;
          $scope.userPreferences.customerSettings.customerSortReverse = $scope.customerSortReverse;
          $scope.savePreferencesFn();
        }

      });




      $scope.importFacebookFriends = function() {
        CustomerService.importFacebookFriends(function(data, success) {
          if (success) {
            $('#import-contacts-modal').modal('hide');
            ToasterService.show('success', "Contacts being imported.");
          } else
            $window.location.href = "/inapplogin/facebook?redirectTo=" + encodeURIComponent('/admin#/customer');
        });
      };

      $scope.importLinkedInConnections = function() {
        CustomerService.importLinkedInConnections(function(data, success) {
          if (success) {
            $('#import-contacts-modal').modal('hide');
            ToasterService.show('success', "Contacts being imported.");
          } else
            $window.location.href = "/inapplogin/linkedin?redirectTo=" + encodeURIComponent('/admin#/customer');
        });
      };

      $scope.importGmailContacts = function() {
        CustomerService.importGmailContacts(function(data, success) {
          if (success) {
            $('#import-contacts-modal').modal('hide');
            ToasterService.show('success', "Contacts being imported.");
          } else
            $window.location.href = "/inapplogin/google?redirectTo=" + encodeURIComponent('/admin#/customer');
        });
      };


      $scope.$watch('toggleCategory', function(value) {
        if (angular.isDefined(value))
          $scope.showContactLabel = value;
        else
          $scope.showContactLabel = true;
      });
      $scope.$watch('toggleEmail', function(value) {
        if (angular.isDefined(value))
          $scope.showEmail = value;
        else
          $scope.showEmail = true;
      });
      $scope.$watch('toggleFacebook', function(value) {
        if (angular.isDefined(value))
          $scope.showFacebookId = value;
        else
          $scope.showFacebookId = true;
      });
      $scope.$watch('toggleTwitter', function(value) {
        if (angular.isDefined(value))
          $scope.showTwitterId = value;
        else
          $scope.showTwitterId = true;
      });
      $scope.$watch('toggleLinkedInId', function(value) {
        if (angular.isDefined(value))
          $scope.showLinkedInId = value;
        else
          $scope.showLinkedInId = true;
      });
      $scope.$watch('toggleAddress', function(value) {
        if (angular.isDefined(value))
          $scope.showAddress = value;
        else
          $scope.showAddress = true;
      });
      $scope.setDefaultView = function(value) {
        //$scope.gridViewDisplay = value;
        // Save user preferences
        $scope.userPreferences.customerSettings.gridViewDisplay = value;
        $scope.savePreferencesFn();
      }
      $scope.setImportantContact = function(customer) {
        customer.starred = true;
        CustomerService.saveCustomer(customer, function(customers) {
          ToasterService.show('success', "Contact updated succesfully.");
        })
      }

      UserService.getUserPreferences(function(preferences) {
        $scope.userPreferences = preferences;
        var customerSettings = $scope.userPreferences.customerSettings;
        if (customerSettings) {
          $scope.userPreferences.customerSettings = customerSettings;
          $scope.customerOrder = $scope.userPreferences.customerSettings.customerOrder;
          $scope.customerSortReverse = $scope.userPreferences.customerSettings.customerSortReverse;
        } else {
          $scope.userPreferences.customerSettings = {
            customerOrder: 'first',
            customerSortReverse: false,
            customerDisplayFormat: 'first',
            gridViewDisplay: "true"
          }
        }

      });
      $scope.savePreferencesFn = function() {
        UserService.updateUserPreferences($scope.userPreferences, function() {})
      };

    });
  }]);
});