'use strict';
/*global app, angular*/
(function (angular) {
  app.controller('CreateCampaignCtrl', ["$scope", "$timeout", "toaster", "CampaignService", "CustomerService", "CommonService", "editableOptions", "AccountService", function ($scope, $timeout, toaster, CampaignService, CustomerService, CommonService, editableOptions, AccountService) {

    editableOptions.theme = 'bs3';

    /*
     * @defaultNewEmail
     * - default new email to show for initial design unless user selects template
     */

    $scope.emailToSend = {
      "title": "New Email",
      "components": [{
        "_id": CommonService.generateUniqueAlphaNumericShort(),
        "anchor": CommonService.generateUniqueAlphaNumericShort(),
        "type": "email",
        "version": 1,
        "txtcolor": "#888888",
        "logo": "<h2>Logo Here</h2>",
        "title": "<h2 class='center'>New Email</h2>",
        "subtitle": "subtitle",
        "text": "This is your new email",
        "from_email": "info@indigenous.io",
        "bg": {
          "img": {
            "url": "",
            "width": null,
            "height": null,
            "parallax": false,
            "blur": false
          },
          "color": ""
        },
        "visibility": true
      }],
      "screenshot": "//indigenous-screenshots.s3.amazonaws.com/account_536/1432017910483.png",
      "version": 0,
      "latest": true,
      "subject": "New Email",
      "fromName": "",
      "fromEmail": "",
      "replyTo": ""
    };

    /*
     * @getAccount
     * - get account and autofill new email details
     */

    AccountService.getAccount(function(_account) {
      console.log('account >>> ', _account);
      if (_account.business.logo) {
        $scope.emailToSend.components[0].logo = '<img src="'+_account.business.logo+'"/>';
      }
      if (_account.business.name) {
        $scope.emailToSend.fromName = _account.business.name;
      }
      if (_account.business.emails[0].email) {
        $scope.emailToSend.fromEmail = _account.business.emails[0].email;
        $scope.emailToSend.replyTo = _account.business.emails[0].email;
      }
    });


    $scope.selectedCustomers = {
      individuals: []
    };

    var customerTags = [{
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
    }, {
      label: "No Tag",
      data: "nt"
    }];

    var nextStep = function () {
      $scope.currentStep++;
    };
    var prevStep = function () {
      $scope.currentStep--;
    };
    var goToStep = function (i) {
      $scope.currentStep = i;
    };
    var errorMessage = function () {
      toaster.pop('error', 'Error', 'please complete the form in this step before proceeding');
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

    CustomerService.getCustomers(function (customers) {
      _.each(customers, function (customer, index) {
        if (!$scope.checkBestEmail(customer)) {
          customers.splice(index, 1);
        }
      });
      $scope.customers = customers;
      var _tags = [];
      _.each(customers, function (customer) {
        if (customer.tags && customer.tags.length > 0) {
          _.each(customer.tags, function (tag) {
            _tags.push(tag);
          });
        } else {
          _tags.push('nt');
        }
      });
      var d = _.groupBy(_tags, function (tag) {
        return tag;
      });

      var x = _.map(d, function (tag) {
        return {
          uniqueTag: tag[0],
          matchingTag: _.find(customerTags, function (matchTag) {
            return matchTag.data === tag[0];
          }).label,
          numberOfTags: tag.length
        };
      });
      $scope.customerCounts = x;
    });

    // selected tags
    $scope.tagSelection = [];
    $scope.totalRecipients = 0;
    $scope.fullSelectedCustomers = [];

    var currentTimeout = 0;

    $scope.getTotalRecipients = function () {
      var totalContacts = [];
      var fullContacts = [];
      _.each($scope.tagSelection, function (tagName) {
        var matching = _.find($scope.customerCounts, function (count) {
          return count.matchingTag === tagName;
        });
        if (matching && tagName !== 'No Tag') {
          _.each($scope.customers, function (single) {
            if (single.tags && single.tags.length > 0 && single.tags.indexOf(matching.uniqueTag) > -1) {
              if (totalContacts.indexOf(single._id) <= 0) {
                totalContacts.push(single._id);
                $timeout(function () {
                  $scope.fullSelectedCustomers.push(single);
                }, currentTimeout + 750);
              }
            }
          });
        }
        if (tagName === 'No Tag') {
          _.each($scope.customers, function (single) {
            if (!single.tags || single.tags.length <= 0) {
              if (totalContacts.indexOf(single._id) <= 0) {
                fullContacts.push(single);
                $timeout(function () {
                  $scope.fullSelectedCustomers.push(single._id);
                }, currentTimeout + 750);
              }
            }
          });
        }
      });

      currentTimeout = 50;

      // $scope.fullSelectedCustomers = fullContacts;
      return totalContacts.length;
    };

    // toggle selection
    $scope.toggleSelection = function (tagName) {
      var idx = $scope.tagSelection.indexOf(tagName);

      // is currently selected
      if (idx > -1) {
        $scope.tagSelection.splice(idx, 1);
      } else {
        $scope.tagSelection.push(tagName);
      }
      $scope.totalRecipients = $scope.getTotalRecipients();
    };

    $scope.currentStep = 1;
    $scope.newCampaign = {
      type: 'onetime'
    };
    // Initial Value
    $scope.form = {

      next: function () {
        $scope.goingTo = 'next';
        $scope.toTheTop();
        nextStep();
      },
      prev: function () {
        $scope.goingTo = 'prev';
        $scope.toTheTop();
        prevStep();
      },
      goTo: function (i) {
        if (parseInt($scope.currentStep, 10) > parseInt(i, 10)) {
          $scope.toTheTop();
          goToStep(i);

        } else {
          $scope.toTheTop();
          goToStep(i);
          // if (form.$valid) {
          //   $scope.toTheTop();
          //   goToStep(i);

          // } else
          //   errorMessage();
        }
      },
      submit: function () {
        console.log('submit');
      },
      reset: function () {
        console.log('reset');
      }
    };

  }]);
  app.filter('propsFilter', function () {
    return function (items, props) {
      var out = [];

      if (angular.isArray(items)) {
        items.forEach(function (item) {
          var itemMatches = false;

          var keys = Object.keys(props);
          for (var i = 0; i < keys.length; i++) {
            var prop = keys[i];
            var text = props[prop].toLowerCase();
            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
              itemMatches = true;
              break;
            }
          }

          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        // Let the output be the input untouched
        out = items;
      }

      return out;
    };
  });
}(angular));
