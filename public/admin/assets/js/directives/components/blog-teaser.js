/*global app, angular, */
/*jslint unparam:true*/
app.directive('blogTeaserComponent', ['WebsiteService', '$filter', function (WebsiteService, $filter) {
	'use strict';
	return {
		scope: {
			component: '=',
			ssbEditor: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			scope.isEditing = true;
		},
		controller: function ($scope, WebsiteService) {
			$scope.loading = true;
			$scope.currentPostPage = 1;

			WebsiteService.getPosts(function (posts) {
				_.each(posts, function (blogpost) {
					blogpost.date_published = new Date(blogpost.publish_date || blogpost.created.date).getTime();
					blogpost.date_created = new Date(blogpost.created.date).getTime();
					blogpost.date_modified = new Date(blogpost.modified.date).getTime();
				});
				$scope.teaserposts = angular.copy(posts);
				filterPosts(posts, function () {
					$scope.pageChanged(1);
					$scope.loading = false;
				});

			});

			$scope.listArticleStyle = listArticleStyle;

			function listArticleStyle(item) {
				var styleString = ' ';

				if (item && item.articleBorder && item.articleBorder.show && item.articleBorder.color) {
					styleString += 'border-color: ' + item.articleBorder.color + ';';
					styleString += 'border-width: ' + item.articleBorder.width + 'px;';
					styleString += 'border-style: ' + item.articleBorder.style + ';';
					styleString += 'border-radius: ' + item.articleBorder.radius + '%;';
				}

				return styleString;
			}

			function sortBlogFn(component) {
				if (component.postorder) {
					if (component.postorder == 1 || component.postorder == 2) {
						return "date_modified";
					}
					if (component.postorder == 3 || component.postorder == 4) {
						return "date_created";
					}
					if (component.postorder == 5 || component.postorder == 6) {
						return "date_published";
					}
				} else {
					return "date_published";
				}
			}
			$scope.titleStyle = function (component) {
				var styleString = ' ';
				if (component && component.settings) {
					if (component.settings.title) {
						if (component.settings.title.fontSize) {
							styleString += 'font-size: ' + component.settings.title.fontSize + 'px !important;';
						}
						if (component.settings.title.fontFamily) {
							styleString += 'font-family: ' + component.settings.title.fontFamily + 'px !important;';
						}
						if (component.settings.title.color) {
							styleString += 'color: ' + component.settings.title.color + "!important;";
						}
					}
				}
				return styleString;
			};
			$scope.descriptionStyle = function (component) {
				var styleString = ' ';
				if (component && component.settings) {
					if (component.settings.description) {
						if (component.settings.description.fontSize) {
							styleString += 'font-size: ' + component.settings.description.fontSize + 'px !important;';
						}
						if (component.settings.description.fontFamily) {
							styleString += 'font-family: ' + component.settings.description.fontFamily + 'px !important;';
						}
						if (component.settings.description.color) {
							styleString += 'color: ' + component.settings.description.color + "!important;";
						}
					}
				}
				return styleString;
			};


			function customSortOrder() {
				if ($scope.component.postorder == 1 || $scope.component.postorder == 3 || $scope.component.postorder == 5) {
					return false;
				}
				if ($scope.component.postorder == 2 || $scope.component.postorder == 4 || $scope.component.postorder == 6) {
					return true;
				}
				return true;
			}

			function filterPosts(data, fn) {
				var filteredPosts = [],
					numberOfPostsToshow = 0;
				_.each(data, function (post) {
					if (filterTags(post)) {
						if (filterCategory(post)) {
							filteredPosts.push(post);
						}
					}
				});
				filteredPosts = sortTeaserPosts(filteredPosts);
				if ($scope.component.version == 2) {
					numberOfPostsToshow = $scope.component.numberOfTotalPosts || $scope.teaserposts.length;
				} else {
					numberOfPostsToshow = $scope.component.numberOfTotalPosts || 3;
				}
				filteredPosts = $filter('limitTo')(filteredPosts, numberOfPostsToshow);
				$scope.posts = filteredPosts;
				return fn();
			}

			function sortTeaserPosts(posts) {
				var sortOrder = customSortOrder(),
					sortBy = sortBlogFn($scope.component);
				return $filter('orderBy')(posts, [sortBy, "date_created"], sortOrder);
			}

			function filterTags(post) {
				var postTags = $scope.component.postTags;
				if (postTags && postTags.length > 0) {
					return (post.post_tags && _.intersection(postTags, post.post_tags).length > 0);
				} else {
					return true;
				}
			}


			function filterCategory(post) {
				var postCategories = $scope.component.postCategories;
				if (postCategories && postCategories.length > 0) {
					return (post.post_categories && _.intersection(postCategories, _.pluck(post.post_categories, "text")).length > 0);

				} else {
					return true;
				}
			}

			$scope.pageChanged = function (pageNo) {
				$scope.currentPostPage = pageNo;
				if ($scope.posts && $scope.component.numberOfPostsPerPage) {
					var begin = (($scope.currentPostPage - 1) * $scope.component.numberOfPostsPerPage),
						numDisplay = $scope.component.numberOfPostsPerPage,
						end;
					//check if set to 0 and change to all posts
					if (numDisplay === 0) {
						numDisplay = $scope.posts.length;
					}
					end = begin + numDisplay;
					$scope.filteredPosts = $scope.posts.slice(begin, end);
				} else {
					$scope.filteredPosts = $scope.posts;
				}
			};

			/*
			 * @watch:productTags
			 * - watch for product tags to change in component settings and filter products
			 */

			$scope.$watch('component.postTags', function (newValue, oldValue) {
				if (newValue !== oldValue) {
					filterPosts($scope.teaserposts, function () {
						$scope.pageChanged(1);
					});
				}
			});


			$scope.$watch('component.postCategories', function (newValue, oldValue) {
				if (newValue !== oldValue) {
					filterPosts($scope.teaserposts, function () {
						$scope.pageChanged(1);
					});
				}
			});

			$scope.$watch('component.numberOfTotalPosts', function (newValue, oldValue) {
				if (newValue !== oldValue) {
					$scope.component.numberOfTotalPosts = parseInt(newValue) > 0 ? parseInt(newValue) : 0;
					filterPosts($scope.teaserposts, function () {
						$scope.pageChanged(1);
					});
				}
			});

			$scope.$watch('component.numberOfPostsPerPage', function (newValue, oldValue) {
				if (newValue !== oldValue) {
					$scope.component.numberOfPostsPerPage = parseInt(newValue) > 0 ? parseInt(newValue) : 0;
					filterPosts($scope.teaserposts, function () {
						$scope.pageChanged(1);
					});
				}
			});

			$scope.$watch('component.postorder', function (newValue, oldValue) {
				if (newValue !== oldValue) {
					filterPosts($scope.teaserposts, function () {
						$scope.pageChanged(1);
					});
				}
			});

			/*
			 * @convertInLowerCase
			 * - convert array value in lowercase
			 */

			/*function convertInLowerCase(dataItem) {
				var _item = [];
				_.each(dataItem, function (tagItem) {
					_item.push(tagItem.toLowerCase());
				});
				return _item;
			}*/
		}
	};
}]);
