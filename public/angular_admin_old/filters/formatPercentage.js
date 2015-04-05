define(['app'], function(app) {
  app.register.filter('formatPercentage', ['$filter', function ($filter) {
	  return function(percent) {
        return (percent*1).toFixed(1) + "%";
	  };
	}]);
});
