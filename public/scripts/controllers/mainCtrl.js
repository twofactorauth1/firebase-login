'use strict';

mainApp.controller('MainCtrl', ['$scope', 'websiteService', 'accountService', 'themeService', 'pagesService', 'ENV', '$location', '$document', '$anchorScroll', '$window', 'userService',
  function ($scope, websiteService, accountService, themeService, pagesService, ENV, $location, $document, $anchorScroll, $window, userService) {

    var account, pages, website, that = this;
    that.segmentIOWriteKey = ENV.segmentKey;

    var body = document.body,
      html = document.documentElement;

    $scope.init = function (value) {
      $scope.websiteId = value;
    };

    var height = Math.max(body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight);
    $scope.minHeight = height;

    $scope.isSection = function (value) {
      if (value == 'section') {
        return true;
      } else {
        return false;
      }
    };

    $scope.showAdminBar = false;

    userService.isAuthenticatedSession(function (data) {
      if (data === true) {
        $scope.showAdminBar = true;
      }
    });

  }
]);
