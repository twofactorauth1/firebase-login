'use strict';
/*global app, window*/
(function (angular) {
  app.controller('ContactsCtrl', ["$scope", "$state", "toaster", "$modal", "$window", "ContactService", "SocialConfigService", "userConstant", "formValidations", "CommonService", '$timeout', 'SweetAlert', "$location", function ($scope, $state, toaster, $modal, $window, ContactService, SocialConfigService, userConstant, formValidations, CommonService, $timeout, SweetAlert, $location) {

    $scope.tableView = 'list';
    $scope.itemPerPage = 100;
    $scope.showPages = 15;
    $scope.selectAllChecked = false;
    $scope.bulkActionChoice = {};
    $scope.tagsBulkAction = {};

    if (!$state.current.sort) {
      $scope.order = "reverse";
    }
    $scope.formValidations = formValidations;
    $scope.default_image_url = "/admin/assets/images/default-user.png";

    $scope.bulkActionChoices = [{data: 'tags', label: 'Tags'}, {data: 'delete', label: 'Delete'}];

    $scope.filterContactPhotos = function (contacts) {
      _.each(contacts, function (contact) {
        if (contact) {
          contact.hasPhoto = false;
          if (contact.photo) {
            if ($("#contact_photo_" + contact._id).attr("src") === $scope.default_image_url) {
              contact.hasPhoto = false;
            } else {
              contact.hasPhoto = true;
            }
          }
        }
      });
    };

    $scope.filterContacts = function () {
      $scope.showFilter = !$scope.showFilter;
      $scope.filterContactPhotos($scope.contacts);
    };

    /*
     * @getContacts
     * -
     */

    $scope.getContacts = function () {
      ContactService.getContacts(function (contacts) {
        _.each(contacts, function (contact) {
          contact.bestEmail = $scope.checkBestEmail(contact);
          contact.hasFacebookId = $scope.checkFacebookId(contact);
          contact.hasTwitterId = $scope.checkTwitterId(contact);
          contact.hasLinkedInId = $scope.checkLinkedInId(contact);
          contact.hasGoogleId = $scope.checkGoogleId(contact);

          contact.bestAddress = $scope.displayAddressFormat(contact);
          var tempTags = [];
          var tagLabel = "";
          _.each(contact.tags, function (tag) {
             tagLabel = _.findWhere($scope.contactTags, { data: tag });
              if(tagLabel)
                tempTags.push(tagLabel.label);
              else
                tempTags.push(tag);
          });
          if(tempTags)
            contact.tempTags = _.uniq(tempTags);
        });
        $scope.contacts = contacts;
        // In case contact is created from simple form component.
        if($scope.contacts.length > 0){
          $scope.minRequirements = true;
        }
        if ($state.current.sort) {
          $scope.setSortOrder($state.current.sort);
        }
        $scope.showContacts = true;
        ContactService.getAllContactTags(contacts, function(tags){
          $scope.contactTags = tags;
        });

      });
    };

    $scope.getContacts();

    ContactService.getContactTags(function(tags){
      $scope.contactTags = tags;
    });

    /*
     * @getters
     * - getters for the sort on the table
     */

    $scope.getters = {
      created: function (value) {
        return value.created.date || -1;
      },
      modified: function (value) {
        return value.modified.date;
      },
      name: function (value) {
        return [value.first, value.middle, value.last].join(' ').trim();
      },
      tags: function (value) {
        return $scope.contactTagsFn(value);
      },
      phone: function (value) {
        if (value.details[0] && value.details[0].phones && value.details[0].phones[0]) {
          return value.details[0].phones[0].number.trim();
        }
        return "";
      },
      address: function (value) {
        return value.bestAddress
      },
      social: function (value) {
        if (value.hasLinkedInId) {
          return 1;
        }
        if (value.hasGoogleId) {
          return 2;
        }
        if (value.hasFacebookId) {
          return 3;
        }
        if (value.hasTwitterId) {
          return 4;
        }

        return 5;
      }
    };

    /*
     * @openModal
     * -
     */

    $scope.openModal = function (template, controller, _size) {
      // console.log('');
      // $scope.modalInstance = $modal.open({
      //   templateUrl: template,
      //   controller: controller,
      //   scope: $scope,
      //   backdrop: 'static',
      //   size: _size || 'md'
      // });
      // angular.element('.modal-body').editable({selector: '.editable'});
      console.log('openModal >>> ', template, controller, _size);
      var _modal = {
        templateUrl: template,
        keyboard: false,
        backdrop: 'static',
        size: 'md',
        resolve: {
          getContacts: function () {
            return $scope.getContacts;
          }
        }
      };

      if (controller) {
        _modal.controller = controller;
      }

      if (_size) {
        _modal.size = _size;
      }

      $scope.modalInstance = $modal.open(_modal);
      $scope.modalInstance.result.then(null, function () {
        angular.element('.sp-container').addClass('sp-hidden');
      });
    };

    $scope.openSimpleModal = function (modal) {
      var _modal = {
        templateUrl: modal,
        scope: $scope,
        keyboard: false,
        backdrop: 'static'
      };
      $scope.modalInstance = $modal.open(_modal);
      $scope.modalInstance.result.then(null, function () {
        angular.element('.sp-container').addClass('sp-hidden');
      });
    };

    /*
     * @closeModal
     * -
     */

    $scope.closeModal = function () {
      $scope.modalInstance.close();
      $scope.socailList = false;
      $scope.groupList = false;
    };

    /*
     * @preventClick
     * -
     */

    $scope.preventClick = function (event) {
      event.stopPropagation();
    };

    /*
     * @column
     * -
     */

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

    $scope.contactTagsFn = function (contact) {
      return ContactService.contactTags(contact);
    };

    $scope.checkBestEmail = function (contact) {
      var returnVal = ContactService.checkBestEmail(contact);
      this.email = contact.email;
      return returnVal;
    };

    $scope.checkFacebookId = function (contact) {
      var returnVal = ContactService.checkFacebookId(contact);
      this.facebookId = contact.facebookId;
      return returnVal;
    };

    $scope.checkTwitterId = function (contact) {
      var returnVal = ContactService.checkTwitterId(contact);
      this.twitterId = contact.twitterId;
      return returnVal;
    };

    $scope.checkLinkedInId = function (contact) {
      var returnVal = ContactService.checkLinkedInId(contact);
      this.linkedInUrl = contact.linkedInUrl;
      this.linkedInId = contact.linkedInId;
      return returnVal;
    };

    $scope.checkGoogleId = function (contact) {
      var returnVal = ContactService.checkGoogleId(contact);
      this.googleUrl = contact.googleUrl;
      this.googleId = contact.googleId;
      return returnVal;
    };

    $scope.checkAddress = function (contact) {
      var returnVal = ContactService.checkAddress(contact);
      this.address = contact.address;
      return returnVal;
    };

    $scope.displayAddressFormat = function (contact) {
      if (contact.details.length !== 0 && contact.details[0].addresses && contact.details[0].addresses.length !== 0) {
        var address = contact.details[0].addresses[0];
        if (address && (address.address || address.address2 || address.city || address.state || address.zip)) {
          //var address = scope.htmlToPlaintext(address);
          var separator = ' ';
          var _topline = '';
          if(address.address || address.address2)
            _topline = _.filter([address.address, address.address2], function (str) {
              return str !== "";
            }).join(", ");
          var _bottomline = '';
          if(address.city || address.state || address.zip)
           _bottomline = _.filter([address.city, address.state, address.zip], function (str) {
            return str !== "";
          }).join(", ");
          if(_bottomline && _topline){
            separator = ", "
          }
          if (_topline) {
            return _topline + separator + _bottomline;
          }
          return _bottomline;
        }
    }
    };
    $scope.viewSingle = function (contact) {
      var tableState = $scope.getSortOrder();
      $state.current.sort = tableState.sort;
      $location.path('/contacts/' + contact._id);
    };

    /* 18-Sep Unioned set of tags in system with those needed by Indigenous
    *
    * Retained (part of Ind. flow)
    *   - Lead (ld)
    *   - Customer (cu)
    *
    * New:
    *   - Cheatsheet Lead (cs)
    *   - Trial Customer (tc)
    *   - Expired Trial Customer (ex)
    *   - Cancelled Trial Customer (ct)
    *   - Cancelled Customer (cc)
    *
    * - Old. Keeping for our clients:
        *   - Colleague (co)
    *   - Friend (fr)
    *   - Member (mb)
    *   - Family (fa)
    *   - Admin (ad)
    *   - Other (ot)
    *
    * - Dumb: This list an that in contactDetailCtrl should be managed centrally (see case 4395)
    */

    $scope.contact = {};
    $scope.contact.tags = {};



    $scope.tagToContact = function(value) {
     return ContactService.tagToContact(value);
    }

    $scope.contactPhotoOptions = [{
      name: 'Photo',
      value: true
    }, {
      name: 'No Photo',
      value: false
    }];

    $scope.contactsLimit = 50;

    $scope.addContacts = function () {
      $scope.contactsLimit += 50;
    };

    $scope.addContact = function () {

      $scope.saveLoading = true;
      var tempTags = [];
      _.each($scope.contact.tags, function (tag) {
        tempTags.push(tag.data);
      });
      if(tempTags)
        tempTags = _.uniq(tempTags);
      var matchingContact = _.findWhere($scope.contacts, {
        bestEmail: $scope.contact.email
      });
      if(matchingContact){
        $scope.setDuplicateUser(true);
        $scope.saveLoading = false;
        return;
      }
      var tempContact = {
        first: $scope.contact.first,
        middle: $scope.contact.middle,
        last: $scope.contact.last,
        tags: tempTags
      };
      if($scope.contact.email){
        tempContact.details = [];
        tempContact.details.push({
          emails: [{
            _id: CommonService.generateUniqueAlphaNumericShort(),
            email: $scope.contact.email
          }]
        })
      }
      ContactService.saveContact(tempContact, function (returnedContact) {
        $scope.saveLoading = false;
        $scope.fullName = '';
        $scope.contact.tags = {};
        $scope.contact.email = '';
        $scope.duplicateContact = false;
        $scope.closeModal();


        returnedContact.bestEmail = $scope.checkBestEmail(returnedContact);
        $scope.contacts.unshift(returnedContact);
        $scope.incrementContactTags(returnedContact);
        toaster.pop('success', 'Contact Successfully Added');
        $scope.minRequirements = true;
      });
    };

    $scope.incrementContactTags = function (contact) {
      var contactTags = $scope.contactTags;
      if(contact){
        var contactTags = [];
          if (contact.tags) {
            _.each(contact.tags, function (tag) {
              var type = _.find(contactTags, function (type) {
                return type.data === tag;
              });
              if (!type) {
                contactTags.push({
                  label : tag,
                  data : tag
                })
              }
            });
          }
        $scope.contactTags = _.uniq(contactTags.concat(contactTags), function(w) { return w.label; })
      }
    };

    $scope.setDuplicateUser = function(val){
      $scope.duplicateContact = val;
    }

    $scope.$watch('fullName', function (newValue) {
      if (newValue !== undefined) {
        var nameSplit = newValue.match(/\S+/g);
        if (nameSplit) {
          if (nameSplit.length >= 3) {
            $scope.contact.first = nameSplit[0];
            $scope.contact.middle = nameSplit[1];
            $scope.contact.last = nameSplit[2];
          } else if (nameSplit.length === 2) {
            $scope.contact.first = nameSplit[0];
            $scope.contact.middle = '';
            $scope.contact.last = nameSplit[1];
          } else if (nameSplit.length === 1) {
            $scope.contact.first = nameSplit[0];
            $scope.contact.middle = '';
            $scope.contact.last = '';
          }
        } else {
          $scope.contact.first = '';
          $scope.contact.middle = '';
          $scope.contact.last = '';
        }
      }
    }, true);
    // $scope.socialAccounts = {};
    // SocialConfigService.getAllSocialConfig(function (data) {
    //   $scope.socialAccounts = data.socialAccounts;
    // });

    $scope.importFacebookFriends = function () {
      ContactService.importFacebookFriends(function (data, success) {
        if (success) {
          $('#import-contacts-modal').modal('hide');
          toaster.pop('success', "Contacts being imported.");
        } else {
          $window.location.href = "/socialconfig/facebook?redirectTo=" + encodeURIComponent('/admin#/contact');
        }
      });
    };

    $scope.importLinkedInConnections = function () {
      var foundSocialId = false;
      $scope.socialAccounts.forEach(function (value) {
        if (value.type === userConstant.social_types.LINKEDIN) {
          foundSocialId = true;
          $scope.closeModal();
          toaster.pop('success', "Contacts import initiated.");
          SocialConfigService.importLinkedinContact(value.id, function () {
            $scope.closeModal();
            toaster.pop('success', "Contacts import complete.");
          });
        }
      });
      if (foundSocialId === false) {
        $scope.closeModal();
        toaster.pop('warning', "No linkedin account integrated.");
      }
    };

    $scope.importGmailContacts = function () {
      var foundSocialId = false;
      $scope.socialAccounts.forEach(function (value) {
        if (value.type === userConstant.social_types.GOOGLE) {
          foundSocialId = true;
          $scope.closeModal();
          toaster.pop('success', "Contacts import initiated.");
          SocialConfigService.importGoogleContact(value.id, function () {
            $scope.closeModal();
            toaster.pop('success', "Contacts import complete.");
          });
        }
      });
      if (foundSocialId === false) {
        $scope.closeModal();
        toaster.pop('warning', "No google account integrated.");
      }
    };

    /*
     * @triggerInput
     * - trigger the hidden input to trick smart table into activating filter
     */

    $scope.triggerInput = function (element) {
      angular.element(element).trigger('input');
    };

    /*
     * @clearFilter
     * - clear the filter for the status when the red X is clicked
     */

    $scope.filterContact = {};

    $scope.clearFilter = function (event, input, filter) {
      $scope.filterContact[filter] = {};
      $scope.triggerInput(input);
    };

    // $scope.socailType = "";
    // $scope.socailList = false;
    // $scope.groupList = false;

    // $scope.showSocialAccountSelect = function (socailType) {
    //   $scope.socailType = socailType;
    //   $scope.socailList = true;
    //   if (socailType === userConstant.social_types.GOOGLE) {
    //     $scope.groupList = true;
    //   } else {
    //     $scope.groupList = false;
    //   }
    // };

    $scope.bulkActionSelectFn = function () {
        if ($scope.bulkActionChoice.action.data == 'delete') {
            SweetAlert.swal({
                title: "Are you sure?",
                text: "Do you want to delete the filtered contacts?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, do not delete it!",
                closeOnConfirm: true,
                closeOnCancel: true
              },
              function (isConfirm) {
                if (isConfirm) {
                    var selectedContacts = $scope.selectedContactsFn();
                    selectedContacts.forEach(function(sc, sci) {
                        ContactService.deleteContact(sc._id, function () {});
                        $scope.contacts.splice(_.findIndex($scope.contacts, function(c) {return c._id == sc._id; }), 1);
                        $scope.displayedContacts.splice(_.findIndex($scope.displayedContacts, function(c) {return c._id == sc._id; }), 1);
                    });
                    $scope.bulkActionChoice = null;
                    $scope.bulkActionChoice = {};
                    $scope.clearSelectionFn();
                    toaster.pop('success', 'Contacts Deleted.');
                } else {
                 $scope.bulkActionChoice = null;
                 $scope.bulkActionChoice = {};
                }
              });
        }

        if ($scope.bulkActionChoice.action.data == 'tags') {
            $scope.bulkActionChoice = {};
            $scope.openSimpleModal('tags-bulk-action-modal');
        }

        if ($scope.bulkActionChoice.action.data == 'export') {
          ContactService.exportCsvContacts(_.pluck($scope.selectedContactsFn(), '_id'));
          $scope.bulkActionChoice = null;
          $scope.bulkActionChoice = {};
          $scope.clearSelectionFn();
          toaster.pop('success', 'Contact export started.');
        }
    };

    $scope.selectAllClickFn = function ($event) {
        $event.stopPropagation();
        if ($scope.selectAllChecked) {
            $scope.selectAllChecked = false;
        } else {
            $scope.selectAllChecked = true;
        }
        $scope.displayedContacts.forEach(function(contact, index) {
            contact.isSelected = $scope.selectAllChecked;
        });
    };

    $scope.clearSelectionFn = function () {
        $scope.selectAllChecked = false;
        $scope.displayedContacts.forEach(function(contact, index) {
            contact.isSelected = $scope.selectAllChecked;
        });
    };

    $scope.contactSelectClickFn = function ($event, contact) {
        $event.stopPropagation();
        if (contact.isSelected) {
            contact.isSelected = false;
        } else {
            contact.isSelected = true;
        }
    };

    $scope.selectedContactsFn = function () {
        var exportContacts = _.filter($scope.displayedContacts, function(contact) { return contact.isSelected; });
        $scope.exportText = exportContacts.length ? "Export Selected " + exportContacts.length : "Export";
        return exportContacts;
    };

    $scope.tagsBulkActionClickFn = function (operation) {
        var selectedContacts = $scope.selectedContactsFn();
        var tags = _.uniq(_.pluck($scope.tagsBulkAction.tags, 'data'));

        selectedContacts.forEach(function(contact, index) {
            if (operation == 'add') {
                if ($scope.tagsBulkAction.toReplace) {
                    contact.tags = tags;
                } else {
                    if (contact.tags) {
                        contact.tags = contact.tags.concat(tags);
                    } else {
                        contact.tags = tags;
                    }
                }
            }

            if (operation == 'remove') {
                contact.tags = _.difference(contact.tags, tags);
            }

            ContactService.saveContact(contact, function() {});
        });

        $scope.tagsBulkAction = {};
        $scope.clearSelectionFn();
        $scope.closeModal();
        toaster.pop('success', 'Contacts tags updated.');
    };

    $scope.exportContactsFn = function () {
      if (_.pluck($scope.selectedContactsFn().length)) {
        ContactService.exportCsvContacts(_.pluck($scope.selectedContactsFn(), '_id'));
      } else {
        ContactService.exportCsvContacts(null);
      }
      $scope.clearSelectionFn();
      toaster.pop('success', 'Contact export started.');
    };
  }]);
}(angular));
