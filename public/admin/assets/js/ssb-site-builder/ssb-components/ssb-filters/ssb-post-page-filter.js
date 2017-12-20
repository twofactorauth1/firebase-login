'use strict';
app.filter('ssbPostPageFilter', ['$filter', function ($filter) {
	return function(posts, currentPage, settings) {
		var filteredPosts = posts;
		if(settings && settings.enableBlogPaging && settings.blogPagePostsPerPage > 0){
			var start =  (currentPage - 1) * settings.blogPagePostsPerPage;     	
        	filteredPosts = $filter('limitTo')(posts.slice(start), settings.blogPagePostsPerPage);
		}
		return filteredPosts;
    }
}]);
