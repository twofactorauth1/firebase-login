define(['app'], function(app) {
  	app.register.filter('htmlToPlaintext', ['$filter', function ($filter) {
	  	return function(text) {
	      return String(text).replace(/<[^>]+>/gm, '');
	    };
	}]);
});
