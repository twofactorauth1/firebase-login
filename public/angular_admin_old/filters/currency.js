define(['app'], function(app) {
  app.register.filter('formatCurrency', ['$filter', function ($filter) {
	  return function(input) {
	    input = parseFloat(input);

	    if(input % 1 === 0) {
	      input = input.toFixed(0);
	    }
	    else {
	      input = input.toFixed(2);
	    }

	    return '$' + input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	  };
	}]);
});
