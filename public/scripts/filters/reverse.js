mainApp.filter('reverse', function() {
    return function(items) {
	      return Array.prototype.slice.call(items).reverse(); 
    }
});