'use strict';
/*global app, angular, moment*/
(function (angular) {
  app.controller('CreateCampaignCtrl', ["$scope", "$rootScope", "$modal", "$location", "$window", "$stateParams", "toaster", "$timeout", "CampaignService", "CustomerService", "CommonService", "editableOptions", "AccountService", "userConstant", "WebsiteService", "$q", "formValidations", "SweetAlert", function ($scope, $rootScope, $modal, $location, $window, $stateParams, toaster, $timeout, CampaignService, CustomerService, CommonService, editableOptions, AccountService, userConstant, WebsiteService, $q, formValidations, SweetAlert) {

    /*
     * set editor theme
     */
    editableOptions.theme = 'bs3';

    /*
     * Setup some initial wizard state
     */
    var customerTags = userConstant.contact_types.dp;
    var nextStep = function () {
      $scope.currentStep++;
    };
    var prevStep = function () {
      $scope.currentStep--;
    };
    var goToStep = function (i) {
      $scope.currentStep = i;
    };
    var errorMessage = function (i) {
      if ($scope.currentStep < i && (i - $scope.currentStep > 1)) {
        toaster.pop('error', 'Error', 'Please complete the previous steps before proceeding');
      } else
        toaster.pop('error', 'Error', 'Please complete the form in this step before proceeding');
    };

    $scope.changesConfirmed = true;
    $scope.navigateOnSave = null;
    $scope.whenToSend = 'now';
    $scope.selectedEmail = {
      type: 'new'
    };
    $scope.tableView = 'list';
    $scope.emailValidation = formValidations.email;
    $scope.delivery = {
      date: moment(),
      // time: moment(),
      minDate: new Date()
    };

    $scope.triggers = [{
      name: 'Sign Up',
      icon: 'fa-paper-plane',
      value: 'SIGNUP'
    }];

    $scope.emails = [];

    $scope.formatDate = function (date) {
      if (!date._d) {
        var date = { year: date.year, month: date.month - 1, day: date.day, hour: date.hour, minute: date.minute };
        var localDate = moment.utc(date);
        var localDate = localDate.local();
      } else {
        var localDate = moment(date);
      }
      
      return localDate.format("dddd, MMMM Do YYYY, h:mm A");
    };

    $scope.updateSendNow = function (value) {
      $scope.whenToSend = value;
      $scope.watchDeliveryDate = true;
      if ($scope.whenToSend !== 'later') {
        $scope.delivery.date = moment();
        // $scope.delivery.time = moment();
      }

    };

    $scope.hstep = 1;
    $scope.mstep = 1;

    $scope.options = {
      hstep: [1, 2, 3],
      mstep: [1, 5, 10, 15, 25, 30]
    };

    $scope.ismeridian = true;

    $scope.selectedCustomers = {
      individuals: []
    };

    // selected tags
    $scope.tagSelection = [];
    
    $scope.recipients = [];
    $scope.originalRecipients = [];
    $scope.recipientsToRemove = [];

    $scope.newCampaign = {};

    $scope.duplicateCampaign = {
      name: ''
    };

    $scope.selectedCustomers.newEmails = [];

    $scope.isEditable = false;

    $scope.getProgressType = function (value) {
      var type;
      if (value < 25) {
        type = 'danger';
      } else if (value < 50) {
        type = 'warning';
      } else if (value < 75) {
        type = 'info';
      } else {
        type = 'success';
      }
      return type;
    };

    //TODO: bring out to shared / filter
    $scope._moment = function (_date, options) {
      if (_date.toString().length === 10) {
        _date = _date * 1000;
      }
      var formattedDate = moment(_date).subtract('months', 1);

      if (options) {
        if (options.subtractNum && options.subtractType) {
          formattedDate = formattedDate.subtract(options.subtractNum, options.subtractType);
        }
      }
      return formattedDate.format("MMMM Do, YYYY");
    };

    /*
     * @defaultNewEmail
     * - default new email to show for initial design unless user selects template
     */
    $scope.emailToSend = {
      "title": "",
      "type": "email",
      "subject": "Edit Subject",
      "fromName": "",
      "fromEmail": "",
      "replyTo": "",
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
        "title": '<h2 style="text-align:center;">One Column Layout Section</h2>',
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
        "title": '<h2 style="text-align:center;">Two Column Layout Section</h2>',
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
        "title": '<h2 style="text-align:center;">Three Column Layout Section</h2>',
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

    $scope.emailToSendCopy = angular.copy($scope.emailToSend);

    $scope.component = $scope.emailToSend.components[0];

    $scope.updateTime = function () {
      // var date = moment($scope.delivery.date);
      // if (date && date._d && date._d.toString() === "Invalid Date") {
      //   $scope.invalidDate = true;
      // } else {
      //   $scope.delivery.date = date;
      // }
      // if ($scope.delivery.date.diff && $scope.delivery.date.diff(moment(), "minutes") < 0) {
      //   $scope.invalidDate = true;
      // } else {
      //   $scope.invalidDate = false;
      // }
    };

    $scope.togglePreview = function () {
      if (!$scope.showPreview) {
        $scope.showPreview = true;
      } else {
        $scope.showPreview = false;
      }
    };

    $scope.newCampaignObj = {
      "name": "",
      "type": "onetime",
      "status": "DRAFT",
      "startDate": "", //not used on autoresponder
      "steps": [{
        "type": "email",
        "trigger": null,
        "index": 1,
        "settings": {
          "emailId": "",
          "offset": "", //in minutes
          "fromEmail": "",
          "fromName": '',
          "replyTo": '',
          "subject": '',
          "vars": [],
          "sendAt": {},
        }
      }]
    };

    /*
     * @originalCampaignObj
     * - save for later comparison
     */
    $scope.originalCampaignObj = angular.copy($scope.newCampaignObj);

    /*
     * @sendTestEmail
     * - send email based on current email template
     */
    $scope.sendTestEmail = function (_email) {
      $scope.sendingEmail = true;
      WebsiteService.sendTestEmail(_email, $scope.emailToSend, function (data) {
        $scope.sendingEmail = false;
        if (data && data[0] && data[0]._id) {
          $scope.closeModal();
          toaster.pop('success', 'Test Email sent successfully');
        }
        console.log('test send status ', data);
      });
    };

    // $scope.setComponentsHTML = function (email) {
    //   email.components = email.components.map(function (component) {
    //     component.html = angular.element('#' + $scope.emailToSend.components[0]._id);
    //     return component;
    //   });
    // };

    $scope.openModal = function (template) {
      $scope.modalInstance = $modal.open({
        templateUrl: template,
        keyboard: false,
        backdrop: 'static',
        scope: $scope
      });
      $scope.modalInstance.result.finally($scope.closeModal());
    };

    /*
     * @openSimpleModal
     * -
     */
    $scope.openSimpleModal = function (modal, _size) {
      var _modal = {
        templateUrl: modal,
        scope: $scope,
        keyboard: false,
        backdrop: 'static',
        size: _size || 'md'
      };
      $scope.modalInstance = $modal.open(_modal);
      $scope.modalInstance.result.then(null, function () {
        angular.element('.sp-container').addClass('sp-hidden');
      });
    };

    $scope.closeModal = function () {
      $scope.modalInstance.close();
    };

    $scope.fullscreen = false;

    /*
     * @toggleFullscreen
     * - 
     */
    $scope.toggleFullscreen = function () {
      $scope.transitionDone = false;
      if (!$scope.fullscreen) {
        $scope.fullscreen = true;
        $timeout(function () {
          $scope.transitionDone = true;
        }, 1000);
      } else {
        $scope.fullscreen = false;
        $timeout(function () {
          $scope.transitionDone = true;
        }, 1000);
      }
    };

    /*
     * @analyzeSubject
     * - email subject quality feedback
     */
    $scope.analyzeSubject = function (subject) {
      var subjectWords = subject.split(' ');
      var lowercaseSubjectWords = subject.toLowerCase().split(' ');
      var wordsToUse = ["freebie", "urgent", "breaking", "important", "alert", "thank you", "sneak peek", "alert", "daily", "free delivery", "cash", "quote", "save", "jokes", "promotional", "congratulations", "revision", "forecast", "snapshot", "token", "voluntary", "monthly", "deduction", "upgrade", "just", "content", "go", "wonderful"];
      var wordsNotToUse = ["free", "reminder", "canceled", "helping", "fundraising", "raffle", "fundraiser", "charity", "donate", "last chance", "breast cancer", "sign up", "help", "percent off", "newsletter", "report", "program", "half", "budget", "unlimited", "discount", "down", "sale", "suburbs", "decoder", "inland", "county", "wish", "forgotten", "thirds", "discussion", "romantic", "videos", "miss", "deals", "groovy", "conditions", "friday", "monday", "furry", "double", "volunteer", "learn"];

      var capitalized = true;
      var lessThan50Char = true;
      var lessThan10Words = true;
      var isAlphaNumeric = true;
      var containsWordToUse = true;
      var avoidsWordNotToUse = true;
      var moreThan4Words = true;
      var differentFromPreviousSubjects = true;

      _.each(subjectWords, function (word) {
        //All Words Capitalized
        if (word && word[0] !== word[0].toUpperCase()) {
          capitalized = false;
        }

        //does not include words to avoid
        if (wordsNotToUse.indexOf(word.toLowerCase()) >= 0) {
          avoidsWordNotToUse = false;
        }
      });

      //includes words to use
      if (_.intersection(lowercaseSubjectWords, wordsToUse).length <= 0) {
        containsWordToUse = false;
      }

      //Less than 50 characters
      if (subject.length > 49) {
        lessThan50Char = false;
      }

      //less than 10 words
      if (subjectWords.length > 9) {
        lessThan10Words = false;
      }

      //more than 4 words
      if (subjectWords.length < 4) {
        moreThan4Words = false;
      }

      if ($scope.emails && $scope.emails.length > 0) {
        //determine if previous subject emails are closely related by score
        var bestMatch = {
          value: '',
          percent: 0
        };

        var lowercaseSubject = subject.replace(new RegExp('[^a-zA-Z ]'), "").toLowerCase();
        _.each($scope.emails, function (email) {
          if (email.subject) {
            var lowercaseEmailSubject = email.subject.replace(new RegExp('[^a-zA-Z ]'), "").toLowerCase();
            var percentMatch = lowercaseSubject.score(lowercaseEmailSubject);
            if (bestMatch.percent < percentMatch) {
              bestMatch.value = email.subject;
              bestMatch.percent = percentMatch;
            }
          }
        });

        if (bestMatch.value && bestMatch.percent > 0.75) {
          differentFromPreviousSubjects = false;
          $scope.bestMatch = bestMatch;
        }
      }

      //No special characters except for question mark
      if (/^[a-zA-Z0-9- ]*$/.test(subject) === false) {
        isAlphaNumeric = false;
      }

      //TODO: contains personalization

      var percentRating = 100;
      var sixth = 12.5;
      var rulesBooleanArr = [capitalized, lessThan50Char, lessThan10Words, isAlphaNumeric, containsWordToUse, avoidsWordNotToUse, moreThan4Words, differentFromPreviousSubjects];
      _.each(rulesBooleanArr, function (rule) {
        if (rule === false) {
          percentRating = percentRating - sixth;
        }
      });

      $scope.subjectRules = {
        "capitalized": capitalized,
        "lessThan50Char": lessThan50Char,
        "lessThan10Words": lessThan10Words,
        "isAlphaNumeric": isAlphaNumeric,
        "containsWordToUse": containsWordToUse,
        "avoidsWordNotToUse": avoidsWordNotToUse,
        "moreThan4Words": moreThan4Words,
        "differentFromPreviousSubjects": differentFromPreviousSubjects
      };

      $scope.subjectScore = Math.round(percentRating);

    };


    $scope.$watch('emailToSend.subject', function (newValue, oldValue) {
      if (newValue) {
        $scope.analyzeSubject(newValue);
      }
    });

    /*
     * @changeCurrentEmail
     * - set selected email
     */
    $scope.changeCurrentEmail = function (selectedEmail) {
      $scope.emailToSend = selectedEmail;
    };

    /*
     * @checkCampaignName
     * - check for existing campaign name
     */
    $scope.checkCampaignName = function (_name) {
      $scope.checkingCampaignName = true;
      CampaignService.checkCampaignNameExists(_name, function (exists) {
        $scope.campaignNameChecked = true;
        $scope.checkingCampaignName = false;
        $scope.campaignNameExists = exists;
        $scope.emailToSend.title = _name + ' Email Template';
        $scope.emailToSend.subject = _name;
        $scope.checkEmailTitle($scope.emailToSend.title);
      });
    };

    /*
     * @checkCampaignName
     * - check for existing campaign name
     */
    $scope.checkDuplicateCampaignName = function (_name) {
      $scope.checkingDuplicateCampaignName = true;
      CampaignService.checkCampaignNameExists(_name, function (exists) {
        $scope.campaignDuplicateNameChecked = true;
        $scope.checkingDuplicateCampaignName = false;
        $scope.campaignDuplicateNameExists = exists;
      });
    };

    /*
     * @checkEmailTitle
     * - check email title doesnt exist already
     */
    $scope.checkEmailTitle = function (_name) {
      if ($scope.selectedEmail.type === 'new') {
        $scope.checkingEmailTitle = true;
        var exists = _.findWhere($scope.originalEmails, {
          title: _name
        });
        $scope.emailTitleExists = exists ? true : false;
      } else {
        $scope.emailTitleExists = false;
      }

      $scope.emailTitleChecked = true;
      $scope.checkingEmailTitle = false;
    };

    /*
     * @clearEmail
     * - callback for toggle on radio input "New Email" vs. "Template"
     */
    $scope.clearEmail = function (newEmail) {
      $scope.checkingEmailTitle = false;
      // $scope.emailToSend.title = "";
      $scope.setBusinessDetails();
      if (newEmail) {
        $scope.emailToSendPrevious = angular.copy($scope.emailToSend);
        $scope.emailToSend = $scope.emailToSendCopy;
        $scope.emailToSend.title = $scope.newCampaignObj.name + ' Email Template';
        $scope.emailToSend.fromName = $scope.emailToSendPrevious.fromName;
        $scope.emailToSend.fromEmail = $scope.emailToSendPrevious.fromEmail;
        $scope.emailToSend.replyTo = $scope.emailToSendPrevious.replyTo;
      } else {
        $scope.emailToSend = $scope.emailToSendPrevious;
        if($scope.newCampaignObj.steps && $scope.newCampaignObj.steps[0] && $scope.newCampaignObj.steps[0].settings && !$scope.newCampaignObj.steps[0].settings.emailId && $scope.emailToSendPrevious)
          $scope.newCampaignObj.steps[0].settings.emailId = $scope.emailToSendPrevious._id
      }
    }

    /*
     * @customerSelected
     * - callback for contact tag click added from dropdown list
     */
    $scope.customerSelected = function (select) {
      var selected = select.selected[select.selected.length - 1];
      var removalIndex = _.indexOf($scope.recipientsToRemove, selected._id);
      var existingContact = _.find($scope.recipients, function (recipient) {
        return recipient._id === selected._id;
      });
      
      if (!existingContact) {
        $scope.recipients.push(selected);
      }

      // clear search text
      select.search = '';

      //remove from removal array
      if (removalIndex !== -1) {
        $scope.recipientsToRemove.splice(removalIndex, 1);
      }
    };

    /*
     * @customerRemoved
     * - callback for contact tag click on [X] button
     */
    $scope.customerRemoved = function (select, selected) {
      var existingContactIndex;
      var contact = _.findWhere($scope.recipients, {
        _id: selected._id
      });
      if (contact) {
        existingContactIndex = _.indexOf($scope.recipients, contact);
      }

      if (existingContactIndex > -1) {
        //get the tags that have been selected
        // var tags = $scope.getSelectedTags();
        // var tagExists = _.intersection(contact.tags || ['nt'], tags);
        // if (tagExists.length === 0) {
          $scope.recipients.splice(existingContactIndex, 1);
        // }

      }
      // clear search text
      select.search = '';

      //add to removal array
      $scope.recipientsToRemove.push(selected._id);
    };

    /*
     * DEPRECATED: @manualEmailsEntered
     * - check for valid email addresses entered
     */
    // $scope.manualEmailsEntered = function () {
    //   var splits = $scope.selectedCustomers.newEmails.split(',');
    //   var validatedEmails = [];
    //   _.each(splits, function (split) {
    //     var nospaces = split.replace(' ', '');
    //     if (nospaces.length > 0 && $scope.validateEmail(split)) {
    //       validatedEmails.push(split);
    //     }
    //   });
    //   $scope.newContactsLength = validatedEmails.length;
    // };

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
     * @eliminateDuplicate
     * - 
     */
    $scope.eliminateDuplicate = function (customer) {
      return $scope.selectedCustomers.individuals.indexOf(customer._id) > -1;
    };

    /*
     * @getSelectedTags
     * - loop through tags, return selected
     */
    $scope.getSelectedTags = function () {
      var tags = [];
      _.each($scope.tagSelection, function (fullTag) {
        var matchingTag = _.find(customerTags, function (matchTag) {
          return matchTag.label === fullTag;
        });
        if (matchingTag) {
          tags.push(matchingTag.data);
        }
      });
      return tags;
    };

    /*
     * @getRecipients
     * - compile recipients to save to campaign
     */
    $scope.getRecipients = function () {

      var fullContacts = [];

      //get the tags that have been selected
      var tags = $scope.getSelectedTags();

      //loop through customers and add if one of the tags matches

      _.each($scope.customers, function (customer) {
        if (customer.tags && customer.tags.length > 0) {
          var tagExists = _.intersection(customer.tags, tags);
          if (tagExists.length > 0) {
            if (!$scope.eliminateDuplicate(customer))
              fullContacts.push(customer);
          }
        } else {
          if (tags.indexOf('nt') > -1) {
            if (!$scope.eliminateDuplicate(customer))
              fullContacts.push(customer);
          }
        }

        //add customers from individual

        if ($scope.selectedCustomers.individuals.indexOf(customer._id) > -1) {
          fullContacts.push(customer);
        }
      });

      return fullContacts;
    };

     $scope.contactTags = function (customer) {
       return CustomerService.contactTags(customer);
     };

    /*
     * @checkContactExists
     * - 
     */
    $scope.checkContactExists = function (email) {
      var matchingRecipient = _.find($scope.recipients, function (recipient) {
        if (recipient.details && recipient.details[0] && recipient.details[0].emails && recipient.details[0].emails[0] && recipient.details[0].emails[0].email) {
          return (recipient.details[0].emails[0].email).toLowerCase() === email.text;
        }
      });
      var matchingContact = _.find($scope.customers, function (customer) {
        if (customer.details && customer.details[0] && customer.details[0].emails && customer.details[0].emails[0] && customer.details[0].emails[0].email) {
          return (customer.details[0].emails[0].email).toLowerCase() === email.text;
        }
      });
      if (matchingRecipient || matchingContact) {
        return false;
      }

      return true;
    };

    /*
     * @createCustomerData
     * - stub out customer data
     */
    $scope.createCustomerData = function (email) {
      // New customer
      var customer = {
        details: [{
          emails: []
        }]
      };

      customer.details[0].emails.push({
        email: email
      });
      return customer;
    };

    /*
     * @checkAndCreateCustomer
     * - check email addresses entered and create new customer/contact
     */
    $scope.checkAndCreateCustomer = function (fn) {
      var contactsArr = [];
      var promises = [];
      if ($scope.selectedCustomers.newEmails) {
        var _emails = $scope.selectedCustomers.newEmails;
        _.each(_emails, function (email) {
          var contact = _.findWhere($scope.customers, {
            email: email.text
          });
          if (!contact) {
            var tempCustomer = $scope.createCustomerData(email.text);
            promises.push(CustomerService.createCustomer(tempCustomer));
          } else {
            contactsArr.push(contact._id);
          }
        });
      }

      if (promises.length) {
        $q.all(promises)
          .then(function (data) {
            _.each(data, function (value) {
              contactsArr.push(value.data._id);
            });
            fn(contactsArr);
          })
          .catch(function (err) {
            console.error(err);
          });
      } else {
        fn(contactsArr);
      }
    };

    /*
     * @activateCampaign
     * - set campaign to 'RUNNING' then call saveOrUpdateCampaign
     * - update navigation function
     */
    $scope.activateCampaign = function () {
      $scope.newCampaignObj.status = 'RUNNING';
      $scope.navigateOnSave = function() { 
        $timeout(function() {
          window.location = '/admin/#/marketing/campaigns';
        }, 750);
      };
      if ($scope.newCampaignObj._id) {
        $scope.saveOrUpdateCampaign(true);
      } else {
        $scope.saveOrUpdateCampaign(false);
      }
    };

    /*
     * @saveOrUpdateCampaign
     * - save or update campaign based on new campaign or existing
     */
    $scope.saveOrUpdateCampaign = function (update) {
      //add new email if exists
      $scope.saveLoading = true;
      $scope.changesConfirmed = true;
      var actionFn = update ? 'updateCampaign' : 'createCampaign';
      var stepSettings = $scope.newCampaignObj.steps[0].settings;

      //add contacts if new
      $scope.checkAndCreateCustomer(function (createdContactsArr) {
        $scope.addContacts(createdContactsArr);
        if (!stepSettings.emailId) {
          WebsiteService.createEmail($scope.emailToSend, function (newEmail) {
            $scope[actionFn](newEmail);
          });
        } else {
          $scope[actionFn]($scope.emailToSend);
        }
      });
    };

    /*
     * @createCampaign
     * - 
     */
    $scope.createCampaign = function (newEmail) {

      //set/format email and send date
      $scope.setEmail(newEmail);
      $scope.setDate();
      $scope.setTagsOnCampaign();

      //add campaign
      CampaignService.createCampaign($scope.newCampaignObj, $scope.savedSuccess);

    };

    /*
     * @updateCampaign
     * - 
     */
    $scope.updateCampaign = function (newEmail) {
      
      //set/format email and send date
      $scope.setEmail(newEmail);
      $scope.setDate();
      $scope.setTagsOnCampaign();

      //remove any contacts that were marked for removal
      $scope.removeContactsFromCampaign();

      //update campaign
      CampaignService.updateCampaign($scope.newCampaignObj, $scope.savedSuccess);
    };

    /*
     * @savedSuccess
     * - callback on create or update success
     * - navigate to next page
     */
    $scope.savedSuccess = function(_newCampaign) {
      $scope.saveLoading = false;
      toaster.pop('success', 'Campaign updated successfully');
      $scope.originalCampaignObj = _newCampaign;
      $scope.newCampaignObj = _newCampaign;
      $scope.emails = [];
      $scope.navigateOnSave();
    };

    /*
     * @setTagsOnCampaign
     * - set selected tags on 'contacts' property of campaign obj
     */
    $scope.setTagsOnCampaign = function() {
      $scope.newCampaignObj.contactTags = $scope.getSelectedTags();
    };

    /*
     * @addContacts
     * - 
     */
    $scope.addContacts = function(createdContactsArr, fn) {
      //get an array of contact Ids from recipients
      var recipientsIdArr = [];

      _.each($scope.recipients, function (recipient) {
        if (recipient._id) {
          recipientsIdArr.push(recipient._id);
        }
      });

      //add created contacts to recipients array
      if (createdContactsArr.length > 0) {
        _.each(createdContactsArr, function (createdContactId) {
          if (recipientsIdArr.indexOf(createdContactId) < 0) {
            recipientsIdArr.push(createdContactId);
          }
        });
      }

      var contactsArr = recipientsIdArr;

      $scope.newCampaignObj.contacts = contactsArr;
    };

    /*
     * @removeContactsFromCampaign
     * - cancel campaign for contacts marked for removal
     */
    $scope.removeContactsFromCampaign = function() {
      angular.forEach($scope.recipientsToRemove, function(contactId) {
        CampaignService.cancelCampaignForContact($scope.newCampaignObj, contactId, function() {
          console.log('removed ' + contactId);
        });
      });
      _.each($scope.removeContactsFromCampaign, function(id) {
        console.log('remove ' + id);
        console.log(_.indexOf($scope.newCampaignObj.contacts, id));
      });
    };

    /*
     * @setEmail
     * - set email-related data
     */
    $scope.setEmail = function(newEmail) {
      if (newEmail) {
        var stepSettings = $scope.newCampaignObj.steps[0].settings;
        stepSettings.emailId = newEmail._id;
        stepSettings.fromEmail = newEmail.fromEmail;
        stepSettings.fromName = newEmail.fromName;
        stepSettings.replyTo = newEmail.replyTo;
        stepSettings.subject = newEmail.subject;
      }
    };

    /*
     * @setDate
     * - set date data
     */
    $scope.setDate = function() {
      var sendAt = $scope.newCampaignObj.steps[0].settings.sendAt;
      var delivery = moment.utc($scope.delivery.date)//.add(moment().utcOffset(), 'minutes');
      sendAt.year = moment.utc(delivery).get('year');
      sendAt.month = moment.utc(delivery).get('month') + 1;
      sendAt.day = moment.utc(delivery).get('date');
      sendAt.hour = moment.utc(delivery).get('hour');
      sendAt.minute = moment.utc(delivery).get('minute');
      console.log(sendAt);
    };

    /*
     * @checkCampaignNameExists
     */
    $scope.checkCampaignNameExists = function () {
      var exists = false;
      if ($scope.checkingCampaignName) {
        exists = true;
      }
      if ($scope.campaignNameExists) {
        exists = true;
      }
      return exists;
    };

    /*
     * @checkNewRecipients
     * - check for recipients added
     */
    $scope.checkNewRecipients = function () {
      var returnValue = false;
      if ($scope.selectedCustomers.newEmails && $scope.selectedCustomers.newEmails.length)
        returnValue = true;
      return returnValue;
    };

    /*
     * @validateStep
     * - check for required fields
     */
    $scope.validateStep = function (i, valid) {
      if (valid) {
        if (i === 2 && (!$scope.newCampaignObj.name || $scope.checkCampaignNameExists()))
          valid = false;
        else if (i === 3 && (!$scope.emailToSend.title || $scope.emailTitleExists))
          valid = false;
        else if (i === 4 && ($scope.newCampaignObj.type == 'onetime' && !$scope.recipients.length && !$scope.checkNewRecipients()))
          valid = false;
        else if (i === 5 && $scope.whenToSend === 'later' && $scope.newCampaignObj.type === 'onetime') {
          $scope.updateTime();
          if ($scope.invalidDate)
            valid = false;
        }
      }
      return valid;
    }

    /*
     * @ValidateBeforeProceed
     * - check for valid current step
     */
    $scope.ValidateBeforeProceed = function (i) {
      var index = 2;
      var valid = true;
      if (i >= 2) {
        while (index <= i && index >= 2) {
          valid = $scope.validateStep(index, valid);
          if (valid)
            index++;
          else
            index = 0;
        }
      }
      if (!valid) {
        errorMessage(i);
        valid = false;
      }
      return valid;
    }

    /*
     * @toggleSelection
     * - toggle selected contact tags
     */
    $scope.toggleSelection = function (tagName) {
      var idx = $scope.tagSelection.indexOf(tagName);

      // is currently selected
      if (idx > -1) {
        $scope.tagSelection.splice(idx, 1);
      } else {
        $scope.tagSelection.push(tagName);
      }
      $scope.recipients = $scope.getRecipients();
    };

    $scope.currentStep = 1;
    
    /*
     * @form
     * - Initial Value
     */
    $scope.form = {
      next: function () {
        var i = $scope.currentStep + 1;
        var valid = $scope.ValidateBeforeProceed(i);
        if (valid) {
          $scope.goingTo = 'next';
          $scope.toTheTop();
          nextStep();
          $scope.updateSendNow($scope.whenToSend);
        }
      },
      prev: function () {
        $scope.goingTo = 'prev';
        $scope.toTheTop();
        prevStep();
        $scope.updateSendNow($scope.whenToSend);
      },
      goTo: function (i) {
        var valid = true;
        //validate first step
        console.log('$scope.newCampaignObj.name ', $scope.newCampaignObj.name);
        console.log('$scope.newCampaignObj.type ', $scope.newCampaignObj.type);
        var valid = $scope.ValidateBeforeProceed(i);
        if (valid) {
          $scope.toTheTop();
          goToStep(i);
          $scope.updateSendNow($scope.whenToSend);
        }
      },
      submit: function () {
        console.log('submit');
      },
      reset: function () {
        console.log('reset');
      }
    };

    /*
     * @createDuplicateCampaign
     * - TODO: check name exists
     */
    $scope.createDuplicateCampaign = function (newCampaign) {
      if ($scope.newCampaignObj._id) {
        CampaignService.duplicateCampaign($scope.newCampaignObj._id, newCampaign,function(data) {
          
          $timeout(function() {
            $scope.closeModal();
          }, 0);
          
          if (data._id) {

            $timeout(function() {
              window.location = '/admin/#/marketing/campaigns/' + data._id;
            }, 1000);
          
          }

        });
      } else {
        toaster.pop('error', 'Error', 'Please save this campaign before duplicating');
      }
    };

    /*
     * @saveCampaign
     * - if pending changes, kick off save flow
     * - if navigating to new url, show alert
     * - validate/check and call saveOrUpdateCampaign
     */
    $scope.saveCampaign = function (_url) {
      $scope.changesConfirmed = true;
      if ($scope.pendingChanges()) {
        var save = function() {
          if (!$scope.newCampaignObj._id) {
            CampaignService.checkCampaignNameExists($scope.newCampaignObj.name, function (exists) {
                $scope.saveOrUpdateCampaign(false);
            });
          } else {
            $scope.saveOrUpdateCampaign(true);
          }
        }
        
        $scope.saveLoading = true;

        //preserve intended navigation
        if (_url) {
          $scope.navigateURL = _url;
          $scope.navigateOnSave = function() { 
            $timeout(function() {
              $window.location = $scope.navigateURL 
            }, 750);
          };
          
          SweetAlert.swal({
            title: "You have unsaved changes.",
            text: "Do you want to save pending changes to this campaign?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, save it!",
            cancelButtonText: "No, do not save.",
            closeOnConfirm: true,
            closeOnCancel: true
          }, function (isConfirm) {
            if (isConfirm) {
              $scope.changesConfirmed = true;
              save();
            }
          });
        } else {
          $scope.navigateOnSave = function() { 
            $timeout(function() {
              window.location = '/admin/#/marketing/campaigns';
            }, 750);
          };
          if ($scope.validateStep($scope.currentStep + 1, true)) {
            save();
          } else {
            $scope.saveLoading = false;
            toaster.pop('error', 'Error', 'Please complete the form in this step before proceeding');
          }
        }
      }
      
    };

    /*
     * @deleteCampaign
     * - TODO: API updates to support deleting campaign
     */
    $scope.deleteCampaign = function() {
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Do you want to delete this campaign?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete campaign!",
        cancelButtonText: "No, do not delete campaign!",
        closeOnConfirm: false,
        closeOnCancel: false
      },
      function (isConfirm) {
        if (isConfirm) {
          SweetAlert.swal("Saved!", "Campaign is deleted.", "success");
          CampaignService.deleteCampaign($scope.newCampaignObj._id, function(data) {
            toaster.pop('success', "Campaign Deleted", "The " + $scope.newCampaignObj.name + " campaign was deleted successfully.");
            $scope.closeModal();
            $timeout(function () {
              window.location = '/admin/#/marketing/campaigns';
            }, 500)
          });
        } else {
          SweetAlert.swal("Cancelled", "Campaign not deleted.", "error");
        }
      });
    };

    /*
     * @locationChangeStart
     * - Before user leaves editor, ask if they want to save changes
     */
    var offFn = $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
      if (!$scope.changesConfirmed) {
        $scope.saveCampaign(newUrl);
      }
    });

    /*
     * @setBusinessDetails
     * - set any filled out info from business data
     */
    $scope.setBusinessDetails = function() {
      var account = $scope.account;
      var logo = account.business.logo || '<h2>Logo Here</h2>';
      var businessName = account.business.name || 'Edit name';
      var fromEmail = account.business.emails[0].email || 'Edit email';

      if ($scope.emailToSend) {
        if (logo.indexOf('http') != -1 && $scope.emailToSend.components[0].logo == '<h2>Logo Here</h2>') {
          $scope.emailToSend.components[0].logo = '<img src="' + account.business.logo + '"/>';
          $scope.emailToSendCopy.components[0].logo = '<img src="' + account.business.logo + '"/>';
        }
        if (businessName && $scope.emailToSend.fromName == '') {
          $scope.emailToSend.fromName = account.business.name;
          $scope.emailToSendCopy.fromName = account.business.name;
        }
        if (fromEmail && $scope.emailToSend.fromEmail == '') {
          $scope.emailToSend.fromEmail = account.business.emails[0].email;
          $scope.emailToSendCopy.fromEmail = account.business.emails[0].email;
        }
        if (fromEmail && $scope.emailToSend.replyTo == '') {
          $scope.emailToSend.replyTo = account.business.emails[0].email;
          $scope.emailToSendCopy.replyTo = account.business.emails[0].email;
        }
      }
    };

    /*
     * @getAccount
     * - get account and autofill new email details
     */

    $scope.getAccount = function() {
      var promise = AccountService.getAccount(function (_account) {
        $scope.account = _account;
        $scope.setBusinessDetails();
      });
      return promise;
    };

    /*
     * @getEmails
     * - get all emails for this user, then...
     * - find selected email for this campaign by id
     */
    $scope.getEmails = function() {
      
      var promise = WebsiteService.getEmails(false, function (_emails) {
        var emailId = $scope.newCampaignObj.steps[0].settings.emailId;
        var matchedEmail = null;
        var emailMatch = function(email) {
          return email._id === emailId;
        };

        $scope.emails = _emails;
        $scope.originalEmails = angular.copy(_emails);
        
        matchedEmail = $scope.emails.filter(emailMatch)[0];
        if (emailId && matchedEmail) {
          $scope.emailToSend = matchedEmail;
          $scope.originalEmailToSend = angular.copy($scope.emailToSend);
        } else {
          console.log('email not found');
        }

        $scope.emailToSendPrevious = $scope.emails[0];

      });

      return promise;
    };

    /*
     * @getCampaign
     * - get saved campaign data, then...
     * - set selected email to template since we've saved the email already
     * - if onetime campaign, set send-date data
     * - set editable mode
     */
    $scope.getCampaign = function() {
      
      var promise = CampaignService.getCampaign($stateParams.campaignId, function (data) {
          
          var sendAtDateISOString = moment.utc(data.steps[0].settings.sendAt).subtract('months', 1).toISOString();
          var localMoment = moment(sendAtDateISOString);

          $scope.originalCampaignObj = angular.copy(data);
          $scope.newCampaignObj = data;
          $scope.selectedEmail = {
            type: 'template'
          };

          if ($scope.newCampaignObj.type === 'onetime') {
            //if valid date and in future, set 'later'
            if (localMoment.isValid() && localMoment.isAfter(moment()) || !$scope.isEditable) {
              $scope.whenToSend = 'later';
              // $scope.delivery.time = moment.utc(sendAtDateObj).add(moment().utcOffset(), 'minutes');
              $scope.delivery.date = localMoment;
              $scope.delivery.originalDate = angular.copy(localMoment);
            }
          }

          $scope.setEditable();
      });

      return promise;
    };

    /*
     * @getContacts
     * - get saved customers attached to this campaign
     */
    $scope.getContacts = function() {
      var promise = CampaignService.getCampaignContacts($stateParams.campaignId, function (data) {
          $scope.originalRecipients = angular.copy(data);
          $scope.recipients = data;
          $scope.selectedCustomers.individuals = data;
      });
      return promise;
    };

    /*
     * @getCustomers
     * - get all customers for this user
     */
    $scope.getCustomers = function() {
      var promise = CustomerService.getCustomers(function (customers) {
        _.each(customers, function (customer, index) {

          if (!$scope.checkBestEmail(customer)) {
            customers.splice(index, 1);
          }
        });
        $scope.customers = customers;
        var _tags = [];
        _.each(customers, function (customer) {
          customer.fullName = customer.first + " " + customer.last || '';
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

      return promise;
    };

    /*
     * @loadSavedTags
     * - loop through saved tags and apply to data that drives the tag checkbox
     */
    $scope.loadSavedTags = function() {
      _.each($scope.newCampaignObj.contactTags, function(tag) {
        var tag = _.findWhere($scope.customerCounts, { uniqueTag: tag });
        $scope.toggleSelection(tag.matchingTag);
      });
    };

    /*
     * @pendingChanges
     * - check for changes in the data
     */
    $scope.pendingChanges =  function() {
      return (
        (!angular.equals($scope.originalCampaignObj, $scope.newCampaignObj)) ||
        (!angular.equals($scope.originalRecipients, $scope.recipients)) ||
        (!angular.equals([], $scope.selectedCustomers.newEmails)) ||
        (!angular.equals($scope.originalEmailToSend, $scope.emailToSend)) ||
        (!angular.equals($scope.delivery.originalDate, $scope.delivery.date))
      )
    };

    /*
     * @setEditable
     * - set mode based on campaign status
     */
    $scope.setEditable = function() {
      if ($scope.newCampaignObj.status.toLowerCase() === 'draft' || $scope.newCampaignObj.status.toLowerCase() === 'pending') {
        $scope.isEditable = true;
      }
    };

    /*
     * @setCampaignType
     * - set 'onetime' or 'autoresponder'
     * - TODO: when we have more triggers, should set selected triggers
     */
    $scope.setCampaignType = function(type) {
      $scope.newCampaignObj.type = type;
      if (type === 'autoresponder') {
        $scope.newCampaignObj.steps[0].trigger = 'SIGNUP';
      } else {
        $scope.newCampaignObj.steps[0].trigger = null;
      }
    };

    /*
     * @init
     * - Set page context (if creating or loading existing campaign).
     */
    $scope.init = (function(){

      if($stateParams.campaignId) {
        $scope.getCampaign().then(function(data) {
          return $scope.getEmails();
        }).then(function(data) {
          return $scope.getAccount();
        }).then(function(data) {
          return $scope.getContacts();
        }).then(function(data) {
          return $scope.getCustomers();
        }).then(function(data) {
          $scope.loadSavedTags();
        });
      } else {
        $scope.setEditable();
        $scope.getEmails();
        $scope.getAccount();
        $scope.getCustomers();
      }

    })();

  }]);

  app.filter('propsFilter', function () {
    return function (items, props) {
      var out = [];

      if (angular.isArray(items)) {
        items.forEach(function (item) {
          var itemMatches = false;

          var keys = Object.keys(props);
          var i = 0;
          for (i; i < keys.length; i++) {
            if (item[keys[i]] && item[keys[i]].toString().toLowerCase().indexOf(props[keys[i]].toLowerCase()) !== -1) {
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
