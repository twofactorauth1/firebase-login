
/*global app*/
app.filter('ssbPostPageFilter', function ($filter) {
	"use strict";
	return function(posts, currentPage, settings) {
		if(settings && settings.enableBlogPaging && settings.blogPagePostsPerPage > 0){
			var start =  (currentPage - 1) * settings.blogPagePostsPerPage;     	
        	return $filter('limitTo')(posts.slice(start), settings.blogPagePostsPerPage);;
		}
		else{
			return posts;
		}
    }
});
