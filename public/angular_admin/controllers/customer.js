define(['app', 'customerService', 'stateNavDirective', 'truncateDirective', 'ngProgress', 'headroom', 'ngHeadroom', 'toasterService', 'iStartsWithFilter', 'ngInfiniteScroll', 'scrollerDirective', 'userService', 'moment', 'timeAgoFilter'], function(app) {
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

    $scope.saveScrollFn = function(pos) {
      $scope.userPreferences.customerSettings.scrollPos = pos;
      $scope.savePreferencesDelayedFn(false, 1500);
    };

    $scope.customerScrollFn = function() {
      if ($scope.fetchedCustomers) {
        $scope.customerScrollBusy = true;
        var pushCustomers = $scope.fetchedCustomers.slice($scope.customerScrollOffset, $scope.customerScrollLimit + $scope.customerScrollOffset);
        for (var i = 0; i < pushCustomers.length; i++) {
          $scope.renderedCustomers.push(pushCustomers[i]);
        }
        $scope.customerScrollOffset += $scope.customerScrollLimit;
        $scope.customerScrollBusy = false;
        $scope.alphaFilterStatusFn();
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
      // $scope.customerScrollOffset = 0;
      // $scope.customerScrollFn();
    };

    $scope.sortCustomers = function(a, b) {
      if (a > b) return +1;
      if (a < b) return -1;
      return 0;
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
      if ($scope.originalCustomers) {
        $scope.originalCustomers.forEach(function(value, index) {
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
      }
    };

    $scope.$watch('customerOrder', function(newValue, oldValue) {
      if ($scope.alphaFilter) {
        $scope.alphaFilter($scope.alphaSelected);
      }
    });

    $scope.$watch('customerSortReverse', function(newValue, oldValue) {
      if ($scope.alphaFilter) {
        $scope.alphaFilter($scope.alphaSelected);
      }
    });

    var fetchFields = ['_id', 'first', 'middle', 'last', 'starred', 'photo', 'type', 'details', 'address', 'created'];
    CustomerService.getCustomersShortForm(fetchFields, function(customers) {
      $scope.originalCustomers = customers;
      $scope.fetchedCustomers = customers;
      $scope.orderByFn();
      $scope.customerScrollFn();
      ngProgress.complete();
      ToasterService.processPending();
      var initializeSearchBar = 0;
      $scope.$watch('searchBar', function(newValue, oldValue) {
        if (initializeSearchBar >= 1) {
          console.log('searching ', newValue);
          if (newValue) {
            var searchBarSplit = newValue.split(' ');
            if (searchBarSplit.length >= 1) {
              $scope.customerFilter.first = searchBarSplit[0];
              $scope.customerFilter.middle = searchBarSplit[1];
              $scope.customerFilter.last = searchBarSplit[2];
            } else if (searchBarSplit.length == 2) {
              $scope.customerFilter.first = searchBarSplit[0];
              $scope.customerFilter.last = searchBarSplit[1];
            } else if (searchBarSplit.length == 1) {
              $scope.customerFilter.first = searchBarSplit[0];
            }

            console.log('$scope.customerOrder >>> ', $scope.customerOrder);
            if ($scope.customerFilter) {
              if ($scope.customerOrder === 'first') {
                $scope.fetchedCustomers = $scope.originalCustomers.filter(function(elem) {
                  if (elem.first) {
                    return elem.first.toLowerCase().indexOf($scope.customerFilter.first.toLowerCase()) != -1;
                  }
                });
              } else {
                $scope.fetchedCustomers = $scope.originalCustomers.filter(function(elem) {
                  if (elem.last) {
                    return elem.last.toLowerCase().indexOf($scope.customerFilter.last.toLowerCase()) != -1;
                  }
                });
              }
              console.log('$scope.fetchedCustomers >>> ', $scope.fetchedCustomers);
            } else {
              console.log('no filter');
            }
            $scope.renderedCustomers = [];
            $scope.orderByFn();
            $scope.customerScrollOffset = 0;
            $scope.customerScrollFn();

          } else {
            $scope.customerFilter = {};
          }
        }
        initializeSearchBar += 1;

      });

      $scope.alphaSelected = null;
      $scope.alphaSelectedCharCode = null;

      $scope.alphaFilter = function(alpha) {
        $scope.alphaSelected = alpha;
        var orginal = $scope.originalCustomers;
        $scope.renderedCustomers = [];
        $scope.fetchedCustomers = [];
        if (alpha) {
          $scope.alphaSelectedCharCode = alpha.charCodeAt(0);
          $scope.fetchedCustomers = orginal.filter(function(elem) {
            if (elem.first) {
              return elem.first.charAt(0).toLowerCase() == alpha;
            }
          });
          $(".contentpanel").scrollTop(0);
          $scope.customerFilter.first = alpha;
        } else {
          $scope.alphaSelectedCharCode = null;
          $scope.fetchedCustomers = orginal;
          $scope.customerFilter = {};
        }
        $scope.orderByFn();
        $scope.customerScrollOffset = 0;
        $scope.customerScrollFn();
      };

      $scope.$watch('alphaSelectedCharCode', function(newValue, oldValue) {
        if (newValue) {
          $('.search-contacts').unbind('keypress');
          $('.search-contacts').keypress(function(e) {
            if (($(this).val().length===0) && (e.charCode != $scope.alphaSelectedCharCode)) {
              e.preventDefault();
              return false;
            }
          });
        } else {
          $('.search-contacts').unbind('keypress');
        }
      });

      var initializeDisplaySort = 0;

      $scope.$watch('changeDisplayFormat', function(newValue, oldValue) {
        //must check initializeDisplaySort twice - once for the init model and once to set the model
        if (newValue && initializeDisplaySort >= 2) {
          newValue = parseInt(newValue);
          if (newValue == 1) {
            $scope.userPreferences.customerSettings.customerDisplayFormat = 'first';
          } else if (newValue == 2) {
            $scope.userPreferences.customerSettings.customerDisplayFormat = 'last';
          }
          // Save user preferences
          $scope.savePreferencesFn();
        }

        initializeDisplaySort += 1;
      });




      $scope.$watch('sortOrder', function(newValue, oldValue) {
        newValue = parseInt(newValue);
        if (newValue === '') {
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

      });

      var initializeSortOrder = 0;

      $scope.$watch('sortOrderSettings', function(newValue, oldValue) {
        if (initializeSortOrder >= 2) {
          newValue = parseInt(newValue);
          $scope.sortOrder = newValue;
          if (newValue === '') {
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

          if (newValue && $scope.userPreferences && $scope.userPreferences.customerSettings) {
            $scope.userPreferences.customerSettings.customerOrder = $scope.customerOrder;
            $scope.userPreferences.customerSettings.customerSortReverse = $scope.customerSortReverse;
            $scope.savePreferencesFn();
          }
        }
        initializeSortOrder += 1;

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
      $scope.$watch('toggleSocial', function(value) {
        if (angular.isDefined(value))
          $scope.showSocial = value;
        else
          $scope.showSocial = true;
      });
      $scope.$watch('toggleAddress', function(value) {
        if (angular.isDefined(value))
          $scope.showAddress = value;
        else
          $scope.showAddress = true;
      });
      $scope.$watch('toggleCustomerSince', function(value) {
        if (angular.isDefined(value))
          $scope.showCustomerSince = value;
        else
          $scope.showCustomerSince = true;
      });
      $scope.setDefaultView = function(value) {
        $scope.gridViewDisplay = value;
        // Save user preferences
        $scope.userPreferences.customerSettings.gridViewDisplay = value;
        $scope.savePreferencesFn();
      };

      $scope.setImportantContact = function(customer) {
        customer.starred = true;
        CustomerService.saveCustomer(customer, function(customers) {
          ToasterService.show('success', "Contact updated succesfully.");
        });
      };

      UserService.getUserPreferences(function(preferences) {
        $scope.userPreferences = preferences;
        var customerSettings = $scope.userPreferences.customerSettings;
        if ($scope.userPreferences.customerSettings.scrollPos) {
          setTimeout(function() {
            console.info('restore scroll');
            $(".contentpanel").scrollTop($scope.userPreferences.customerSettings.scrollPos);
          }, 1000);
        }
        if (customerSettings) {
          $scope.userPreferences.customerSettings = customerSettings;
          $scope.customerOrder = $scope.userPreferences.customerSettings.customerOrder;
          $scope.customerSortReverse = $scope.userPreferences.customerSettings.customerSortReverse;
          var displayFormat = $scope.userPreferences.customerSettings.customerDisplayFormat;
          if (displayFormat === 'first') {
            console.log('first');
            $scope.changeDisplayFormat = 1;
          }
          if (displayFormat === 'last') {
            console.log('last');
            $scope.changeDisplayFormat = 2;
          }
          var customerOrder = $scope.customerOrder;
          var orderNum;
          if (customerOrder === 'first') {
            orderNum = 1;
          }
          if (customerOrder === 'last') {
            orderNum = 2;
          }
          if (customerOrder === 'created.date') {
            orderNum = 3;
          }
          $scope.sortOrder = orderNum;
          $scope.sortOrderSettings = orderNum;
          console.log('$scope.userPreferences.customerSettings.gridViewDisplay >>> ', $scope.userPreferences.customerSettings.gridViewDisplay);
          $scope.gridViewDisplay = $scope.userPreferences.customerSettings.gridViewDisplay;
        } else {
          $scope.userPreferences.customerSettings = {
            customerOrder: 'first',
            customerSortReverse: false,
            customerDisplayFormat: 'first',
            gridViewDisplay: "true"
          };
        }

      });

      $scope.savePreferencesFnWait = false;

      $scope.savePreferencesDelayedFn = function(toaster, ms) {
        if ($scope.savePreferencesFnWait) {
          return;
        }
        $scope.savePreferencesFnWait = true;
        setTimeout(UserService.updateUserPreferences($scope.userPreferences, toaster, function() {
          $scope.savePreferencesFnWait = false;
        }), ms);
      };

      $scope.savePreferencesFn = function() {
        UserService.updateUserPreferences($scope.userPreferences, true, function() {});
      };

    });
  }]);
});
