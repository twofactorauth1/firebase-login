(function () {

    app.controller('EmailCampaignController', indiEmailCampaignController);

    indiEmailCampaignController.$inject = ['$scope', 'EmailBuilderService', '$stateParams', '$state', 'toaster', 'AccountService', 'WebsiteService', '$modal', '$timeout', '$document', '$window', 'EmailCampaignService', 'ContactService', 'userConstant', 'editableOptions', 'SweetAlert', '$location'];
    /* @ngInject */
    function indiEmailCampaignController($scope, EmailBuilderService, $stateParams, $state, toaster, AccountService, WebsiteService, $modal, $timeout, $document, $window, EmailCampaignService, ContactService, userConstant, editableOptions, SweetAlert, $location) {

        console.info('email-campaign directive init...');

        $scope.$state = $state;
        var vm = this;
        var contactTags = userConstant.contact_types.dp;

        vm.init = init;
        vm.state = vm.state || {};
        vm.uiState = vm.uiState || {};

        editableOptions.theme = 'bs3';

        vm.state.campaignId = $stateParams.id;
        vm.state.campaign = {
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
                    "bcc": '',
                    "subject": '',
                    "vars": [],
                    "sendAt": {},
                }
            }],
            "searchTags": {
                operation: "set",
                tags: []
            }
        };
        vm.state.campaignOriginal = angular.copy(vm.state.campaign);
        vm.state.email = null;
        vm.uiState.dataLoaded = false;
        vm.uiState.disableEditing = true;
        vm.state.account = null;
        vm.state.website = {
            settings: {}
        };
        vm.state.contacts = [];
        vm.state.allContacts = [];
        vm.state.tagSelection = [];
        vm.state.recipients = [];
        vm.state.recipientsToRemove = [];
        vm.state.originalRecipients = [];
        vm.uiState.selectedContacts = {
            individuals: []
        };
        vm.uiState.whenToSend = 'now';
        vm.uiState.watchDeliveryDate = false;
        vm.uiState.delivery = {
            date: moment(),
            minDate: new Date()
        };
        vm.uiState.hstep = 1;
        vm.uiState.mstep = 1;
        vm.uiState.tableView = 'list';
        vm.uiState.triggers = [{
            name: 'Sign Up',
            icon: 'fa-paper-plane',
            value: 'SIGNUP'
        }];

        vm.saveAsDraftFn = saveAsDraftFn;
        vm.sendTestFn = sendTestFn;
        vm.activateCampaignFn = activateCampaignFn;
        vm.getContactsFn = getContactsFn;
        vm.checkBestEmailFn = checkBestEmailFn;
        vm.toggleSelectionFn = toggleSelectionFn;
        vm.getRecipientsFn = getRecipientsFn;
        vm.getSelectedTagsFn = getSelectedTagsFn;
        vm.eliminateDuplicateFn = eliminateDuplicateFn;
        vm.contactSelectedFn = contactSelectedFn;
        vm.contactRemovedFn = contactRemovedFn;
        vm.checkContactExistsFn = checkContactExistsFn;
        vm.updateSendNowFn = updateSendNowFn;
        vm.openModalFn = openModalFn;
        vm.closeModalFn = closeModalFn;
        vm.getCampaignContactsFn = getCampaignContactsFn;
        vm.loadSavedTagsFn = loadSavedTagsFn;
        vm.checkAndCreateContactFn = checkAndCreateContactFn;
        vm.addContactsFn = addContactsFn;
        vm.removeContactsFromCampaignFn = removeContactsFromCampaignFn;
        vm.resetDirtyFn = resetDirtyFn;
        vm.checkIfDirtyFn = checkIfDirtyFn;
        vm.duplicateFn = duplicateFn;
        vm.changeEmailFn = changeEmailFn;
        vm.deleteCampaignFn = deleteCampaignFn;

        $scope.$watch('vm.state.campaign.type', function() {
            console.debug('vm.state.campaign.type', vm.state.campaign.type);
            if (vm.state.campaign.steps) {
                if (vm.state.campaign.type === 'autoresponder') {
                    vm.state.campaign.steps[0].trigger = 'SIGNUP';
                } else {
                    vm.state.campaign.steps[0].trigger = null;
                }
            }
        });

        $scope.$watch('emailToSend.subject', function (newValue, oldValue) {
            if (newValue) {
                vm.analyzeSubject(newValue);
            }
        });

        function addContactsFn(createdContactsArr) {
            //get an array of contact Ids from recipients
            var recipientsIdArr = [];

            _.each(vm.state.recipients, function (recipient) {
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

            vm.state.campaign.contacts = contactsArr;
        }

        function removeContactsFromCampaignFn() {
            angular.forEach(vm.state.recipientsToRemove, function (contactId) {
                EmailCampaignService.cancelCampaignForContact(vm.state.campaign, contactId)
                    .then(function (res) {
                        console.warn('removed ' + contactId);
                    });
            });

            _.each(vm.removeContactsFromCampaign, function (id) {
                console.warn('remove ' + id);
                console.warn(_.indexOf(vm.state.campaign.contacts, id));
            });
        }

        function checkAndCreateContactFn(fn) {
            var contactsArr = [];
            var promises = [];
            if (vm.uiState.selectedContacts.newEmails) {
                var _emails = vm.uiState.selectedContacts.newEmails;
                _.each(_emails, function (email) {
                    var contact = _.findWhere(vm.state.contacts, {
                        email: email.text
                    });
                    if (!contact) {
                        var tempContact = vm.createContactData(email.text);
                        promises.push(ContactService.createContact(tempContact));
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
        }

        function saveAsDraftFn() {
            vm.uiState.dataLoaded = false;
            var fn = EmailCampaignService.updateCampaign;

            if (vm.state.campaignId === 'create') {
                fn = EmailCampaignService.createCampaign;
            }

            //resetting status
            vm.state.campaign.status = 'DRAFT';

            //populating structured delivery timestamp
            var sendAt = {};
            sendAt.year = moment.utc(vm.uiState.delivery.date).get('year');
            sendAt.month = moment.utc(vm.uiState.delivery.date).get('month') + 1;
            sendAt.day = moment.utc(vm.uiState.delivery.date).get('date');
            sendAt.hour = moment.utc(vm.uiState.delivery.date).get('hour');
            sendAt.minute = moment.utc(vm.uiState.delivery.date).get('minute');
            vm.state.campaign.steps[0].settings.sendAt = sendAt;

            vm.state.campaign.contactTags = vm.getSelectedTagsFn();
            vm.removeContactsFromCampaignFn();

            //processing custom emails for contact
            vm.checkAndCreateContactFn(function (createdContactsArr) {
                vm.addContactsFn(createdContactsArr);
                fn(vm.state.campaign)
                    .then(function (res) {
                        vm.state.campaign = angular.extend(vm.state.campaign, res.data);
                        vm.state.campaignOriginal = angular.copy(res.data);
                        vm.state.originalRecipients = angular.copy(vm.state.recipients);
                        vm.uiState.dataLoaded = true;
                        vm.uiState.disableEditing = false;
                        toaster.pop('success', 'Campaign saved');
                    }, function (err) {
                        vm.uiState.dataLoaded = true;
                        toaster.pop('error', 'Campaign save failed');
                    });
            });
        }

        function sendTestFn(address) {
            vm.uiState.dataLoaded = false;
            EmailCampaignService.sendTestEmail(address, vm.state.email)
                .then(function (res) {
                    vm.uiState.dataLoaded = true;
                    vm.closeModalFn();
                    toaster.pop('success', 'Send test email');
                }, function (err) {
                    vm.uiState.dataLoaded = true;
                    vm.closeModalFn();
                    toaster.pop('error', 'Send test mail failed');
                });
        }

        function activateCampaignFn() {
            vm.uiState.dataLoaded = false;
            var fn = EmailCampaignService.updateCampaign;

            if (vm.state.campaignId === 'create') {
                fn = EmailCampaignService.createCampaign;
            }
            vm.state.campaign.status = 'PENDING';
            fn(vm.state.campaign)
                .then(function (res) {
                    vm.state.campaign = angular.extend(vm.state.campaign, res.data);
                    vm.state.campaignOriginal = angular.copy(res.data);
                    vm.state.originalRecipients = angular.copy(vm.state.recipients);
                    vm.uiState.dataLoaded = true;
                    vm.uiState.disableEditing = true;
                    toaster.pop('success', 'Campaign activated');
                }, function (err) {
                    vm.uiState.dataLoaded = true;
                    toaster.pop('error', 'Campaign activation failed');
                });
        }

        function checkBestEmailFn(contact) {
            var returnVal = ContactService.checkContactBestEmail(contact);
            return returnVal;
        }

        function getContactsFn() {
            var promise = ContactService.getContacts(function (contacts) {
                var contactWithoutEmails = [];
                _.each(contacts, function (contact) {
                    if (!vm.checkBestEmailFn(contact)) {
                        contactWithoutEmails.push(contact);
                    }
                });
                contacts = _.difference(contacts, contactWithoutEmails);
                vm.state.contacts = contacts;
                ContactService.getAllContactTags(contacts, function (tags) {
                    contactTags = tags;
                });
                var _tags = [];
                vm.state.allContacts = [];
                _.each(contacts, function (contact) {
                    vm.state.allContacts.push({
                        _id: contact._id,
                        first: contact.first
                    });
                    //contact.fullName = contact.first + " " + contact.last || '';
                    if (contact.tags && contact.tags.length > 0) {
                        _.each(contact.tags, function (tag) {
                            var tagLabel = _.findWhere(contactTags, {
                                data: tag
                            });
                            if (tagLabel)
                                _tags.push(tagLabel.label);
                            else
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
                    var returnObj = {
                        uniqueTag: tag[0],
                        numberOfTags: tag.length
                    };
                    var matchingTagObj = _.find(contactTags, function (matchTag) {
                        return matchTag.label === tag[0];
                    });
                    if (matchingTagObj) {
                        returnObj.matchingTag = matchingTagObj.label;
                    } else {
                        returnObj.matchingTag = 'No Tag';
                    }
                    return returnObj;
                });
                vm.contactCounts = x;
            });

            return promise;
        }

        function getSelectedTagsFn() {
            var tags = [];
            _.each(vm.state.tagSelection, function (fullTag) {
                var matchingTag = _.find(contactTags, function (matchTag) {
                    return matchTag.label === fullTag;
                });
                if (matchingTag) {
                    tags.push(matchingTag.label);
                } else {
                    tags.push(fullTag);
                }
            });
            return tags;
        }

        function eliminateDuplicateFn(contact) {
            return vm.uiState.selectedContacts.individuals.indexOf(contact._id) > -1;
        };

        function getRecipientsFn() {

            var fullContacts = [];

            //get the tags that have been selected
            var tags = vm.getSelectedTagsFn();

            //loop through contacts and add if one of the tags matches

            _.each(vm.state.contacts, function (contact) {
                if (contact.tags && contact.tags.length > 0) {
                    var tempTags = [];
                    var tagLabel = "";
                    _.each(contact.tags, function (tag) {
                        tagLabel = _.findWhere(contactTags, {
                            data: tag
                        });
                        if (tagLabel)
                            tempTags.push(tagLabel.label);
                        else
                            tempTags.push(tag);
                    });
                    var tagExists = _.intersection(tempTags, tags);
                    if (tagExists.length > 0) {
                        if (!vm.eliminateDuplicateFn(contact)) {
                            fullContacts.push(contact);
                        }
                    }
                } else {
                    if (tags.indexOf('No Tag') > -1) {
                        if (!vm.eliminateDuplicateFn(contact)) {
                            fullContacts.push(contact);
                        }
                    }
                }

                //add contacts from individual

                if (vm.uiState.selectedContacts.individuals.indexOf(contact._id) > -1) {
                    fullContacts.push(contact);
                }
            });

            return fullContacts;
        }

        function toggleSelectionFn(tagName) {
            var idx = vm.state.tagSelection.indexOf(tagName);

            // is currently selected
            if (idx > -1) {
                vm.state.tagSelection.splice(idx, 1);
            } else {
                vm.state.tagSelection.push(tagName);
            }
            vm.state.recipients = vm.getRecipientsFn();

        }

        function contactSelectedFn(select) {
            var selected = select.selected[select.selected.length - 1];
            var removalIndex = _.indexOf(vm.state.recipientsToRemove, selected._id);
            var existingContact = _.find(vm.state.recipients, function (recipient) {
                return recipient._id === selected._id;
            });

            if (!existingContact) {
                vm.state.recipients.push(selected);
            }

            // clear search text
            select.search = '';

            //remove from removal array
            if (removalIndex !== -1) {
                vm.state.recipientsToRemove.splice(removalIndex, 1);
            }
        }

        function contactRemovedFn(select, selected) {
            var existingContactIndex;
            var contact = _.findWhere(vm.state.recipients, {
                _id: selected._id
            });
            if (contact) {
                existingContactIndex = _.indexOf(vm.state.recipients, contact);
            }

            if (existingContactIndex > -1) {
                //get the tags that have been selected
                var tags = vm.getSelectedTagsFn();
                var tempTags = [];
                var tagLabel = "";
                _.each(contact.tags, function (tag) {
                    tagLabel = _.findWhere(contactTags, {
                        data: tag
                    });
                    if (tagLabel)
                        tempTags.push(tagLabel.label);
                    else
                        tempTags.push(tag);
                });
                if (!tempTags.length)
                    tempTags.push('No Tag');
                var tagExists = _.intersection(tempTags, tags);
                if (tagExists.length === 0) {
                    vm.state.recipients.splice(existingContactIndex, 1);
                }

            }
            // clear search text
            select.search = '';

            //add to removal array
            vm.state.recipientsToRemove.push(selected._id);
        }

        function checkContactExistsFn(email) {
            var matchingRecipient = _.find(vm.state.recipients, function (recipient) {
                if (recipient.details && recipient.details[0] && recipient.details[0].emails && recipient.details[0].emails[0] && recipient.details[0].emails[0].email) {
                    return (recipient.details[0].emails[0].email).toLowerCase() === email.text;
                }
            });
            var matchingContact = _.find(vm.state.contacts, function (contact) {
                if (contact.details && contact.details[0] && contact.details[0].emails && contact.details[0].emails[0] && contact.details[0].emails[0].email) {
                    return (contact.details[0].emails[0].email).toLowerCase() === email.text;
                }
            });
            if (matchingRecipient || matchingContact) {
                return false;
            }

            return true;
        }

        function updateSendNowFn(value) {
            vm.uiState.whenToSend = value;
            vm.uiState.watchDeliveryDate = true;
            if (vm.uiState.whenToSend !== 'later') {
                vm.uiState.delivery.date = moment();
            }
        }

        function openModalFn(template) {
            vm.modalInstance = $modal.open({
                templateUrl: template,
                keyboard: false,
                backdrop: 'static',
                scope: $scope
            });
            vm.modalInstance.result.finally(vm.closeModalFn());
        }

        function closeModalFn() {
            vm.modalInstance.close();
        }

        function getCampaignContactsFn() {
            vm.uiState.dataLoaded = false;
            EmailCampaignService.getCampaignContacts(vm.state.campaignId)
                .then(function (res) {
                    vm.state.originalRecipients = angular.copy(res.data);
                    vm.state.recipients = res.data;
                    var individuals = [];
                    _.each(res.data, function (contact) {
                        individuals.push(
                            contact._id
                        );
                    });
                    vm.uiState.selectedContacts.individuals = individuals;
                    vm.uiState.dataLoaded = true;
                });
        }

        function loadSavedTagsFn() {
            vm.uiState.dataLoaded = false;
            _.each(vm.state.campaign.contactTags, function (tag) {
                var tagLabel = _.findWhere(contactTags, {
                    data: tag
                });
                if (tagLabel) {
                    tag = tagLabel.label;
                }
                var tag = _.findWhere(vm.contactCounts, {
                    uniqueTag: tag
                });
                if (tag)
                    vm.toggleSelectionFn(tag.matchingTag);
            });
            vm.uiState.dataLoaded = true;
        }

        function checkIfDirtyFn() {
            var isDirty = false;

            if (!angular.equals(vm.state.campaign, vm.state.campaignOriginal)) {
                isDirty = true;
                console.info('Dirty vm.state.campaign', vm.state.campaign, vm.state.campaignOriginal);
            }

            if (!angular.equals(vm.uiState.delivery.date, vm.uiState.delivery.originalDate)) {
                isDirty = true;
                console.info('Dirty vm.uiState.delivery.date', vm.uiState.delivery.date, vm.uiState.delivery.originalDate);
            }

            if (!angular.equals(_.pluck(vm.state.recipients, '_id').sort(), _.pluck(vm.state.originalRecipients, '_id').sort())) {
                isDirty = true;
                console.info('Dirty vm.state.recipients', _.pluck(vm.state.recipients, '_id').sort(), _.pluck(vm.state.originalRecipients, '_id').sort());
            }

            return isDirty;
        }

        function resetDirtyFn() {
            vm.state.campaign = angular.copy(vm.state.campaignOriginal);
            vm.uiState.delivery.date = angular.copy(vm.uiState.delivery.originalDate);
            vm.state.recipients = angular.copy(vm.state.originalRecipients);
        }

        function duplicateFn() {
            EmailCampaignService.duplicateCampaign(vm.state.campaign)
                .then(function (res) {
                    $state.go('app.emailCampaign', {
                        id: res.data._id
                    });
                    toaster.pop('success', 'Campaign cloned');
                });
        }

        function changeEmailFn() {
            var email = _.findWhere(vm.state.emails, {
                _id: vm.state.campaign.steps[0].settings.emailId
            });
            vm.state.campaign.steps[0].settings.emailId = email._id;
            vm.state.campaign.steps[0].settings.fromEmail = email.fromEmail;
            vm.state.campaign.steps[0].settings.fromName = email.fromName;
            vm.state.campaign.steps[0].settings.replyTo = email.replyTo;
            vm.state.campaign.steps[0].settings.bcc = email.bcc;
            vm.state.campaign.steps[0].settings.subject = email.subject;
            vm.state.campaign.steps[0].settings.vars = email.vars;
        }

        function deleteCampaignFn() {
            SweetAlert.swal({
                title: "Are you sure?",
                text: "Do you want to cancel this campaign?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, cancel campaign!",
                cancelButtonText: "No, do not cancel campaign!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    EmailCampaignService.deleteCampaign(vm.state.campaign).then(function(data) {
                        toaster.pop('success', "Campaign cancelled.", "The " + vm.state.campaign.name + " campaign was cancelled successfully.");
                        vm.closeModal();
                        $timeout(function () {
                            $location.path('/marketing/campaigns');
                        }, 500)
                    });
                } else {
                    SweetAlert.swal("Not Cancelled", "The campaign was not cancelled.", "error");
                }
            });
        };

        function init(element) {
            vm.element = element;

            AccountService.getAccount(function (data) {
                vm.state.account = data;
            });

            WebsiteService.getWebsite(function (data) {
                vm.state.website = data;
            });

            WebsiteService.getEmails(null, function (data) {
                vm.state.emails = data;
            });

            ContactService.getContactTags(function(tags){
                vm.state.contactTags = tags;
            });

            if (vm.state.campaignId !== 'create') {
                EmailCampaignService.getCampaign(vm.state.campaignId)
                    .then(function (res) {
                        if (!res.data._id) {
                            toaster.pop('error', 'Campaign not found');
                            $state.go('app.marketing.campaigns');
                        }
                        vm.state.campaign = angular.extend(vm.state.campaign, res.data);
                        vm.state.campaignOriginal = angular.copy(res.data);
                        console.info('campaign obj', vm.state.campaign);

                        if (vm.state.campaign.steps[0].settings.emailId) {
                            EmailBuilderService.getEmail(vm.state.campaign.steps[0].settings.emailId)
                                .then(function (res) {
                                    vm.state.email = res.data;
                                });
                        }

                        var sendAtDateISOString = moment.utc(vm.state.campaign.steps[0].settings.sendAt).subtract('months', 1).toISOString();
                        var localMoment = moment(sendAtDateISOString);

                        if (vm.state.campaign.type === 'onetime') {
                            if (localMoment.isValid()) {
                                vm.uiState.delivery.date = localMoment;
                                vm.uiState.delivery.originalDate = angular.copy(localMoment);
                                vm.uiState.whenToSend = localMoment.isAfter() ? 'later' : 'now';
                            }
                        }

                        if (vm.state.campaign.status === 'DRAFT') {
                            vm.uiState.disableEditing = false;
                        }
                        vm.getContactsFn()
                            .then(function () {
                                vm.loadSavedTagsFn();
                            });
                        vm.getCampaignContactsFn();
                    }, function (err) {
                        $state.go('app.marketing.campaigns');
                    });
            }
        }


    }

})();
