/*global app, angular,_,$*/
/*jslint unparam:true*/
app.directive('blogComponent', ['$filter', '$timeout', 'WebsiteService', 'toaster', 'SweetAlert', function ($filter, $timeout, WebsiteService, toaster, SweetAlert) {
	'use strict';
	return {
		scope: {
			component: '=',
			media: '&',
			control: '=',
			ssbEditor: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			scope.isEditing = true;
			scope.changeBlogImage = function (blog, index) {
				scope.media({
					blog: blog,
					index: index
				});
			};
			scope.deletedPosts = [];
			if (!scope.ssbEditor) {
				scope.component.spacing = scope.$parent.defaultSpacings;
			}

			scope.control.saveBlogData = function () {
				_.each(scope.blog.blogposts, function (value) {
					var matching_post = _.find(scope.originalBlogPosts, function (item) {
						return item._id === value._id;
					});

					if (!angular.equals(matching_post, value)) {
						WebsiteService.updatePost(scope.$parent.page._id, value._id, value, function (data) {});
					}
				});

				if (scope.deletedPosts.length) {
					WebsiteService.bulkDeletePosts(scope.$parent.page._id, scope.deletedPosts, function (data) {});
					scope.deletedPosts = [];
				}
			};
		},
		controller: function ($scope, WebsiteService, $compile, $filter, $timeout) {
			$scope.blog = {};
			$scope.showCloud = false;
			WebsiteService.getPosts(function (posts) {
				$scope.blog.blogposts = posts;
				$scope.originalBlogPosts = angular.copy($scope.blog.blogposts);
				$scope.blog.postTags = [];
				$scope.blog.categories = [];

				_.each(posts, function (post) {
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

				$scope.activateTagCloud($scope.blog.postTags);

				//if tagname is present, filter the cached posts with the tagname
				// if ($route.current.params.tagname != null) {
				//   var filterPosts = [];
				//   that.currentTag = decodeURIComponent($route.current.params.tagname);
				//   for (var i = 0; i < data.length; i++) {
				//     if (data[i].post_tags) {
				//       var tags = data[i].post_tags;
				//       for (var i2 = 0; i2 < tags.length; i2++) {
				//         if (tags[i2] === $route.current.params.tagname) {
				//           filterPosts.push(data[i]);
				//         }
				//       };
				//     }
				//   };
				//   that.blogposts = filterPosts;
				//   return;
				// }

				//if authorname is present, filter the cached posts with the authorname
				// if ($route.current.params.authorname != null) {
				//   var filterPosts = [];
				//   that.currentAuthor = $route.current.params.authorname;
				//   for (var i = 0; i < data.length; i++) {
				//     if (typeof data[i].post_author !== "undefined") {
				//       if (data[i].post_author === $route.current.params.authorname) {
				//         filterPosts.push(data[i]);
				//       }
				//     }
				//   };
				//   that.blogposts = filterPosts;
				//   return;
				// }

				//if catname is present, filter the cached posts with the catname
				// if ($route.current.params.catname != null) {
				//   var filterPosts = [];
				//   that.currentCat = $route.current.params.catname;
				//   for (var i = 0; i < data.length; i++) {
				//     if (data[i].post_category) {
				//       if (data[i].post_category === $route.current.params.catname) {
				//         filterPosts.push(data[i]);
				//       }
				//     }
				//   };
				//   that.blogposts = filterPosts;
				//   return;
				// }

				// if ($route.current.params.postname != null) {
				//   var found = $filter('getByProperty')('post_url', $route.current.params.postname, data);
				//   if (found) {
				//     that.post = found;
				//     that.blogPageUrl = $location.$$absUrl;
				//     if ($scope.parentScope) {
				//       $scope.parentScope.loadPost && $scope.parentScope.loadPost(found);
				//       $scope.copyPostMode();
				//     }
				//   }
				//   return;
				// }
			});

			$scope.activateTagCloud = function (tags, update) {
				var _tagCloud = [];
				_.each(tags, function (tag) {
					var default_size = 2;
					var count = _.countBy(_.flatten(tags), function (num) {
						return num === tag;
					})["true"];
					if (count) {
						default_size += count;
					}
					_tagCloud.push({
						text: tag,
						weight: default_size, //Math.floor((Math.random() * newValue.length) + 1),
						link: '/tag/' + tag
					});
				});
				$scope.rendered = false;
				$scope.tagCloud = _tagCloud;
				$timeout(function () {
					$(".jqcloud").jQCloud($scope.tagCloud, {
						autoResize: true,
						width: 230,
						height: 300,
						afterCloudRender: function () {
							if (!$scope.rendered) {
								$scope.rendered = true;
								angular.element('.jqcloud').css({
									'width': '100%'
								});
								angular.element('.jqcloud').jQCloud('update', $scope.tagCloud);
							}
						}
					});
				}, 1000);
				if (update)
					angular.element('.jqcloud').jQCloud('update', $scope.tagCloud);
			};

			/********** BLOG PAGE PAGINATION RELATED **********/
			$scope.curPage = 0;
			$scope.pageSize = 10;
			$scope.numberOfPages = function () {
				if ($scope.blog.blogposts) {
					return Math.ceil($scope.blog.blogposts.length / $scope.pageSize);
				}

				return 0;
			};

			$scope.sortBlogFn = function (component) {
				return function (blogpost) {
					if (component.postorder) {
						if (component.postorder == 1 || component.postorder == 2) {
							return Date.parse($filter('date')(blogpost.modified.date, "MM/dd/yyyy HH:mm:ss"));
						}
						if (component.postorder == 3 || component.postorder == 4) {
							return Date.parse($filter('date')(blogpost.created.date, "MM/dd/yyyy HH:mm:ss"));
						}
						if (component.postorder == 5 || component.postorder == 6) {
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
				}
				if (component.postorder == 2 || component.postorder == 4 || component.postorder == 6) {
					return true;
				}

				return true;
			};

			$scope.$watch('component.version', function (newValue, oldValue) {
				if (newValue && oldValue && newValue != oldValue) {
					$timeout(function () {
						if (angular.element(".jqcloud").length)
							$scope.activateTagCloud($scope.blog.postTags);
					}, 1000);
				}
			});

			$scope.deleteBlogPost = function (postId, blogpost) {
				SweetAlert.swal({
					title: "Are you sure?",
					text: "Do you want to delete this post",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Yes, delete post!",
					cancelButtonText: "No, do not delete post!",
					closeOnConfirm: false,
					closeOnCancel: true
				}, function (isConfirm) {
					if (isConfirm) {
						//WebsiteService.deletePost($scope.$parent.page._id, postId, function (data) {
						var index = $scope.blog.blogposts.indexOf(blogpost);
						$scope.blog.blogposts.splice(index, 1);
						toaster.pop('success', 'Post deleted successfully');
						SweetAlert.swal("Saved!", "Post deleted.", "success");
						$scope.deletedPosts.push(postId);
						$scope.$parent.setDirty(true);
						//Refresh tags
						$scope.blog.postTags = [];
						_.each($scope.blog.blogposts, function (post) {
							if (post.post_tags) {
								_.each(post.post_tags, function (tag) {
									if ($scope.blog.postTags.indexOf(tag) <= -1) {
										$scope.blog.postTags.push(tag);
									}
								});
							}
						});
						$scope.activateTagCloud($scope.blog.postTags, true);
					}
				});
				//console.log('delete post');

			};
		}
	};
}]);
