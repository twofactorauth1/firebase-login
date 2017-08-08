'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/

app.controller('ssbPostSettingsModalCtrl', ['$scope', '$rootScope', '$http', '$timeout', '$q', '$compile', '$filter', 'SimpleSiteBuilderBlogService', function ($scope, $rootScope, $http, $timeout, $q, $compile, $filter, SimpleSiteBuilderBlogService) {
    $scope.availablePostTags = [];
    $scope.availablePostCategories = [];
    var posts = SimpleSiteBuilderBlogService.blog.posts || [];
    
    var tags = [];
    var categories = [];
    
    tags.push(_.pluck(posts, "post_tags"))
    categories.push(_.pluck(posts, "post_categories"));

    tags = _.uniq(_.flatten(tags));
    tags = _.map(tags, function(tag){
        return tag.text ? tag.text : tag
    })

    $scope.availablePostTags = _.uniq(tags);

    var availablePostCategories = _.uniq(_.without(_.flatten(categories), null));
    $scope.availablePostCategories = _.uniq(_.without(_.pluck(availablePostCategories, "text"), null));
}]);