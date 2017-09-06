
/*global app, _*/
/*jslint unparam:true*/

app.controller('ssbPostSettingsModalCtrl', ['$scope', '$rootScope', '$http', '$timeout', '$q', '$compile', '$filter', 'SimpleSiteBuilderBlogService', function ($scope, $rootScope, $http, $timeout, $q, $compile, $filter, SimpleSiteBuilderBlogService) {
	'use strict';
    $scope.availablePostTags = [];
    $scope.availablePostCategories = [];
    var posts = SimpleSiteBuilderBlogService.blog.posts || [],
		tags = [],
		categories = [],
		availablePostCategories;
    tags.push(_.pluck(posts, "post_tags"));
    categories.push(_.pluck(posts, "post_categories"));

    tags = _.uniq(_.flatten(tags));
    tags = _.map(tags, function (tag) {
        return tag.text || tag;
    });

    $scope.availablePostTags = _.uniq(tags);

	availablePostCategories = _.uniq(_.without(_.flatten(categories), null));
    $scope.availablePostCategories = _.uniq(_.without(_.pluck(availablePostCategories, "text"), null));
}]);
