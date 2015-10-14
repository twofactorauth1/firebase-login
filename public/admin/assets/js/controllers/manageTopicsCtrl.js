'use strict';
/*global app*/
(function (angular) {
  app.controller('ManageTopicsCtrl', ["$scope", "$location", "toaster", "$filter", "$modal", "WebsiteService", function ($scope, $location, toaster, $filter, $modal, WebsiteService) {

    WebsiteService.getTopics(function (topics) {
      console.log('topics ', topics);
      $scope.topics = topics;
    });

    $scope.topicCategories = ['Account', 'Billing', 'Contacts', 'Campaigns', 'Dashboard', 'Emails', 'Getting Started', 'Integrations', 'Orders', 'Pages', 'Posts', 'Products', 'Profile', 'Site Analytics', 'Social Feed'];

    $scope.openModal = function (url) {
      $scope.modalInstance = $modal.open({
        templateUrl: url,
        keyboard: false,
        backdrop: 'static',
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

    $scope.resetTemplateDetails = function () {
      $scope.templateDetails = false;
      $scope.selectedTemplate = null;
      $scope.showChangeURL = false;
    };

    $scope.validateCreatePage = function (page, restrict) {
      $scope.createPageValidated = false;
      if (page) {
        if (page.handle === '') {
          $scope.handleError = true;
        } else {
          $scope.handleError = false;
          if (!restrict) {
            page.handle = $filter('slugify')(page.title);
          }
        }
        if (page.title === '') {
          $scope.titleError = true;
        } else {
          $scope.titleError = false;
        }
        if (page && page.title && page.title !== '' && page.handle && page.handle !== '') {
          $scope.createPageValidated = true;
        }
      }
    };

    $scope.createTopic = function (newtopic, $event) {
      console.log('create topic >>> ', newtopic);
      // $scope.validateCreatePage(topic, true);

      // if (!$scope.createPageValidated) {
      //   $scope.titleError = true;
      //   $scope.handleError = true;
      //   return false;
      // }

      // $scope.titleError = false;
      // $scope.handleError = false;

      // var topicData = {
      //   title: topic.title,
      //   category: 'website'
      // };


      // if (!hasHandle) {
        WebsiteService.createTopic(newtopic, function (createdTopic) {
          toaster.pop('success', 'Topic Created', 'The ' + createdTopic.title + ' topic was created successfully.');
          $scope.closeModal();


          $scope.topics.unshift(createdTopic);
          $scope.displayedTopics.unshift(createdTopic);
          newtopic.title = "";
          newtopic.category = "";

          $scope.resetTopicsDetails();
        });
      // } else {
      //   toaster.pop('error', "Page URL " + page.handle, "Already exists");
      //   $event.preventDefault();
      //   $event.stopPropagation();
      // }
    };

    $scope.viewSingle = function (topic) {
      $location.path('/support/manage-topics/').search({
        topic: topic._id
      });
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
}(angular));
