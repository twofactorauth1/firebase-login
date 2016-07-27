'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('SettingsCtrl', ["$scope", "$log", "$modal", "$state", "WebsiteService", "AccountService", "UserService", "toaster", "$timeout", '$location', 'SimpleSiteBuilderService', '$window', 'SweetAlert', 'pageConstant', function ($scope, $log, $modal, $state, WebsiteService, AccountService, UserService, toaster, $timeout, $location, SimpleSiteBuilderService, $window, SweetAlert, pageConstant) {
    $scope.keywords = [];

    console.log($location.absUrl().replace('main', 'hey'));
    /*
     * @settingsTitles
     * list of settings titles to map to
     */

    var viewTitles = {
      "website": "Website Settings",
      "commerce": "Commerce Settings",
      "customers": "Customers Settings",
      "emails": "Email Settings",
      "all": "Settings"
    };

    /*
     * @clearAllNotifications
     * clear all notification checkboxes
     */

    $scope.clearAllNotifications = function () {
      $scope.account.email_preferences.new_contacts = false;
      $scope.account.email_preferences.new_orders = false;
      $scope.account.email_preferences.helpful_tips = false;
    };

    $scope.clearNoNotifications = function () {
      $scope.account.email_preferences.no_notifications = false;
    };

    /*
     * @viewSettings
     * show section and navigate to tab
     */

    $scope.settingsView = 'all';
    $scope.viewTitle = viewTitles['all'];

    $scope.viewSettings = function (section, tab) {
      $scope.settingsView = section;
      $scope.viewTitle = viewTitles[section];
      $timeout(function () {
        angular.element('.sitesettings [heading="' + tab + '"] a').triggerHandler('click');
      }, 0);
    };


    AccountService.getAccount(function (account) {
        $scope.account = account;
            $scope.originalAccount = angular.copy(account);
            if (!account.commerceSettings) {
                account.commerceSettings = {
                taxes: true,
                taxbased: '',
                taxnexus: ''
            };
        }
    });

    $scope.$watch(function() { return SimpleSiteBuilderService.website; }, function(website){
        if(website){
            var _defaults = false;
            $scope.website = website;
            $scope.keywords = website.seo.keywords;
            if($scope.website){
              if(!$scope.website.title && $scope.account.business.name){
                $scope.website.title = angular.copy($scope.account.business.name);
                _defaults = true;
              }
              if(!$scope.website.seo){
                $scope.website.seo = {};
              }
              if(!$scope.website.seo.description && $scope.account.business.description){
                $scope.website.seo.description = angular.copy($scope.account.business.description);
                _defaults = true;
              }
            }
            if(_defaults){
              $scope.saveLoading = true;
              SimpleSiteBuilderService.saveWebsite($scope.website).then(function(response){
                $scope.saveLoading = false;
              });
            }
        }

    });

    /*
     * @saveSettings
     * save update account and website obj
     */

    $scope.saveLoading = false;

    $scope.saveSettings = function () {
      $scope.saveLoading = true;
      if(!$scope.account.subdomain && !$scope.account.domain)
      {
        $scope.saveLoading = false;
        toaster.pop('error', "Subdomain can't be blank");
        return;
      }

      if ($scope.account.commerceSettings.paypal && !$scope.account.commerceSettings.paypalAddress) {
          $scope.saveLoading = false;
          toaster.pop('error', "Paypal address can't be blank");
          return;
      }
        
        if ($scope.account.commerceSettings.taxes && $scope.account.commerceSettings.taxbased === 'business_location') {
            var hasZip = true;

            if (!$scope.account.business) {
                hasZip = false;    
            } else if ($scope.account.business && !$scope.account.business.addresses) {
                hasZip = false;
            } else if ($scope.account.business && $scope.account.business.addresses && !$scope.account.business.addresses.length) {
                hasZip = false;
            } else if ($scope.account.business && $scope.account.business.addresses && $scope.account.business.addresses.length && $scope.account.business.addresses[0].zip === '') {
                hasZip = false;
            }

            if (!hasZip) {
                $scope.saveLoading = false;
                toaster.pop('error', "Business Location tax basis requires an address on Business Profile");
                return;
            }
        }

        AccountService.updateAccount($scope.account, function (data, error) {
            if (error) {
                $scope.saveLoading = false;
                toaster.pop('error', error.message);
            } else {
                var _links = [];
                $scope.website.linkLists.forEach(function (value, index) {
                    if (value.handle === "head-menu") {
                        _links = value.links;
                    }
                })

                var _blogIndex = _.findIndex(_links, function(link) { return link.linkTo.data === pageConstant.page_handles.BLOG })

                // Add blog link to nav
                if($scope.account.showhide.blog && $scope.account.showhide.ssbBlog){
                    if(_blogIndex === -1){
                        _links.push({
                            label: pageConstant.page_handles.BLOG,
                            type: "link",
                            linkTo: {
                            data: pageConstant.page_handles.BLOG,
                            type: "page"
                            }
                        });
                    }

                }
                // Remove Blog Link From nav
                else{
                    if(_blogIndex > -1)
                        _links.splice(_blogIndex, 1);
                }

                SimpleSiteBuilderService.updateBlogPages().then(function(response){
                    SimpleSiteBuilderService.saveWebsite($scope.website).then(function(response){
                        $scope.saveLoading = false;
                        toaster.pop('success', " Website Settings saved.");
                        if ($scope.account.subdomain !== $scope.originalAccount.subdomain) {
                            var _newUrl = $location.absUrl().split($scope.originalAccount.subdomain);
                            $window.location.href = _newUrl[0] + $scope.account.subdomain + _newUrl[1];
                        }
                        var mainAccount = AccountService.getMainAccount();
                        if (mainAccount) {
                            mainAccount.showhide.blog = $scope.account.showhide.blog;
                        }

                        if ($scope.account.showhide.userScripts && $scope.website.resources.toggles.userScripts) {
                          SimpleSiteBuilderService.updateScriptResource($scope.website).then();
                        }
                    });
                });
            }

        });
    };

    /*
     * @insertFavicon
     * insert the favicon
     */

    $scope.insertFavicon = function (asset) {
      $scope.website.settings.favicon = asset.url.replace(/^(http|https):/i, "");
    };

    /*
     * @removeFavicon
     * remove the favicon
     */

    $scope.removeFavicon = function () {
      $scope.website.settings.favicon = '';
    };

    /*
     * @checkDomainExists
     * check to see if the domain already exist on change
     */

    $scope.domainError = false;
    $scope.modifysub = {};
    $scope.modifysub.show = false;

    $scope.checkDomainExists = function (account) {
      account.subdomain = account.subdomain.replace(/ /g, '').replace(/\./g, '_').replace(/@/g, '').replace(/_/g, ' ').replace(/\W+/g, '').toLowerCase();
      console.log('account.subdomain >>> ', account.subdomain);
      if (account.subdomain) {
        $scope.checkingSubdomain = true;
        if ($scope.originalAccount.subdomain != account.subdomain) {
          UserService.checkDuplicateSubdomain(account.subdomain, account._id, function (data) {
            $scope.hasCheckedSubdomain = true;
            $log.debug('checkDomainExists', data);
            $scope.checkingSubdomain = false;
            if (data.isDuplicate) {
              $scope.domainError = true;
            } else {
              $scope.domainError = false;
            }
          });
        } else {
          $scope.hasCheckedSubdomain = false;
          $scope.domainError = false;
          $scope.checkingSubdomain = false;
        }
      }
    };

    $scope.revertSubdomain = function () {
      $scope.hasCheckedSubdomain = '';
      $scope.modifysub.show = false;
      $scope.account.subdomain = $scope.originalAccount.subdomain;
    };

    /*
     * @calculateTaxOptions
     * -
     */

    $scope.calculateTaxOptions = [{
      name: 'Customer Shipping Address',
      value: 'customer_shipping'
    }, {
      name: 'Customer Billing Address',
      value: 'customer_billing'
    }, {
      name: 'Business Location',
      value: 'business_location'
    }];

    /*
     * @navigateTo
     * - navigate to view and close aside
     */

    $scope.navigateTo = function (section, $event) {
      $state.go(section);
      $scope.cancel($event);
    };


    /*
     * @updateSettings
     * -
     */

    // $scope.updateSettings = function () {
    //   var _account = $scope.account;
    //   _account.commerceSettings = $scope.settings;
    //   console.log('$scope.settings ', $scope.settings);
    //   AccountService.updateAccount(_account, function (updatedAccount) {
    //     toaster.clear();
    //     toaster.pop('success', 'Settings Successfully Updated');
    //     console.log('updatedAccount ', updatedAccount);
    //   });
    // };

    /*
     * @openMediaModal
     * -
     */

    $scope.openMediaModal = function () {
      $scope.showInsert = true;
      $scope.modalInstance = $modal.open({
        templateUrl: 'media-modal',
        controller: 'MediaModalCtrl',
        size: 'lg',
        keyboard: false,
        backdrop: 'static',
        resolve: {
          showInsert: function () {
            return $scope.showInsert;
          },
          insertMedia: function () {
            return $scope.insertFavicon;
          },
          isSingleSelect: function () {
              return true;
          }
        }
      });
    };

    /*
     * @closeModal
     * -
     */

    $scope.closeModal = function () {
      $scope.modalInstance.close();
    };

    // Add/Remove Meta tags
    $scope.accountAddMetaFn = function () {
      $scope.website.metatags = $scope.website.metatags || [];
      $scope.website.metatags.push({
        name:'',
        value:''
      });
    };
    $scope.removeMeta = function (index) {
      $scope.website.metatags.splice(index, 1);
    };

    $scope.showAddMeta = function (index) {
      return index === 0;
    };

    $scope.toggleEnableBlog = function(status){
        if(!status){
            SweetAlert.swal({
                title: "Are you sure?",
                text: "Your blog and posts will no longer be accessible",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Ok",
                cancelButtonText: "Cancel",
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function (isConfirm) {
                if (isConfirm) {

                }
                else{
                    $scope.account.showhide.blog = !status
                }
            });
        }

    }


  }]);
}(angular));
