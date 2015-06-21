'use strict';
/**
 * controller for products
 */
(function (angular) {
  app.controller('EmailsCtrl', ["$scope", "$location", "toaster", "$filter", "$modal", "WebsiteService", function ($scope, $location, toaster, $filter, $modal, WebsiteService) {

    /*
     * @getCustomers
     * get all customers to for customer select
     */

    WebsiteService.getEmails(function (emails) {
      console.log('emails ', emails);
      $scope.emails = emails;
    });


    $scope.openModal = function (template) {
      $scope.modalInstance = $modal.open({
        templateUrl: template,
        scope: $scope
      });
    };

    $scope.closeModal = function () {
      $scope.modalInstance.close();
    };

    $scope.getters = {
      components: function (value) {
        return value.length;
      },
      created: function (value) {
        return value.created.date;
      },
      modified: function (value) {
        return value.modified.date;
      }
    };

    $scope.setTemplateDetails = function (templateDetails) {
      $scope.templateDetails = true;
      $scope.selectedTemplate = templateDetails;
    };

    $scope.resetTemplateDetails = function () {
      $scope.templateDetails = false;
      $scope.selectedTemplate = null;
      $scope.showChangeURL = false;
    };

    $scope.$watch('createpage.title', function (newValue, oldValue) {
      if (newValue) {
        $scope.createpage.handle = $filter('slugify')(newValue);
      }
    });

    $scope.$watch('createpage.handle', function (newValue, oldValue) {
      if (newValue) {
        $scope.createpage.handle = $filter('slugify')(newValue);
      }
    });

    $scope.validateCreatePage = function (page, restrict) {
      $scope.createPageValidated = false;
      if (page) {
        if (page.handle == '') {
          $scope.handleError = true;
        } else {
          $scope.handleError = false;
          if (!restrict)
            page.handle = $filter('slugify')(page.title);
        }
        if (page.title == '') {
          $scope.titleError = true;
        } else {
          $scope.titleError = false;
        }
        if (page && page.title && page.title != '' && page.handle && page.handle != '') {
          $scope.createPageValidated = true;
        }
      }
    };

    $scope.createPageFromTemplate = function (page, $event) {
      $scope.validateCreatePage(page, true);

      if (!$scope.createPageValidated) {
        $scope.titleError = true;
        $scope.handleError = true;
        return false;
      } else {
        $scope.titleError = false;
        $scope.handleError = false;
      }

      var pageData = {
        title: page.title,
        handle: page.handle,
        mainmenu: page.mainmenu
      };

      var hasHandle = false;
      for (var i = 0; i < $scope.pages.length; i++) {
        if ($scope.pages[i].handle === page.handle) {
          hasHandle = true;
        }
      };

      if (!hasHandle) {
        WebsiteService.createPageFromTemplate($scope.selectedTemplate._id, pageData, function (newpage) {
          toaster.pop('success', 'Page Created', 'The ' + newpage.title + ' page was created successfully.');
          $scope.closeModal();

          if (newpage.components) {
            newpage.components = newpage.components.length;
          } else {
            newpage.components = 0;
          }

          $scope.pages.unshift(newpage);
          $scope.displayedPages.unshift(newpage);
          page.title = "";
          page.handle = "";

          $scope.resetTemplateDetails();
        });
      } else {
        toaster.pop('error', "Page URL " + page.handle, "Already exists");
        $event.preventDefault();
        $event.stopPropagation();
      }
    };

    $scope.viewSingle = function (email) {
      window.location = '/admin/#/editor?email=' + email.handle;
    };

    $scope.filterScreenshot = {};

    $scope.pageScreenshotOptions = [{
      name: 'Screenshot',
      value: true
    }, {
      name: 'No Screenshot',
      value: false
    }];

    /*
     * @triggerInput
     * - trigger the hidden input to trick smart table into activating filter
     */

    $scope.triggerInput = function (element) {
      angular.element(element).trigger('input');
    };

    $scope.clearFilter = function (event, input) {
      $scope.filterScreenshot = {};
      $scope.triggerInput(input);
    };

  }]);
})(angular);
