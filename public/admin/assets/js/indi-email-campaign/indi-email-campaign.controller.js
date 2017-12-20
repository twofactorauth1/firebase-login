(function () {

    app.controller('EmailCampaignController', indiEmailCampaignController);

    indiEmailCampaignController.$inject = ['$scope', 'EmailBuilderService', '$stateParams', '$state', 'toaster', 'AccountService', 'WebsiteService', '$modal', '$timeout', '$document', '$window', 'EmailCampaignService', 'ContactService', 'userConstant', 'editableOptions', 'SweetAlert', '$location', '$q', 'formValidations'];
    /* @ngInject */
    function indiEmailCampaignController($scope, EmailBuilderService, $stateParams, $state, toaster, AccountService, WebsiteService, $modal, $timeout, $document, $window, EmailCampaignService, ContactService, userConstant, editableOptions, SweetAlert, $location, $q, formValidations) {

        console.info('email-campaign directive init...');

        $scope.$state = $state;
        var vm = this;
        var contactTags = userConstant.contact_types.dp;
        vm.campaign_tags = [];
        vm.init = init;
        vm.state = vm.state || {};
        vm.uiState = vm.uiState || {};

        editableOptions.theme = 'bs3';

        vm.getTagLabel = getTagLabel;

        vm.state.campaignId = $stateParams.id;
        vm.state.campaign = {
            "name": "",
            "type": "onetime",
            "status": "DRAFT",
            "startDate": "", //not used on autoresponder
            "emailSettings":{
                "emailId": "",
                "fromEmail": "",
                "fromName": '',
                "replyTo": '',
                "bcc": '',
                "cc": '',
                "subject": '',
                "vars": [],
                "sendAt": {}
            },
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
            individuals: [],
            newEmails: []
        };

        vm.uiState.originalNewEmails = [];
        vm.uiState.whenToSend = 'now';
        vm.uiState.watchDeliveryDate = false;
        vm.uiState.delivery = {
            date: moment(),
            minDate: new Date()
        };
        vm.uiState.delivery.originalDate = angular.copy(vm.uiState.delivery.date);
        vm.uiState.hstep = 1;
        vm.uiState.mstep = 1;
        vm.uiState.tableView = 'list';
        vm.uiState.allowRedirect = true;
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
        //vm.updateTagsFn = updateTagsFn;
        vm.addContactsFn = addContactsFn;
        vm.removeContactsFromCampaignFn = removeContactsFromCampaignFn;
        vm.resetDirtyFn = resetDirtyFn;
        vm.checkIfDirtyFn = checkIfDirtyFn;
        vm.duplicateFn = duplicateFn;
        vm.updateCampaignEmailSettingsFn = updateCampaignEmailSettingsFn;
        vm.deleteCampaignFn = deleteCampaignFn;
        vm.cancelCampaignFn = cancelCampaignFn;
        vm.canActivateFn = canActivateFn;
        vm.tagToContactFn = tagToContactFn;
        vm.createContactDataFn = createContactDataFn;
        vm.contactTagsFn = contactTagsFn;
        vm.formValidations = formValidations;
        vm.backToCampaigns = backToCampaigns;
        vm.customTagFilter=customTagFilter;
        vm.showSelectTagsPane = showSelectTagsPane;

        function showSelectTagsPane(){
            var showTagPane = true;
            if(vm.state.campaign && vm.uiState.dataLoaded && vm.state.campaign.status === 'COMPLETED'){
                if(!vm.state.campaign.searchTags || !vm.state.campaign.searchTags.tags.length){
                    showTagPane = false;
                }
            }
            return showTagPane;
        }

        $scope.$watch('vm.state.campaign.type', function () {
            console.debug('vm.state.campaign.type', vm.state.campaign.type);
            if(vm.state.campaign.emailSettings && vm.state.campaign.status !== 'COMPLETED') {
                if (vm.state.campaign.type === 'autoresponder') {
                    vm.state.campaign.emailSettings.trigger = 'SIGNUP';
                } else {
                    vm.state.campaign.emailSettings.trigger = null;
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
            //vm.updateTagsFn(vm.state.campaign.contacts);
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
                        email: email.text.toLowerCase()
                    });
                    if (!contact) {
                        var tempContact = vm.createContactDataFn(email.text.toLowerCase());
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


        function saveAsDraftFn(isActivation) {
            vm.uiState.allowRedirect = true;
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
                    if(vm.state.campaign.emailSettings) {
                        vm.state.campaign.emailSettings.sendAt = sendAt;
                    }


                    vm.state.campaign.contactTags = vm.getSelectedTagsFn();
                    vm.state.campaign.contactTagData = [];
                    _.each(vm.state.campaign.contactTags, function(label){
                        vm.state.campaign.contactTagData.push(ContactService.getTagFromLabel(label));
                    });
                    vm.removeContactsFromCampaignFn();

                    //processing custom emails for contact


                    EmailCampaignService.checkIfDuplicateCampaign(vm.state.campaign._id, vm.state.campaign.name)
                        .then(function (response) {
                            if(response.data){
                                toaster.pop('warning', 'Campaign name already exists');
                                vm.uiState.dataLoaded = true;
                                vm.uiState.disableEditing = false;
                                vm.uiState.allowRedirect = false;
                                return;
                            }
                            if (isActivation) {
                                vm.state.campaign.status = 'RUNNING';
                            }
                            vm.checkAndCreateContactFn(function (createdContactsArr) {
                                vm.addContactsFn(createdContactsArr);
                                fn(vm.state.campaign)
                                    .then(function (res) {
                                        vm.state.campaign = angular.extend(vm.state.campaign, res.data);
                                        vm.state.campaignOriginal = angular.copy(vm.state.campaign);
                                        vm.state.originalRecipients = angular.copy(vm.state.recipients);
                                        vm.uiState.delivery.originalDate = angular.copy(vm.uiState.delivery.date);
                                        vm.uiState.originalNewEmails = angular.copy(vm.uiState.selectedContacts.newEmails);
                                        vm.uiState.dataLoaded = true;
                                        vm.uiState.disableEditing = false;
                                        if (isActivation) {
                                            vm.uiState.disableEditing = true;
                                            toaster.pop('success', 'Campaign activated');
                                        } else {
                                            toaster.pop('success', 'Campaign saved');
                                        }
                                    }, function (err) {
                                        vm.uiState.dataLoaded = true;

                                        if (isActivation) {
                                            toaster.pop('error', 'Campaign activation failed');
                                        } else {
                                            toaster.pop('error', 'Campaign save failed');
                                        }
                                    });
                                });
                            }
                    );
                // }
            }

        function sendTestFn(address) {
            vm.uiState.dataLoaded = false;
            console.log('sendTestFn:', vm.state.email);
            /*
             *Copy over settings from campaign in case the vm.state.email is stale
             */
            vm.state.email.fromEmail = vm.state.campaign.emailSettings.fromEmail;
            vm.state.email.fromName = vm.state.campaign.emailSettings.fromName;
            vm.state.email.replyTo = vm.state.campaign.emailSettings.replyTo;
            vm.state.email.bcc = vm.state.campaign.emailSettings.bcc;
            vm.state.email.cc = vm.state.campaign.emailSettings.cc;
            vm.state.email.subject = vm.state.campaign.emailSettings.subject;

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
            //vm.saveAsDraftFn(true);
            if(!checkRequiredFields()){
                toaster.pop('warning', 'Please fill the required fields');
                var element = document.getElementById("campaign-email-settings-container");
                $document.scrollToElementAnimated(element, 0, 1000);
                return;
            }
            else{
                vm.uiState.saveLoading = true;
                var fn = EmailCampaignService.activateCampaign;
                fn(vm.state.campaign).then(function (res) {
                        vm.state.campaign = angular.extend(vm.state.campaign, res.data);
                        vm.state.campaignOriginal = angular.copy(vm.state.campaign);
                        vm.state.originalRecipients = angular.copy(vm.state.recipients);
                        vm.uiState.originalNewEmails = angular.copy(vm.uiState.selectedContacts.newEmails);
                        vm.uiState.delivery.originalDate = angular.copy(vm.uiState.delivery.date);
                        vm.uiState.dataLoaded = true;
                        vm.uiState.disableEditing = false;
                        vm.uiState.saveLoading = false;
                        vm.uiState.disableEditing = true;
                        toaster.pop('success', 'Campaign activated');

                    }, function (err) {
                        vm.uiState.dataLoaded = true;
                        toaster.pop('error', 'Campaign activation failed');
                        vm.uiState.saveLoading = false;
                    }
                );
            }
        }

        function checkRequiredFields(){
            var isValidForm = true;
            if(!vm.state.campaign.emailSettings.fromEmail){
                isValidForm = false;
            }
            return isValidForm;
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
               // ContactService.getAllContactTags(contacts, function (tags) {
                  //  contactTags = tags;
                 //   vm.state.contactTags = angular.copy(tags);
                //});
                //contactTags = angular.copy(vm.state.contactTags);
                //var _tags = [];
                vm.state.allContacts = [];
                _.each(contacts, function (contact) {
                    vm.state.allContacts.push({
                        _id: contact._id,
                        first: contact.first
                    });
                });
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
            if(email){
                var regex = formValidations.email;
                var regexValue = regex.test(email.text);

                if(!regexValue){
                    return false;
                }

                var matchingRecipient = _.find(vm.state.recipients, function (recipient) {
                    if (recipient.details && recipient.details[0] && recipient.details[0].emails && recipient.details[0].emails[0] && recipient.details[0].emails[0].email) {
                        return (recipient.details[0].emails[0].email).toLowerCase() === email.text.toLowerCase();
                    }
                });
                var matchingContact = _.find(vm.state.contacts, function (contact) {
                    if (contact.details && contact.details[0] && contact.details[0].emails && contact.details[0].emails[0] && contact.details[0].emails[0].email) {
                        return (contact.details[0].emails[0].email).toLowerCase() === email.text.toLowerCase();
                    }
                });
                if (matchingRecipient || matchingContact) {
                    return false;
                }

                return true;
            }
            else{
                return false;
            }
        }

        function updateSendNowFn(value) {
            vm.uiState.whenToSend = value;
            vm.uiState.watchDeliveryDate = true;

            if(vm.uiState.whenToSend !== 'now') {
                if(vm.uiState.delivery.date.isBefore(moment())) {
                    vm.uiState.delivery.date = moment();
                }
            }
            if (vm.uiState.whenToSend !== 'later') {
                vm.uiState.delivery.date = moment();
            }

            vm.state.campaign.emailSettings.whenToSend = vm.uiState.whenToSend;
        }

        function openModalFn(template) {
            vm.modalInstance = $modal.open({
                templateUrl: template,
                keyboard: true,
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
                    vm.state.recipients = res.data;
                    vm.state.originalRecipients = angular.copy(vm.state.recipients);
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
                if (tag && tag === 'No Tag')
                    vm.toggleSelectionFn(tag);
                else{
                    var tagLabel = _.findWhere(contactTags, {
                        data: tag
                    });
                    if (tagLabel) {
                        tag = tagLabel.label;
                    }
                    var tag = _.findWhere(vm.contactCounts, {
                        uniqueTag: tag
                    });
                    if(tag)
                        vm.toggleSelectionFn(tag.matchingTag);
                }
            });

            $timeout(function() {
               vm.state.originalRecipients = angular.copy(vm.state.recipients);
            }, 0);
            vm.uiState.dataLoaded = true;
        }

        function checkIfDirtyFn() {
            var isDirty = false;

            if(vm.state.campaign && vm.state.campaign.status !== 'COMPLETED'){
                if (!angular.equals(vm.state.campaign, vm.state.campaignOriginal)) {
                    isDirty = true;
                    //console.info('Dirty vm.state.campaign', vm.state.campaign, vm.state.campaignOriginal);
                }

                if (!angular.equals(vm.uiState.delivery.date, vm.uiState.delivery.originalDate)) {
                    isDirty = true;
                    console.info('Dirty vm.uiState.delivery.date', vm.uiState.delivery.date, vm.uiState.delivery.originalDate);
                }

                if (!angular.equals(_.pluck(vm.state.recipients, '_id').sort(), _.pluck(vm.state.originalRecipients, '_id').sort())) {
                    isDirty = true;
                    console.info('Dirty vm.state.recipients', _.pluck(vm.state.recipients, '_id').sort(), _.pluck(vm.state.originalRecipients, '_id').sort());
                }

                if (!angular.equals(vm.uiState.originalNewEmails, vm.uiState.selectedContacts.newEmails)) {
                    isDirty = true;
                    console.info('Dirty vm.uiState.selectedContacts', vm.uiState.selectedContacts, vm.uiState.originalNewEmails);
                }
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

        function updateCampaignEmailSettingsFn(change) {
            var email = vm.state.email;

            if(change && vm.state.campaign.emailSettings){
                email = _.findWhere(vm.state.emails, {
                    _id: vm.state.campaign.emailSettings.emailId
                });
                vm.state.campaign.emailSettings.emailId = email._id;
                vm.state.campaign.emailSettings.fromEmail = email.fromEmail;
                vm.state.campaign.emailSettings.fromName = email.fromName;
                vm.state.campaign.emailSettings.replyTo = email.replyTo;
                vm.state.campaign.emailSettings.bcc = email.bcc;
                vm.state.campaign.emailSettings.cc = email.cc;
                vm.state.campaign.emailSettings.subject = email.subject;
                vm.state.campaign.emailSettings.vars = email.vars;
                vm.state.email = angular.copy(email);
                console.log('695 set email to:', vm.state.email);
            } else {
                var indexInEmailList = _.findIndex(vm.state.emails, {
                    _id: email._id
                });
                vm.state.emails[indexInEmailList] = email;
            }

        }

        function deleteCampaignFn() {
            SweetAlert.swal({
                    title: "Are you sure?",
                    text: "Do you want to delete this campaign?",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete campaign!",
                    cancelButtonText: "No, do not delete campaign!",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                function (isConfirm) {
                    if (isConfirm) {
                        EmailCampaignService.deleteCampaign(vm.state.campaign).then(function (data) {
                            toaster.pop('success', "Campaign deleted.", "The " + vm.state.campaign.name + " campaign was deleted successfully.");
                            resetDirtyFn();
                            $timeout(function () {
                                $location.path('/marketing/campaigns');
                            }, 500)
                        });
                    } else {
                        SweetAlert.swal("Not Deleted", "The campaign was not deleted.", "error");
                    }
                });
        };

        function cancelCampaignFn() {
            SweetAlert.swal({
                    title: "Are you sure?",
                    text: "Do you want to cancel this campaign?",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, cancel campaign!",
                    cancelButtonText: "No, do not cancel campaign!",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                function (isConfirm) {
                    if (isConfirm) {
                        EmailCampaignService.cancelCampaign(vm.state.campaign).then(function (data) {
                            toaster.pop('success', "Campaign cancelled.", "The " + vm.state.campaign.name + " campaign was cancelled successfully.");
                            resetDirtyFn();
                            $timeout(function () {
                                $location.path('/marketing/campaigns');
                            }, 500)
                        });
                    } else {
                        SweetAlert.swal("Not Cancelled", "The campaign was not cancelled.", "error");
                    }
                });
        };

        function canActivateFn() {
            var dataIsLoaded = vm.uiState.dataLoaded;
            var campaignHasId = vm.state.campaign && angular.isDefined(vm.state.campaign._id);
            var campaignNotCancelled = vm.state.campaign.status.toLowerCase() !== 'cancelled';
            var campaignHasContacts = (vm.state.recipients.length + vm.uiState.selectedContacts.newEmails.length + getSelectedTagsFn().length) > 0;
            var campaignIsOneTime = (vm.state.campaign.type === 'onetime');
            var isDirty = checkIfDirtyFn();
            return dataIsLoaded && campaignHasId && campaignNotCancelled && (campaignIsOneTime ? campaignHasContacts : true) && !isDirty;
        }

        function tagToContactFn(value) {
            return ContactService.tagToContact(value);
        }

        function createContactDataFn(email) {
            // New contact
            var contact = {
                details: [{
                    emails: []
            	   }]
            };

            contact.details[0].emails.push({
                email: email
            });
            return contact;
        }

        function contactTagsFn(contact) {
            return ContactService.contactTags(contact);
        }

        function getTagLabel(label){
            return label === 'No Tag' ? '(no tag)' : label
        }

        function backToCampaigns(){
            $location.url('/marketing/campaigns');
        }

        function customTagFilter(checkTag){
            if(vm.state.campaign.searchTags && vm.state.campaign.searchTags.tags) {
              var valid = true;
              angular.forEach(vm.state.campaign.searchTags.tags, function(tg){
                if(tg.label.toLowerCase() === checkTag.label.toLowerCase()){
                  valid = false;
                }
              });
              return valid;
            }
            return true;
        }

        function init(element) {
            vm.element = element;

            AccountService.getAccount(function (data) {
                vm.state.account = data;
            });

            WebsiteService.getWebsite(function (data) {
                vm.state.website = data;
            });

            ContactService.getContactTags(function (tags) {
                vm.state.contactTags = tags;
            });

            ContactService.getContactTagCounts(function(response){
                var tags = response.count;
                var uniqueLabeledTagObject = {};
                _.map(tags, function (value, key) {
                    var label = key.trim();
                    if(label && label !== ''){
                       vm.state.contactTags.push({label :label, data : label});
                    }

                    var matchingTagObj = _.find(vm.state.contactTags, function (matchTag) {
                        return matchTag.data === label;
                    });

                    if(matchingTagObj){
                        label = matchingTagObj.label;
                    }
                    if(uniqueLabeledTagObject[label]){
                        uniqueLabeledTagObject[label] = parseInt(value) + parseInt(uniqueLabeledTagObject[label]);
                    }
                    else{
                        uniqueLabeledTagObject[label] = parseInt(value);
                    }
                });

                var x = _.map(uniqueLabeledTagObject, function (value, key) {
                    var returnObj = {
                        uniqueTag: key,
                        numberOfTags: value
                    };
                    if(key === 'NOTAG'){
                        returnObj.matchingTag = 'No Tag';
                        returnObj.uniqueTag = 'nt';
                    }
                    else {
                        returnObj.matchingTag = key;
                    }
                    return returnObj;
                });
                vm.contactCounts = x;
            });

            if (vm.state.campaignId !== 'create') {
                EmailCampaignService.getCampaign(vm.state.campaignId)
                    .then(function (res) {
                        if (!res.data._id) {
                            toaster.pop('error', 'Campaign not found');
                            $state.go('app.marketing.campaigns');
                        }

                        var campaign = res.data;

                        if(campaign.emailSettings.emailId){
                            EmailBuilderService.getEmail(campaign.emailSettings.emailId)
                                .then(function (res) {
                                    vm.state.email = res.data;
                                    console.log('823 set email to:', vm.state.email);
                                    vm.state.campaign = angular.extend(vm.state.campaign, campaign);

                                    if (vm.state.campaign.status === 'DRAFT') {
                                        vm.uiState.disableEditing = false;
                                    }

                                    WebsiteService.getEmails(null, function (data) {
                                        vm.state.emails = data;
                                        vm.updateCampaignEmailSettingsFn();
                                        vm.state.campaignOriginal = angular.copy(campaign);
                                        console.info('campaign obj', vm.state.campaign);
                                    });
                                });
                        } else {
                            vm.state.campaign = angular.extend(vm.state.campaign, campaign);
                            vm.state.campaignOriginal = angular.copy(campaign);
                            console.info('campaign obj', vm.state.campaign);
                        }


                        var sendAtDateISOString = null;
                        if(campaign.emailSettings) {
                            var sendAt = campaign.emailSettings.sendAt;
                            //sendAtDateISOString = moment.utc(campaign.emailSettings.sendAt).subtract('months', 1).toISOString();
                            var _dateString = sendAt.month + "/" + sendAt.day + "/" + sendAt.year + " " + sendAt.hour + ":" + sendAt.minute;
                            sendAtDateISOString =  moment.utc(_dateString).toISOString();
                        }

                        var localMoment = moment(sendAtDateISOString);

                        if (vm.state.campaign.type === 'onetime') {
                            if (localMoment.isValid()) {
                                vm.uiState.delivery.date = localMoment;
                                vm.uiState.delivery.originalDate = angular.copy(localMoment);
                                if(campaign.emailSettings.whenToSend){
                                    vm.uiState.whenToSend = campaign.emailSettings.whenToSend;
                                }
                                else{
                                    vm.uiState.whenToSend = localMoment.isAfter() ? 'later' : 'now';
                                }
                            }
                        }
                        if(campaign.contacts && campaign.contacts.length <= userConstant.campaigns.MAX_CONTACT_LIST_COUNT){
                            vm.getCampaignContactsFn();
                        }
                        else{
                            vm.uiState.contactLimitExceeded = true;
                        }
                        ContactService.getContactsCount(function(response){
                            if(response.count <= userConstant.campaigns.MAX_CONTACT_LIST_COUNT){
                                vm.getContactsFn()
                                .then(function () {
                                    vm.loadSavedTagsFn();
                                });
                            } else {
                                vm.loadSavedTagsFn();
                                vm.uiState.contactLimitExceeded = true;
                            }
                        })
                    }, function (err) {
                        $state.go('app.marketing.campaigns');
                    });
            }
        }


    }

})();
