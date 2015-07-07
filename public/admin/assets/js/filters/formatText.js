'use strict';

app.filter('formatText', function () {
  return function (string) {
  	if (string) {
  		var res;
  		if (string === 'blog.post.post_title') {
  			res = 'Post Title';
  		}
  		if (string === 'blog.post.post_content') {
  			res = 'Post Content';
  		}
  		if (!res) {
  			res = string.replace("_", " ").replace(".", " ").replace("component", "").replace("img", "Image ");
  		}
	    var newVal = '';
	    res = res.split(' ');
	    for (var c = 0; c < res.length; c++) {
	      newVal += res[c].substring(0, 1).toUpperCase() + res[c].substring(1, res[c].length) + ' ';
	    }
	    return newVal;
	}
  };
});
