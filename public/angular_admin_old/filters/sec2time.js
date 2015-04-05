define(['app'], function(app) {
  app.register.filter('secTotime', ['$filter', function ($filter) {
	  return function(duration) {
	    var minutes = parseInt(Math.floor(duration / 60));
        var seconds = parseInt(duration - minutes * 60);

        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return minutes + ":" + seconds;
	  };
	}]);
});
