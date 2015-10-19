'use strict';
/*global app, window*/
(function (angular) {
  app.controller('EmailsCtrl', ["$scope", "$timeout", "$location", "toaster", "$modal", "WebsiteService", "CommonService", "AccountService", "formValidations", function ($scope, $timeout, $location, toaster, $modal, WebsiteService, CommonService, AccountService, formValidations) {

    $scope.setDefaults = function () {
      $scope.newEmail = {
        title: 'New Email Title',
        subject: 'New Email Subject'
      };
    };
    $scope.formValidations = formValidations;
    $scope.setDefaults();

    /*
     * @getCustomers
     * get all customers to for customer select
     */

    WebsiteService.getEmails(true, function (emails) {
      $timeout(function () {
        $scope.$apply(function () {
          $scope.emails = angular.copy(emails);
        });
      });
    });

    /*
     * @getAccount
     * - get account and autofill new email details
     */

    AccountService.getAccount(function (_account) {
      $scope.account = _account;
      if (_account.business.name) {
        $scope.newEmail.fromName = _account.business.name;
      }
      if (_account.business.emails[0].email) {
        $scope.newEmail.fromEmail = _account.business.emails[0].email;
        $scope.newEmail.replyTo = _account.business.emails[0].email;
      }
      $scope.newEmailOriginal = angular.copy($scope.newEmail);
    });
    $scope.order = "reverse";
    $scope.default_image_url = "/admin/assets/images/default-page.jpg";

    $scope.filterTemplateScreenShots = function (emails) {
      _.each(emails, function (email) {
        if (email) {
          email.hasScreenshot = false;
          if (email.previewUrl) {
            if ($("#template_screenshot_" + email._id).attr("src") === $scope.default_image_url) {
              email.hasScreenshot = false;
            } else {
              email.hasScreenshot = true;
            }
          }
        }
      });
    };

    $scope.filterTemplates = function () {
      $scope.showFilter = !$scope.showFilter;
      $scope.filterTemplateScreenShots($scope.emails);
    };

    $scope.createNewEmail = function (_newEmail) {
      //temporarily add a single email obj
      var emailToSend = {
        "title": _newEmail.title,
        "type": 'email',
        "subject": _newEmail.subject,
        "fromName": _newEmail.fromName,
        "fromEmail": _newEmail.fromEmail,
        "replyTo": _newEmail.replyTo,
        "components": [{
          "_id": CommonService.generateUniqueAlphaNumericShort(),
          "anchor": CommonService.generateUniqueAlphaNumericShort(),
          "type": "email-header",
          "version": 1,
          "txtcolor": "#888888",
          "logo": "<h2>Logo Here</h2>",
          // "title": "<h2 class='center'>New Email</h2>",
          // "subtitle": "subtitle",
          // "text": "This is your new email",
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
        },
        {
          "_id": CommonService.generateUniqueAlphaNumericShort(),
          "anchor": CommonService.generateUniqueAlphaNumericShort(),
          "type": "email-1-col",
          "version": 1,
          "txtcolor": "#888888",
          // "logo": "<h2>Logo Here</h2>",
          "title": '<h2 style="text-align:center;color:#58585b;">One Column Layout Section</h2>',
          // "subtitle": "subtitle",
          "text": '<p style="text-align:center;">This is a single column content section.</p>',
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
        },
        {
          "_id": CommonService.generateUniqueAlphaNumericShort(),
          "anchor": CommonService.generateUniqueAlphaNumericShort(),
          "type": "email-2-col",
          "version": 1,
          "txtcolor": "#888888",
          "title": '<h2 style="text-align:center;color:#58585b;">Two Column Layout Section</h2>',
          // "subtitle": "subtitle",
          "text1": '<p style="text-align:center;">This is column 1.</p>',
          "text2": '<p style="text-align:center;">This is column 2.</p>',
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
        },
        {
          "_id": CommonService.generateUniqueAlphaNumericShort(),
          "anchor": CommonService.generateUniqueAlphaNumericShort(),
          "type": "email-3-col",
          "version": 1,
          "txtcolor": "#888888",
          "title": '<h2 style="text-align:center;color:#58585b;">Three Column Layout Section</h2>',
          // "subtitle": "subtitle",
          "text1": '<p style="text-align:center;">This is column 1.</p>',
          "text2": '<p style="text-align:center;">This is column 2.</p>',
          "text3": '<p style="text-align:center;">This is column 3.</p>',
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
        },
        {
          "_id": CommonService.generateUniqueAlphaNumericShort(),
          "anchor": CommonService.generateUniqueAlphaNumericShort(),
          "type": "email-footer",
          "version": 1,
          "txtcolor": "#888888",
          // "logo": "<h2>Logo Here</h2>",
          // "title": "<h2 class='center'>New Email</h2>",
          // "subtitle": "subtitle",
          "text": "This is an email footer.",
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
        }]
      };

      if ($scope.account.business.logo) {
        emailToSend.components[0].logo = '<img src="' + $scope.account.business.logo + '"/>';
      }

      WebsiteService.createEmail(emailToSend, function (newemail, err) {
        if(newemail && !err) {
          toaster.pop('success', 'Email Created', 'The ' + newemail.title + ' email was created successfully.');
          $scope.emails.unshift(newemail);
          $scope.displayedEmails.unshift(newemail);
          $scope.newEmailOriginal = angular.copy($scope.newEmail);
          $scope.closeModal();
          $scope.viewSingle(newemail);
        } else if(err) {
          toaster.pop('error', "Error creating Email", err.message);
        }
      });

    };


    $scope.openModal = function (template) {
      $scope.modalInstance = $modal.open({
        templateUrl: template,
        keyboard: false,
        backdrop: 'static',
        scope: $scope
      });
    };

    $scope.closeModal = function () {
      $scope.modalInstance.close();
    };

    $scope.getters = {
      components: function (value) {
        return value.length;
      },
      created: function (value) {
        return value.created.date;
      },
      modified: function (value) {
        return value.modified.date;
      }
    };

    $scope.setTemplateDetails = function (templateDetails) {
      $scope.templateDetails = true;
      $scope.selectedTemplate = templateDetails;
    };

    $scope.resetTemplateDetails = function () {
      $scope.templateDetails = false;
      $scope.selectedTemplate = null;
      $scope.showChangeURL = false;
    };

    $scope.viewSingle = function (email) {
      $location.path('/editor').search({
        email: email._id
      });
    };

    $scope.filterScreenshot = {};

    $scope.pageScreenshotOptions = [{
      name: 'Screenshot',
      value: true
    }, {
      name: 'No Screenshot',
      value: false
    }];

    /*
     * @triggerInput
     * - trigger the hidden input to trick smart table into activating filter
     */

    $scope.triggerInput = function (element) {
      angular.element(element).trigger('input');
    };

    $scope.clearFilter = function (event, input) {
      $scope.filterScreenshot = {};
      $scope.triggerInput(input);
    };

  }]);
}(angular));
