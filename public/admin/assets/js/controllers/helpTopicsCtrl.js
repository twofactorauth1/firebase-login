'use strict';
/*global app, moment, angular, Intercom, urlParser*/
(function (angular) {
  app.controller('HelpTopicsCtrl', ["$rootScope", "$scope", "WebsiteService", "$location", "$sce", '$filter', function ($rootScope, $scope, WebsiteService, $location, $sce, $filter) {

    $scope.searchTextValue = {};
    $scope.searchTextValueBy = '$';
    $scope.loaded = false;
    $scope.panesByCat = {
      account: [],
      billing: [],
      contacts: [],
      campaigns: [],
      dashboard: [],
      emails: [],
      faqs: [],
      integrations: [],
      orders: [],
      posts: [],
      products: [],
      profile: [],
      'site-analytics': [],
      'social-feed': [],
      website: [],
    };

    $rootScope.$on('$locationChangeSuccess', function (event, newUrl, oldUrl) {
      if ($location.search().title) {
        var _topic = _.find($scope.topics, function (top) {
          return top.handle === $location.search().title;
        });
        $scope.viewSingle(_topic);
        //$location.search('topic', null);
    } else if ($location.search().topic) {
        var _topic = _.find($scope.topics, function (top) {
          return top._id === $location.search().topic;
        });
        console.log(_topic);
        $scope.viewSingle(_topic);
    } else {
        $scope.loaded = false;
        $scope.showTopics();
      }
    });

    $scope.isMoreThan50Char = function (word) {
      if (word.length > 50) {
        return true;
      }
    };

    WebsiteService.getTopics(function (topics) {
      console.log('topics ', topics);
      $scope.topics = topics;
      _.each($scope.topics, function (topic) {
        if (topic.isPublic) {
          console.log('topic> ', topic);
          $scope.panesByCat[topic.category.toLowerCase().replace(' ', '-')].push(topic);
        }
      });
      $scope.topicsLoaded = true;
      if ($location.search().title) {
        var _topic = _.find($scope.topics, function (top) {
          return top.handle === $location.search().title;
        });
        $scope.viewSingle(_topic);
      }
      if ($location.search().topic) {
        var _topic = _.find($scope.topics, function (top) {
          return top._id === $location.search().topic;
        });
        $scope.viewSingle(_topic);
      }
    });

    $scope.updateTopic = function (topic) {
      console.log('topic ', topic);
      topic.handle = $filter('slugify')(topic.title);
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
      if(!topic)
        return;
      if(!$scope.loaded)
        $scope.isViewed(topic);
      $scope.loaded = true;
      $scope.singleTopic = topic;
      $scope.showSingle = true;
      $location.path('/support/help-topics').search({
        title: topic.handle
      });
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
      $location.search('topic', null);
      $scope.showSingle = false;
      $scope.singleTopic = '';
      $scope.topicRated = false;
      $scope.showSupport = false;
      $scope.showThanks = false;
    };

  }]);
}(angular));
