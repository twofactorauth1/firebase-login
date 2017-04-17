(function(){

app.controller('SiteBuilderBolgRecentTagComponentController', SiteBuilderBolgRecentTagComponentController);

SiteBuilderBolgRecentTagComponentController.$inject = ['SimpleSiteBuilderBlogService', '$scope', '$timeout', '$location', '$filter'];
/* @ngInject */
function SiteBuilderBolgRecentTagComponentController(SimpleSiteBuilderBlogService, $scope, $timeout, $location, $filter) {

    console.info('ssb-blog-recent-tags directive init...')

    var vm = this;

    vm.init = init;
    vm.hasFeaturedPosts = false;

    vm.blog = SimpleSiteBuilderBlogService.blog || {};
    vm.blog_tags= [];
    vm.filteredPostView = false;
    vm.encodeUrlText = encodeUrlText;
    vm.titleStyle=titleStyle;
    vm.descriptionStyle=descriptionStyle;
    $scope.$watchCollection('vm.blog.posts', function(newValue) {
        if (newValue) {
            $timeout(function () {
                $scope.$broadcast('$refreshSlickSlider');
            }, 2000)
            vm.blog_tags=getTags();
             if(vm.blog_tags.length<1){
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
    function getTags(){
        var blog_tags = []
        if (vm.blog.posts.length > 0) {
            angular.forEach(vm.blog.posts, function(post, key) {
                if (post.post_tags && post.post_tags.length > 0) {
                    angular.forEach(post.post_tags, function(tag, key1) {

                        if(blog_tags.length<10){
                          if (blog_tags.indexOf(tag) == -1) {
                            blog_tags.push(tag)
                           }
                        }
                    })
                }
            })
        }
        return blog_tags;
    }


    function encodeUrlText(url){
        return encodeURI(url);
    }


    function init(element) {
    	vm.element = element;
        vm.blog_tags=getTags();
        if(vm.blog_tags.length<1){
            element.closest("div.ssb-page-section").css({'display': 'none'});
        }
    }

}


})();
