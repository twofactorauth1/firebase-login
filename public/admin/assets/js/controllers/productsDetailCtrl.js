'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('ProductsDetailCtrl', ["$scope", "$modal", "$timeout", 'editableOptions', "$state", "$stateParams", "$q", "CommonService", "ProductService", "PaymentService", "UserService", "AccountService", "WebsiteService",  "toaster", "SweetAlert", "productConstant", "$location", function ($scope, $modal, $timeout, editableOptions, $state, $stateParams, $q, CommonService, ProductService, PaymentService, UserService, AccountService, WebsiteService, toaster, SweetAlert, ProductConstant, $location) {


    /*
     * set editor theme
     */
    editableOptions.theme = 'bs3';
    $scope.isProduct = true;
    $scope.existingEmail = {};

    $scope.isProductDirty = {
      dirty : false
    };

    $scope.slickConfig = {
        infinite: false,
        dots: false,
        slidesToShow: 3,
        slidesToScroll: 1,
        focusOnSelect: true
    };

    $scope.slickSlideIndex = 0;
    $scope.isMediaSingleSelect = false;

    /*
     * @openModal
     * -
     */

    $scope.openModal = function (modal) {
      $scope.modalInstance = $modal.open({
        templateUrl: modal,
        keyboard: false,
        backdrop: 'static',
        scope: $scope
      });
    };

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
            return $scope.insertMedia;
          },
          isSingleSelect: function () {
              return $scope.isMediaSingleSelect;
          }
        }
      });
    };

    /*
     * @closeModal
     * -
     */

    $scope.closeModal = function (cancel) {
      if (cancel === true) {
        $scope.editCancelFn();
      } else {
        $scope.modalInstance.close();
      }
    };

    UserService.getUser(function (user) {
      $scope.user = user;
    });

    $scope.initDatePicker = function(){
      $timeout(function() {
        $scope.myform.$dirty = false;
      }, 0);
    };

    $scope.selectedDate = {};
    var startDate =  moment();
    var endDate = moment().add(6, 'days');
    $scope.selectedDate.range = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
    };

    var setProductEmailSettings = function(product){
      product.emailSettings = {
          "emailId": "",
          "offset": "", //in minutes
          "fromEmail": "",
          "fromName": '',
          "replyTo": '',
          "cc": '',
          "bcc": '',
          "subject": '',
          "vars": [],
          "sendAt": {}
        }
    }

     /*
     * @getProduct
     * - get single product based on stateparams
     */
    $scope.getProduct = function(){
      var promise = ProductService.getSingleProduct($stateParams.productId, function (product) {
        console.log(product);
        var startDate = product.sale_date_from;
        var endDate = product.sale_date_to;
        if (!startDate && !endDate) {
          startDate = moment();
          endDate = moment().add(6, 'days');
        }
        $scope.selectedDate.range = {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        };
        product.regular_price = parseFloat(product.regular_price);
        $scope.product = product;
        $scope.originalIcon = product.icon;
        if (product.assets && product.assets.length) {
            $scope.isMediaSingleSelect = true;
        }
        console.log('product ', product);
        var p_icon = $scope.product.icon;
        if(p_icon && !p_icon.indexOf("fa-") == 0)
          p_icon = "fa-cube";

        angular.element('#convert').iconpicker({
          iconset: 'fontawesome',
          icon: p_icon,
          rows: 5,
          cols: 5,
          placement: 'right'
        });

        $scope.getProductTags();

        if (!$scope.product.attributes) {
          $scope.product.attributes = [{
            'name': '',
            'values': []
          }];
        }

        if ($scope.product.downloads.length <= 0) {
          $scope.product.downloads = [{
            'id': Math.uuid(8),
            'name': '',
            'file': ''
          }];
        }

        var promises = [];
        if ($scope.product.product_attributes.stripePlans) {
          $scope.product.product_attributes.stripePlans.forEach(function (value, index) {
            promises.push(PaymentService.getPlanPromise(value.id));
            productPlanStatus[value.id] = value.active;
            productPlanSignupFee[value.id] = value.signup_fee;
          });
          $q.all(promises)
            .then(function (data) {
              data.forEach(function (value, index) {
                value.data.active = productPlanStatus[value.data.id];
                value.data.signup_fee = productPlanSignupFee[value.data.id];
                $scope.plans.push(value.data);
              });
            })
            .catch(function (err) {
              console.error(err);
            });
        }
      });
      return promise;
    }
    $scope.product_tags = [];
    var productPlanStatus = {};
    var productPlanSignupFee = {};

    /*
     * @insertMedia
     * - insert media function
     */

    $scope.insertMedia = function (assets) {
        if ($scope.isMediaSingleSelect == false) {
            var urls = _.pluck(assets, 'url');
        }
      if ($scope.currentDownload) {
        console.log('download');
        if ($scope.isMediaSingleSelect == false) {
            $scope.currentDownload.file = urls[0];
        } else {
            $scope.currentDownload.file = assets.url;
        }
      } else {
        console.log('product image');
        if ($scope.isMediaSingleSelect == false) {
            $scope.product.icon = urls[0];
            $scope.product.assets = urls;
        } else {
            $scope.product.icon = assets.url;
            $scope.product.assets[$scope.slickSlideIndex] = assets.url;
        }
      }
      $scope.setDownloadId();
    };

    $scope.setDownloadId = function (download) {
      $scope.currentDownload = download;
    };


    /*
     * @addAttribute
     * - add an attribute
     */

    $scope.addAttribute = function () {
      console.log('addAttribute');
      var tempAttribute = {
        "name": "",
        "values": []
      };
      $scope.product.attributes.push(tempAttribute);
      toaster.pop('success', 'New attribute has been added.');
    };

    /*
     * @addDownload
     * - add a download
     */

    $scope.addDownload = function () {
      console.log('addDownload');
      var tempDownload = {
        'id': Math.uuid(8),
        'name': '',
        'file': ''
      };

      $scope.product.downloads.push(tempDownload);
      toaster.pop('success', 'New download has been added.');
    };

    /*
     * @removeDownload
     * - remove a download
     */

    $scope.removeDownload = function (downloadId) {
      console.log('removeDownload');
      var _downloads = _.filter($scope.product.downloads, function (download) {
        return download.id !== downloadId;
      });

      $scope.product.downloads = _downloads;
      toaster.pop('warning', 'Download has been removed.');
    };

    /*
     * @removeAttribute
     * - remove an attribute
     */

    $scope.removeAttribute = function (index) {
      var formattedAttributes = [];
      var attributeRemoved = [];
      _.each($scope.product.attributes, function (attribute, i) {
        if (i !== index) {
          formattedAttributes.push(attribute);
        } else {
          attributeRemoved.push(attribute);
        }
      });
      $scope.product.attributes = formattedAttributes;
      var name;
      if (attributeRemoved[0].name.length > 0) {
        name = attributeRemoved[0].name;
      } else {
        name = 'Empty Attribute';

      }
      toaster.pop('error', name + ' attribute has been removed.');
    };

    $scope.ldloading = {};
    $scope.clickBtn = function (style) {
      $scope.ldloading[style.replace('-', '_')] = true;
      $timeout(function () {
        $scope.ldloading[style.replace('-', '_')] = false;
      }, 2000);
    };

    /*
     * @validateProduct
     * - validate the product before saved
     */

    $scope.validateProduct = function () {
      var _isValid = true;
      if (!$scope.product.name) {
        _isValid = false;
        $scope.productNameError = true;
      }
      if (!$scope.product.type) {
        _isValid = false;
        $scope.productTypeError = true;
      }
      return _isValid;
    };

     /*
     * @setEmail
     * - set email-related data
     */
    $scope.setEmail = function(newEmail) {
      if (newEmail) {
        var stepSettings = $scope.product.emailSettings;
        stepSettings.emailId = newEmail._id;
        stepSettings.fromEmail = newEmail.fromEmail;
        stepSettings.fromName = newEmail.fromName;
        stepSettings.replyTo = newEmail.replyTo;
        stepSettings.cc = newEmail.cc;
        stepSettings.bcc = newEmail.bcc;
        stepSettings.subject = newEmail.subject;
      }
    };

    /*
     * @saveProductFn
     * - save product function
     */

    $scope.saveLoading = false;

    $scope.saveProductFn = function () {
      $scope.pageSaving = true;
      console.log('$scope.selectedDate ', $scope.selectedDate);
      if ($scope.selectedDate.range) {
        $scope.product.sale_date_from = new Date($scope.selectedDate.range.startDate).toISOString();
        $scope.product.sale_date_to = new Date($scope.selectedDate.range.endDate).toISOString();
      }
      $scope.setProductTags();
      if ($scope.validateProduct()) {
        $scope.saveLoading = true;
        if($scope.product.fulfillment_email){
          if(!$scope.emailToSend.title){
            toaster.pop('warning', 'Warning', "Email title can't not blank");
            $scope.saveLoading = false;
            return;
          }
          if($scope.emailTitleExists && $scope.selectedEmail.type === "new"){
            toaster.pop('warning', 'Warning', "Email title already exists");
            $scope.saveLoading = false;
            return;
          }

          var stepSettings = $scope.product.emailSettings;
          if (!stepSettings.emailId || (angular.isDefined($scope.existingEmail.replace) && !$scope.existingEmail.replace)) {
            $scope.emailToSend.productId = $scope.product._id;
            WebsiteService.createEmail($scope.emailToSend, function (newEmail) {
              $scope.isNewEmailObj = true;
              $scope.updateProductEmail(newEmail);
            });
          } else {
            $scope.isNewEmailObj = false;
            $scope.updateProductEmail($scope.emailToSend);
          }
        }
        else{
          $scope.saveProduct();
        }
      }
    };

    $scope.saveProduct = function(){
        if (!$scope.product.is_image) {
            $scope.product.assets = [$scope.product.icon];
        }
        ProductService.saveProduct($scope.product, function (product) {
          //format variation attributes
          $scope.product = product;
          angular.copy($scope.product, $scope.originalProduct);
          $scope.product_tags = [];
          $scope.getProductTags();
          if($scope.product.fulfillment_email){
            $scope.getEmails();
          }
          $scope.saveLoading = false;
          toaster.pop('success', 'Product Saved.');
          $scope.pageSaving = false;
        });
    }


    $scope.updateProductEmail = function (newEmail) {
      //set/format email and send date
      $scope.setEmail(newEmail);
      $scope.updatedEmail = angular.copy(newEmail);

      //update product email

      if($scope.updatedEmail && $scope.existingEmail.replace || ($scope.product && $scope.emailToSend.productId && $scope.emailToSend.productId === $scope.product._id)){
        WebsiteService.updateEmail($scope.updatedEmail, function(data, error) {
          $scope.saveProduct();
        });
      }
      else{
        $scope.saveProduct();
      }
    };

    $scope.removeVariation = function () {
      console.log('removeVariation');
    };


    ProductService.productStatusTypes(function(types) {
        $scope.productStatusOptions = types;
    });

    $scope.productTypes = ProductConstant.product_types;


    $scope.externalLinkOptions = ProductConstant.external_link_options.dp;


    $scope.externalLinkViewOptions = ProductConstant.external_link_view_options.dp;

    /*
     * @convert:iconpicker
     * - icon picker for product image replacement
     */


    $('#convert').on('change', function (e) {
      if ($scope.product && !$scope.product.is_image) {
        $scope.product.icon = e.icon;
      }
    });

    $scope.newSubscription = {
      planId: CommonService.generateUniqueAlphaNumericShort(),
      interval: 'week',
      interval_count: 1
    };

    $scope.plans = [];

    $scope.addSubscriptionFn = function (newSubscription, showToaster) {
      console.log('newSubscription ', newSubscription);
      if (!$scope.stripeAccountExist) {
        toaster.pop('error', 'Need to add a stripe account first.');
        $state.go('account');
      }
      $scope.newSubscription = newSubscription;
      var subscription_fee = parseInt($scope.signup_fee)*100;
      $scope.newSubscription.amount = $scope.newSubscription.amount * 100;
      PaymentService.postCreatePlan($scope.newSubscription, function (subscription) {
        $scope.signup_fee = subscription_fee;
        subscription.signup_fee = subscription_fee;
        $scope.plans.push(subscription);
        var price = parseInt(subscription.amount, 10);
        if ($scope.product.product_attributes.stripePlans) {
          $scope.product.product_attributes.stripePlans.push({
            id: subscription.id,
            active: true,
            signup_fee: subscription_fee,
            price: price
          });
        } else {
          $scope.product.product_attributes.stripePlans = [{
            id: subscription.id,
            active: true,
            signup_fee: subscription_fee,
            price: price
          }];
        }


        productPlanStatus[subscription.id] = true;
        productPlanSignupFee[subscription.id] = $scope.signup_fee;
        $scope.saveProductFn();

        $scope.newSubscription = {
          planId: CommonService.generateUniqueAlphaNumericShort(),
          interval: 'week',
          interval_count: 1
        };
        $scope.signup_fee = null;
        $scope.closeModal('add-subscription-modal');
      }, showToaster);
    };

    $scope.planEditFn = function (planId) {
      console.log('planEditFn');
      $scope.editingPlan = true;
      $scope.openModal('add-subscription-modal');
      $scope.plans.forEach(function (value, index) {
        if (value.id === planId) {
          $scope.newSubscription = angular.copy(value);
          $scope.newSubscription.amount = $scope.newSubscription.amount / 100;
          $scope.newSubscription.planId = value.id;
          $scope.signup_fee = productPlanSignupFee[value.id];
        }
      });
    };

    $scope.editCancelFn = function () {
      $scope.editingPlan = false;
      $scope.saveLoadingPlan = false;
      $scope.signup_fee = null;
      $scope.newSubscription = {
        planId: CommonService.generateUniqueAlphaNumericShort(),
        interval: 'week',
        interval_count: 1
      };
      $scope.closeModal('add-subscription-modal');
    };

    $scope.planDeleteFn = function (planId, showToast, saveProduct, func) {
      var fn = func || false;
      PaymentService.deletePlan(planId, showToast, function () {
        $scope.plans.forEach(function (value, index) {
          if (value.id === planId) {
            $scope.plans.splice(index, 1);
          }
        });

        $scope.product.product_attributes.stripePlans.forEach(function (value, index) {
          if (value.id === planId) {
            $scope.product.product_attributes.stripePlans.splice(index, 1);
          }
        });

        if (saveProduct) {
          if (!$scope.plans.length) {
            $scope.product.status = 'inactive';
          }
          $scope.saveProductFn();
        }

        if (fn) {
          fn();
        }
      }, true);
    };

    $scope.editSubscriptionFn = function (newSubscription) {
      $scope.saveLoadingPlan = true;
      $scope.planDeleteFn(newSubscription.planId, false, false, function () {
        $scope.addSubscriptionFn(newSubscription, false);
        $scope.editCancelFn();
        toaster.pop('success', 'Plan updated.');
      });
    };

    $scope.getProductTags = function () {
      if ($scope.product.tags) {
        $scope.product.tags.forEach(function (v, i) {
          $scope.product_tags.push({
            text: v
          });
        });
      }
      $scope.originalTags = angular.copy($scope.product_tags);
    };

    $scope.setProductTags = function () {
      $scope.product.tags = [];
      $scope.product_tags.forEach(function (v, i) {
        if (v.text) {
          $scope.product.tags.push(v.text);
        }
      });
    };

    /*
     * @checkSalePrice
     * - check the sale to price to ensure its not more than the price
     */

    $scope.checkSalePrice = function () {
      console.log('sales_price ', $scope.product.sales_price);
    };

    /*
     * @deleteProductFn
     * -
     */

    $scope.deleteProductFn = function (product) {
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Do you want to delete this product?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, do not delete it!",
        closeOnConfirm: true,
        closeOnCancel: true
      }, function (isConfirm) {
        if (isConfirm) {
          ProductService.deleteProduct(product._id, function () {
            toaster.pop('warning', 'Product Deleted.');
            $scope.originalProduct = angular.copy($scope.product);
            $state.go('app.commerce.products');
          });
        }
      });
    };

    $scope.setDefault = function(){
      if ($scope.product.is_image) {
        $scope.product.icon = $scope.originalProduct.icon ? $scope.originalProduct.icon : $scope.product.assets[0];
        if($scope.product.assets.length < 2)
           $scope.product.assets[0] = $scope.product.icon;
      } else {
        $scope.product.icon = 'fa-cube';
        angular.element('#convert').iconpicker('setIcon', 'fa-cube');
      }
    }

    function checkIfEmailContentChanged() {
      return $scope.emailToSend && $scope.originalEmailToSend && !angular.equals($scope.emailToSend, $scope.originalEmailToSend);
    }

    function checkIfTagsChanged() {
      return !angular.equals($scope.originalTags, $scope.product_tags);
    }

    $scope.checkIfDirty = function(){
      var isDirty = false;
      if($scope.originalProduct)
        if((!angular.equals($scope.originalProduct, $scope.product)) || checkIfTagsChanged() || checkIfEmailContentChanged())
          isDirty = true;
      return isDirty;
    }
    $scope.resetDirty = function(){
      $scope.originalProduct = null;
      $scope.product = null;
      $scope.originalTags = null;
    }


    // Email fulfillment related

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
      "cc": "",
      "bcc": "",
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

    /*
     * @getAccount
     * - get account and autofill new email details
     */

    $scope.getAccount = function() {
      var promise = AccountService.getUpdatedAccount(function (_account) {
        $scope.account = _account;
        $scope.stripeAccountExist = false;
        $scope.paypalAccountExist = $scope.account.commerceSettings.paypal;
        $scope.account.credentials.forEach(function(cred, index) {
            if (cred.type == 'stripe') {
                $scope.stripeAccountExist = true;
            }
        });
        $scope.setBusinessDetails();
        $scope.actualEmailToSend = angular.copy($scope.emailToSend);
      });
      return promise;
    };


    /*
     * @setBusinessDetails
     * - set any filled out info from business data
     */
    $scope.setBusinessDetails = function(update) {
      var account = $scope.account;
      var logo = account.business.logo || '<h2>Logo Here</h2>';
      var businessName = account.business.name || 'Edit name';
      var fromEmail = account.business.emails[0].email || 'Edit email';

      if ($scope.emailToSend) {
        if (logo.indexOf('http') != -1 && $scope.emailToSend.components[0].logo == '<h2>Logo Here</h2>') {
          $scope.emailToSend.components[0].logo = '<img src="' + account.business.logo + '"/>';
          $scope.emailToSendCopy.components[0].logo = '<img src="' + account.business.logo + '"/>';
        }
        if (businessName && ($scope.emailToSend.fromName == '' || update)) {
          $scope.emailToSend.fromName = account.business.name;
          $scope.emailToSendCopy.fromName = account.business.name;
        }
        if (fromEmail && ($scope.emailToSend.fromEmail == '' || update)) {
          $scope.emailToSend.fromEmail = account.business.emails[0].email;
          $scope.emailToSendCopy.fromEmail = account.business.emails[0].email;
        }
        if (fromEmail && update) {
          $scope.emailToSend.replyTo = account.business.emails[0].email;
          $scope.emailToSendCopy.replyTo = account.business.emails[0].email;
        }
      }
    };
    $scope.emails = [];
    $scope.selectedEmail = {
      type: 'new'
    };

    /*
     * @setEmailstoSendDetails
     *
     */
    $scope.setEmailDefaults = function (_name) {
      $scope.emailToSend.title = _name + ' Email';
      $scope.emailToSend.subject = _name;
      $scope.checkEmailTitle($scope.emailToSend.title);
    };



     /*
     * @changeCurrentEmail
     * - set selected email
     */
    $scope.changeCurrentEmail = function (selectedEmail) {
      $scope.emailToSend = selectedEmail;
    };


    $scope.getEmails = function() {
        if($scope.product.type == $scope.productTypes.DONATION) {
            $scope.product.on_sale = false;
        }
      if(!$scope.product.emailSettings){
        setProductEmailSettings($scope.product);
      }
      if($scope.product.fulfillment_email && $scope.product.emailSettings.emailId)
        $scope.selectedEmail = {
          type: 'template'
        };

      var promise = WebsiteService.getEmails(false, function (_emails) {
        var emailId = $scope.product.emailSettings.emailId;
        var matchedEmail = null;
        var emailMatch = function(email) {
          return email._id === emailId;
        };

        $scope.emails = angular.copy(_emails);
        $scope.originalEmails = angular.copy(_emails);

        //$scope.setEmailDefaults($scope.product.name || '');

        matchedEmail = $scope.emails.filter(emailMatch)[0];
        if (emailId && matchedEmail) {
           $scope.emailToSend = matchedEmail;
            //seeting data back to template
           if($scope.product.emailSettings.emailId){
              $scope.emailToSend.fromEmail= $scope.product.emailSettings.fromEmail;
              $scope.emailToSend.fromName= $scope.product.emailSettings.fromName;
              $scope.emailToSend.cc= $scope.product.emailSettings.cc;
              $scope.emailToSend.bcc= $scope.product.emailSettings.bcc;
              $scope.emailToSend.replyTo= $scope.product.emailSettings.replyTo;
              $scope.emailToSend.subject= $scope.product.emailSettings.subject;
           }
           $scope.originalEmailToSend = angular.copy($scope.emailToSend);

        } else {
          console.log('email not found');
        }
        $scope.emailToSendPrevious = $scope.emails[0];
      });
      $scope.originalProduct = angular.copy($scope.product);
      return promise;
    };

    /*
     * @checkEmailTitle
     * - check email title doesnt exist already
     */
    $scope.checkEmailTitle = function (_name) {
      if ($scope.selectedEmail.type === 'new') {
        $scope.checkingEmailTitle = true;
        var exists = _.find($scope.originalEmails, function(email){
          return email.title && email.title.toLowerCase() == _name.toLowerCase();
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
      if (newEmail) {
        $scope.emailToSendPrevious = angular.copy($scope.emailToSend);
        $scope.setBusinessDetails(newEmail);
        $scope.emailToSend = $scope.emailToSendCopy;
        $scope.emailToSend.title = $scope.product.name + ' Email';
        $scope.emailToSend.cc = "";
        $scope.emailToSend.bcc = "";
        $scope.emailToSend.subject = $scope.product.name;
        $scope.checkEmailTitle($scope.emailToSend.title);
        if($scope.product && $scope.product.emailSettings)
          $scope.product.emailSettings.emailId = null;
      } else {
        $scope.setBusinessDetails();
        $scope.emailToSend = $scope.emailToSendPrevious;
        if($scope.product.emailSettings && !$scope.product.emailSettings.emailId && $scope.emailToSendPrevious)
          $scope.product.emailSettings.emailId = $scope.emailToSendPrevious._id
        $scope.actualEmailToSend = angular.copy($scope.emailToSend);
      }
    }

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

    $scope.assetSlideClickFn = function ($index) {
      $scope.slickSlideIndex = $index;
      $scope.isMediaSingleSelect = true;
      $scope.product.icon = $scope.product.assets[$index];
      $scope.originalIcon = $scope.product.icon;
    };

    $scope.planToggleActiveFn = function (id, active) {
      $scope.product.product_attributes.stripePlans.forEach(function(plan, index) {
        if (plan.id == id) {
          plan.active = active;
          console.log(plan);
        }
      });
    }

    $scope.cloneLoading = false;

    $scope.cloneProductFn = function () {
      $scope.cloneLoading = true;

      ProductService.cloneProduct($scope.product._id, function (clone) {
        toaster.pop('success', 'Product Cloned.');
        $scope.cloneLoading = false;
        $state.go('app.commerce.productsingle', {productId: clone._id});
      });
    };

    $scope.displayDatePicker = function(){
        $timeout(function() {
            angular.element('.sales-date-date-picker').click();
        }, 0);
    }

    $scope.checkFulfillmentEmail= function(){
      var returnValue = false;
      if($scope.product && $scope.product.fulfillment_email){
        if($scope.product.emailSettings && $scope.product.emailSettings.emailId)
        {
          returnValue = false;
        }
        else{
          returnValue = true;
        }
      }
      return returnValue;
      
    }

    $scope.backToProducts = function () {
        $location.url('/commerce/products');
    };


    $scope.$watch('selectedDate.range', function (newValue, oldValue) {
      if (newValue) {
          $scope.pickerOptions.startDate = new Date($scope.selectedDate.range.startDate);
          $scope.pickerOptions.endDate = new Date($scope.selectedDate.range.endDate);
        }
    });

    $scope.resetEmailTemplate = function(){
        if($scope.product.type == $scope.productTypes.DONATION || $scope.product.type == $scope.productTypes.EXTERNAL){
            $scope.product.fulfillment_email = false;
        }
        if($scope.product.type == $scope.productTypes.DONATION) {
            $scope.product.on_sale = false;
        }
    }
    

    $scope.init = (function(){
      $scope.getProduct().then(function(data) {
        return $scope.getEmails();
      }).then(function(data) {
        return $scope.getAccount();
      })

      
      $scope.pickerOptions = {
        startDate: new Date($scope.selectedDate.range.startDate),
        endDate: new Date($scope.selectedDate.range.endDate),
        format: 'YYYY-MM-DD',
        opens: 'left',
        ranges: {
          'Today': [moment(), moment()],
          'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          'Last 7 Days': [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
      };
    })();

  }]);
}(angular));
