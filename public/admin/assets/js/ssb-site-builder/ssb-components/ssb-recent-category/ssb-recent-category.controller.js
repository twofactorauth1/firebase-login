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
    vm.blog_categories= [];
    vm.filteredPostView = false;
    vm.encodeUrlText = encodeUrlText;
    vm.titleStyle=titleStyle;
    vm.descriptionStyle=descriptionStyle;
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

                        if(blog_categories.length<20 && _.filter(blog_categories, function(intag){
                            return intag.text == tag.text
                        }).length ==0) {
                            blog_categories.push(tag);
                        }
                    })
                }
            })
        }
        return blog_categories;
    }


    function encodeUrlText(url){
        return encodeURI(url);
    }


    function init(element) {
    	vm.element = element;
        vm.blog_categories=blogCategories();
        if(vm.blog_categories.length<1){
            element.closest("div.ssb-page-section").css({'display': 'none'});
        }
    }

}


})();
