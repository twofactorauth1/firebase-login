'use strict';
/*global app, angular, moment*/
(function (angular) {
  app.controller('CreateCampaignCtrl', ["$scope", "$rootScope", "$modal", "$location", "$window", "$stateParams", "toaster", "$timeout", "CampaignService", "CustomerService", "CommonService", "editableOptions", "AccountService", "userConstant", "WebsiteService", "$q", "formValidations", "SweetAlert", function ($scope, $rootScope, $modal, $location, $window, $stateParams, toaster, $timeout, CampaignService, CustomerService, CommonService, editableOptions, AccountService, userConstant, WebsiteService, $q, formValidations, SweetAlert) {

    editableOptions.theme = 'bs3';

    $scope.navigateOnSave = null;
    $scope.whenToSend = 'now';
    $scope.selectedEmail = {
      type: 'new'
    };
    $scope.tableView = 'list';
    $scope.emailValidation = formValidations.email;
    $scope.delivery = {
      date: moment(),
      time: moment(),
      minDate: new Date()
    };

    $scope.triggers = [{
      name: 'Sign Up',
      icon: 'fa-paper-plane',
      value: 'SIGNUP'
    }];

    $scope.emails = [];

    if ($scope.isEditable && $scope.watchDeliveryDate) {
      $scope.$watch('delivery.date', function() {
        if ($scope.emails.length) {
          $scope.setDate();
        }
      });
    }

    $scope.formatDate = function (date) {
      return moment(date).format("dddd, MMMM Do YYYY, h:mm A");
    };

    $scope.updateSendNow = function (value) {
      $scope.whenToSend = value;
      $scope.watchDeliveryDate = true;
      if ($scope.whenToSend !== 'later') {
        $scope.delivery.date = moment();
        $scope.delivery.time = moment();
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
    $scope.originalRecipients = 
    $scope.recipientsToRemove = [];

    $scope.newCampaign = {};

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
      "subject": "",
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
      var time = moment($scope.delivery.time);
      var date = moment($scope.delivery.date);
      var hour = time.get('hour');
      var minute = time.get('minute');
      var formatted = date.set('hour', hour).set('minute', minute);
      if (formatted && formatted._d.toString() === "Invalid Date") {
        $scope.invalidDate = true;
      } else {
        $scope.delivery.date = formatted;
      }

      if ($scope.delivery.date.diff && $scope.delivery.date.diff(moment(), "minutes") < 0) {
        $scope.invalidDate = true;
      } else {
        $scope.invalidDate = false;
      }

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
          "sendAt": {
            "year": 2015,
            "month": 8,
            "day": 13,
            "hour": 5,
            "minute": 35
          },
        }
      }]
    };

    $scope.originalCampaignObj = angular.copy($scope.newCampaignObj);

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
        size: _size || 'md',
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
        if (word[0] !== word[0].toUpperCase()) {
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

    $scope.changeCurrentEmail = function (selectedEmail) {
      $scope.emailToSend = selectedEmail;
    };

    $scope.checkCampaignName = function (_name) {
      $scope.checkingCampaignName = true;
      CampaignService.checkCampaignNameExists(_name, function (exists) {
        $scope.campaignNameChecked = true;
        $scope.checkingCampaignName = false;
        $scope.campaignNameExists = exists;
        $scope.emailToSend.title = _name + ' Email Template';
        $scope.emailToSend.subject = "Test - " + _name;
        $scope.checkEmailTitle($scope.emailToSend.title);
      });
    };

    $scope.checkEmailTitle = function (_name) {
      if ($scope.selectedEmail.type === 'new') {
        $scope.checkingEmailTitle = true;
        var exists = _.findWhere($scope.originalEmails, {
          title: _name
        });
        $scope.emailTitleExists = exists ? true : false;
      } else
        $scope.emailTitleExists = false;

      $scope.emailTitleChecked = true;
      $scope.checkingEmailTitle = false;
    };

    $scope.clearEmail = function (newEmail) {
      $scope.checkingEmailTitle = false;
      $scope.emailToSend.title = "";
      if (newEmail) {
        $scope.emailToSend = $scope.emailToSendCopy;
      }
    }

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

    $scope.manualEmailsEntered = function () {
      var splits = $scope.selectedCustomers.newEmails.split(',');
      var validatedEmails = [];
      _.each(splits, function (split) {
        var nospaces = split.replace(' ', '');
        if (nospaces.length > 0 && $scope.validateEmail(split)) {
          validatedEmails.push(split);
        }
      });
      $scope.newContactsLength = validatedEmails.length;
    };

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

    $scope.eliminateDuplicates = function (customer) {
      return $scope.selectedCustomers.individuals.indexOf(customer._id) > -1;
    }

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
    }

    $scope.getRecipients = function () {

      var fullContacts = [];

      //get the tags that have been selected
      var tags = $scope.getSelectedTags();

      //loop through customers and add if one of the tags matches

      _.each($scope.customers, function (customer) {
        if (customer.tags && customer.tags.length > 0) {
          var tagExists = _.intersection(customer.tags, tags);
          if (tagExists.length > 0) {
            if (!$scope.eliminateDuplicates(customer))
              fullContacts.push(customer);
          }
        } else {
          if (tags.indexOf('nt') > -1) {
            if (!$scope.eliminateDuplicates(customer))
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

    $scope.activateCampaign = function () {
      $scope.newCampaignObj.status = 'RUNNING';
      $scope.navigateOnSave = function() { window.location = '/admin/#/marketing/campaigns' };
      if ($scope.newCampaignObj._id) {
        $scope.saveOrUpdateCampaign(true);
      } else {
        $scope.saveOrUpdateCampaign(false);
      }
    };

    $scope.saveOrUpdateCampaign = function (update) {
      //add new email if exists
      $scope.saveLoading = true;
      $scope.changesConfirmed = true;
      var actionFn = update ? 'updateCampaign' : 'createCampaign';
      var stepSettings = $scope.newCampaignObj.steps[0].settings;


      if (!stepSettings.emailId) {
        WebsiteService.createEmail($scope.emailToSend, function (newEmail) {
          $scope[actionFn](newEmail);
        });
      } else {
        $scope[actionFn]($scope.emailToSend);
      }
    };

    $scope.createCampaign = function (newEmail) {

      //set/format email and send date
      $scope.setEmail(newEmail);
      $scope.setDate();

      //add campaign
      CampaignService.createCampaign($scope.newCampaignObj, function (_newCampaign) {

        //add contacts if new
        $scope.checkAndCreateCustomer(function (createdContactsArr) {
          $scope.addNewContacts(createdContactsArr, _newCampaign, 'Campaign created successfully');
        });

      });
    };

    $scope.updateCampaign = function (newEmail) {
      
      //set/format email and send date
      $scope.setEmail(newEmail);
      $scope.setDate();

      //update campaign
      CampaignService.updateCampaign($scope.newCampaignObj, function (_newCampaign) {

        //add contacts if new
        $scope.checkAndCreateCustomer(function (createdContactsArr) {
          $scope.addNewContacts(createdContactsArr, _newCampaign, 'Campaign updated successfully');
        });

        //remove any contacts previously added
        $scope.removeContactsFromCampaign();

      });
    };

    $scope.addNewContacts = function(createdContactsArr, _newCampaign, msg) {
      //get an array of contact Ids from recipients
      var recipientsIdArr = [];

      _.each($scope.recipients, function (recipient) {
        if (recipient._id) {
          recipientsIdArr.push(recipient._id);
        }
      });

      //add created contacts to recipeints array
      if (createdContactsArr.length > 0) {
        _.each(createdContactsArr, function (createdContactId) {
          if (recipientsIdArr.indexOf(createdContactId) < 0) {
            recipientsIdArr.push(createdContactId);
          }
        });
      }

      var contactsArr = recipientsIdArr;

      //bulk add contacts to campaign
      CampaignService.bulkAddContactsToCampaign(contactsArr, _newCampaign._id, function (success) {
        //show success
        $scope.saveLoading = false;
        toaster.pop('success', msg);
        $scope.originalCampaignObj = _newCampaign;
        $scope.newCampaignObj = _newCampaign;
        $scope.navigateOnSave();
      });
    };

    $scope.removeContactsFromCampaign = function() {
      angular.forEach($scope.recipientsToRemove, function(contactId) {
        CampaignService.cancelCampaignForContact($scope.newCampaignObj, contactId, function() {
          console.log('removed ' + contactId);
        });
      });
    };

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

    $scope.setDate = function() {
      var sendAt = $scope.newCampaignObj.steps[0].settings.sendAt;
      var delivery = moment($scope.delivery.date);
      sendAt.year = moment(delivery).get('year');
      sendAt.month = moment(delivery).get('month') + 1;
      sendAt.day = moment(delivery).get('date');
      sendAt.hour = moment(delivery).get('hour');
      sendAt.minute = moment(delivery).get('minute');
    };

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


    $scope.checkNewRecipients = function () {
      var returnValue = false;
      if ($scope.selectedCustomers.newEmails && $scope.selectedCustomers.newEmails.length)
        returnValue = true;
      return returnValue;
    };

    $scope.validateStep = function (i, valid) {
      if (valid) {
        if (i === 2 && (!$scope.newCampaignObj.name || $scope.checkCampaignNameExists()))
          valid = false;
        else if (i === 3 && (!$scope.emailToSend.title || $scope.emailTitleExists))
          valid = false;
        else if (i === 4 && !$scope.recipients.length && !$scope.checkNewRecipients())
          valid = false;
        else if (i === 5 && $scope.whenToSend === 'later') {
          $scope.updateTime();
          if ($scope.invalidDate)
            valid = false;
        }
      }
      return valid;
    }

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

    // toggle selection
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
    // Initial Value
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

    $scope.createDuplicateCampaign = function (newCampaign) {
      if ($scope.newCampaignObj._id) {
        CampaignService.duplicateCampaign($scope.newCampaignObj._id, newCampaign,function(data) {
          $scope.closeModal();
          if (data._id) {
            window.location = '/admin/#/marketing/campaigns/' + data._id;
          }
        });
      } else {
        toaster.pop('error', 'Error', 'Please save this campaign before duplicating');
      }
    };

    $scope.saveCampaign = function (_url) {
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
          $scope.navigateOnSave = function() { $window.location.href = $scope.navigateURL };
          
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
          $scope.navigateOnSave = function() { window.location = '/admin/#/marketing/campaigns' };
          if ($scope.validateStep($scope.currentStep + 1, true)) {
            save();
          } else {
            toaster.pop('error', 'Error', 'Please complete the form in this step before proceeding');
          }
        }
      }
      
    };

    /*
     * @locationChangeStart
     * - Before user leaves editor, ask if they want to save changes
     */
    $scope.changesConfirmed = false;
    var offFn = $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
      if (!$scope.changesConfirmed) {
        $scope.saveCampaign(newUrl);
      }
    });


    /*
     * @getAccount
     * - get account and autofill new email details
     */

    $scope.getAccount = function() {
      var promise = AccountService.getAccount(function (_account) {
        if ($scope.emailToSend && !$scope.emailToSend._id) {
          if (_account.business.logo) {
            $scope.emailToSend.components[0].logo = '<img src="' + _account.business.logo + '"/>';
          }
          if (_account.business.name) {
            $scope.emailToSend.fromName = _account.business.name;
          }
          if (_account.business.emails[0].email) {
            $scope.emailToSend.fromEmail = _account.business.emails[0].email;
            $scope.emailToSend.replyTo = _account.business.emails[0].email;
          }
        }
      });
      return promise;
    };

    $scope.getEmails = function() {
      
      var promise = WebsiteService.getEmails(false, function (_emails) {
        var emailId = $scope.newCampaignObj.steps[0].settings.emailId;
        var emailMatch = function(email) {
          return email._id === emailId;
        };

        $scope.emails = _emails;
        $scope.originalEmails = angular.copy(_emails);
        
        if (emailId) {
          $scope.emailToSend = $scope.emails.filter(emailMatch)[0];
        }

      });

      return promise;
    };

    $scope.getCampaign = function() {
      
      var promise = CampaignService.getCampaign($stateParams.campaignId, function (data) {
          
          var sendAtDateObj = data.steps[0].settings.sendAt;
          
          $scope.originalCampaignObj = angular.copy(data);
          $scope.newCampaignObj = data;
          $scope.selectedEmail = {
            type: 'template'
          };

          if (moment(sendAtDateObj).isValid()) {
            $scope.whenToSend = 'later';
            $scope.delivery.time = moment(sendAtDateObj);
            $scope.delivery.date = moment(sendAtDateObj).subtract('months', 1);
          }

          $scope.setEditable();
      });

      return promise;
    };

    $scope.getContacts = function() {
      var promise = CampaignService.getCampaignContacts($stateParams.campaignId, function (data) {
          $scope.originalRecipients = angular.copy(data);
          $scope.recipients = data;
          $scope.selectedCustomers.individuals = data;
      });
      return promise;
    };

    $scope.pendingChanges =  function() {
      return (
        (!angular.equals($scope.originalCampaignObj, $scope.newCampaignObj)) ||
        (!angular.equals($scope.originalRecipients, $scope.recipients))
      )
    };

    $scope.setEditable = function() {
      if ($scope.newCampaignObj.status.toLowerCase() === 'draft' || $scope.newCampaignObj.status.toLowerCase() === 'pending') {
        $scope.isEditable = true;
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
          console.log(data);
        });
      } else {
        $scope.setEditable();
        $scope.getEmails();
        $scope.getAccount();
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
