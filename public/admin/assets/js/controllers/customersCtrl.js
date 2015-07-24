'use strict';
/*global app, window*/
(function (angular) {
  app.controller('CustomersCtrl', ["$scope", "$state", "toaster", "$modal", "$window", "CustomerService", "SocialConfigService", "userConstant", function ($scope, $state, toaster, $modal, $window, CustomerService, SocialConfigService, userConstant) {

    $scope.tableView = 'list';
    $scope.itemPerPage = 100;
    $scope.showPages = 15;

    if (!$state.current.sort) {
      $scope.order = "reverse";
    }

    /*
     * @getCustomers
     * -
     */

    CustomerService.getCustomers(function (customers) {
      _.each(customers, function (customer) {
        customer.bestEmail = $scope.checkBestEmail(customer);
        customer.hasFacebookId = $scope.checkFacebookId(customer);
        customer.hasTwitterId = $scope.checkTwitterId(customer);
        customer.hasLinkedInId = $scope.checkLinkedInId(customer);
        customer.hasGoogleId = $scope.checkGoogleId(customer);
      });
      $scope.customers = customers;
      if ($state.current.sort) {
        $scope.setSortOrder($state.current.sort);
      }
      $scope.showCustomers = true;
      console.log("customers loaded");

    });

    /*
     * @getters
     * - getters for the sort on the table
     */

    $scope.getters = {
      created: function (value) {
        return value.created.date || -1;
      },
      modified: function (value) {
        return value.modified.date;
      },
      name: function (value) {
        return [value.first, value.middle, value.last].join(' ').trim();
      },
      tags: function (value) {
        return $scope.contactTags(value);
      },
      phone: function (value) {
        if (value.details[0] && value.details[0].phones && value.details[0].phones[0]) {
          return value.details[0].phones[0].number.trim();
        }
        return "";
      },
      address: function (value) {
        if (value.details[0] && value.details[0].addresses && value.details[0].addresses[0] && value.details[0].addresses[0].city && value.details[0].addresses[0].state) {
          return [value.details[0].addresses[0].city, value.details[0].addresses[0].state].join(' ').trim();
        }
        if (value.details[0] && value.details[0].addresses && value.details[0].addresses[0] && value.details[0].addresses[0].address && !value.details[0].addresses[0].city) {
          return value.details[0].addresses[0].address;
        }
      },
      social: function (value) {
        if (value.hasLinkedInId) {
          return 1;
        }
        if (value.hasGoogleId) {
          return 2;
        }
        if (value.hasFacebookId) {
          return 3;
        }
        if (value.hasTwitterId) {
          return 4;
        }

        return 5;
      }
    };

    /*
     * @openModal
     * -
     */

    $scope.openModal = function (template, _size) {
      $scope.modalInstance = $modal.open({
        templateUrl: template,
        scope: $scope,
        backdrop: 'static',
        size: _size || md
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

    /*
     * @preventClick
     * -
     */

    $scope.preventClick = function (event) {
      event.stopPropagation();
    };

    /*
     * @column
     * -
     */

    $scope.column = {
      "photo": true,
      "name": true,
      "tags": true,
      "email": true,
      "address": true,
      "social": true,
      "phone": true,
      "created": true,
      "modified": true
    };

    $scope.contactTags = function (customer) {
      return CustomerService.contactTags(customer);
    };

    $scope.checkBestEmail = function (contact) {
      var returnVal = CustomerService.checkBestEmail(contact);
      this.email = contact.email;
      return returnVal;
    };

    $scope.checkFacebookId = function (contact) {
      var returnVal = CustomerService.checkFacebookId(contact);
      this.facebookId = contact.facebookId;
      return returnVal;
    };

    $scope.checkTwitterId = function (contact) {
      var returnVal = CustomerService.checkTwitterId(contact);
      this.twitterId = contact.twitterId;
      return returnVal;
    };

    $scope.checkLinkedInId = function (contact) {
      var returnVal = CustomerService.checkLinkedInId(contact);
      this.linkedInUrl = contact.linkedInUrl;
      this.linkedInId = contact.linkedInId;
      return returnVal;
    };

    $scope.checkGoogleId = function (contact) {
      var returnVal = CustomerService.checkGoogleId(contact);
      this.googleUrl = contact.googleUrl;
      this.googleId = contact.googleId;
      return returnVal;
    };

    $scope.checkAddress = function (contact) {
      var returnVal = CustomerService.checkAddress(contact);
      this.address = contact.address;
      return returnVal;
    };

    $scope.viewSingle = function (customer) {
      var tableState = $scope.getSortOrder();
      $state.current.sort = tableState.sort;
      window.location = '/admin/#/customers/' + customer._id;
    };

    $scope.customer = {};
    $scope.customer.tags = {};
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

    $scope.customerPhotoOptions = [{
      name: 'Photo',
      value: true
    }, {
      name: 'No Photo',
      value: false
    }];

    $scope.customersLimit = 50;

    $scope.addCustomers = function () {
      console.log('add customer');
      $scope.customersLimit += 50;
    };

    $scope.addCustomer = function () {
      var tempTags = [];
      _.each($scope.customer.tags, function (tag) {
        tempTags.push(tag.data);
      });
      var tempCustomer = {
        first: $scope.customer.first,
        middle: $scope.customer.middle,
        last: $scope.customer.last,
        tags: tempTags
      };
      CustomerService.saveCustomer(tempCustomer, function (returnedCustomer) {
        $scope.fullName = '';
        $scope.customer.tags = {};
        $scope.closeModal();
        $scope.customers.unshift(returnedCustomer);
        toaster.pop('success', 'Customer Successfully Added');
        $scope.minRequirements = true;
      });
    };

    $scope.$watch('fullName', function (newValue) {
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
    $scope.socialAccounts = {};
    SocialConfigService.getAllSocialConfig(function (data) {
      $scope.socialAccounts = data.socialAccounts;
    });

    $scope.importFacebookFriends = function () {
      CustomerService.importFacebookFriends(function (data, success) {
        if (success) {
          $('#import-contacts-modal').modal('hide');
          toaster.pop('success', "Contacts being imported.");
        } else {
          $window.location.href = "/socialconfig/facebook?redirectTo=" + encodeURIComponent('/admin#/customer');
        }
      });
    };

    $scope.importLinkedInConnections = function () {
      var foundSocialId = false;
      $scope.socialAccounts.forEach(function (value) {
        if (value.type === userConstant.social_types.LINKEDIN) {
          foundSocialId = true;
          $scope.closeModal();
          toaster.pop('success', "Contacts import initiated.");
          SocialConfigService.importLinkedinContact(value.id, function () {
            $scope.closeModal();
            toaster.pop('success', "Contacts import complete.");
          });
        }
      });
      if (foundSocialId === false) {
        $scope.closeModal();
        toaster.pop('warning', "No linkedin account integrated.");
      }
    };

    $scope.importGmailContacts = function () {
      var foundSocialId = false;
      $scope.socialAccounts.forEach(function (value) {
        if (value.type === userConstant.social_types.GOOGLE) {
          foundSocialId = true;
          $scope.closeModal();
          toaster.pop('success', "Contacts import initiated.");
          SocialConfigService.importGoogleContact(value.id, function () {
            $scope.closeModal();
            toaster.pop('success', "Contacts import complete.");
          });
        }
      });
      if (foundSocialId === false) {
        $scope.closeModal();
        toaster.pop('warning', "No google account integrated.");
      }
    };

    $scope.customerColumns = [{
      name: 'First Name',
      value: 'first',
      match: ''
    }, {
      name: 'Middle Name',
      value: 'middle',
      match: ''
    }, {
      name: 'Last Name',
      value: 'last',
      match: ''
    }, {
      name: 'Email Address',
      value: 'email',
      match: ''
    }, {
      name: 'Phone Number',
      value: 'phone',
      match: ''
    }, {
      name: 'Website URL',
      value: 'website',
      match: ''
    }, {
      name: 'Company Name',
      value: 'company',
      match: ''
    }, {
      name: 'Gender',
      value: 'gender',
      match: ''
    }, {
      name: 'Tags',
      value: 'tags',
      match: ''
    }, {
      name: 'Address',
      value: 'address',
      match: ''
    }];

    $scope.csvComplete = function (results, file) {
      $scope.uploadingCsv = false;
      $scope.csvHeaders = results.data[0];
      $scope.csvResults = results.data;
    };

    $scope.previewCustomer = {};

    $scope.updatePreview = function (item, model) {
      console.log(item, model);
      var _match = _.find($scope.customerColumns, function(_column) {
        return _column.match === model;
      });
      console.log(_match);
    };

    $scope.uploadMatchedCSV = function () {
      var _formattedColumns = [];
      _.each($scope.customerColumns, function (_column) {
        var indexMatch = _.indexOf($scope.csvHeaders, _column.match);
        if (indexMatch >= 0) {
          _column.index = indexMatch;
        }
        _formattedColumns[_column.value] = _column;
      });
      console.log('uploadMatchedCSV >>> ', $scope.customerColumns);
      var customersToAdd = [];
      _.each($scope.csvResults, function (_result, i) {
        console.log('_result ', _result);
        if (i !== 0) {
          // var _formattedCustomer = {
          //   first: _result[_formattedColumns.first.index],
          //   middle: '',
          //   last: '',
          //   details: [{
          //     _id: "",
          //     socialId: "", //The social Id from where these details came
          //     source: "csv",
          //     location: "" //Location string
          //     emails: []
          //     photos: {
          //       square: ""
          //       small: ""
          //       medium: ""
          //       large: ""
          //     }
          //     websites: []
          //     company: ""
          //     phones: [{
          //       _id: "",
          //       type: string "m|w|h|o" //mobile, work, home, other
          //       number: string,
          //       default: false
          //     }],
          //     addresses: [{
          //       _id: ""
          //       type: string "w|h|o"
          //       address: string
          //       address2: string
          //       city: string
          //       state: string
          //       zip: string
          //       country: string,
          //       countryCode: string
          //       displayName: string,
          //       lat: "",
          //       lon: "",
          //       defaultShipping: false
          //       defaultBilling: false

          //     }]
          //   }]
          // };

          var _formattedCustomer = {
            first: _result[_formattedColumns.first.index]
          };

          customersToAdd.push(_formattedCustomer);
        }
      });
      console.log('customersToAdd ', customersToAdd);
    };

    $scope.csvUploaded = function (event, files) {
      $scope.uploadingCsv = true;
      var config = {
        delimiter: "", // auto-detect
        newline: "", // auto-detect
        header: false,
        dynamicTyping: false,
        preview: 0,
        encoding: "",
        worker: false,
        comments: false,
        step: undefined,
        complete: function (results, file) {
          $scope.csvComplete(results, file);
        },
        error: undefined,
        download: false,
        skipEmptyLines: false,
        chunk: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
      };
      Papa.parse(files[0], config);
    };

    // $('#files').parse({
    //     config: config,
    //     before: function(file, inputElem)
    //     {
    //       start = now();
    //       console.log("Parsing file...", file);
    //     },
    //     error: function(err, file)
    //     {
    //       console.log("ERROR:", err, file);
    //       firstError = firstError || err;
    //       errorCount++;
    //     },
    //     complete: function()
    //     {
    //       end = now();
    //       printStats("Done with all files");
    //     }
    //   });

    /*
     * @triggerInput
     * - trigger the hidden input to trick smart table into activating filter
     */

    $scope.triggerInput = function (element) {
      angular.element(element).trigger('input');
    };

    /*
     * @clearFilter
     * - clear the filter for the status when the red X is clicked
     */

    $scope.filterCustomer = {};

    $scope.clearFilter = function (event, input, filter) {
      $scope.filterCustomer[filter] = {};
      $scope.triggerInput(input);
    };

    $scope.importGoogleContacts = function (groupId) {
      $scope.closeModal();
      toaster.pop('success', "Contacts import initiated.");
      SocialConfigService.importGoogleContactsForGroup($scope.tempGoogleAccount.id, groupId.id, function () {
        $scope.closeModal();
        $scope.minRequirements = true;
        toaster.pop('success', "Your Google contacts are being imported in the background.");
      });
      $scope.tempGoogleAccount = null;
      $scope.socailList = false;
      $scope.groupList = false;
    };

    $scope.importContacts = function (selectedAccount) {
      var foundSocialId = false;
      if (selectedAccount.type === userConstant.social_types.GOOGLE) {
        foundSocialId = true;
        $scope.tempGoogleAccount = selectedAccount;
        SocialConfigService.getGoogleGroups(selectedAccount.id, function (data) {
          data.push({
            name: 'All',
            id: 'All'
          });
          $scope.socialAccountGroups = data;
        });
        //$scope.closeModal();
        //toaster.pop('success', "Contacts import initiated.");
        //SocialConfigService.importGoogleContact(selectedAccount.id, function(data) {
        //    $scope.closeModal();
        //    toaster.pop('success', "Your Google contacts are being imported in the background.");
        //});
      }
      if (selectedAccount.type === userConstant.social_types.LINKEDIN) {
        foundSocialId = true;
        $scope.closeModal();
        toaster.pop('success', "Contacts import initiated.");
        SocialConfigService.importLinkedinContact(selectedAccount.id, function () {
          $scope.closeModal();
          toaster.pop('success', "Your LinkedIn contacts are being imported in the background.");

        });
        $scope.socailList = false;
        $scope.groupList = false;
      }

      if (foundSocialId === false) {
        $scope.closeModal();
        toaster.pop('warning', "No such account integrated.");
        $scope.socailList = false;
        $scope.groupList = false;
      }


    };
    $scope.socailType = "";
    $scope.socailList = false;
    $scope.groupList = false;

    $scope.showSocialAccountSelect = function (socailType) {
      $scope.socailType = socailType;
      $scope.socailList = true;
      if (socailType === userConstant.social_types.GOOGLE) {
        $scope.groupList = true;
      } else {
        $scope.groupList = false;
      }
    };

  }]);
}(angular));
