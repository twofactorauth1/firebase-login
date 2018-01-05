/*global app,console, window,angular, _, $ */
/* eslint-disable no-console*/
(function () {

	app.controller('SiteBuilderBlogPostListComponentController', ssbBlogPostListComponentController);

	ssbBlogPostListComponentController.$inject = ['SimpleSiteBuilderBlogService', '$scope', '$timeout', '$location'];
	/* @ngInject */
	function ssbBlogPostListComponentController(SimpleSiteBuilderBlogService, $scope, $timeout, $location) {

		console.info('ssb-blog-post-list directive init...');

		var vm = this,
			path = $location.$$url.replace('/page/', '');

		vm.init = init;
		vm.initData = initData;
		vm.hasFeaturedPosts = false;
		vm.paging ={
			currentPage : 1
		}

		if (path) {
			path = decodeURI(path);
		}

		vm.blog = SimpleSiteBuilderBlogService.blog || {};

		vm.sortBlogPosts = sortBlogPosts;

		vm.filteredPostView = false;


		vm.listArticleStyle = listArticleStyle;

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

		$scope.$watchCollection('vm.filtered.posts', function (posts) {
			if (posts) {
				if (vm.website) {
					$timeout(function () {
						vm.featuredPosts = angular.copy(_.filter(posts, function (post) {
							return post.featured;
						}));
						$scope.$broadcast('$refreshSlickSlider');
					}, 0);

					$timeout(function () {
						$(window).resize();
					}, 2000);
				} else {

					vm.featuredPosts = angular.copy(_.filter(posts, function (post) {
						return post.featured;
					}));
					if ($location.$$path.indexOf("/preview/") === 0) {
						$timeout(function () {
							$scope.$broadcast('$refreshSlickSlider');
							$(window).resize();
						}, 1000);
					}
				}
			}
		}, true);


		$scope.$watch('vm.website.settings.defaultBlogTemplateWidth', function (settings) {
			if (angular.isDefined(settings)) {
				$timeout(function () {
					$scope.$broadcast('$refreshSlickSlider');
				}, 0);
			}

		});

		function initData() {
			var posts = SimpleSiteBuilderBlogService.loadDataFromPage('#indigenous-precache-sitedata-posts') || window.indigenous.precache.siteData.posts;

			if (posts) {

				if (vm.filteredPostView) {
					if (vm.blog.currentAuthor) {
						posts = posts.filter(function (post) {
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
				vm.blog.posts = posts;

			}
		}


		function sortBlogPosts(blogpost) {
			return new Date(blogpost.publish_date || blogpost.created.date).getTime();
		}

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


		function init(element) {
			vm.element = element;
			if (!vm.blog.posts.length) {
				vm.initData();
			}
		}

		$scope.getHref = function(page){  
            if(vm.component){
            	var pageNo = page || 1;
            	var pageKey = vm.component._id + "_page";
                var queryStringSeparator = "?";
                var queryString = "";
                var hrefUrl = "";
                if($location.$$search && Object.keys($location.$$search).length){
                    var stringArr = Object.keys($location.$$search);
                    stringArr.push(pageKey);
                    stringArr = _.uniq(stringArr);
                    _.each(stringArr, function(key){
                        if(key != pageKey){
                            queryString = appendQueryString(key, $location.$$search[key], queryString);                            
                        }
                        else{
                            queryString = appendQueryString(pageKey, pageNo, queryString);
                        }
                    })
                    hrefUrl = $location.$$path + queryString;
                }
                else{
                    hrefUrl = $location.$$path + queryStringSeparator + pageKey + "="  + pageNo;
                }

            	return hrefUrl;
            }
        }

        function appendQueryString(key, value, queryString){
			if(queryString){
                queryString +="&" + key + "=" + value;
            }
            else{
                queryString +="?" + key + "=" + value;
            }
            return queryString;
        }

		vm.settings = {};
		if(vm.website){
			vm.settings = vm.website.settings
		}
		else if(window.indigenous.precache.siteData){
			vm.settings = window.indigenous.precache.siteData.settings;
		}

	}


}());
