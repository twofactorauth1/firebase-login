(function(){

app.controller('ssbBolgRecentCategoryComponentController', ssbBolgRecentCategoryComponentController);

ssbBolgRecentCategoryComponentController.$inject = ['SimpleSiteBuilderBlogService', '$scope', '$timeout', '$location', '$filter'];
/* @ngInject */
function ssbBolgRecentCategoryComponentController(SimpleSiteBuilderBlogService, $scope, $timeout, $location, $filter) {

    console.info('ssb-blog-recent-category directive init...')

    var vm = this;

    vm.init = init;
    vm.hasFeaturedPosts = false;

    vm.blog = SimpleSiteBuilderBlogService.blog || {};
    vm.initData = initData;
    vm.blog_categories= [];
    vm.filteredPostView = false;
    vm.encodeUrlText = encodeUrlText;
    vm.titleStyle=titleStyle;
    vm.descriptionStyle=descriptionStyle;
    var path = $location.$$url.replace('/page/', '');

    if (path) {
        path = decodeURI(path);
    }
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
    $scope.$watchCollection('vm.blog.posts', function(newValue) {
        if (newValue) {
            vm.blog_categories=blogCategories();
             if(vm.blog_categories.length<1){
                 vm.element.closest("div.ssb-page-section").css({'display': 'none'});
            }else{
                 vm.element.closest("div.ssb-page-section").css({'display': 'block'});
            }
        }
    });

    function titleStyle(){
		var styleString = ' ';
		if(vm.component && vm.component.settings && vm.component.settings.title && vm.component.settings.title.fontSize){
			styleString += 'font-size: ' + vm.component.settings.title.fontSize + 'px !important;';
		}
		if(vm.component && vm.component.settings && vm.component.settings.title && vm.component.settings.title.fontFamily){
			styleString += 'font-family: ' + vm.component.settings.title.fontFamily + 'px !important;';
		}
		if(vm.component && vm.component.settings && vm.component.settings.title && vm.component.settings.title.color){
			styleString += 'color: ' + vm.component.settings.title.color + "!important;";
		}
		return styleString;
	}

	function descriptionStyle(){
		var styleString = ' ';
		if(vm.component && vm.component.settings && vm.component.settings.description && vm.component.settings.description.fontSize){
			styleString += 'font-size: ' + vm.component.settings.description.fontSize + 'px !important;';
		}
		if(vm.component && vm.component.settings && vm.component.settings.description && vm.component.settings.description.fontFamily){
			styleString += 'font-family: ' + vm.component.settings.description.fontFamily + 'px !important;';
		}
		if(vm.component && vm.component.settings && vm.component.settings.description && vm.component.settings.description.color){
			styleString += 'color: ' + vm.component.settings.description.color + "!important;";
		}
		return styleString;
	}
    function blogCategories(){
        var blog_categories = []
        if (vm.blog.posts.length > 0) {
            angular.forEach(vm.blog.posts, function(post, key) {
                if (post.post_categories && post.post_categories.length > 0) {
                    angular.forEach(post.post_categories, function(tag, key1) { 
                        if(blog_categories.length<20 ){ 
                            if (angular.isObject(tag) && tag.text) {
                                if (!isExit(tag.text,blog_categories)){
                                    blog_categories.push(tag.text);
                                }
                            } else {
                                if (!isExit(tag,blog_categories)) {
                                    blog_categories.push(tag);
                                }
                            }
                        }
                    })
                }
            })
        }
        return blog_categories;
    }
    function isExit(query, arr) {
        var lowerQuery = query.toLowerCase();
        return _.find(arr, function(term) {
          return term.toLowerCase() == lowerQuery;
        })!==undefined;
    }


    function encodeUrlText(url){
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
        vm.blog_categories=blogCategories();
        if(vm.blog_categories.length<1){
            element.closest("div.ssb-page-section").css({'display': 'none'});
        }
    }

}


})();
