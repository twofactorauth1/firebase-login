/*global app, console ,window */
/*jslint unparam:true*/
/* eslint-disable no-console */
(function () {

	app.controller('SiteBuilderBolgRecentPostComponentController', ssbBlogRecentPostComponentController);

	ssbBlogRecentPostComponentController.$inject = ['SimpleSiteBuilderBlogService', '$scope', '$timeout', '$location'];
	/* @ngInject */
	function ssbBlogRecentPostComponentController(SimpleSiteBuilderBlogService, $scope, $timeout, $location) {

		console.info('ssb-blog-recent-post-list directive init...');

		var vm = this;

		vm.init = init;
		vm.initData = initData;
		vm.hasFeaturedPosts = false;
		vm.showNumberOfPosts = showNumberOfPosts; // default
		vm.showFirstPost = showFirstPost;
		var path = $location.$$url.replace('/page/', '');

		if (path) {
			path = decodeURI(path);
		}

		vm.blog = SimpleSiteBuilderBlogService.blog || {};

		vm.sortBlogPosts = sortBlogPosts;

		vm.filteredPostView = false;
		vm.titleStyle = titleStyle;
		vm.descriptionStyle = descriptionStyle;

		if (path.indexOf("tag/") > -1) {
			vm.blog.currentTag = path.replace('/tag/', '');
			vm.filteredPostView = true;
		}

		if (path.indexOf("author/") > -1) {
			vm.blog.currentAuthor = path.replace('/author/', '');
			vm.filteredPostView = true;
		}
		if (path.indexOf("category/") > -1) {
			vm.blog.currentCategory = path.replace('/category/', '');
			vm.filteredPostView = true;
		}

		$scope.$watchCollection('vm.blog.posts', function (newValue) {
			if (newValue) {
				if (vm.blog.posts.length > 1) {
					vm.element.closest("div.ssb-page-section").css({
						'display': 'block'
					});
				} else {
					vm.element.closest("div.ssb-page-section").css({
						'display': 'none'
					});
				}
			}
		});

		function titleStyle() {
			var styleString = ' ';
			if (vm.component && vm.component.settings && vm.component.settings.title && vm.component.settings.title.fontSize) {
				styleString += 'font-size: ' + vm.component.settings.title.fontSize + 'px !important;';
			}
			if (vm.component && vm.component.settings && vm.component.settings.title && vm.component.settings.title.fontFamily) {
				styleString += 'font-family: ' + vm.component.settings.title.fontFamily + 'px !important;';
			}
			if (vm.component && vm.component.settings && vm.component.settings.title && vm.component.settings.title.color) {
				styleString += 'color: ' + vm.component.settings.title.color + "!important;";
			}
			return styleString;
		}

		function descriptionStyle() {
			var styleString = ' ';
			if (vm.component && vm.component.settings && vm.component.settings.description && vm.component.settings.description.fontSize) {
				styleString += 'font-size: ' + vm.component.settings.description.fontSize + 'px !important;';
			}
			if (vm.component && vm.component.settings && vm.component.settings.description && vm.component.settings.description.fontFamily) {
				styleString += 'font-family: ' + vm.component.settings.description.fontFamily + 'px !important;';
			}
			if (vm.component && vm.component.settings && vm.component.settings.description && vm.component.settings.description.color) {
				styleString += 'color: ' + vm.component.settings.description.color + "!important;";
			}
			return styleString;
		}

		function initData() {
			var posts = SimpleSiteBuilderBlogService.loadDataFromPage('#indigenous-precache-sitedata-posts') || window.indigenous.precache.siteData.posts;
			if (posts) {
				if (vm.filteredPostView) {
					if (vm.blog.currentAuthor) {
						posts = posts.filter(function (post) {
							// console.log(post)
							return post.post_author === vm.blog.currentAuthor;
						});
					}
					if (vm.blog.currentTag) {
						posts = posts.filter(function (post) {
							if (post.post_tags) {
								return _.some(post.post_tags, function (tag) {
									return tag.toLowerCase() === vm.blog.currentTag.toLowerCase();
								});
							}
						});
					}
					if (vm.blog.currentCategory) {
						posts = posts.filter(function (post) {
							if (post.post_categories) {
								return _.some(post.post_categories, function (tag) {
									if (tag.text) {
										return tag.text.toLowerCase() === vm.blog.currentCategory.toLowerCase();
									} else {
										return tag.toLowerCase() === vm.blog.currentCategory.toLowerCase();
									}
								});
							}
						});
					}
				}
				checkHasFeaturedPosts();
			}
			vm.blog.posts = posts;
		}

		function checkHasFeaturedPosts() {
			vm.hasFeaturedPosts = vm.blog.posts.filter(function (post) {
				return post.featured;
			}).length;
		}

		function sortBlogPosts(blogpost) {
			return new Date(blogpost.publish_date || blogpost.created.date).getTime();
		}

		function showNumberOfPosts() {
			var showCount = 6;
			if (vm.component.post_count) {
				if (vm.showFirstPost()) {
					showCount = parseInt(vm.component.post_count);
				} else {
					showCount = parseInt(vm.component.post_count) + 1;
				}

			}
			if (showCount > vm.blog.posts.length) {
				showCount = vm.blog.posts.length;
			}
			return showCount;
		}

		function showFirstPost() {
			return vm.filterCategoryOrTagsView = (vm.component.postTags && vm.component.postTags.length) || (vm.component.postCategories && vm.component.postCategories.length);
		}

		function init(element) {
			vm.element = element;
			checkHasFeaturedPosts();
			if (!vm.blog.posts.length) {
				vm.initData();
			}
		}

	}


})();
