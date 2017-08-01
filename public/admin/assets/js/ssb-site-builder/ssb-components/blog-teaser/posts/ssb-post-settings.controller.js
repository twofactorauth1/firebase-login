'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/

app.controller('ssbPostSettingsModalCtrl', ['$scope', '$rootScope', '$http', '$timeout', '$q', '$compile', '$filter', 'WebsiteService', function ($scope, $rootScope, $http, $timeout, $q, $compile, $filter, WebsiteService) {
    $scope.availablePostTags = [];
    $scope.availablePostCategories = [];
    WebsiteService.getPosts(function (posts) {
      //$scope.posts = posts;
      var tags = [];
      var categories = [];
      
      tags.push(_.pluck(posts, "post_tags"))
      categories.push  (_.pluck(posts, "post_categories"));
      
      $scope.availablePostTags = _.uniq(_.flatten(tags));
      $scope.availablePostCategories = _.uniq(_.without(_.flatten(categories), null));
      $scope.availablePostCategories = _uniq(_.without(_.pluck($scope.availablePostCategories, "text"), null));
    });

}]);
