(function() {

    app.controller('EmailCampaignController', indiEmailCampaignController);

    indiEmailCampaignController.$inject = ['$scope', 'EmailBuilderService', '$stateParams', '$state', 'toaster', 'AccountService', 'WebsiteService', '$modal', '$timeout', '$document', '$window', 'EmailCampaignService', 'ContactService', 'userConstant'];
    /* @ngInject */
    function indiEmailCampaignController($scope, EmailBuilderService, $stateParams, $state, toaster, AccountService, WebsiteService, $modal, $timeout, $document, $window, EmailCampaignService, ContactService, userConstant) {

        console.info('email-campaign directive init...');

        $scope.$state = $state;
        var vm = this;
        var contactTags = userConstant.contact_types.dp;

        vm.init = init;
        vm.state = vm.state || {};
        vm.uiState = vm.uiState || {};

        vm.campaignId = $stateParams.id;
        vm.campaign = {
            status: 'DRAFT',
            type: 'onetime'
        };
        vm.campaignOriginal = angular.copy(vm.campaign);
        vm.state.email = null;
        vm.uiState.dataLoaded = false;
        vm.disableEditing = true;
        vm.account = null;
        vm.website = {
            settings: {}
        };
        vm.contacts = [];
        vm.allContacts = [];
        vm.tagSelection = [];
        vm.recipients = [];
        vm.recipientsToRemove = [];
        vm.originalRecipients = [];
        vm.selectedContacts = {
            individuals: []
        };
        vm.whenToSend = 'now';
        vm.watchDeliveryDate = false;
        vm.delivery = {
            date: moment(),
            minDate: new Date()
        };
        vm.hstep = 1;
        vm.mstep = 1;
        vm.tableView = 'list';
        vm.triggers = [{
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


        function addContactsFn(createdContactsArr) {
            //get an array of contact Ids from recipients
            var recipientsIdArr = [];

            _.each(vm.recipients, function(recipient) {
                if (recipient._id) {
                    recipientsIdArr.push(recipient._id);
                }
            });

            //add created contacts to recipients array
            if (createdContactsArr.length > 0) {
                _.each(createdContactsArr, function(createdContactId) {
                    if (recipientsIdArr.indexOf(createdContactId) < 0) {
                        recipientsIdArr.push(createdContactId);
                    }
                });
            }

            var contactsArr = recipientsIdArr;

            vm.campaign.contacts = contactsArr;
            console.log(vm.campaign.contacts);
        }

        function removeContactsFromCampaignFn() {
            angular.forEach(vm.recipientsToRemove, function(contactId) {
                EmailCampaignService.cancelCampaignForContact(vm.campaign, contactId)
                    .then(function(res) {
                        console.warn('removed ' + contactId);
                    });
            });

            _.each(vm.removeContactsFromCampaign, function(id) {
                console.warn('remove ' + id);
                console.warn(_.indexOf(vm.campaign.contacts, id));
            });
        }

        function checkAndCreateContactFn(fn) {
            var contactsArr = [];
            var promises = [];
            if (vm.selectedContacts.newEmails) {
                var _emails = vm.selectedContacts.newEmails;
                _.each(_emails, function(email) {
                    var contact = _.findWhere(vm.contacts, {
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
                    .then(function(data) {
                        _.each(data, function(value) {
                            contactsArr.push(value.data._id);
                        });
                        fn(contactsArr);
                    })
                    .catch(function(err) {
                        console.error(err);
                    });
            } else {
                fn(contactsArr);
            }
        }

        function saveAsDraftFn() {
            vm.uiState.dataLoaded = false;
            var fn = EmailCampaignService.updateCampaign;

            if (vm.campaignId !== 'create') {
                fn = EmailCampaignService.createCampaign;
            }

            //resetting status
            vm.campaign.status = 'DRAFT';

            //populating structured delivery timestamp
            var sendAt = {};
            sendAt.year = moment.utc(vm.delivery.date).get('year');
            sendAt.month = moment.utc(vm.delivery.date).get('month') + 1;
            sendAt.day = moment.utc(vm.delivery.date).get('date');
            sendAt.hour = moment.utc(vm.delivery.date).get('hour');
            sendAt.minute = moment.utc(vm.delivery.date).get('minute');
            vm.campaign.steps[0].settings.sendAt = sendAt;

            vm.campaign.contactTags = vm.getSelectedTagsFn();
            vm.removeContactsFromCampaignFn();

            //processing custom emails for contact
            vm.checkAndCreateContactFn(function(createdContactsArr) {
                vm.addContactsFn(createdContactsArr);
                fn(vm.campaign)
                    .then(function(res) {
                        vm.campaign = res.data;
                        vm.campaignOriginal = angular.copy(res.data);
                        vm.uiState.dataLoaded = true;
                        vm.disableEditing = false;
                        toaster.pop('success', 'Campaign saved');
                    }, function(err) {
                        vm.uiState.dataLoaded = true;
                        toaster.pop('error', 'Campaign save failed');
                    });
            });
        }

        function sendTestFn(address) {
            vm.uiState.dataLoaded = false;
            EmailCampaignService.sendTestEmail(address, vm.state.email)
                .then(function(res) {
                    vm.uiState.dataLoaded = true;
                    vm.closeModalFn();
                    toaster.pop('success', 'Send test email');
                }, function(err) {
                    vm.uiState.dataLoaded = true;
                    vm.closeModalFn();
                    toaster.pop('error', 'Send test mail failed');
                });
        }

        function activateCampaignFn() {
            vm.uiState.dataLoaded = false;
            var fn = EmailCampaignService.updateCampaign;

            if (vm.campaignId !== 'create') {
                fn = EmailCampaignService.createCampaign;
            }
            vm.campaign.status = 'PENDING';
            fn(vm.campaign)
                .then(function(res) {
                    vm.campaign = res.data;
                    vm.campaignOriginal = angular.copy(res.data);
                    vm.uiState.dataLoaded = true;
                    vm.disableEditing = true;
                    toaster.pop('success', 'Campaign activated');
                }, function(err) {
                    vm.uiState.dataLoaded = true;
                    toaster.pop('error', 'Campaign activation failed');
                });
        }

        function checkBestEmailFn(contact) {
            var returnVal = ContactService.checkContactBestEmail(contact);
            return returnVal;
        }

        function getContactsFn() {
            var promise = ContactService.getContacts(function(contacts) {
                var contactWithoutEmails = [];
                _.each(contacts, function(contact) {
                    if (!vm.checkBestEmailFn(contact)) {
                        contactWithoutEmails.push(contact);
                    }
                });
                contacts = _.difference(contacts, contactWithoutEmails);
                vm.contacts = contacts;
                ContactService.getAllContactTags(contacts, function(tags) {
                    contactTags = tags;
                });
                var _tags = [];
                vm.allContacts = [];
                _.each(contacts, function(contact) {
                    vm.allContacts.push({
                        _id: contact._id,
                        first: contact.first
                    });
                    //contact.fullName = contact.first + " " + contact.last || '';
                    if (contact.tags && contact.tags.length > 0) {
                        _.each(contact.tags, function(tag) {
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
                var d = _.groupBy(_tags, function(tag) {
                    return tag;
                });

                var x = _.map(d, function(tag) {
                    var returnObj = {
                        uniqueTag: tag[0],
                        numberOfTags: tag.length
                    };
                    var matchingTagObj = _.find(contactTags, function(matchTag) {
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
            _.each(vm.tagSelection, function(fullTag) {
                var matchingTag = _.find(contactTags, function(matchTag) {
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
            return vm.selectedContacts.individuals.indexOf(contact._id) > -1;
        };

        function getRecipientsFn() {

            var fullContacts = [];

            //get the tags that have been selected
            var tags = vm.getSelectedTagsFn();

            //loop through contacts and add if one of the tags matches

            _.each(vm.contacts, function(contact) {
                if (contact.tags && contact.tags.length > 0) {
                    var tempTags = [];
                    var tagLabel = "";
                    _.each(contact.tags, function(tag) {
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
                        if (!vm.eliminateDuplicateFn(contact))
                            fullContacts.push(contact);
                    }
                } else {
                    if (tags.indexOf('No Tag') > -1) {
                        if (!vm.eliminateDuplicateFn(contact))
                            fullContacts.push(contact);
                    }
                }

                //add contacts from individual

                if (vm.selectedContacts.individuals.indexOf(contact._id) > -1) {
                    fullContacts.push(contact);
                }
            });

            return fullContacts;
        }

        function toggleSelectionFn(tagName) {
            var idx = vm.tagSelection.indexOf(tagName);

            // is currently selected
            if (idx > -1) {
                vm.tagSelection.splice(idx, 1);
            } else {
                vm.tagSelection.push(tagName);
            }
            vm.recipients = vm.getRecipientsFn();

        }

        function contactSelectedFn(select) {
            var selected = select.selected[select.selected.length - 1];
            var removalIndex = _.indexOf(vm.recipientsToRemove, selected._id);
            var existingContact = _.find(vm.recipients, function(recipient) {
                return recipient._id === selected._id;
            });

            if (!existingContact) {
                vm.recipients.push(selected);
            }

            // clear search text
            select.search = '';

            //remove from removal array
            if (removalIndex !== -1) {
                vm.recipientsToRemove.splice(removalIndex, 1);
            }
        }

        function contactRemovedFn(select, selected) {
            var existingContactIndex;
            var contact = _.findWhere(vm.recipients, {
                _id: selected._id
            });
            if (contact) {
                existingContactIndex = _.indexOf(vm.recipients, contact);
            }

            if (existingContactIndex > -1) {
                //get the tags that have been selected
                var tags = vm.getSelectedTagsFn();
                var tempTags = [];
                var tagLabel = "";
                _.each(contact.tags, function(tag) {
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
                    vm.recipients.splice(existingContactIndex, 1);
                }

            }
            // clear search text
            select.search = '';

            //add to removal array
            vm.recipientsToRemove.push(selected._id);
        }

        function checkContactExistsFn(email) {
            var matchingRecipient = _.find(vm.recipients, function(recipient) {
                if (recipient.details && recipient.details[0] && recipient.details[0].emails && recipient.details[0].emails[0] && recipient.details[0].emails[0].email) {
                    return (recipient.details[0].emails[0].email).toLowerCase() === email.text;
                }
            });
            var matchingContact = _.find(vm.contacts, function(contact) {
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
            vm.whenToSend = value;
            vm.watchDeliveryDate = true;
            if (vm.whenToSend !== 'later') {
                vm.delivery.date = moment();
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
            EmailCampaignService.getCampaignContacts(vm.campaignId)
                .then(function(res) {
                    vm.originalRecipients = angular.copy(res.data);
                    vm.recipients = res.data;
                    var individuals = [];
                    _.each(res.data, function(contact) {
                        individuals.push(
                            contact._id
                        );
                    });
                    vm.selectedContacts.individuals = individuals;
                    vm.uiState.dataLoaded = true;
                });
        }

        function loadSavedTagsFn() {
            vm.uiState.dataLoaded = false;
            _.each(vm.campaign.contactTags, function(tag) {
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
            var isDirty = true;

            if (_.isEqual(vm.campaign, vm.campaignOriginal)) {
                isDirty = false;
            } else {
                isDirty = true;
            }

            if (_.isEqual(vm.delivery.date, vm.delivery.originalDate)) {
                isDirty = false;
            } else {
                isDirty = true;
            }

            if (_.isEqual(_.pluck(vm.recipients, '_id').sort(), _.pluck(vm.originalRecipients, '_id').sort())) {
                isDirty = false;
            } else {
                isDirty = true;
            }

            return isDirty;
        }

        function resetDirtyFn() {
            vm.campaign = angular.copy(vm.campaignOriginal);
            vm.delivery.date = angular.copy(vm.delivery.originalDate);
            vm.recipients = angular.copy(vm.originalRecipients);
        }

        function duplicateFn() {
            EmailCampaignService.duplicateCampaign(vm.campaign)
            .then(function(res) {
                $state.go('app.emailCampaign', {id: res.data._id});
                toaster.pop('success', 'Campaign cloned');
            });
        }

        function init(element) {
            vm.element = element;

            AccountService.getAccount(function(data) {
                vm.account = data;
            });

            WebsiteService.getWebsite(function(data) {
                vm.website = data;
            });

            if (vm.campaignId !== 'create') {
                EmailCampaignService.getCampaign(vm.campaignId)
                    .then(function(res) {
                        if (!res.data._id) {
                            toaster.pop('error', 'Campaign not found');
                            $state.go('app.marketing.campaigns');
                        }
                        vm.campaign = res.data;
                        vm.campaignOriginal = angular.copy(res.data);
                        console.info('campaign obj', vm.campaign);

                        if (vm.campaign.steps[0].settings.emailId) {
                            EmailBuilderService.getEmail(vm.campaign.steps[0].settings.emailId)
                                .then(function(res) {
                                    vm.state.email = res.data;
                                });
                        }

                        var sendAtDateISOString = moment.utc(vm.campaign.steps[0].settings.sendAt).subtract('months', 1).toISOString();
                        var localMoment = moment(sendAtDateISOString);

                        if (vm.campaign.type === 'onetime') {
                            if (localMoment.isValid()) {
                                vm.delivery.date = localMoment;
                                vm.delivery.originalDate = angular.copy(localMoment);
                                vm.whenToSend = localMoment.isAfter() ? 'later' : 'now';
                            }
                        }

                        if (vm.campaign.status === 'DRAFT') {
                            vm.disableEditing = false;
                        }
                        vm.getContactsFn()
                            .then(function() {
                                vm.loadSavedTagsFn();
                            });
                        vm.getCampaignContactsFn();
                    }, function(err) {
                        $state.go('app.marketing.campaigns');
                    });
            }
        }


    }

})();
