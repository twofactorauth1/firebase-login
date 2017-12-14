/*global app, angular,document, $*/
/*jslint unparam:true*/
app.directive('blogComponent', ['postsService', '$filter', '$location', '$timeout', function (postsService, $filter, $location, $timeout) {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html',
		controller: function ($scope, postsService) {
			$scope.blog = {};
			$scope.showCloud = false;
			$scope.component.spacing = $scope.$parent.defaultSpacings;
			var path = $location.$$path.replace('/page/', '');

			/*
			 * @postsService
			 * -
			 */

			postsService(function (err, posts) {
				$scope.blog.blogposts = posts;

				$scope.blog.postTags = [];
				$scope.blog.categories = [];

				_.each(posts, function (post) {
					if (path.indexOf("tag/") > -1) {
						$scope.blog.currentTag = path.replace('/tag/', '');
						$scope.blog.blogposts = _.filter($scope.blog.blogposts, function (post) {
							if (post.post_tags) {
								return post.post_tags.indexOf($scope.blog.currentTag) > -1;
							}
						});
					}
					if (path.indexOf("category/") > -1) {
						$scope.blog.currentCat = path.replace('/category/', '');
						$scope.blog.blogposts = _.filter($scope.blog.blogposts, function (post) {
							return post.post_category === $scope.blog.currentCat;
						});
					}
					if (path.indexOf("author/") > -1) {
						$scope.blog.currentAuthor = path.replace('/author/', '');
						$scope.blog.blogposts = _.filter($scope.blog.blogposts, function (post) {
							return post.post_author === $scope.blog.currentAuthor;
						});
					}

					//get post tags for sidebar
					if (post.post_tags) {
						_.each(post.post_tags, function (tag) {
							if ($scope.blog.postTags.indexOf(tag) <= -1) {
								$scope.blog.postTags.push(tag);
							}
						});
					}

					//get post cateogry for sidebar
					if (post.post_category) {
						if ($scope.blog.categories.indexOf(post.post_category) <= -1) {
							$scope.blog.categories.push(post.post_category);
						}
					}

				});

				$(document).ready(function () {
					$timeout(function () {
						$scope.activateTagCloud($scope.blog.postTags);
					}, 500);
				});
			});

			$scope.activateTagCloud = function (tags) {
				var currentTagCloud = [];
				_.each(tags, function (tag) {
					var default_size = 2,
						count = _.countBy(_.flatten(tags), function (num) {
							return num == tag;
						})["true"];
					if (count) {
						default_size += count;
					}
					currentTagCloud.push({
						text: tag,
						weight: default_size, //Math.floor((Math.random() * newValue.length) + 1),
						link: '/tag/' + tag
					});
				});
				$scope.rendered = false;
				$scope.tagCloud = currentTagCloud;
				$(".jqcloud").jQCloud($scope.tagCloud, {
					autoResize: true,
					width: 230,
					height: 300,
					afterCloudRender: function () {
						$timeout(function () {
							//if (!$scope.rendered) {
							//$scope.rendered = true;
							angular.element('.jqcloud').css({
								'width': '100%'
							});
							//angular.element('.jqcloud').jQCloud('update', $scope.tagCloud);
							//}
						}, 100);
					}
				});
			};

			/********** BLOG PAGE PAGINATION RELATED **********/
			$scope.curPage = 0;
			$scope.pageSize = 10;
			$scope.numberOfPages = function () {
				if ($scope.blog.blogposts) {
					return Math.ceil($scope.blog.blogposts.length / $scope.pageSize);
				} else {
					return 0;
				}
			};

			$scope.sortBlogFn = function (component) {
				return function (blogpost) {
					if (component.postorder) {
						if (component.postorder == 1 || component.postorder == 2) {
							return Date.parse($filter('date')(blogpost.modified.date, "MM/dd/yyyy HH:mm:ss"));
						} else if (component.postorder == 3 || component.postorder == 4) {
							return Date.parse($filter('date')(blogpost.created.date, "MM/dd/yyyy HH:mm:ss"));
						} else if (component.postorder == 5 || component.postorder == 6) {
							return Date.parse($filter('date')(blogpost.publish_date || blogpost.created.date, "MM/dd/yyyy"));
						}
					} else {
						return Date.parse($filter('date')(blogpost.publish_date || blogpost.created.date, "MM/dd/yyyy"));
					}
				};
			};

			$scope.customSortOrder = function (component) {
				if (component.postorder == 1 || component.postorder == 3 || component.postorder == 5) {
					return false;
				} else if (component.postorder == 2 || component.postorder == 4 || component.postorder == 6) {
					return true;
				} else {
					return true;
				}
			};
		}
	};
}]);
