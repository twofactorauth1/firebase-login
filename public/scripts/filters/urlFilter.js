mainApp.filter('urlFilter', function() {
    return function(url) {
	      return url.replace(/\W+/g, "").toLowerCase();
    }
});