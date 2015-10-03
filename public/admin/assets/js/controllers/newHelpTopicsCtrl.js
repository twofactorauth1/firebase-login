'use strict';
/*global app, moment, angular, Intercom, urlParser*/
(function (angular) {
  app.controller('NewHelpTopicsCtrl', ["$scope", "WebsiteService", "$location", "$sce", function ($scope, WebsiteService, $location, $sce) {

    $scope.searchTextValue = {};
    $scope.searchTextValueBy = '$';

    $scope.panesByCat = {
      account: [],
      billing: [],
      contacts: [],
      campaigns: [],
      dashboard: [],
      emails: [],
      'getting-started': [],
      integrations: [],
      orders: [],
      pages: [],
      posts: [],
      products: [],
      profile: [],
      'site-analytics': [],
      'social-feed': []
    };

    WebsiteService.getTopics(function (topics) {
      console.log('topics ', topics);
      $scope.topics = topics;
      _.each($scope.topics, function (topic) {
        if (topic.isPublic) {
          $scope.panesByCat[topic.category.toLowerCase().replace(' ', '-')].push(topic);
        }
      });

      if ($location.search().topic) {
        var _topic = _.find($scope.topics, function (top) {
          return top._id === $location.search().topic;
        });
        $scope.viewSingle(_topic);
        $location.search('topic', null);
      }
      $scope.topicsLoaded = true;
    });

    $scope.updateTopic = function (topic) {
      console.log('topic ', topic);
      WebsiteService.updateTopic(topic, function (topic) {
        console.log('topic updated', topic);
      });
    };

    $scope.isViewed = function (topic) {
      console.log('isViewed >>> ');
      topic.statistics.views = topic.statistics.views + 1;
      $scope.updateTopic(topic);
    };

    $scope.isHelpful = function (topic) {
      console.log('isHelpful >>> ', topic.statistics.helpful);
      $scope.topicRated = true;
      $scope.showThanks = true;
      topic.statistics.helpful = topic.statistics.helpful + 1;
      $scope.updateTopic(topic);
    };

    $scope.notHelpful = function (topic) {
      console.log('notHelpful >>> ', topic.statistics.nothelpful);
      Intercom('showNewMessage', ' ' + topic.title + ' The help topic did not answer my issue.');
      $scope.topicRated = true;
      $scope.showSupport = true;
      topic.statistics.nothelpful = topic.statistics.nothelpful + 1;
      $scope.updateTopic(topic);
    };

    $scope.singleTopic = {};

    $scope.viewSingle = function (topic) {
      console.log('viewSingle >>> ', topic);
      $scope.isViewed(topic);
      $scope.singleTopic = topic;
      $scope.showSingle = true;
    };

    $scope.flvVideoUrl = function (iframeUrl, url) {
      var parsedUrl = urlParser.parse(url);
      var retUrl = "";
      if (parsedUrl) {
        retUrl = iframeUrl + parsedUrl.id + '?showinfo=0&rel=0&hd=1';
      } else {
        retUrl = iframeUrl;
      }
      return $sce.trustAsResourceUrl(retUrl);
    };

    $scope.showTopics = function () {
      $scope.showSingle = false;
      $scope.singleTopic = '';
      $scope.topicRated = false;
      $scope.showSupport = false;
      $scope.showThanks = false;
    };

  }]);
}(angular));
