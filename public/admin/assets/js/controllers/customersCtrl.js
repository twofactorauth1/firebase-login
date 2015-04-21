'use strict';
/**
 * controller for customers
 */
(function(angular) {
    app.controller('CustomersCtrl', ["$scope", "toaster", "$filter", "$modal", "CustomerService", "SocialConfigService", "userConstant", function($scope, toaster, $filter, $modal, CustomerService, SocialConfigService, userConstant) {

        CustomerService.getCustomers(function(customers) {
            console.log('customers >>> ', customers);
            _.each(customers, function(customer) {
                customer.bestEmail = $scope.checkBestEmail(customer);
                customer.bestAddress = $scope.checkAddress(customer);
            });
            $scope.customers = customers;
        });

        $scope.getters = {
            created: function(value) {
                return value.created.date;
            },
            modified: function(value) {
                return value.modified.date;
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
        };

        $scope.preventClick = function(event) {
            event.stopPropagation();
        };

        $scope.column = {
            "photo": true,
            "name": true,
            "category": true,
            "email": true,
            "address": true,
            "social": true,
            "phone": true,
            "created": true,
            "modified": true
        };

        $scope.contactLabel = function(customer) {
            return CustomerService.contactLabel(customer);
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

        $scope.importContacts = function(selectedAccount) {
            var foundSocialId = false;
            if (selectedAccount.type == userConstant.social_types.GOOGLE) {
                    foundSocialId = true;
                    $scope.closeModal();
                    toaster.pop('success', "Contacts import initiated.");
                    SocialConfigService.importGoogleContact(selectedAccount.id, function(data) {
                        $scope.closeModal();
                        toaster.pop('success', "Contacts import complete.");
                    });
                }
            if (selectedAccount.type == userConstant.social_types.LINKEDIN) {
                foundSocialId = true;
                $scope.closeModal();
                toaster.pop('success', "Contacts import initiated.");
                SocialConfigService.importLinkedinContact(selectedAccount.id, function(data) {
                    $scope.closeModal();
                    toaster.pop('success', "Contacts import complete.");
                });
            }  

            if (foundSocialId == false) {
                $scope.closeModal();
                toaster.pop('warning', "No google account integrated.");
            }
        };
        $scope.socailType = "";
        $scope.socailList = false;
        $scope.showSocialAccountSelect = function(socailType) { 
            $scope.socailType = socailType;
            $scope.socailList = true;
        };

    }]);
})(angular);
