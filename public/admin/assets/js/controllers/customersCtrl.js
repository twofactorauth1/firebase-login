'use strict';
/**
 * controller for customers
 */
(function(angular) {
    app.controller('CustomersCtrl', ["$scope", "toaster", "$filter", "$modal", "CustomerService", "SocialConfigService", "userConstant", function($scope, toaster, $filter, $modal, CustomerService, SocialConfigService, userConstant) {
        $scope.tableView = 'list';
        CustomerService.getCustomers(function(customers) {
            console.log('customers >>> ', customers);
            _.each(customers, function(customer) {
                customer.bestEmail = $scope.checkBestEmail(customer);
                customer.bestAddress = $scope.checkAddress(customer);

                customer.hasPhoto = false;
                if(customer.photo) {
                    customer.hasPhoto = true;
                }
            });
            $scope.customers = customers;
        });
        /*
         * @getters
         * - getters for the sort on the table
         */
        $scope.getters = {
            created: function(value) {
                return value.created.date;
            },
            modified: function(value) {
                return value.modified.date;
            },
            name:function(value)
            {
                return [value.first, value.middle, value.last].join(' ').trim();
            },
            tags:function(value)
            {
                return $scope.contactTags(value)
            },
            phone:function(value)
            {
                if(value.details[0].phones && value.details[0].phones[0])
                {
                   return value.details[0].phones[0].number.trim()
                }
                else
                {
                    return ""
                }
            },
            address:function(value)
            {
                if(value.details[0].addresses && value.details[0].addresses[0] && value.details[0].addresses[0].city && value.details[0].addresses[0].state)
                {
                   return [value.details[0].addresses[0].city, value.details[0].addresses[0].state].join(' ').trim()
                }
                else if(value.details[0].addresses && value.details[0].addresses[0] && value.details[0].addresses[0].address && !value.details[0].addresses[0].city)
                {
                   return value.details[0].addresses[0].address
                }
            }
        };

        

        $scope.openModal = function(template) {
            $scope.modalInstance = $modal.open({
                templateUrl: template,
                scope: $scope
            });
        };

        $scope.closeModal = function() {
            $scope.modalInstance.close();
            $scope.socailList = false;
            $scope.groupList = false;
        };

        $scope.preventClick = function(event) {
            event.stopPropagation();
        };

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

        $scope.contactTags = function(customer) {
            return CustomerService.contactTags(customer);
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

        $scope.checkGoogleId = function(contact) {
            var returnVal = CustomerService.checkGoogleId(contact);
            this.googleUrl = contact.googleUrl;
            this.googleId = contact.googleId;
            return returnVal;
        };

        $scope.checkAddress = function(contact) {
            var returnVal = CustomerService.checkAddress(contact);
            this.address = contact.address;
            return returnVal;
        };

        $scope.viewSingle = function(customer) {
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

        $scope.addCustomer = function() {
            console.log('addCustomer >>> ', $scope.fullName, $scope.customer.tags);
            var tempTags = [];
            _.each($scope.customer.tags, function(tag) {
                tempTags.push(tag.data);
            });
            var tempCustomer = {
                first: $scope.customer.first,
                middle: $scope.customer.middle,
                last: $scope.customer.last,
                tags: tempTags
            };
            CustomerService.saveCustomer(tempCustomer, function(returnedCustomer) {
                $scope.fullName = '';
                $scope.customer.tags = {};
                $scope.closeModal();
                $scope.customers.unshift(returnedCustomer);
                toaster.pop('success', 'Customer Successfully Added');
            });
        };

        $scope.$watch('fullName', function(newValue, oldValue) {
            if (newValue !== undefined) {
                var nameSplit = newValue.match(/\S+/g);
                if (nameSplit) {
                    if (nameSplit.length >= 3) {
                        $scope.customer.first = nameSplit[0];
                        $scope.customer.middle = nameSplit[1];
                        $scope.customer.last = nameSplit[2];
                    } else if (nameSplit.length == 2) {
                        $scope.customer.first = nameSplit[0];
                        $scope.customer.middle = '';
                        $scope.customer.last = nameSplit[1];
                    } else if (nameSplit.length == 1) {
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
        SocialConfigService.getAllSocialConfig(function(data) {
            $scope.socialAccounts = data.socialAccounts;
            console.log($scope.socialAccounts);
        });

        $scope.importFacebookFriends = function() {
            CustomerService.importFacebookFriends(function(data, success) {
                if (success) {
                    $('#import-contacts-modal').modal('hide');
                    ToasterService.show('success', "Contacts being imported.");
                } else
                    $window.location.href = "/socialconfig/facebook?redirectTo=" + encodeURIComponent('/admin#/customer');
            });
        };

        $scope.importLinkedInConnections = function() {
            var foundSocialId = false;
            $scope.socialAccounts.forEach(function(value, index) {
                if (value.type == userConstant.social_types.LINKEDIN) {
                    foundSocialId = true;
                    $scope.closeModal();
                    toaster.pop('success', "Contacts import initiated.");
                    SocialConfigService.importLinkedinContact(value.id, function(data) {
                        $scope.closeModal();
                        toaster.pop('success', "Contacts import complete.");
                    });
                }
            });
            if (foundSocialId == false) {
                $scope.closeModal();
                toaster.pop('warning', "No linkedin account integrated.");
            }
        };

        $scope.importGmailContacts = function() {
            var foundSocialId = false;
            $scope.socialAccounts.forEach(function(value, index) {
                if (value.type == userConstant.social_types.GOOGLE) {
                    foundSocialId = true;
                    $scope.closeModal();
                    toaster.pop('success', "Contacts import initiated.");
                    SocialConfigService.importGoogleContact(value.id, function(data) {
                        $scope.closeModal();
                        toaster.pop('success', "Contacts import complete.");
                    });
                }
            });
            if (foundSocialId == false) {
                $scope.closeModal();
                toaster.pop('warning', "No google account integrated.");
            }
        };

        /*
         * @triggerInput
         * - trigger the hidden input to trick smart table into activating filter
         */

        $scope.triggerInput = function(element) {
            angular.element(element).trigger('input');
        };

        /*
         * @clearFilter
         * - clear the filter for the status when the red X is clicked
         */

        $scope.filterCustomer = {};

        $scope.clearFilter = function(event, input, filter) {
            $scope.filterCustomer[filter] = {};
            $scope.triggerInput(input);
        };

        $scope.importGoogleContacts = function(groupId) {
            console.log("account: ", $scope.tempGoogleAccount);
            console.log("group: ", groupId);
            $scope.closeModal();
            toaster.pop('success', "Contacts import initiated.");
            SocialConfigService.importGoogleContactsForGroup($scope.tempGoogleAccount.id, groupId.id, function(data) {
                $scope.closeModal();
                toaster.pop('success', "Your Google contacts are being imported in the background.");
            });
            $scope.tempGoogleAccount = null;
            $scope.socailList = false;
            $scope.groupList = false;
        };

        $scope.importContacts = function(selectedAccount) {
            var foundSocialId = false;
            if (selectedAccount.type == userConstant.social_types.GOOGLE) {
                    foundSocialId = true;
                    $scope.tempGoogleAccount = selectedAccount;
                    SocialConfigService.getGoogleGroups(selectedAccount.id, function(data){
                        console.dir(data);
                        data.push({name:'All', id:'All'});
                        $scope.socialAccountGroups = data;
                    });
                    //$scope.closeModal();
                    //toaster.pop('success', "Contacts import initiated.");
                    //SocialConfigService.importGoogleContact(selectedAccount.id, function(data) {
                    //    $scope.closeModal();
                    //    toaster.pop('success', "Your Google contacts are being imported in the background.");
                    //});
                }
            if (selectedAccount.type == userConstant.social_types.LINKEDIN) {
                foundSocialId = true;
                $scope.closeModal();
                toaster.pop('success', "Contacts import initiated.");
                SocialConfigService.importLinkedinContact(selectedAccount.id, function(data) {
                    $scope.closeModal();
                    toaster.pop('success', "Your LinkedIn contacts are being imported in the background.");

                });
                $scope.socailList = false;
                $scope.groupList = false;
            }  

            if (foundSocialId == false) {
                $scope.closeModal();
                toaster.pop('warning', "No such account integrated.");
                $scope.socailList = false;
                $scope.groupList = false;
            }


        };
        $scope.socailType = "";
        $scope.socailList = false;
        $scope.groupList = false;

        $scope.showSocialAccountSelect = function(socailType) { 
            $scope.socailType = socailType;
            $scope.socailList = true;
            if(socailType === userConstant.social_types.GOOGLE) {
                $scope.groupList = true;
            } else {
                $scope.groupList = false;
            }
        };

    }]);
})(angular);
