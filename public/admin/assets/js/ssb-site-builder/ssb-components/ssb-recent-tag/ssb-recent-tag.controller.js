/*global app, console ,angular  */
/*jslint unparam:true*/
/* eslint-disable no-console */
(function () {

	app.controller('SiteBuilderBolgRecentTagComponentController', SiteBuilderBolgRecentTagComponentController);

	SiteBuilderBolgRecentTagComponentController.$inject = ['SimpleSiteBuilderBlogService', '$scope'];
	/* @ngInject */
	function SiteBuilderBolgRecentTagComponentController(SimpleSiteBuilderBlogService, $scope) {

		console.info('ssb-blog-recent-tags directive init...');

		var vm = this;

		vm.init = init;
		vm.hasFeaturedPosts = false;
		vm.initData = initData;
		vm.blog = SimpleSiteBuilderBlogService.blog || {};
		vm.blog_tags = [];
		vm.filteredPostView = false;
		vm.encodeUrlText = encodeUrlText;
		vm.titleStyle = titleStyle;
		vm.descriptionStyle = descriptionStyle;
		$scope.$watchCollection('vm.blog.posts', function (newValue) {
			if (newValue) {
				vm.blog_tags = getTags();
				if (vm.blog_tags.length < 1) {
					vm.element.closest("div.ssb-page-section").css({
						'display': 'none'
					});
				} else {
					vm.element.closest("div.ssb-page-section").css({
						'display': 'block'
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

		function getTags() {
			var blog_tags = [];
			if (vm.blog.posts.length > 0) {
				angular.forEach(vm.blog.posts, function (post) {
					if (post.post_tags && post.post_tags.length > 0) {
						angular.forEach(post.post_tags, function (tag) {

							if (blog_tags.length < 20) {
								if (angular.isObject(tag) && tag.text) {
									if (!isExit(tag.text,blog_tags)){
										blog_tags.push(tag.text);
									}
								} else {
									if (!isExit(tag,blog_tags)) {
										blog_tags.push(tag);
									}
								}
							}
						});
					}
				});
			}
			return blog_tags;
		}
		function isExit(query, arr) {
			var lowerQuery = query.toLowerCase();
			return _.find(arr, function(term) {
			  return term.toLowerCase() == lowerQuery;
			})!==undefined;
		}

		function encodeUrlText(url) {
			return encodeURI(url);
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
			}
			vm.blog.posts = posts;
		}

		function init(element) {
			vm.element = element;
			if (!vm.blog.posts.length) {
				vm.initData();
			}
			vm.blog_tags = getTags();
			if (vm.blog_tags.length < 1) {
				element.closest("div.ssb-page-section").css({
					'display': 'none'
				});
			}
		}
	}

}());
