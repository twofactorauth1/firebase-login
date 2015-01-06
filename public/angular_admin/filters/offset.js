define(['app'], function(app) {
  app.register.filter('offset', function() {
    	return function(input, start) {
    	start = parseInt(start, 10);
    	return input.slice(start);
  };
});
});