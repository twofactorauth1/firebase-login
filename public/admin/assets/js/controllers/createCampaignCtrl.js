'use strict';
/*global app, angular, moment*/
(function (angular) {
  app.controller('CreateCampaignCtrl', ["$scope", "$modal", "$location", "toaster", "$timeout", "CampaignService", "CustomerService", "CommonService", "editableOptions", "AccountService", "userConstant", "WebsiteService", "$q", "formValidations", function ($scope, $modal, $location, toaster, $timeout, CampaignService, CustomerService, CommonService, editableOptions, AccountService, userConstant, WebsiteService, $q, formValidations) {

    editableOptions.theme = 'bs3';

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

    $scope.formatDate = function (date) {
      return moment(date).format("dddd, MMMM Do YYYY, h:mm A");
    };

    $scope.updateSendNow = function () {
      $scope.delivery.date = moment();
      $scope.delivery.time = moment();
    };


    $scope.hstep = 1;
    $scope.mstep = 15;

    $scope.options = {
      hstep: [1, 2, 3],
      mstep: [1, 5, 10, 15, 25, 30]
    };

    $scope.ismeridian = true;

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

    /*
     * @defaultNewEmail
     * - default new email to show for initial design unless user selects template
     */

    $scope.emailToSend = {
      "title": "",
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

    $scope.component = $scope.emailToSend.components[0];

    $scope.updateTime = function () {
      var time = moment($scope.delivery.time);
      var date = moment($scope.delivery.date);
      var hour = time.get('hour');
      var minute = time.get('minute');
      var formatted = date.set('hour', hour).set('minute', minute);
      $scope.delivery.date = formatted;
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
      "status": "draft",
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

    $scope.sendTestEmail = function (_email) {
      WebsiteService.sendTestEmail(_email, $scope.emailToSend, function (data) {
        if(data && data[0] && data[0]._id)
        {
          $scope.closeModal();
          toaster.pop('success', 'Test Email sent successfully');
        }
        console.log('test send status ', data);
      });
    };

    $scope.openModal = function (template) {
      $scope.modalInstance = $modal.open({
        templateUrl: template,
        scope: $scope
      });
      $scope.modalInstance.result.finally($scope.closeModal());
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

    /*
     * @getAccount
     * - get account and autofill new email details
     */

    AccountService.getAccount(function (_account) {
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
    });

    WebsiteService.getEmails(function (_emails) {
      $scope.emails = _emails;
      $scope.originalEmails = angular.copy(_emails);
    });

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
        $scope.emailToSend.subject = _name;
        $scope.checkEmailTitle($scope.emailToSend.title);
      });
    };

    $scope.checkEmailTitle = function (_name) {
      if($scope.selectedEmail.type === 'new')
      {
        $scope.checkingEmailTitle = true;
        var exists = _.findWhere($scope.originalEmails, {
          title: _name
        });
        $scope.emailTitleExists = exists ? true : false;
      }
      else
        $scope.emailTitleExists = false;
      
      $scope.emailTitleChecked = true;
      $scope.checkingEmailTitle = false;
    };

    $scope.clearEmail = function()
    {
      $scope.checkingEmailTitle = false;
      $scope.emailToSend.title = "";
    }

    $scope.customerSelected = function (select) {
      var selected = select.selected[select.selected.length - 1];

      var existingContact = _.find($scope.recipients, function (recipient) {
        return recipient._id === selected._id;
      });
      if (!existingContact) {
        $scope.recipients.push(selected);
      }
      // clear search text
      select.search = '';
    };

    $scope.customerRemoved = function (select, selected) {
      var existingContactIndex;
      var contact = _.findWhere($scope.recipients, {
        _id: selected._id
      });
      if(contact)
        existingContactIndex = _.indexOf($scope.recipients, contact);

      if (existingContactIndex > -1) {
        $scope.recipients.splice(existingContactIndex, 1);
      }
      // clear search text
      select.search = '';
    };

    $scope.selectedCustomers = {
      individuals: []
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
      if($scope.currentStep < i && (i - $scope.currentStep > 1 ))
      {
        toaster.pop('error', 'Error', 'Please complete the previous steps before proceeding');  
      }
      else
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


    // selected tags
    $scope.tagSelection = [];
    $scope.recipients = [];

    $scope.eliminateDuplicates = function(customer)
    {          
      return $scope.selectedCustomers.individuals.indexOf(customer._id) > -1;
    }

    $scope.getRecipients = function () {

      var fullContacts = [];

      //get the tags that have been selected
      var tags = [];
      _.each($scope.tagSelection, function (fullTag) {
        var matchingTag = _.find(customerTags, function (matchTag) {
          return matchTag.label === fullTag;
        });
        if (matchingTag) {
          tags.push(matchingTag.data);
        }
      });

      //loop through customers and add if one of the tags matches

      _.each($scope.customers, function (customer) {
        if (customer.tags && customer.tags.length > 0) {
          var tagExists = _.intersection(customer.tags, tags);
          if (tagExists.length > 0) {
            if(!$scope.eliminateDuplicates(customer))
              fullContacts.push(customer);
          }
        } else {
          if (tags.indexOf('nt') > -1) {
            if(!$scope.eliminateDuplicates(customer))
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

    $scope.completeNewCampaign = function () {
      //add new email if exists

      var stepSettings = $scope.newCampaignObj.steps[0].settings;

      if (!stepSettings.emailId) {
        WebsiteService.createEmail($scope.emailToSend, function (newEmail) {
          $scope.createCampaign(newEmail);
        });
      } else {
        $scope.createCampaign($scope.emailToSend);
      }
    };

    $scope.createCampaign = function (newEmail) {
      var stepSettings = $scope.newCampaignObj.steps[0].settings;
        stepSettings.emailId = newEmail._id;
        stepSettings.fromEmail = newEmail.fromEmail;
        stepSettings.fromName = newEmail.fromName;
        stepSettings.replyTo = newEmail.replyTo;
        stepSettings.subject = newEmail.subject;

        //set delivery date
        var sendAt = $scope.newCampaignObj.steps[0].settings.sendAt;
        var delivery = moment($scope.delivery.date);
        sendAt.year = moment.utc(delivery).get('year');
        sendAt.month = moment.utc(delivery).get('month') + 1;
        sendAt.day = moment.utc(delivery).get('date');
        sendAt.hour = moment.utc(delivery).get('hour');
        sendAt.minute = moment.utc(delivery).get('minute');

        //add campaign
        CampaignService.createCampaign($scope.newCampaignObj, function (_nemCampaign) {

          //add contacts if new
          $scope.checkAndCreateCustomer(function (createdContactsArr) {

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
            CampaignService.bulkAddContactsToCampaign(contactsArr, _nemCampaign._id, function (success) {
              //show success
              toaster.pop('success', 'Campaigns created successfully');
              $location.path('/marketing/campaigns');
            });

          });

        });
    };
    $scope.checkNewRecipients = function()
    {
      var returnValue = false;
      if($scope.selectedCustomers.newEmails && $scope.selectedCustomers.newEmails.length)
          returnValue = true;
      return returnValue;
    };

    $scope.validateStep = function(i, valid)
    {
      if(valid)
      {
        if (i === 2 && !$scope.newCampaignObj.name || !$scope.newCampaignObj.type)
        valid = false;
        else if(i === 3 && (!$scope.emailToSend.title || $scope.emailTitleExists))
          valid = false;
        else if(i === 4 && !$scope.recipients.length && !$scope.checkNewRecipients())
          valid = false;
      }
      return valid;
    }

    $scope.ValidateBeforeProceed = function(i)
    {
      var index = 2;
      var valid = true;
      if(i >= 2 )
        { 
          while (index <= i && index >= 2)
            {  
              valid = $scope.validateStep(index, valid);
              if(valid)
                index ++ ;
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
        if(valid)
        {
          $scope.goingTo = 'next';
          $scope.toTheTop();
          nextStep();
        }        
      },
      prev: function () {
        $scope.goingTo = 'prev';
        $scope.toTheTop();
        prevStep();
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
          var i = 0;
          for (i; i < keys.length; i++) {
            if (item[keys[i]].toString().toLowerCase().indexOf(props[keys[i]].toLowerCase()) !== -1) {
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
